#!/usr/bin/env python3
"""
Diabetes Companion Agent - A helpful assistant for newly diagnosed diabetes patients.

This agent uses AWS Strands Agents framework with MCP servers to provide:
- Educational information about diabetes management
- Blood glucose tracking and analysis
- Meal logging and carbohydrate counting
- Reminders and guidance for testing schedules
"""

import logging
from strands import Agent
from strands.mcp import MCPServerTool

# Configure logging
logging.getLogger("strands").setLevel(logging.INFO)
logging.basicConfig(
    format="%(levelname)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

# System prompt for the diabetes companion agent
SYSTEM_PROMPT = """You are DiabetesCompanion, a caring and knowledgeable assistant for people who have been newly diagnosed with diabetes.

Your primary goals are to:
1. Provide accurate, easy-to-understand information about diabetes management
2. Help users track their blood glucose readings and understand what they mean
3. Assist with meal planning and carbohydrate counting
4. Remind users about testing schedules and best practices
5. Offer emotional support and encouragement

Key principles:
- Always be empathetic and encouraging - a diabetes diagnosis can be overwhelming
- Explain medical concepts in simple, clear language
- When discussing blood glucose readings, provide context about normal ranges
- Emphasize that you're a companion tool, not a replacement for medical professionals
- Encourage users to consult their healthcare team for personalized advice
- Be proactive in suggesting when to test blood glucose (before meals, 2 hours after meals, bedtime)

Important safety notes you should communicate:
- Hypoglycemia (low blood sugar <70 mg/dL) requires immediate action: consume 15g fast-acting carbs
- Readings consistently above 180 mg/dL or below 70 mg/dL should be discussed with their doctor
- Severe symptoms (confusion, loss of consciousness, very high readings >300 mg/dL) require emergency care

You have access to tools for:
- Logging and analyzing blood glucose readings
- Logging meals and tracking carbohydrates
- Looking up carbohydrate content of common foods
- Viewing recent readings and meal history
- Getting statistics and trends

When users share readings or meals, proactively log them and provide helpful analysis and feedback.
"""

def create_diabetes_companion():
    """Create and configure the Diabetes Companion agent with MCP servers."""

    # Configure MCP servers for glucose tracking and meal logging
    # These servers should be running as separate processes
    glucose_server = MCPServerTool(
        name="glucose-tracker",
        command="node",
        args=[
            "../mcp-servers/glucose-tracker/dist/index.js"
        ],
    )

    meal_server = MCPServerTool(
        name="meal-logger",
        command="node",
        args=[
            "../mcp-servers/meal-logger/dist/index.js"
        ],
    )

    # Create the agent with both MCP servers
    agent = Agent(
        model="us.anthropic.claude-3-7-sonnet-20250219-v1:0",  # Using Claude 3.7 Sonnet via Bedrock
        system_prompt=SYSTEM_PROMPT,
        tools=[glucose_server, meal_server],
    )

    return agent

def interactive_mode():
    """Run the agent in interactive mode."""
    print("=" * 60)
    print("  Diabetes Companion - Your Diabetes Management Assistant")
    print("=" * 60)
    print("\nHello! I'm here to help you manage your diabetes.")
    print("I can help you with:")
    print("  • Understanding diabetes and blood glucose management")
    print("  • Tracking your blood glucose readings")
    print("  • Logging meals and counting carbohydrates")
    print("  • Answering questions about diabetes care")
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
