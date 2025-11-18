#!/usr/bin/env python3
"""
Coordinator Agent - Phase 3: Multi-Agent Orchestration

The Coordinator Agent routes user requests to specialized agents and manages
agent handoffs for complex queries requiring multiple specialists.
"""

import logging
import os
from strands import Agent
from strands.models.anthropic import AnthropicModel
from agents import (
    create_education_agent,
    create_tracking_agent,
    create_advisory_agent,
    create_emergency_agent,
)

# Configure logging
logging.getLogger("strands").setLevel(logging.INFO)
logging.basicConfig(
    format="%(levelname)s | %(message)s", handlers=[logging.StreamHandler()]
)


COORDINATOR_SYSTEM_PROMPT = """You are the Coordinator for DiabetesCompanion, a multi-agent diabetes management system.

Your CRITICAL responsibility is to:
1. Analyze user requests and determine which specialized agent should handle them
2. Route requests to the appropriate agent
3. Manage complex queries that may require multiple agents
4. Provide a seamless experience while leveraging specialized expertise

**AVAILABLE SPECIALIZED AGENTS:**

🎓 **EDUCATION AGENT** - Use for:
- Questions about diabetes (types, causes, symptoms)
- Explaining medical concepts or terminology
- Information about medications, insulin, treatments
- Nutrition and diet education
- Complications and prevention
- General "what is..." or "how does..." questions
- Examples: "What is Type 2 diabetes?", "How does metformin work?", "What foods should I eat?"

📊 **TRACKING AGENT** - Use for:
- Logging blood glucose readings
- Recording meals and food intake
- Logging exercise activities
- Creating or managing reminders
- Viewing recent logs
- Examples: "Log my glucose: 125 mg/dL", "I ate pasta for lunch", "Set up testing reminders"

📈 **ADVISORY AGENT** - Use for:
- Analyzing patterns in glucose data
- Calculating time-in-range (TIR)
- Trend analysis over time
- Identifying correlations (meals, exercise, glucose)
- Personalized recommendations based on data
- Reviewing statistics and summaries
- Examples: "What's my TIR?", "Detect patterns", "How is my control trending?", "Should I change anything?"

🚨 **EMERGENCY AGENT** - Use for (HIGHEST PRIORITY):
- Blood glucose < 70 mg/dL (hypoglycemia)
- Blood glucose > 250 mg/dL (hyperglycemia)
- Symptoms of DKA (ketoacidosis)
- Confusion, dizziness, severe symptoms
- Any urgent "help" or "emergency" situation
- Examples: "I'm at 50 and feeling shaky", "My sugar is 400", "I'm vomiting and glucose is high"

**ROUTING DECISION PROCESS:**

1. **Emergency Check** (ALWAYS FIRST):
   - Scan for critical numbers (<70, >250 mg/dL)
   - Look for emergency keywords: "help", "emergency", "urgent", "severe", "confused"
   - If emergency → IMMEDIATELY route to Emergency Agent

2. **Primary Intent Analysis**:
   - Is this mainly a question? → Education Agent
   - Is this mainly logging data? → Tracking Agent
   - Is this mainly analysis/advice? → Advisory Agent

3. **Complex Query Handling**:
   - Some queries need multiple agents
   - Example: "Log my glucose at 145 and tell me if that's good"
     → First: Tracking Agent (log 145)
     → Then: Advisory Agent (analyze if it's in range)
   - Handle these sequentially, explaining the process

4. **Ambiguous Cases**:
   - If unclear, ask the user to clarify
   - OR make your best judgment and explain which agent you're using

**YOUR RESPONSE FORMAT:**

Always structure responses as:
```
[Agent: AGENT_NAME]
<agent's response>
```

For multi-agent requests:
```
[Agent: TRACKING_AGENT]
<tracking response>

[Agent: ADVISORY_AGENT]
<advisory response>
```

**IMPORTANT RULES:**

1. **Don't try to answer yourself** - Always use an agent
2. **Be transparent** - Tell user which agent is helping them
3. **Emergency first** - Always check for emergencies before routing elsewhere
4. **One task at a time** - Don't try to do multiple unrelated things simultaneously
5. **Explain handoffs** - If switching agents, explain why

**EXAMPLE ROUTING:**

"What is Type 2 diabetes?"
→ Education Agent (explanation request)

"My glucose is 125 fasting"
→ Tracking Agent (log the reading)

"My glucose is 125 fasting, is that good?"
→ Tracking Agent (log) + Advisory Agent (evaluate)

"What's my average glucose?"
→ Advisory Agent (analytics)

"I'm at 55 and dizzy"
→ Emergency Agent (critical low)

"Set up reminders for testing"
→ Tracking Agent (reminder management)

"Should I exercise after meals?"
→ Education Agent (general advice) OR Advisory Agent (personalized based on their data)

"Detect any patterns"
→ Advisory Agent (pattern analysis)

Remember: You are the air traffic controller. Your job is to route requests efficiently to the right specialist, not to answer questions yourself. Be quick, accurate, and transparent about which agent is handling each request.
"""


