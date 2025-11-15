# Diabetes Companion - AI-Powered Diabetes Management Assistant

**Phase 3: Multi-Agent System** - An advanced demonstration of AWS Strands Agents showcasing specialized agent collaboration, intelligent routing, and agent-to-agent coordination for comprehensive diabetes management.

## Overview

**Diabetes Companion** is an AI-powered multi-agent system for diabetes management. Phase 3 demonstrates how Strands Agents can build sophisticated systems where specialized agents collaborate, each focusing on their area of expertise while working together seamlessly through intelligent coordination.

## Features

### Phase 1 (Basic Companion)
- ✅ Educational Q&A about diabetes management
- ✅ Blood glucose tracking with range checking
- ✅ Meal logging with carbohydrate counting
- ✅ Food database with 50+ common foods

### Phase 2 (Active Assistant)
- ✅ **Advanced Pattern Detection**: Identifies high morning readings, post-meal spikes, hypoglycemia trends
- ✅ **Trend Analysis**: Analyzes glucose trends over 3 days, week, 2 weeks, or month
- ✅ **Time-in-Range (TIR)**: Calculates key diabetes metric (goal: >70%, ideally >80%)
- ✅ **Exercise Tracking**: Log activities, track glucose impact, get personalized recommendations
- ✅ **Smart Reminders**: Set up testing schedules (minimal/standard/intensive) and medication reminders
- ✅ **Weekly Exercise Summaries**: Track progress toward ADA's 150-minute weekly goal
- ✅ **Glucose Impact Analysis**: See how exercise affects your blood sugar

### Phase 3 (Multi-Agent System) - **Current**
- ✅ **Specialized Agents**: 4 expert agents with focused responsibilities
  - 🎓 **Education Agent**: Diabetes knowledge, medical concepts, evidence-based guidance
  - 📊 **Tracking Agent**: Data logging specialist (glucose, meals, exercise, reminders)
  - 📈 **Advisory Agent**: Pattern analysis, personalized recommendations, TIR monitoring
  - 🚨 **Emergency Agent**: Critical situation response (hypo/hyperglycemia protocols)
- ✅ **Intelligent Routing**: Coordinator analyzes requests and routes to appropriate specialist
- ✅ **Emergency Prioritization**: Automatic detection of critical situations
- ✅ **Multi-Agent Coordination**: Complex queries handled by multiple agents
- ✅ **Transparent Operation**: Users know which expert is helping them
- ✅ **Agent Specialization**: Each agent optimized for specific diabetes management tasks

## Architecture (Phase 3: Multi-Agent System)

```
                         User Request
                              │
                              ▼
                   ┌──────────────────────┐
                   │  Coordinator Agent   │
                   │  - Request Analysis  │
                   │  - Intelligent Route │
                   │  - Emergency Check   │
                   └──────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼                    ▼
┌───────────────┐   ┌────────────────┐   ┌───────────────┐   ┌────────────────┐
│   Education   │   │   Tracking     │   │   Advisory    │   │   Emergency    │
│     Agent     │   │     Agent      │   │     Agent     │   │     Agent      │
│               │   │                │   │               │   │                │
│  🎓 Diabetes  │   │  📊 Data       │   │  📈 Pattern   │   │  🚨 Critical   │
│   Knowledge   │   │   Logging      │   │   Analysis    │   │   Response     │
│               │   │                │   │               │   │                │
│  - Concepts   │   │  - Glucose     │   │  - Trends     │   │  - Hypo <70    │
│  - Education  │   │  - Meals       │   │  - TIR        │   │  - Hyper >250  │
│  - Guidance   │   │  - Exercise    │   │  - Insights   │   │  - DKA         │
│               │   │  - Reminders   │   │  - Recommend  │   │  - Emergency   │
└───────────────┘   └───────┬────────┘   └───────┬───────┘   └───────┬────────┘
                            │                    │                   │
      (No MCP access)       │                    │                   │
                            │                    │                   │
                            └────────────────────┴───────────────────┘
                                               │
                    ┌──────────────────────────┼──────────────────────────┐
                    │                          │                          │
                    ▼                          ▼                          ▼
             ┌──────────┐              ┌──────────┐              ┌──────────┐
             │ Glucose  │              │   Meal   │              │Exercise  │
             │ Tracker  │              │  Logger  │              │ Logger   │
             │  (MCP)   │              │  (MCP)   │              │  (MCP)   │
             └──────────┘              └──────────┘              └──────────┘
             TypeScript                TypeScript                TypeScript

         Pattern Detection          50+ Food Database        Activity Tracking
         Trend Analysis             Carb Counting            Impact Analysis
         Time-in-Range              Daily Summaries          Weekly Goals

                    ┌────────────────────┐
                    │  Reminder System   │
                    │      (MCP)         │
                    └────────────────────┘
                       TypeScript

                    Testing Schedules
                    Medication Alerts
```

