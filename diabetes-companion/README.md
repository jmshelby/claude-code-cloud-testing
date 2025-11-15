# Diabetes Companion - AI-Powered Diabetes Management Assistant

**Phase 2: Active Assistant** - A comprehensive demonstration of AWS Strands Agents for diabetes management, combining Python-based agent orchestration with TypeScript MCP (Model Context Protocol) servers.

## Overview

**Diabetes Companion** is an AI assistant designed to help people manage diabetes with data-driven insights. It showcases how AWS Strands Agents can orchestrate multiple specialized tools through MCP servers to provide an advanced health management experience.

## Features

### Phase 1 (Basic Companion)
- ✅ Educational Q&A about diabetes management
- ✅ Blood glucose tracking with range checking
- ✅ Meal logging with carbohydrate counting
- ✅ Food database with 50+ common foods

### Phase 2 (Active Assistant) - **Current**
- ✅ **Advanced Pattern Detection**: Identifies high morning readings, post-meal spikes, hypoglycemia trends
- ✅ **Trend Analysis**: Analyzes glucose trends over 3 days, week, 2 weeks, or month
- ✅ **Time-in-Range (TIR)**: Calculates key diabetes metric (goal: >70%, ideally >80%)
- ✅ **Exercise Tracking**: Log activities, track glucose impact, get personalized recommendations
- ✅ **Smart Reminders**: Set up testing schedules (minimal/standard/intensive) and medication reminders
- ✅ **Weekly Exercise Summaries**: Track progress toward ADA's 150-minute weekly goal
- ✅ **Glucose Impact Analysis**: See how exercise affects your blood sugar

## Architecture

```
┌─────────────────────────────────────────┐
│   Strands Agent (Python)                │
│   - Educational diabetes knowledge      │
│   - Conversation management             │
│   - Multi-tool orchestration            │
│   - Pattern recognition                 │
└──────────┬──────────────────────────────┘
           │
           ├──────────┬──────────┬──────────┬──────────┐
           │          │          │          │          │
           ▼          ▼          ▼          ▼          ▼
    ┌──────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │ Glucose  │ │  Meal   │ │Reminder │ │Exercise │
    │ Tracker  │ │ Logger  │ │ System  │ │ Logger  │
    │  (MCP)   │ │  (MCP)  │ │  (MCP)  │ │  (MCP)  │
    └──────────┘ └─────────┘ └─────────┘ └─────────┘
    TypeScript   TypeScript  TypeScript  TypeScript

    Enhanced      50+ Food    Testing     Activity
    Analytics     Database    Schedules   Tracking
```

### Technology Stack

- **Agent Framework**: AWS Strands Agents (Python)
- **Tool Servers**: Model Context Protocol (MCP) servers in TypeScript/Node.js
- **LLM**: Amazon Bedrock (Claude 3.7 Sonnet)
- **Architecture**: Polyglot (Python + TypeScript working seamlessly)

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

## Quick Start

### One-Command Setup

```bash
cd diabetes-companion
./setup.sh
```

This will install all dependencies and build all MCP servers.

### Manual Installation

<details>
<summary>Click to expand manual installation steps</summary>

#### 1. Install All MCP Servers

```bash
cd diabetes-companion

# Glucose Tracker
cd mcp-servers/glucose-tracker && npm install && npm run build && cd ../..

# Meal Logger
cd mcp-servers/meal-logger && npm install && npm run build && cd ../..

# Reminder System
cd mcp-servers/reminder-system && npm install && npm run build && cd ../..

# Exercise Logger
cd mcp-servers/exercise-logger && npm install && npm run build && cd ../..
```

#### 2. Install Python Agent

```bash
cd agent
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

</details>

## Usage

### Starting the Agent

From the `diabetes-companion/agent` directory:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python agent.py
```

### Example Interactions

**Getting Started:**
```
You: I was just diagnosed with Type 2 diabetes. What should I do first?
Agent: [Provides empathetic guidance and suggests setting up testing schedule]
```

**Logging Glucose with Pattern Detection:**
```
You: My fasting glucose has been 145, 152, 148 over the last 3 days
Agent: [Logs readings, detects high fasting pattern, provides recommendations]
```