class DiabetesCoordinator:
    """Coordinator that manages multiple specialized agents."""

    def __init__(self):
        """Initialize the coordinator with all specialized agents."""
        print("Initializing DiabetesCompanion Multi-Agent System...")
        print("Loading specialized agents...")

        self.education_agent = create_education_agent()
        print("  ✓ Education Agent loaded")

        self.tracking_agent = create_tracking_agent()
        print("  ✓ Tracking Agent loaded")

        self.advisory_agent = create_advisory_agent()
        print("  ✓ Advisory Agent loaded")

        self.emergency_agent = create_emergency_agent()
        print("  ✓ Emergency Agent loaded")

        # Configure Anthropic model for coordinator
        coordinator_model = AnthropicModel(
            client_args={
                "api_key": os.getenv("ANTHROPIC_API_KEY"),
            },
            max_tokens=4096,
            model_id="claude-sonnet-4-20250514",
            params={
                "temperature": 0.5,  # Moderate temperature for routing decisions
            }
        )

        # Create coordinator agent (no tools - just routing logic)
        self.coordinator = Agent(
            model=coordinator_model,
            system_prompt=COORDINATOR_SYSTEM_PROMPT,
            tools=[],  # Coordinator doesn't need tools - agents have them
        )

        print("\nMulti-Agent System Ready!\n")

    def process_request(self, user_input: str) -> str:
        """
        Process user request by routing to appropriate agent(s).

        The coordinator analyzes the request and determines which specialized
        agent should handle it, then routes accordingly.
        """
        # First, let the coordinator analyze and route the request
        routing_response = self.coordinator(
            f"Analyze this request and determine which agent(s) should handle it. "
            f"Explain your routing decision.\n\nUser request: {user_input}"
        )

        print(f"\n[COORDINATOR ROUTING]: {routing_response}\n")

        # Parse coordinator's decision and route to appropriate agent(s)
        # For now, we'll use a simple keyword-based routing
        # (In production, you'd parse the coordinator's response more sophisticatedly)

        user_lower = user_input.lower()

        # Emergency check (highest priority)
        emergency_keywords = [
            "emergency",
            "help",
            "urgent",
            "confused",
            "dizzy",
            "vomit",
            "unconscious",
        ]
        has_critical_number = any(
            num in user_input
            for num in [" 50", " 60", " 40", " 30", "400", "350", "300", "250"]
        )

        if any(keyword in user_lower for keyword in emergency_keywords) or (
            has_critical_number and ("mg" in user_lower or "sugar" in user_lower)
        ):
            print("[Routing to: EMERGENCY AGENT]\n")
            return self.emergency_agent(user_input)

        # Education keywords
        education_keywords = [
            "what is",
            "what are",
            "how does",
            "why does",
            "explain",
            "tell me about",
            "what causes",
            "what happens",
            "medication",
            "insulin",
            "type 1",
            "type 2",
            "complication",
        ]

        # Tracking keywords
        tracking_keywords = [
            "log",
            "record",
            "i ate",
            "i had",
            "my glucose is",
            "my sugar is",
            "my reading is",
            "set up reminder",
            "create reminder",
            "i walked",
            "i ran",
            "i exercised",
        ]

        # Advisory keywords
        advisory_keywords = [
            "pattern",
            "trend",
            "time in range",
            "tir",
            "average",
            "statistics",
            "analyze",
            "how am i doing",
            "should i",
            "recommend",
            "advice",
            "improve",
        ]

        # Route based on keywords
        if any(keyword in user_lower for keyword in education_keywords):
            print("[Routing to: EDUCATION AGENT]\n")
            return self.education_agent(user_input)

        elif any(keyword in user_lower for keyword in tracking_keywords):
            print("[Routing to: TRACKING AGENT]\n")
            return self.tracking_agent(user_input)

        elif any(keyword in user_lower for keyword in advisory_keywords):
            print("[Routing to: ADVISORY AGENT]\n")
            return self.advisory_agent(user_input)

        else:
            # Default to education for general questions
            print("[Routing to: EDUCATION AGENT (default)]\n")
            return self.education_agent(user_input)


def interactive_mode():
    """Run the coordinator in interactive mode."""
    print("=" * 70)
    print("  DiabetesCompanion - Phase 3: Multi-Agent System")
    print("=" * 70)
    print(
        "\nWelcome! I'm your DiabetesCompanion coordinator, managing a team of"
    )
    print("specialized agents to help you with diabetes management.")
    print("\nMy team includes:")
    print("  🎓 Education Agent - Diabetes knowledge and guidance")
    print("  📊 Tracking Agent - Data logging and management")
    print("  📈 Advisory Agent - Pattern analysis and recommendations")
    print("  🚨 Emergency Agent - Critical situation response")
    print("\nI'll route your requests to the most appropriate specialist.")
    print("\nType 'exit' or 'quit' to end the conversation.\n")

    coordinator = DiabetesCoordinator()

    while True:
        try:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ["exit", "quit", "bye"]:
                print("\nTake care! Remember to monitor your diabetes regularly.")
                print("Consult your healthcare team if you have any concerns.\n")
                break

            # Process through coordinator
            print("")  # Blank line for readability
            response = coordinator.process_request(user_input)
            print(f"Response: {response}\n")

        except KeyboardInterrupt:
            print("\n\nGoodbye! Stay healthy!")
            break
        except Exception as e:
            print(f"\nError: {e}")
            print("Please try again or type 'exit' to quit.\n")


def main():
    """Main entry point."""
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--single":
        # Single query mode for testing
        coordinator = DiabetesCoordinator()
        query = " ".join(sys.argv[2:])
        response = coordinator.process_request(query)
        print(f"\nResponse: {response}")
    else:
        # Interactive mode
        interactive_mode()


if __name__ == "__main__":
    main()
