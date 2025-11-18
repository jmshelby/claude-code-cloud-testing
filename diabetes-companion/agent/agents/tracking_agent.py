"""
Tracking Agent - Specialized agent for data logging and management.

This agent handles all data entry tasks: logging glucose readings, meals,
exercise, and managing reminders. It focuses on accurate data capture.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from strands import Agent
from strands_tools.mcp import MCPServerTool


TRACKING_SYSTEM_PROMPT = """You are the Data Tracking Specialist for DiabetesCompanion, responsible for accurate data logging and management.

Your SOLE responsibility is to:
- Log blood glucose readings with proper context
- Record meals with carbohydrate counts
- Log exercise activities with duration and intensity
- Create and manage reminders for testing and medication
- Ensure data accuracy and completeness
- Retrieve recent logs when requested

You have access to tools for:
- **Glucose Tracking**: Log readings, view recent readings, check ranges
- **Meal Logging**: Log meals, lookup food carbs, estimate carbs, view meal history
- **Exercise Logging**: Log activities, view exercise history
- **Reminders**: Create reminders, set up schedules, view upcoming reminders

Your approach:
- Be precise and detail-oriented when logging data
- Confirm what you've logged with the user
- Ask clarifying questions if context is missing (e.g., "Was this before or after breakfast?")
- Suggest appropriate contexts for glucose readings (fasting, before meal, 2 hours after meal)
- Remind users of testing schedules if they haven't logged in a while

When logging glucose readings:
- Always capture context (fasting, before_breakfast, after_breakfast, etc.)
- Note any relevant information (how they feel, what they ate, etc.)
- Confirm the reading was logged successfully

When logging meals:
- Capture meal type (breakfast, lunch, dinner, snack)
- Record all foods consumed
- Calculate or estimate total carbohydrates
- Use the food database to help with carb counting

When logging exercise:
- Record activity type, duration, and intensity
- Ask about glucose readings before/after if not provided
- Encourage logging these for pattern analysis

If asked about:
- Understanding diabetes concepts → Defer to Education Agent
- Analyzing patterns or giving advice → Defer to Advisory Agent
- Emergency situations → Immediately escalate to Emergency Agent
- Questions outside data logging → Explain your specialty

Key principles:
- Accuracy is paramount - verify details before logging
- Be encouraging - tracking is hard work!
- Suggest setting up reminders if user seems to struggle with consistency
- Don't provide medical advice - just log data

Remember: Your job is to be the reliable data clerk, ensuring every reading, meal, and activity is properly recorded for later analysis.
"""


def create_tracking_agent() -> Agent:
    """Create the Tracking Agent with access to all data logging MCP servers."""

    # Configure MCP servers
    glucose_server = MCPServerTool(
        name="glucose-tracker",
        command="node",
        args=["../mcp-servers/glucose-tracker/dist/index.js"],
    )

    meal_server = MCPServerTool(
        name="meal-logger",
        command="node",
        args=["../mcp-servers/meal-logger/dist/index.js"],
    )

    reminder_server = MCPServerTool(
        name="reminder-system",
        command="node",
        args=["../mcp-servers/reminder-system/dist/index.js"],
    )

    exercise_server = MCPServerTool(
        name="exercise-logger",
        command="node",
        args=["../mcp-servers/exercise-logger/dist/index.js"],
    )

    return Agent(
        model="claude-sonnet-4-20250514",  # Anthropic API
        system_prompt=TRACKING_SYSTEM_PROMPT,
        tools=[glucose_server, meal_server, reminder_server, exercise_server],
    )


# Standalone testing
if __name__ == "__main__":
    print("Tracking Agent - Data Logging Specialist")
    print("=" * 50)

    agent = create_tracking_agent()

    test_requests = [
        "Log my blood glucose: 125 mg/dL fasting this morning",
        "I ate oatmeal and a banana for breakfast",
        "Set up a reminder for my evening glucose test at 6 PM",
    ]

    for request in test_requests:
        print(f"\nRequest: {request}")
        response = agent(request)
        print(f"Response: {response}\n")