**Time-in-Range Analysis:**
```
You: What's my time in range?
Agent: [Calculates TIR percentage, provides assessment against 70% goal]
```

**Exercise Tracking:**
```
You: I walked for 30 minutes today. My glucose was 160 before and 125 after
Agent: [Logs exercise, analyzes glucose impact, provides feedback]

You: What exercise should I do as a beginner?
Agent: [Provides personalized recommendations based on fitness level]
```

**Setting Up Reminders:**
```
You: Help me set up a testing schedule
Agent: [Offers minimal/standard/intensive options, creates daily reminders]

You: When is my next reminder?
Agent: [Shows next upcoming test/medication reminder with time remaining]
```

**Trend Analysis:**
```
You: Show me my glucose trends over the past week
Agent: [Displays daily averages, trend direction, interpretation]

You: Detect any patterns in my readings
Agent: [Analyzes for post-meal spikes, high fasting, variability, etc.]
```

**Meal Planning:**
```
You: I'm planning to eat an apple and yogurt. How many carbs?
Agent: [Estimates total carbs using food database]

You: I ate oatmeal and a banana for breakfast
Agent: [Logs meal with estimated carbs, provides feedback]
```

## Available Tools by MCP Server

### Glucose Tracker (Enhanced for Phase 2)
- `log_glucose` - Log blood glucose reading with context
- `get_recent_readings` - View recent readings
- `get_statistics` - Calculate averages, min/max, distribution
- `check_reading_range` - Check if reading is healthy
- **`detect_patterns`** - Identify high fasting, post-meal spikes, trends ⭐
- **`get_trend_analysis`** - Analyze trends over time periods ⭐
- **`get_time_in_range`** - Calculate TIR percentage ⭐

### Meal Logger
- `log_meal` - Log meals with carb counts
- `lookup_food_carbs` - Query 50+ food database
- `get_recent_meals` - View meal history
- `get_daily_summary` - Daily carb totals
- `estimate_meal_carbs` - Plan meals

### Reminder System ⭐ NEW
- `create_reminder` - Create test/medication reminders
- `setup_testing_schedule` - Auto-generate daily schedules (minimal/standard/intensive)
- `list_reminders` - View all reminders
- `get_next_reminder` - See next upcoming reminder
- `toggle_reminder` - Enable/disable reminders
- `delete_reminder` - Remove reminders

### Exercise Logger ⭐ NEW
- `log_exercise` - Track activity with duration, intensity, glucose readings
- `get_exercise_info` - Learn about specific exercises
- `get_recent_exercises` - View exercise history
- `get_weekly_summary` - Track weekly activity against ADA's 150-minute goal
- `get_exercise_recommendations` - Get personalized plans (beginner/intermediate/advanced)
- `analyze_glucose_impact` - See how exercise affects blood sugar

## Project Structure

```
diabetes-companion/
├── README.md                          # This file (Phase 2)
├── setup.sh                           # One-command setup script
├── .gitignore                         # Git ignore rules
├── agent/                             # Python Strands agent
│   ├── agent.py                       # Main agent (Phase 2 enhanced)
│   ├── requirements.txt               # Python dependencies
│   └── venv/                          # Virtual environment
└── mcp-servers/                       # MCP tool servers
    ├── glucose-tracker/               # Enhanced with analytics
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/index.ts               # Pattern detection, trends, TIR
    │   └── dist/
    ├── meal-logger/                   # Food database
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/index.ts               # 50+ foods with carb data
    │   └── dist/
    ├── reminder-system/               # NEW: Smart reminders
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/index.ts               # Testing & medication schedules
    │   └── dist/
    └── exercise-logger/               # NEW: Activity tracking
        ├── package.json
        ├── tsconfig.json
        ├── src/index.ts               # Exercise tracking & analysis
        └── dist/
```

## Troubleshooting

### "Module not found" errors

Ensure all MCP servers are built:
```bash
cd diabetes-companion
./setup.sh
```

Or manually:
```bash
cd mcp-servers/glucose-tracker && npm run build
cd ../meal-logger && npm run build
cd ../reminder-system && npm run build
cd ../exercise-logger && npm run build
```

### AWS Credentials Issues

Verify credentials:
```bash
aws sts get-caller-identity
```

