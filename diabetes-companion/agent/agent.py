#!/usr/bin/env python3
"""
Diabetes Companion Agent - Phase 2: Active Assistant for diabetes management.

This agent uses AWS Strands Agents framework with MCP servers to provide:
- Educational information about diabetes management
- Blood glucose tracking with advanced pattern detection and trend analysis
- Meal logging and carbohydrate counting
- Exercise tracking and glucose impact analysis
- Smart reminders for testing and medication schedules
- Time-in-range monitoring (key diabetes metric)
"""

import logging
from strands import Agent
from strands.tools.mcp import MCPClient
from mcp import stdio_client, StdioServerParameters

# Configure logging
logging.getLogger("strands").setLevel(logging.INFO)
logging.basicConfig(
    format="%(levelname)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

# System prompt for the diabetes companion agent (Phase 2)
SYSTEM_PROMPT = """You are DiabetesCompanion, a caring and knowledgeable AI assistant for people managing diabetes.

Your primary goals are to:
1. Provide accurate, easy-to-understand information about diabetes management
2. Help users track their blood glucose readings with advanced pattern detection and trend analysis
3. Assist with meal planning and carbohydrate counting
4. Track exercise activities and analyze their impact on blood glucose
5. Manage smart reminders for testing schedules and medication
6. Monitor time-in-range (TIR) - a critical diabetes management metric
7. Offer emotional support and encouragement

Key principles:
- Always be empathetic and encouraging - diabetes management can be challenging
- Explain medical concepts in simple, clear language
- When discussing blood glucose readings, provide context about normal ranges and trends
- Emphasize that you're a companion tool, not a replacement for medical professionals
- Encourage users to consult their healthcare team for personalized advice
- Be proactive in suggesting when to test blood glucose (before meals, 2 hours after meals, bedtime)
- Help users identify patterns in their data to improve glucose control

Important safety notes you should communicate:
- Hypoglycemia (low blood sugar <70 mg/dL) requires immediate action: consume 15g fast-acting carbs
- Check glucose before exercise; have snack if <100 mg/dL
- Exercise can lower glucose for up to 24 hours - monitor for delayed hypoglycemia
- Readings consistently above 180 mg/dL or below 70 mg/dL should be discussed with their doctor
- Severe symptoms (confusion, loss of consciousness, very high readings >300 mg/dL) require emergency care

You have access to advanced tools for:

**Glucose Tracking & Analysis:**
- Log glucose readings with context
- Detect patterns (high morning readings, post-meal spikes, hypoglycemia trends)
- Analyze trends over different time periods (3 days, week, 2 weeks, month)
- Calculate time-in-range (TIR) - goal is >70%, ideally >80%
- View statistics and recent readings

**Meal Logging:**
- Log meals with carbohydrate counts
- Look up carb content of common foods
- Estimate total carbs for meal planning
- View daily and recent meal summaries

**Exercise Tracking:**
- Log exercise activities with duration and intensity
- Get info about specific exercises and their glucose impact
- Analyze how exercise affects blood glucose levels
- View weekly activity summaries
- Get personalized exercise recommendations based on fitness level

**Reminder System:**
- Create reminders for glucose testing and medication
- Set up complete testing schedules (minimal, standard, or intensive)
- View next upcoming reminder
- List and manage all reminders

**Proactive Assistance:**
- When users share readings or meals, automatically log them and provide insightful analysis
- Suggest setting up reminders if the user is new
- Periodically check for patterns and trends
- Encourage exercise and provide recommendations
- Monitor time-in-range and celebrate improvements

Remember: You're helping users take control of their diabetes management with data-driven insights and supportive guidance.
"""

def create_diabetes_companion():
    """Create and configure the Diabetes Companion agent with MCP servers (Phase 2)."""

    # Configure MCP servers using MCPClient for comprehensive diabetes management
    mcp_servers = [
        MCPClient(
            lambda: stdio_client(StdioServerParameters(
                command="node",
                args=["../mcp-servers/glucose-tracker/dist/index.js"],
            ))
        ),
        MCPClient(
            lambda: stdio_client(StdioServerParameters(
                command="node",
                args=["../mcp-servers/meal-logger/dist/index.js"],
            ))
        ),
        MCPClient(
            lambda: stdio_client(StdioServerParameters(
                command="node",
                args=["../mcp-servers/reminder-system/dist/index.js"],
            ))
        ),
        MCPClient(
            lambda: stdio_client(StdioServerParameters(
                command="node",
                args=["../mcp-servers/exercise-logger/dist/index.js"],
            ))
        ),
    ]

    # Collect all tools from MCP servers
    all_tools = []
    for client in mcp_servers:
        with client:
            all_tools.extend(client.list_tools_sync())

    # Create the agent with all MCP servers
    agent = Agent(
        model="claude-sonnet-4-20250514",  # Anthropic API
        system_prompt=SYSTEM_PROMPT,
        tools=all_tools,
    )

    return agent

def interactive_mode():
    """Run the agent in interactive mode."""
    print("=" * 70)
    print("  Diabetes Companion - Phase 2: Your Active Diabetes Assistant")
    print("=" * 70)
    print("\nHello! I'm here to help you actively manage your diabetes.")
    print("\nI can help you with:")
    print("  • Understanding diabetes and blood glucose management")
    print("  • Tracking glucose readings with pattern detection & trend analysis")
    print("  • Logging meals and counting carbohydrates")
    print("  • Tracking exercise and analyzing glucose impact")
    print("  • Setting up smart reminders for testing and medication")
    print("  • Monitoring your time-in-range (TIR) - a key metric")
    print("  • Getting personalized insights and recommendations")
    print("\nType 'exit' or 'quit' to end the conversation.\n")

    agent = create_diabetes_companion()

    # Conversation loop
    while True:
        try:
            user_input = input("You: ").strip()

            if not user_input:
                continue

            if user_input.lower() in ['exit', 'quit', 'bye']:
                print("\nTake care! Remember to monitor your blood glucose regularly.")
                print("Consult your healthcare team if you have any concerns.\n")
                break

            # Send message to agent
            print("\nDiabetesCompanion: ", end="", flush=True)
            response = agent(user_input)
            print(response)
            print()

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
        agent = create_diabetes_companion()
        query = " ".join(sys.argv[2:])
        response = agent(query)
        print(response)
    else:
        # Interactive mode
        interactive_mode()

if __name__ == "__main__":
    main()
