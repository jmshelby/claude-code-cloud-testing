#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// In-memory storage for blood glucose readings
interface GlucoseReading {
  timestamp: string;
  value: number; // mg/dL
  context: string; // e.g., "fasting", "after_breakfast", "before_lunch"
  notes?: string;
}

const readings: GlucoseReading[] = [];

// Helper function to check if reading is in normal range
function analyzeReading(value: number, context: string): {
  status: string;
  message: string;
  range: string;
} {
  let status = "normal";
  let message = "";
  let range = "";

  // General ranges (these are simplified - actual ranges vary by individual)
  if (context.toLowerCase().includes("fasting") || context.toLowerCase().includes("before")) {
    range = "70-130 mg/dL";
    if (value < 70) {
      status = "low";
      message = "This reading is below the normal fasting range. You may be experiencing hypoglycemia.";
    } else if (value > 130) {
      status = "high";
      message = "This reading is above the normal fasting range.";
    } else {
      message = "This reading is within the normal fasting range.";
    }
  } else if (context.toLowerCase().includes("after")) {
    range = "Less than 180 mg/dL";
    if (value < 70) {
      status = "low";
      message = "This reading is low. You may be experiencing hypoglycemia.";
    } else if (value > 180) {
      status = "high";
      message = "This reading is above the recommended range after meals.";
    } else {
      message = "This reading is within the normal range after meals.";
    }
  } else {
    range = "70-180 mg/dL";
    if (value < 70) {
      status = "low";
      message = "This reading is low. You may be experiencing hypoglycemia.";
    } else if (value > 180) {
      status = "high";
      message = "This reading is elevated.";
    } else {
      message = "This reading is within a reasonable range.";
    }
  }

  return { status, message, range };
}

// Define available tools
const tools: Tool[] = [
  {
    name: "log_glucose",
    description: "Log a blood glucose reading with timestamp, value in mg/dL, context (e.g., 'fasting', 'after_breakfast'), and optional notes",
    inputSchema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "Blood glucose value in mg/dL",
        },
        context: {
          type: "string",
          description: "Context of the reading (e.g., 'fasting', 'after_breakfast', 'before_lunch', 'after_dinner')",
        },
        notes: {
          type: "string",
          description: "Optional notes about the reading (e.g., how you feel, what you ate)",
        },
      },
      required: ["value", "context"],
    },
  },
  {
    name: "get_recent_readings",
    description: "Get recent blood glucose readings. Optionally specify how many readings to retrieve (default: 5)",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of recent readings to retrieve (default: 5)",
        },
      },
    },
  },
  {
    name: "get_statistics",
    description: "Get statistics about blood glucose readings including average, min, max, and trend analysis",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "check_reading_range",
    description: "Check if a blood glucose reading is in the healthy range for a given context",
    inputSchema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "Blood glucose value in mg/dL",
        },
        context: {
          type: "string",
          description: "Context of the reading (e.g., 'fasting', 'after_breakfast')",
        },
      },
      required: ["value", "context"],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "glucose-tracker",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "log_glucose": {
        const { value, context, notes } = args as {
          value: number;
          context: string;
          notes?: string;
        };

        const reading: GlucoseReading = {
          timestamp: new Date().toISOString(),
          value,
          context,
          notes,
        };

        readings.push(reading);

        const analysis = analyzeReading(value, context);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                reading,
                analysis,
                message: `Logged reading of ${value} mg/dL (${context}). ${analysis.message}`,
              }, null, 2),
            },
          ],
        };
      }

      case "get_recent_readings": {
        const { count = 5 } = args as { count?: number };
        const recentReadings = readings.slice(-count).reverse();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: recentReadings.length,
                readings: recentReadings,
              }, null, 2),
            },
          ],
        };
      }

      case "get_statistics": {
        if (readings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  message: "No readings available yet. Start logging readings to see statistics.",
                }, null, 2),
              },
            ],
          };
        }

        const values = readings.map((r) => r.value);
        const average = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Count readings by status
        let lowCount = 0;
        let normalCount = 0;
        let highCount = 0;

        readings.forEach((r) => {
          const analysis = analyzeReading(r.value, r.context);
          if (analysis.status === "low") lowCount++;
          else if (analysis.status === "high") highCount++;
          else normalCount++;
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                total_readings: readings.length,
                average: Math.round(average * 10) / 10,
                min,
                max,
                distribution: {
                  low: lowCount,
                  normal: normalCount,
                  high: highCount,
                },
                latest_reading: readings[readings.length - 1],
              }, null, 2),
            },
          ],
        };
      }

      case "check_reading_range": {
        const { value, context } = args as { value: number; context: string };
        const analysis = analyzeReading(value, context);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                value,
                context,
                ...analysis,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Glucose Tracker MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
