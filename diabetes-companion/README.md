# Diabetes Companion - AI-Powered Diabetes Management Assistant

**Phase 4: Production-Ready System** - A complete demonstration of AWS Strands Agents showcasing specialized multi-agent collaboration, production features including A1C estimation, data export, web search integration, and comprehensive diabetes management capabilities.

## Overview

**Diabetes Companion** is a production-ready AI-powered multi-agent system for diabetes management. This project demonstrates the complete evolution from basic tracking (Phase 1) through advanced analytics (Phase 2), multi-agent specialization (Phase 3), to production-ready features (Phase 4) using AWS Strands Agents framework.

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

### Phase 3 (Multi-Agent System)
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

### Phase 4 (Production Features) - **Current**
- ✅ **A1C Estimation**: Calculate estimated A1C percentage from average glucose using Nathan et al. (2008) clinical formula
- ✅ **Bidirectional A1C Conversion**: Convert A1C ↔ estimated average glucose (eAG)
- ✅ **Clinical Categorization**: Automatic interpretation (Normal, Prediabetes, Good/Fair/Poor Control)
- ✅ **Web Search Integration**: Find diabetes-friendly recipes and medical research information
- ✅ **Recipe Database**: 100+ curated diabetes-friendly recipes organized by meal type and dietary preference with carb counts
- ✅ **Data Export**: Export glucose, meal, and exercise data to CSV format for healthcare providers
- ✅ **Comprehensive Reports**: Generate diabetes management summaries with glucose stats, A1C estimate, TIR, and recommendations
- ✅ **Evidence-Based**: ADA guidelines, clinical formulas, medically accurate interpretations
- ✅ **Healthcare Integration**: Ready-to-share CSV exports and summary reports for medical appointments

## Architecture (Phase 4: Production-Ready System)

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
        ┌──────────────────────────────────────┼──────────────────────────────────────┐
        │                  │                   │                  │                   │
        ▼                  ▼                   ▼                  ▼                   ▼
   ┌──────────┐      ┌──────────┐       ┌──────────┐      ┌──────────┐       ┌──────────┐
   │ Glucose  │      │   Meal   │       │ Exercise │      │ Reminder │       │Web Search│
   │ Tracker  │      │  Logger  │       │  Logger  │      │  System  │       │  (MCP)   │
   │  (MCP)   │      │  (MCP)   │       │  (MCP)   │      │  (MCP)   │       │  Phase 4 │
   └──────────┘      └──────────┘       └──────────┘      └──────────┘       └──────────┘
   TypeScript        TypeScript         TypeScript        TypeScript         TypeScript

Pattern Detection  50+ Food Database  Activity Tracking  Testing Schedules  Recipe Database
Trend Analysis     Carb Counting      Impact Analysis    Medication Alerts  100+ Recipes
Time-in-Range      Daily Summaries    Weekly Goals                          Research Info

                                    ┌──────────────────┐
                                    │  Export Tools    │
                                    │      (MCP)       │
                                    │    Phase 4       │
                                    └──────────────────┘
                                       TypeScript

                                   A1C Estimation (Nathan et al. 2008)
                                   CSV Export (Glucose/Meals/Exercise)
                                   Summary Reports for Healthcare
                                   Clinical Categorization
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
- **LLM**: Anthropic Claude Sonnet 4 (via Anthropic API)
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

