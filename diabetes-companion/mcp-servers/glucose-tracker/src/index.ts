#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Storage for blood glucose readings
interface GlucoseReading {
  timestamp: string;
  value: number; // mg/dL
  context: string; // e.g., "fasting", "after_breakfast", "before_lunch"
  notes?: string;
}

// Data directory and file path
const DATA_DIR = path.join(os.homedir(), ".diabetes-companion");
const DATA_FILE = path.join(DATA_DIR, "glucose-readings.json");

let readings: GlucoseReading[] = [];

// Ensure data directory exists
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.error(`Created data directory: ${DATA_DIR}`);
  }
}

// Load readings from JSON file
function loadReadings() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      readings = JSON.parse(data);
      console.error(`Loaded ${readings.length} glucose readings from ${DATA_FILE}`);
    } else {
      console.error("No existing data file found. Starting with empty readings.");
    }
  } catch (error) {
    console.error(`Error loading readings: ${error}. Starting with empty readings.`);
    readings = [];
  }
}

// Save readings to JSON file
function saveReadings() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(readings, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving readings: ${error}`);
  }
}

// Initialize storage
ensureDataDirectory();
loadReadings();

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
  {
    name: "detect_patterns",
    description: "Detect patterns in blood glucose readings such as consistently high morning readings, post-meal spikes, or trending up/down",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to analyze (default: 7)",
        },
      },
    },
  },
  {
    name: "get_trend_analysis",
    description: "Get trend analysis showing how glucose levels are changing over time",
    inputSchema: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["3days", "week", "2weeks", "month"],
          description: "Time period to analyze (default: week)",
        },
      },
    },
  },
  {
    name: "get_time_in_range",
    description: "Calculate percentage of readings within target range (70-180 mg/dL) - a key diabetes management metric",
    inputSchema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Number of days to analyze (default: 7)",
        },
      },
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
        saveReadings(); // Persist to disk

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

      case "detect_patterns": {
        const { days = 7 } = args as { days?: number };

        if (readings.length < 3) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: "Need at least 3 readings to detect patterns. Keep logging!",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Get readings from specified period
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const recentReadings = readings.filter(
          (r) => new Date(r.timestamp) >= cutoffDate
        );

        if (recentReadings.length < 3) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: `Only ${recentReadings.length} readings in the last ${days} days. Need at least 3 to detect patterns.`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const patterns: string[] = [];

        // Pattern 1: High morning/fasting readings
        const fastingReadings = recentReadings.filter((r) =>
          r.context.toLowerCase().includes("fasting") ||
          r.context.toLowerCase().includes("before breakfast")
        );
        if (fastingReadings.length >= 2) {
          const highFasting = fastingReadings.filter((r) => r.value > 130);
          if (highFasting.length >= fastingReadings.length * 0.7) {
            patterns.push(
              `High fasting glucose pattern: ${highFasting.length}/${fastingReadings.length} fasting readings are above 130 mg/dL. This may indicate need for medication adjustment.`
            );
          }
        }

        // Pattern 2: Post-meal spikes
        const postMealReadings = recentReadings.filter((r) =>
          r.context.toLowerCase().includes("after")
        );
        if (postMealReadings.length >= 2) {
          const highPostMeal = postMealReadings.filter((r) => r.value > 180);
          if (highPostMeal.length >= postMealReadings.length * 0.7) {
            patterns.push(
              `Post-meal spike pattern: ${highPostMeal.length}/${postMealReadings.length} post-meal readings are above 180 mg/dL. Consider smaller portions, fewer carbs, or more exercise after meals.`
            );
          }
        }

        // Pattern 3: Hypoglycemia trend
        const lowReadings = recentReadings.filter((r) => r.value < 70);
        if (lowReadings.length >= 2) {
          patterns.push(
            `Hypoglycemia pattern: ${lowReadings.length} readings below 70 mg/dL detected. Discuss with your doctor - medication may need adjustment.`
          );
        }

        // Pattern 4: Overall trend (last 5 readings)
        if (recentReadings.length >= 5) {
          const last5 = recentReadings.slice(-5);
          const first3Avg =
            last5.slice(0, 3).reduce((sum, r) => sum + r.value, 0) / 3;
          const last3Avg =
            last5.slice(-3).reduce((sum, r) => sum + r.value, 0) / 3;

          if (last3Avg > first3Avg + 20) {
            patterns.push(
              `Upward trend: Blood glucose has increased by ${Math.round(last3Avg - first3Avg)} mg/dL in recent readings. Monitor closely.`
            );
          } else if (last3Avg < first3Avg - 20) {
            patterns.push(
              `Downward trend: Blood glucose has decreased by ${Math.round(first3Avg - last3Avg)} mg/dL in recent readings. Good progress!`
            );
          }
        }

        // Pattern 5: Variability (high standard deviation)
        const values = recentReadings.map((r) => r.value);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance =
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          values.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev > 50) {
          patterns.push(
            `High variability: Your readings vary significantly (±${Math.round(stdDev)} mg/dL). Try to maintain consistent meal times, portions, and medication schedules.`
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  period_analyzed: `${days} days`,
                  readings_analyzed: recentReadings.length,
                  patterns_detected: patterns.length,
                  patterns:
                    patterns.length > 0
                      ? patterns
                      : ["No significant patterns detected. Your glucose control looks stable!"],
                  recommendation:
                    patterns.length > 0
                      ? "Discuss these patterns with your healthcare provider for personalized advice."
                      : "Continue your current diabetes management routine.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_trend_analysis": {
        const { period = "week" } = args as {
          period?: "3days" | "week" | "2weeks" | "month";
        };

        const periodDays: Record<string, number> = {
          "3days": 3,
          week: 7,
          "2weeks": 14,
          month: 30,
        };

        const days = periodDays[period];
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const periodReadings = readings.filter(
          (r) => new Date(r.timestamp) >= cutoffDate
        );

        if (periodReadings.length < 2) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: `Not enough readings in the last ${period}. Need at least 2 readings to analyze trends.`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Calculate average by day
        const dailyAverages: { date: string; average: number; count: number }[] =
          [];
        const dateMap = new Map<string, number[]>();

        periodReadings.forEach((r) => {
          const date = r.timestamp.split("T")[0];
          if (!dateMap.has(date)) {
            dateMap.set(date, []);
          }
          dateMap.get(date)!.push(r.value);
        });

        dateMap.forEach((values, date) => {
          const average = values.reduce((a, b) => a + b, 0) / values.length;
          dailyAverages.push({ date, average: Math.round(average * 10) / 10, count: values.length });
        });

        dailyAverages.sort((a, b) => a.date.localeCompare(b.date));

        // Calculate overall trend direction
        let trendDirection = "stable";
        if (dailyAverages.length >= 2) {
          const firstHalf = dailyAverages.slice(0, Math.ceil(dailyAverages.length / 2));
          const secondHalf = dailyAverages.slice(Math.floor(dailyAverages.length / 2));

          const firstAvg =
            firstHalf.reduce((sum, d) => sum + d.average, 0) / firstHalf.length;
          const secondAvg =
            secondHalf.reduce((sum, d) => sum + d.average, 0) / secondHalf.length;

          if (secondAvg > firstAvg + 15) {
            trendDirection = "increasing";
          } else if (secondAvg < firstAvg - 15) {
            trendDirection = "decreasing";
          }
        }

        const allValues = periodReadings.map((r) => r.value);
        const periodAverage =
          allValues.reduce((a, b) => a + b, 0) / allValues.length;

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  period,
                  days_analyzed: days,
                  total_readings: periodReadings.length,
                  period_average: Math.round(periodAverage * 10) / 10,
                  trend_direction: trendDirection,
                  daily_averages: dailyAverages,
                  interpretation:
                    trendDirection === "increasing"
                      ? "Your blood glucose is trending upward. Review your diet, exercise, and medication adherence."
                      : trendDirection === "decreasing"
                        ? "Your blood glucose is trending downward. Great progress! Continue your current routine."
                        : "Your blood glucose is stable with no significant trend.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_time_in_range": {
        const { days = 7 } = args as { days?: number };

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const periodReadings = readings.filter(
          (r) => new Date(r.timestamp) >= cutoffDate
        );

        if (periodReadings.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: `No readings found in the last ${days} days.`,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Calculate time in range (TIR) - standard target is 70-180 mg/dL
        const inRange = periodReadings.filter(
          (r) => r.value >= 70 && r.value <= 180
        );
        const below = periodReadings.filter((r) => r.value < 70);
        const above = periodReadings.filter((r) => r.value > 180);

        const tirPercent = Math.round(
          (inRange.length / periodReadings.length) * 100
        );
        const belowPercent = Math.round(
          (below.length / periodReadings.length) * 100
        );
        const abovePercent = Math.round(
          (above.length / periodReadings.length) * 100
        );

        // TIR goals: >70% is good, >80% is excellent
        let assessment = "";
        if (tirPercent >= 80) {
          assessment = "Excellent! You're meeting the recommended TIR goal of >70%.";
        } else if (tirPercent >= 70) {
          assessment = "Good! You're at the recommended TIR goal.";
        } else if (tirPercent >= 50) {
          assessment = "Fair. Work on getting above 70% time in range.";
        } else {
          assessment =
            "Needs improvement. Discuss with your healthcare team about adjusting your diabetes management plan.";
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  period: `${days} days`,
                  total_readings: periodReadings.length,
                  target_range: "70-180 mg/dL",
                  time_in_range: {
                    count: inRange.length,
                    percentage: tirPercent,
                  },
                  time_below_range: {
                    count: below.length,
                    percentage: belowPercent,
                  },
                  time_above_range: {
                    count: above.length,
                    percentage: abovePercent,
                  },
                  assessment,
                  goal: "Target: >70% time in range (ideally >80%)",
                },
                null,
                2
              ),
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
