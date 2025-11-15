# Diabetes Companion - AI-Powered Diabetes Management Assistant

A Phase 1 demonstration of AWS Strands Agents for diabetes management, combining Python-based agent orchestration with TypeScript MCP (Model Context Protocol) servers.

## Overview

**Diabetes Companion** is an AI assistant designed to help people newly diagnosed with diabetes manage their condition. It showcases how AWS Strands Agents can orchestrate multiple specialized tools through MCP servers to provide a comprehensive health management experience.

### Phase 1 Features

- **Educational Q&A**: Get clear, empathetic answers about diabetes management
- **Blood Glucose Tracking**: Log readings, check ranges, view trends and statistics
- **Meal Logging**: Track meals and carbohydrate intake with a built-in food database
- **Smart Analysis**: Receive context-aware feedback on glucose readings and meals

## Architecture

```
┌─────────────────────────────────────────┐
│   Strands Agent (Python)                │
│   - Educational diabetes knowledge      │
│   - Conversation management             │
│   - Tool orchestration                  │
└──────────┬──────────────────────────────┘
           │
           ├──────────────┬──────────────────┐
           │              │                  │
           ▼              ▼                  ▼
    ┌──────────┐   ┌──────────┐      ┌──────────┐
    │ Glucose  │   │   Meal   │      │  Future  │
    │ Tracker  │   │  Logger  │      │  Tools   │
    │  (MCP)   │   │  (MCP)   │      │          │
    └──────────┘   └──────────┘      └──────────┘
    TypeScript     TypeScript
```

### Technology Stack

- **Agent Framework**: AWS Strands Agents (Python)
- **Tool Servers**: Model Context Protocol (MCP) servers in TypeScript/Node.js
- **LLM**: Amazon Bedrock (Claude 3.7 Sonnet)

## Prerequisites

### Required Software

1. **Python 3.9+**
   ```bash
   python3 --version
   ```

2. **Node.js 18+** and npm
   ```bash
   node --version
   npm --version
   ```

3. **AWS Account with Bedrock Access**
   - Access to Claude 3.7 Sonnet model in Amazon Bedrock
   - AWS credentials configured locally

### AWS Setup

1. **Enable Amazon Bedrock Model Access**:
   - Go to AWS Console → Amazon Bedrock → Model Access
   - Request access to "Anthropic Claude 3.7 Sonnet" model
   - Wait for approval (usually instant)

2. **Configure AWS Credentials**:
   ```bash
   aws configure
   # Enter your AWS Access Key ID
   # Enter your AWS Secret Access Key
   # Set default region (e.g., us-east-1 or us-west-2)
   ```

   Or use environment variables:
   ```bash
   export AWS_ACCESS_KEY_ID="your-access-key"
   export AWS_SECRET_ACCESS_KEY="your-secret-key"
   export AWS_DEFAULT_REGION="us-east-1"
   ```

## Installation

### 1. Install TypeScript MCP Servers

Navigate to each MCP server directory and install dependencies:

```bash
# Install Glucose Tracker server
cd diabetes-companion/mcp-servers/glucose-tracker
npm install
npm run build

# Install Meal Logger server
cd ../meal-logger
npm install
npm run build

cd ../../..
```

### 2. Install Python Agent

```bash
# Create a virtual environment (recommended)
cd diabetes-companion/agent
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Starting the Agent

From the `diabetes-companion/agent` directory:

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Run in interactive mode
python agent.py
```

### Example Interactions

**Educational Questions:**
```
You: I just got diagnosed with Type 2 diabetes. What should I know?
DiabetesCompanion: [Provides comprehensive, empathetic information about diabetes]
```

**Logging Blood Glucose:**
```
You: My blood glucose is 145 mg/dL after breakfast
DiabetesCompanion: [Logs the reading, analyzes if it's in range, provides feedback]
```

**Meal Planning:**
```
You: How many carbs are in an apple?
DiabetesCompanion: [Looks up food database, provides carb count and serving size]

You: I ate oatmeal and a banana for breakfast
DiabetesCompanion: [Logs meal, estimates carbs, provides guidance]
```

**Viewing Trends:**
```
You: Show me my recent blood glucose readings
DiabetesCompanion: [Retrieves and displays recent readings with analysis]

You: What's my average glucose level?
DiabetesCompanion: [Provides statistics including average, min, max, and trends]
```

### Single Query Mode (for testing)

```bash
python agent.py --single "What are normal blood glucose ranges?"
```

## Available Tools

### Glucose Tracker MCP Server

- `log_glucose`: Log blood glucose reading with context
- `get_recent_readings`: View recent glucose readings
- `get_statistics`: Get averages, min/max, and trend analysis
- `check_reading_range`: Check if a reading is in healthy range

### Meal Logger MCP Server

- `log_meal`: Log meals with foods and carbohydrate counts
- `lookup_food_carbs`: Look up carbs for common foods
- `get_recent_meals`: View recent meal logs
- `get_daily_summary`: Get today's meal summary and total carbs
- `estimate_meal_carbs`: Estimate carbs for a list of foods

## Project Structure

```
diabetes-companion/
├── README.md                          # This file
├── agent/                             # Python Strands agent
│   ├── agent.py                       # Main agent code
│   ├── requirements.txt               # Python dependencies
│   └── venv/                          # Virtual environment (created during setup)
└── mcp-servers/                       # MCP tool servers
    ├── glucose-tracker/               # Blood glucose tracking
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/
    │   │   └── index.ts               # Glucose tracker implementation
    │   └── dist/                      # Compiled JavaScript (created by build)
    └── meal-logger/                   # Meal and carb tracking
        ├── package.json
        ├── tsconfig.json
        ├── src/
        │   └── index.ts               # Meal logger implementation
        └── dist/                      # Compiled JavaScript (created by build)
```

## Troubleshooting

### "Module not found" errors

Make sure you've installed dependencies for both MCP servers and the Python agent:
```bash
# For each MCP server
cd mcp-servers/glucose-tracker && npm install && npm run build
cd ../meal-logger && npm install && npm run build

# For the agent
cd ../../agent && pip install -r requirements.txt
```

### AWS Credentials Issues

Verify your AWS credentials are configured:
```bash
aws sts get-caller-identity
```

Ensure you have Bedrock model access:
```bash
aws bedrock list-foundation-models --region us-east-1
```

### MCP Server Connection Issues

The agent needs to find the compiled MCP server files. Ensure:
1. Both servers are built: `npm run build` in each server directory
2. The `dist/` folders exist and contain `index.js`

## Future Enhancements (Phase 2+)

- **Time-based reminders**: Scheduled notifications for testing blood glucose
- **Pattern detection**: AI-driven insights about glucose trends
- **Exercise logging**: Track physical activity and its impact
- **Medication reminders**: Track insulin and medication schedules
- **Report generation**: Create summaries for doctor visits
- **Multi-agent system**: Specialized agents for education, tracking, and emergencies
- **Session persistence**: Remember user history across sessions using Strands SessionManager
- **Web search integration**: Real-time diabetes research and recipe lookup
- **Data export**: Export logs to CSV/PDF for healthcare providers

## Safety Disclaimer

**This is a demonstration tool, not medical advice.**

- Always consult healthcare professionals for personalized medical guidance
- Severe symptoms (confusion, very high/low readings) require emergency care
- This tool complements but does not replace proper medical care

## Learning Resources

- [AWS Strands Agents Documentation](https://strandsagents.com/latest/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Strands GitHub Examples](https://github.com/strands-agents/samples)
- [Amazon Bedrock](https://aws.amazon.com/bedrock/)

## License

This is an educational demonstration project.