3. **Anthropic API Account**
   - Sign up at [console.anthropic.com](https://console.anthropic.com)
   - New accounts receive free credits to get started
   - Get your API key from the dashboard

### Anthropic API Setup

1. **Get Your API Key**:
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Sign up or log in
   - Navigate to API Keys
   - Create a new API key

2. **Configure Your API Key**:
   ```bash
   export ANTHROPIC_API_KEY="your-api-key-here"
   ```

   Or add to your shell profile (~/.bashrc, ~/.zshrc, etc.):
   ```bash
   echo 'export ANTHROPIC_API_KEY="your-api-key-here"' >> ~/.bashrc
   source ~/.bashrc
   ```

   On Windows (PowerShell):
   ```powershell
   $env:ANTHROPIC_API_KEY="your-api-key-here"
   ```

**Cost Note**: New Anthropic accounts come with free credits. After that, Claude Sonnet 4 costs approximately:
- $3 per million input tokens
- $15 per million output tokens
- Testing this demo typically costs under $1-2 for a full session

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

# Web Search (Phase 4)
cd mcp-servers/web-search && npm install && npm run build && cd ../..

# Export Tools (Phase 4)
cd mcp-servers/export-tools && npm install && npm run build && cd ../..
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

### Starting the Multi-Agent System (Phase 4)

**IMPORTANT**: Set your Anthropic API key before running:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

From the `diabetes-companion/agent` directory:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Phase 4: Multi-Agent Coordinator (RECOMMENDED)
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

**Phase 4: A1C Estimation and Reports:**
```
You: My average glucose over the past 3 months is 154 mg/dL. What's my estimated A1C?
Agent: Based on your average glucose of 154 mg/dL, your estimated A1C is 7.0%.

Category: Diabetes - Good Control
Interpretation: Your diabetes is well-controlled. This is the target range for most adults.
Goal: Maintain current management. ADA goal for most adults: <7.0%

Note: This is an ESTIMATE using the Nathan et al. (2008) formula. Consult your
healthcare provider for official A1C testing.
```

```
You: Generate a summary report of my diabetes management
Agent: [Creates comprehensive report with:]
- Glucose statistics (average, min, max, time-in-range)
- Estimated A1C with clinical category
- Meal summary (total meals, average carbs)
- Exercise summary (total sessions, minutes)
- Interpretation and recommendations
- Ready to share with healthcare provider
```

**Phase 4: Recipe Search:**
```
You: I need a low-carb breakfast idea
Agent: Here are some diabetes-friendly low-carb breakfast options:

1. Vegetable omelet with spinach and mushrooms (8g carbs)
2. Greek yogurt parfait with berries and nuts (15g carbs)
3. Avocado toast on whole grain bread (22g carbs)
4. Protein smoothie with spinach and berries (12g carbs)

All recipes are portion-controlled and include carb counts for easy tracking!
```

**Phase 4: Data Export:**
```
You: I have a doctor's appointment next week. Can you export my glucose data?
Agent: I've prepared your glucose data export in CSV format:
- Filename: glucose_export_2025-01-15.csv
- 156 readings included
- Columns: Timestamp, Glucose (mg/dL), Context, Notes
- Ready to share with your healthcare provider

[Returns formatted CSV data ready for download]
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

### Web Search ⭐ PHASE 4
- `search_diabetes_recipes` - Find diabetes-friendly recipes by meal type and dietary preference
- `get_recipe_suggestions` - Get personalized recipe recommendations based on preferences
- `search_diabetes_info` - Search for diabetes-related medical information and research
- **100+ Recipe Database**: Low-carb, vegetarian, heart-healthy, and quick options with carb counts

### Export Tools ⭐ PHASE 4
- `estimate_a1c` / `glucose_to_a1c` - Calculate estimated A1C from average glucose (Nathan et al. 2008 formula)
- `a1c_to_glucose` - Convert A1C percentage to estimated average glucose (eAG)
- `generate_summary_report` - Create comprehensive diabetes management report with all metrics
- `export_to_csv` - Export glucose/meals/exercise data to CSV for healthcare providers
- **Clinical Accuracy**: Categorizes as Normal (<5.7%), Prediabetes (5.7-6.4%), or Diabetes (≥6.5%)
- **Treatment Guidance**: Provides ADA-aligned goals based on control level

## Project Structure (Phase 4)

```
diabetes-companion/
├── README.md                          # This file (Phase 4)
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
    ├── exercise-logger/               # Activity tracking
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/index.ts               # Exercise tracking & analysis
    │   └── dist/
    ├── web-search/                    # Phase 4: Recipe & research search ⭐
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── src/index.ts               # 100+ recipes, diabetes info
    │   └── dist/
    └── export-tools/                  # Phase 4: A1C & data export ⭐
        ├── package.json
        ├── tsconfig.json
        ├── src/index.ts               # A1C estimation, CSV export, reports
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
cd ../web-search && npm run build
cd ../export-tools && npm run build
```

### API Key Issues

**Missing API Key Error:**
```
Error: ANTHROPIC_API_KEY environment variable not set
```

Solution:
```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

**Verify API Key is Set:**
```bash
echo $ANTHROPIC_API_KEY
```

**Invalid API Key Error:**
- Check that your key is correct (starts with `sk-ant-`)
- Verify your account has available credits at [console.anthropic.com](https://console.anthropic.com)
- Ensure the key hasn't been revoked

### MCP Server Connection Issues

The agent expects compiled JavaScript in `dist/` folders. Run:
```bash
npm run build
```
in each MCP server directory.

## What Phase 4 Demonstrates

### Production-Ready Features
✅ **Clinical Accuracy** - A1C estimation using peer-reviewed Nathan et al. (2008) formula
✅ **Healthcare Integration** - CSV exports ready for sharing with medical professionals
✅ **Comprehensive Reporting** - Full diabetes management summaries with all key metrics
✅ **Evidence-Based Guidance** - ADA guidelines, clinical categorization, treatment goals
✅ **Recipe Database** - 100+ curated diabetes-friendly meals with accurate carb counts
✅ **Medical Research** - Search capabilities for diabetes information and guidance
✅ **Data Portability** - Export all user data in standardized CSV format
✅ **A1C Conversion Tools** - Bidirectional conversion between A1C and average glucose

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
✅ **Tool Distribution** - Each agent has appropriate MCP server access (6 MCP servers)
✅ **Intent Analysis** - Coordinator understands user requests and routes correctly
✅ **Handoff Management** - Smooth transitions between agent specialists
✅ **Emergency Detection** - Pattern matching for critical situations
✅ **Polyglot Integration** - Python agents + TypeScript MCP servers
✅ **Production Tools** - A1C estimation, data export, recipe search, reporting

### Real-World Benefits
✅ **Expert Responses** - Each domain handled by specialized knowledge
✅ **Better Accuracy** - Focused agents are better at their specialty
✅ **Safety** - Emergency agent ensures critical situations get proper attention
✅ **Healthcare Ready** - Reports and exports designed for medical appointments
✅ **Clinical Precision** - Medically accurate formulas and ADA-aligned recommendations
✅ **Maintainability** - Easy to update one specialist without affecting others
✅ **Extensibility** - Add new specialists without restructuring
✅ **User Trust** - Transparency about which expert is responding

## Future Enhancements (Phase 5+)

### Potential Phase 5 Features
- **Session Persistence**: Strands SessionManager with S3/DynamoDB for conversation continuity
- **Medication Tracking**: Insulin and oral medication logging with dosage tracking
- **Alert System**: Proactive notifications for patterns requiring attention
- **CGM Integration**: Connect to continuous glucose monitors (Dexcom, Libre)
- **Telemedicine Ready**: Generate visit summaries for telehealth appointments
- **PDF Reports**: Professional PDF exports with charts and visualizations
- **Mobile App**: Native mobile interface for on-the-go tracking
- **Integration APIs**: Connect with Apple Health, Google Fit, MyFitnessPal
- **Nutrition AI**: Image recognition for meal logging via photo
- **Predictive Analytics**: Machine learning for glucose trend prediction

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
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Anthropic Console](https://console.anthropic.com) - Get API keys and manage credits
- [American Diabetes Association (ADA)](https://diabetes.org/)
- [Understanding Time in Range](https://diatribe.org/time-in-range)

## Technical Highlights

### Why This is a Great Strands Demo (Phase 4)

1. **Real-World Problem**: Diabetes affects 537M people globally - practical healthcare application
2. **Multi-Agent Architecture**: 5 agents (coordinator + 4 specialists) working together
3. **Production-Ready Tools**: 6 specialized MCP servers with 30+ tools
4. **Clinical Accuracy**: Peer-reviewed formulas (Nathan et al. 2008), ADA guidelines
5. **Advanced Analytics**: Pattern detection, trend analysis, TIR calculation, A1C estimation
6. **Healthcare Integration**: CSV exports, comprehensive reports, data portability
7. **Intelligent Routing**: Demonstrates agent coordination and handoffs
8. **Emergency Handling**: Priority-based routing for critical situations
9. **Polyglot Design**: Python agents + TypeScript MCP servers seamlessly integrated
10. **Practical Value**: Actual health management utility ready for real-world use
11. **Scalability**: Easy to add new specialized agents or capabilities
12. **Complete Evolution**: Demonstrates progression from Phase 1 → 2 → 3 → 4

### Code Quality
- **Python**: Clean OOP with DiabetesCoordinator class and modular agent system
- **TypeScript**: Type-safe MCP servers with comprehensive error handling
- **Modularity**: Each agent and MCP server is independent and testable
- **Documentation**: Detailed system prompts, inline comments, comprehensive README
- **Architecture**: Clear separation of concerns (coordinator, specialists, tool servers)
- **Extensibility**: Easy to add new agents, tools, or modify existing ones
- **Medical Accuracy**: Clinically validated formulas and evidence-based recommendations

### Progressive Complexity Showcase
- **Phase 1**: Basic tracking (2 MCP servers, 1 agent, ~10 tools)
- **Phase 2**: Advanced analytics (4 MCP servers, 1 agent, ~20 tools)
- **Phase 3**: Multi-agent system (4 MCP servers, 5 agents, intelligent routing)
- **Phase 4**: Production-ready (6 MCP servers, 30+ tools, clinical features) ← **Current**
- **Phase 5+**: Persistence, integrations, deployment (future)

## Contributing

This is an educational demonstration project. Contributions welcome for:
- Additional specialized agents (nutrition agent, medication agent, etc.)
- Additional MCP servers (medication tracking, CGM integration, nutrition AI)
- Enhanced routing algorithms and multi-agent coordination patterns
- Advanced multi-agent patterns (swarm intelligence, graph workflows)
- Session persistence with Strands SessionManager
- UI/dashboard integration (web, mobile)
- Deployment examples (AWS Lambda, ECS, Fargate)
- Integration with health platforms (Apple Health, Google Fit)
- Visualization and charting capabilities

## License

This is an educational demonstration project showing AWS Strands Agents capabilities.

---

**Built with AWS Strands Agents** 🧬 | **Powered by Amazon Bedrock** ☁️ | **MCP Protocol** 🔌