Check Bedrock access:
```bash
aws bedrock list-foundation-models --region us-east-1
```

### MCP Server Connection Issues

The agent expects compiled JavaScript in `dist/` folders. Run:
```bash
npm run build
```
in each MCP server directory.

## What Phase 2 Demonstrates

### Strands Agents Capabilities
✅ **Multi-tool orchestration** - 4 MCP servers working together
✅ **Intelligent routing** - Agent chooses right tools for user's request
✅ **Polyglot architecture** - Python agent + TypeScript tools
✅ **Advanced analytics** - Pattern detection and trend analysis
✅ **Proactive assistance** - Agent suggests insights and recommendations

### Real-World Value
✅ **Pattern detection** - Identifies glucose control issues automatically
✅ **Time-in-range** - Industry-standard diabetes metric
✅ **Exercise integration** - Shows exercise impact on glucose
✅ **Smart scheduling** - Adapts to user's lifestyle (minimal/standard/intensive)
✅ **Actionable insights** - Specific recommendations based on data

## Future Enhancements (Phase 3+)

### Phase 3: Multi-Agent System
- Specialized agents:
  - **Education Agent**: Deep diabetes knowledge
  - **Tracking Agent**: Data management
  - **Advisory Agent**: Pattern-based recommendations
  - **Emergency Agent**: Critical situation handling
- Agent-to-Agent (A2A) communication
- Agent handoffs and delegation

### Phase 4: Production Features
- **Session Persistence**: Strands SessionManager with S3
- **Web Search Integration**: Real-time recipe and research lookup
- **Data Export**: CSV/PDF reports for doctors
- **Medication Tracking**: Insulin and oral medication logging
- **A1C Estimation**: Calculate estimated A1C from glucose readings
- **Alert System**: Notifications for patterns requiring attention
- **CGM Integration**: Connect to continuous glucose monitors
- **Telemedicine Ready**: Generate visit summaries

## Key Metrics & Goals

| Metric | Target | Purpose |
|--------|--------|---------|
| Time in Range (TIR) | >70% (ideally >80%) | Primary glucose control metric |
| Fasting Glucose | 70-130 mg/dL | Morning baseline |
| Post-Meal Glucose | <180 mg/dL | 2 hours after eating |
| Weekly Exercise | 150+ minutes | ADA recommendation |
| Testing Frequency | 4-7x daily | Varies by treatment type |

## Safety Disclaimer

**This is a demonstration tool, not medical advice.**

- Always consult healthcare professionals for personalized medical guidance
- Severe symptoms (confusion, very high/low readings) require emergency care
- This tool complements but does not replace proper medical care
- Pattern detection helps identify trends but isn't diagnostic

## Learning Resources

- [AWS Strands Agents Documentation](https://strandsagents.com/latest/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Strands GitHub Examples](https://github.com/strands-agents/samples)
- [Amazon Bedrock](https://aws.amazon.com/bedrock/)
- [American Diabetes Association (ADA)](https://diabetes.org/)
- [Understanding Time in Range](https://diatribe.org/time-in-range)

## Technical Highlights

### Why This is a Great Strands Demo

1. **Real-World Problem**: Diabetes affects 537M people globally
2. **Multi-Tool Complexity**: 4 specialized MCP servers with 20+ tools
3. **Advanced Analytics**: Pattern detection, trend analysis, TIR calculation
4. **Polyglot Design**: Python + TypeScript demonstrating MCP interoperability
5. **Practical Value**: Actual health management utility beyond "hello world"
6. **Scalability Path**: Clear roadmap to production-ready system

### Code Quality
- Type-safe TypeScript MCP servers
- Comprehensive error handling
- In-memory storage (easily upgradeable to databases)
- Modular, maintainable architecture
- Detailed inline documentation

## Contributing

This is an educational demonstration project. Contributions welcome for:
- Additional MCP servers (medication tracking, A1C estimation, etc.)
- Enhanced analytics algorithms
- Multi-agent patterns (Phase 3)
- Session persistence (Phase 4)
- UI/dashboard integration

## License

This is an educational demonstration project showing AWS Strands Agents capabilities.

---

**Built with AWS Strands Agents** 🧬 | **Powered by Amazon Bedrock** ☁️ | **MCP Protocol** 🔌