### Multi-Agent Coordination Flow

1. **User** sends request → **Coordinator Agent**
2. **Coordinator** analyzes intent and urgency
3. **Emergency check** (highest priority): Critical glucose levels or symptoms?
4. **Route** to appropriate specialist agent:
   - Questions → Education Agent
   - Logging → Tracking Agent
   - Analysis → Advisory Agent
   - Emergency → Emergency Agent
5. **Specialist agent** uses MCP tools as needed
6. **Response** returned to user with agent identification

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

### Starting the Multi-Agent System (Phase 3)

From the `diabetes-companion/agent` directory:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Phase 3: Multi-Agent Coordinator (RECOMMENDED)
python coordinator_agent.py

# Alternative: Phase 2 single agent (for comparison)
python agent.py
```

**What happens on startup:**
```
Initializing DiabetesCompanion Multi-Agent System...
Loading specialized agents...
  ✓ Education Agent loaded
  ✓ Tracking Agent loaded
  ✓ Advisory Agent loaded
  ✓ Emergency Agent loaded

Multi-Agent System Ready!
```

### Example Interactions (Phase 3: Multi-Agent System)

**Education Request** → Routes to Education Agent 🎓
```
You: What is Type 2 diabetes and how does it develop?

[Routing to: EDUCATION AGENT]

Education Agent: Type 2 diabetes is a metabolic condition where your body becomes
resistant to insulin or doesn't produce enough insulin to maintain normal blood
glucose levels. Here's how it typically develops...
[Provides comprehensive, evidence-based explanation]
```

**Data Logging** → Routes to Tracking Agent 📊
```
You: My fasting glucose is 128 mg/dL this morning

[Routing to: TRACKING AGENT]

Tracking Agent: I've logged your fasting glucose reading of 128 mg/dL. This is
slightly above the normal fasting range (70-130 mg/dL), but just at the upper limit.
Keep tracking to see if this is a pattern.
```

**Pattern Analysis** → Routes to Advisory Agent 📈
```
You: Can you detect any patterns in my glucose readings?

[Routing to: ADVISORY AGENT]

Advisory Agent: Analyzing your glucose data over the past 7 days... I've detected:
- High fasting glucose pattern: 4/5 fasting readings above 130 mg/dL
- Your time-in-range is 72% - good! You're meeting the 70% target
- Post-dinner readings are well controlled
Recommendation: Discuss your fasting pattern with your doctor...
```

**Emergency Situation** → Routes to Emergency Agent 🚨 (PRIORITY)
```
You: I'm feeling shaky and my glucose is 58 mg/dL

[Routing to: EMERGENCY AGENT]

Emergency Agent: ⚠️ HYPOGLYCEMIA - Immediate Action Required:

1. Consume 15g fast-acting carbs RIGHT NOW:
   - 4 glucose tablets, OR
   - 4 oz fruit juice, OR
   - 1 tablespoon honey
2. Wait 15 minutes
3. Recheck your glucose...
[Provides step-by-step emergency protocol]
```

**Complex Multi-Agent Query**
```
You: Log my glucose at 145 after breakfast, and tell me if that's good

[Routing to: TRACKING AGENT]
Tracking Agent: Logged 145 mg/dL (after breakfast)

[Routing to: ADVISORY AGENT]
Advisory Agent: 145 mg/dL 2 hours after breakfast is within the normal range
(<180 mg/dL). Your post-meal control looks good!
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

## Project Structure (Phase 3)

