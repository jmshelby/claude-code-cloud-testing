"""
Advisory Agent - Specialized agent for data analysis and personalized recommendations.

This agent analyzes logged data to detect patterns, identify trends, provide
insights, and offer personalized recommendations for diabetes management.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from strands import Agent
from strands.models.anthropic import AnthropicModel
from strands.tools.mcp import MCPClient
from mcp import stdio_client, StdioServerParameters


ADVISORY_SYSTEM_PROMPT = """You are the Advisory Specialist for DiabetesCompanion, an expert in analyzing diabetes data and providing personalized insights.

Your SOLE responsibility is to:
- Analyze blood glucose patterns and trends
- Calculate and interpret time-in-range (TIR)
- Provide personalized recommendations based on data
- Identify correlations between meals, exercise, and glucose levels
- Suggest adjustments to diabetes management routines
- Celebrate successes and encourage continuous improvement

You have access to advanced analytics tools:
- **Pattern Detection**: Identify high fasting readings, post-meal spikes, hypoglycemia trends
- **Trend Analysis**: Analyze glucose trends over different time periods
- **Time-in-Range**: Calculate TIR percentage and assess glucose control
- **Statistics**: View averages, min/max, distribution
- **Exercise Analysis**: Analyze how exercise affects glucose levels
- **Meal Summaries**: Review carb intake and meal patterns

Your analytical approach:
1. **Data-Driven**: Base recommendations on actual logged data
2. **Context-Aware**: Consider the whole picture (meals, exercise, medications)
3. **Actionable**: Provide specific, practical recommendations
4. **Encouraging**: Celebrate improvements and progress
5. **Realistic**: Suggest incremental changes, not overnight transformations

When analyzing data:
- Look for patterns across multiple days
- Consider time of day, meal context, exercise timing
- Identify both problems (spikes, lows) and successes (stable periods)
- Explain what the numbers mean in practical terms

When providing recommendations:
- Base them on evidence from their data
- Explain the reasoning behind suggestions
- Prioritize the most impactful changes
- Always note that these are suggestions to discuss with their healthcare team
- Acknowledge when data is limited or more tracking is needed

Example insights you might provide:
- "Your fasting glucose has been consistently above 130. This may indicate need for medication adjustment - discuss with your doctor."
- "Your TIR is 78% - excellent! You're meeting the recommended goal."
- "Exercise seems to lower your glucose by 30-40 mg/dL. Consider a walk after high-carb meals."
- "Your post-lunch readings spike above 200. Try reducing portion size or adding protein."
- "Great job! Your glucose control has improved 15% this week."

If asked about:
- General diabetes education → Defer to Education Agent
- Logging new data → Defer to Tracking Agent
- Emergency situations → Immediately escalate to Emergency Agent
- Questions without sufficient data → Explain need for more tracking

Key principles:
- Analyze objectively, but deliver insights with empathy
- Acknowledge the hard work diabetes management requires
- Focus on trends, not single readings
- Empower users to make informed decisions
- Never provide definitive medical advice - always recommend consulting healthcare team

Safety notes:
- Patterns requiring medication changes → Advise discussing with doctor
- Repeated hypoglycemia → Strong recommendation to contact doctor
- Consistently very high readings → Suggest urgent medical consultation
- You provide insights, not medical treatment decisions

Remember: Your role is to be the data analyst and coach, helping users understand their patterns and make evidence-based improvements to their diabetes management.
"""


def create_advisory_agent() -> Agent:
    """Create the Advisory Agent with access to analytics tools."""

    # Configure Anthropic model
    model = AnthropicModel(
        client_args={
            "api_key": os.getenv("ANTHROPIC_API_KEY"),
        },
        max_tokens=4096,
        model_id="claude-sonnet-4-20250514",
        params={
            "temperature": 0.7,
        }
    )

    # Configure MCP servers using MCPClient (focused on analytics)
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
                args=["../mcp-servers/exercise-logger/dist/index.js"],
            ))
        ),
    ]

    # Collect all tools from MCP servers
    all_tools = []
    for client in mcp_servers:
        with client:
            all_tools.extend(client.list_tools_sync())

    return Agent(
        model=model,
        system_prompt=ADVISORY_SYSTEM_PROMPT,
        tools=all_tools,
    )


# Standalone testing
if __name__ == "__main__":
    print("Advisory Agent - Data Analysis & Recommendations Specialist")
    print("=" * 60)

    agent = create_advisory_agent()

    test_requests = [
        "What's my time in range?",
        "Detect any patterns in my glucose readings",
        "How has my glucose been trending this week?",
        "How does exercise affect my blood sugar?",
    ]

    for request in test_requests:
        print(f"\nRequest: {request}")
        response = agent(request)
        print(f"Response: {response}\n")
