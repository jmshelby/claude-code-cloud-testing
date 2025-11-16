#!/bin/bash

echo "=========================================="
echo "Diabetes Companion - Setup Script"
echo "=========================================="
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo "✓ Python version: $(python3 --version)"
echo ""

# Install MCP servers
echo "📦 Installing MCP servers..."
echo ""

echo "Installing Glucose Tracker MCP server..."
cd mcp-servers/glucose-tracker
npm install
npm run build
cd ../..
echo "✓ Glucose Tracker installed"
echo ""

echo "Installing Meal Logger MCP server..."
cd mcp-servers/meal-logger
npm install
npm run build
cd ../..
echo "✓ Meal Logger installed"
echo ""

echo "Installing Reminder System MCP server..."
cd mcp-servers/reminder-system
npm install
npm run build
cd ../..
echo "✓ Reminder System installed"
echo ""

echo "Installing Exercise Logger MCP server..."
cd mcp-servers/exercise-logger
npm install
npm run build
cd ../..
echo "✓ Exercise Logger installed"
echo ""

echo "Installing Web Search MCP server..."
cd mcp-servers/web-search
npm install
npm run build
cd ../..
echo "✓ Web Search installed"
echo ""

echo "Installing Export Tools MCP server..."
cd mcp-servers/export-tools
npm install
npm run build
cd ../..
echo "✓ Export Tools installed"
echo ""

# Set up Python environment
echo "🐍 Setting up Python agent..."
cd agent

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q --upgrade pip
pip install -q -r requirements.txt

echo "✓ Python agent installed"
echo ""

cd ..

echo "=========================================="
echo "✅ Setup complete!"
echo "=========================================="
echo ""
echo "To run the Diabetes Companion:"
echo "  cd agent"
echo "  source venv/bin/activate"
echo ""
echo "  # Phase 4: Multi-Agent System with Production Features (RECOMMENDED)"
echo "  python coordinator_agent.py"
echo ""
echo "  # Alternative: Phase 2 single agent"
echo "  python agent.py"
echo ""
echo "See README.md for more information."