```
diabetes-companion/
├── README.md                          # This file (Phase 3)
├── setup.sh                           # One-command setup script
├── .gitignore                         # Git ignore rules
├── agent/                             # Python Strands agents
│   ├── coordinator_agent.py           # Phase 3: Multi-agent coordinator ⭐
│   ├── agent.py                       # Phase 2: Single agent (legacy)
│   ├── agents/                        # Phase 3: Specialized agents ⭐
│   │   ├── __init__.py
│   │   ├── education_agent.py         # 🎓 Diabetes knowledge specialist
│   │   ├── tracking_agent.py          # 📊 Data logging specialist
│   │   ├── advisory_agent.py          # 📈 Pattern analysis specialist
│   │   └── emergency_agent.py         # 🚨 Critical response specialist
│   ├── requirements.txt               # Python dependencies
│   └── venv/                          # Virtual environment
└── mcp-servers/                       # MCP tool servers (TypeScript)
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
    ├── reminder-system/               # Smart reminders
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/index.ts               # Testing & medication schedules
    │   └── dist/
    └── exercise-logger/               # Activity tracking
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

## What Phase 3 Demonstrates

### Multi-Agent System Capabilities
✅ **Agent Specialization** - 4 focused agents with clear responsibilities
✅ **Intelligent Coordination** - Coordinator routes requests to right specialist
✅ **Emergency Prioritization** - Critical situations detected and handled first
✅ **Transparent Operation** - Users see which agent is helping them
✅ **Multi-Agent Orchestration** - Complex queries handled by multiple agents
✅ **Scalable Architecture** - Easy to add new specialized agents
✅ **Clean Separation** - Education, tracking, analysis, and emergency domains isolated

### Strands Agents Features Showcased
✅ **Agent Composition** - Multiple agents working in coordinated system
✅ **Tool Distribution** - Each agent has appropriate MCP server access
✅ **Intent Analysis** - Coordinator understands user requests and routes correctly
✅ **Handoff Management** - Smooth transitions between agent specialists
✅ **Emergency Detection** - Pattern matching for critical situations
✅ **Polyglot Integration** - Python agents + TypeScript MCP servers

### Real-World Benefits
✅ **Expert Responses** - Each domain handled by specialized knowledge
✅ **Better Accuracy** - Focused agents are better at their specialty
✅ **Safety** - Emergency agent ensures critical situations get proper attention
✅ **Maintainability** - Easy to update one specialist without affecting others
✅ **Extensibility** - Add new specialists without restructuring
✅ **User Trust** - Transparency about which expert is responding

## Future Enhancements (Phase 4+)

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

### Why This is a Great Strands Demo (Phase 3)

1. **Real-World Problem**: Diabetes affects 537M people globally
2. **Multi-Agent Architecture**: 5 agents (coordinator + 4 specialists) working together
3. **Multi-Tool Complexity**: 4 specialized MCP servers with 20+ tools
4. **Advanced Analytics**: Pattern detection, trend analysis, TIR calculation
5. **Intelligent Routing**: Demonstrates agent coordination and handoffs
6. **Emergency Handling**: Shows priority-based routing for critical situations
7. **Polyglot Design**: Python agents + TypeScript MCP servers
8. **Practical Value**: Actual health management utility with specialist expertise
9. **Scalability**: Easy to add new specialized agents or capabilities
10. **Clear Roadmap**: Demonstrates progression from Phase 1 → 2 → 3 → 4

### Code Quality
- **Python**: Clean OOP with DiabetesCoordinator class
- **TypeScript**: Type-safe MCP servers with comprehensive error handling
- **Modularity**: Each agent is independent and testable
- **Documentation**: Detailed system prompts and inline comments
- **Architecture**: Clear separation of concerns (coordinator vs. specialists)
- **Extensibility**: Easy to add new agents or modify existing ones

### Progressive Complexity Showcase
- **Phase 1**: Basic tracking (2 MCP servers, 1 agent)
- **Phase 2**: Advanced analytics (4 MCP servers, 1 agent, 20+ tools)
- **Phase 3**: Multi-agent system (4 MCP servers, 5 agents, intelligent routing) ← **Current**
- **Phase 4**: Production features (persistence, integrations, deployment)

## Contributing

This is an educational demonstration project. Contributions welcome for:
- Additional specialized agents (nutrition agent, medication agent, etc.)
- Additional MCP servers (medication tracking, A1C estimation, CGM integration)
- Enhanced routing algorithms
- Advanced multi-agent patterns (swarm, graph workflows)
- Session persistence (Phase 4)
- UI/dashboard integration
- Deployment examples (Lambda, ECS, etc.)

## License

This is an educational demonstration project showing AWS Strands Agents capabilities.

---

**Built with AWS Strands Agents** 🧬 | **Powered by Amazon Bedrock** ☁️ | **MCP Protocol** 🔌
