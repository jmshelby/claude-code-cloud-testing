#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { writeFileSync } from "fs";
import { join } from "path";

// Interfaces for data structures (matching other servers)
interface GlucoseReading {
  timestamp: string;
  value: number;
  context: string;
  notes?: string;
}

interface MealLog {
  timestamp: string;
  meal_type: string;
  foods: string[];
  carbs: number;
  notes?: string;
}

interface ExerciseLog {
  timestamp: string;
  activity: string;
  duration_minutes: number;
  intensity: string;
  calories_burned?: number;
  glucose_before?: number;
  glucose_after?: number;
  notes?: string;
}

// Shared data storage (in production, this would be a database)
// For demo purposes, we'll provide export functionality that agents can call
const tools: Tool[] = [
  {
    name: "estimate_a1c",
    description:
      "Estimate A1C (HbA1c) based on average glucose readings. A1C is a key diabetes metric showing average blood sugar over 2-3 months.",
    inputSchema: {
      type: "object",
      properties: {
        average_glucose: {
          type: "number",
          description: "Average blood glucose in mg/dL over the past 2-3 months",
        },
      },
      required: ["average_glucose"],
    },
  },
  {
    name: "glucose_to_a1c",
    description: "Convert average glucose (mg/dL) to estimated A1C percentage using standard formula",
    inputSchema: {
      type: "object",
      properties: {
        average_glucose: {
          type: "number",
          description: "Average glucose in mg/dL",
        },
      },
      required: ["average_glucose"],
    },
  },
  {
    name: "a1c_to_glucose",
    description: "Convert A1C percentage to estimated average glucose (eAG) in mg/dL",
    inputSchema: {
      type: "object",
      properties: {
        a1c: {
          type: "number",
          description: "A1C percentage (e.g., 7.0 for 7%)",
        },
      },
      required: ["a1c"],
    },
  },
  {
    name: "generate_summary_report",
    description:
      "Generate a comprehensive diabetes management summary with glucose stats, meals, exercise, and A1C estimate",
    inputSchema: {
      type: "object",
      properties: {
        glucose_readings: {
          type: "array",
          description: "Array of glucose readings",
        },
        meals: {
          type: "array",
          description: "Array of meal logs (optional)",
        },
        exercises: {
          type: "array",
          description: "Array of exercise logs (optional)",
        },
        days: {
          type: "number",
          description: "Number of days to include in report (default: 30)",
        },
      },
      required: ["glucose_readings"],
    },
  },
  {
    name: "export_to_csv",
    description:
      "Export glucose, meal, and exercise data to CSV format for sharing with healthcare providers",
    inputSchema: {
      type: "object",
      properties: {
        data_type: {
          type: "string",
          enum: ["glucose", "meals", "exercise", "all"],
          description: "Type of data to export",
        },
        glucose_readings: {
          type: "array",
          description: "Array of glucose readings",
        },
        meals: {
          type: "array",
          description: "Array of meal logs",
        },
        exercises: {
          type: "array",
          description: "Array of exercise logs",
        },
      },
      required: ["data_type"],
    },
  },
];

// A1C estimation using Nathan et al. (2008) formula
// A1C = (average glucose + 46.7) / 28.7
function calculateA1C(averageGlucose: number): {
  a1c: number;
  category: string;
  interpretation: string;
  goals: string;
} {
  const a1c = (averageGlucose + 46.7) / 28.7;
  const roundedA1c = Math.round(a1c * 10) / 10;

  let category = "";
  let interpretation = "";
  let goals = "";

  if (roundedA1c < 5.7) {
    category = "Normal (Non-diabetic)";
    interpretation = "Your blood glucose levels are in the normal range.";
    goals = "Maintain healthy lifestyle to prevent diabetes.";
  } else if (roundedA1c < 6.5) {
    category = "Prediabetes";
    interpretation =
      "Your blood glucose levels are higher than normal but not yet diabetic.";
    goals =
      "Work on lifestyle changes (diet, exercise, weight loss) to prevent Type 2 diabetes. ADA goal: <5.7%";
  } else if (roundedA1c < 7.0) {
    category = "Diabetes - Good Control";
    interpretation =
      "Your diabetes is well-controlled. This is the target range for most adults with diabetes.";
    goals = "Maintain current management. ADA goal for most adults: <7.0%";
  } else if (roundedA1c < 8.0) {
    category = "Diabetes - Fair Control";
    interpretation =
      "Your diabetes control could be improved. Discuss with your healthcare team.";
    goals =
      "Work with your doctor to adjust medications, diet, or exercise. Target: <7.0%";
  } else if (roundedA1c < 9.0) {
    category = "Diabetes - Poor Control";
    interpretation =
      "Your diabetes is not well-controlled. This increases risk of complications.";
    goals =
      "Urgent: Discuss with your doctor about intensifying treatment. Target: <7.0%";
  } else {
    category = "Diabetes - Very Poor Control";
    interpretation =
      "Your diabetes is very poorly controlled. High risk of complications.";
    goals =
      "URGENT: Contact your healthcare provider immediately to adjust treatment plan.";
  }

  return {
    a1c: roundedA1c,
    category,
    interpretation,
    goals,
  };
}

// Reverse calculation: A1C to average glucose
function a1cToGlucose(a1c: number): number {
  // Reverse formula: average glucose = (A1C * 28.7) - 46.7
  return Math.round(a1c * 28.7 - 46.7);
}

// Generate CSV from data
function generateCSV(headers: string[], rows: string[][]): string {
  const csvRows = [headers.join(",")];
  rows.forEach((row) => {
    csvRows.push(row.map((cell) => `"${cell}"`).join(","));
  });
  return csvRows.join("\n");
}

// Create server instance
const server = new Server(
  {
    name: "export-tools",
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
      case "estimate_a1c":
      case "glucose_to_a1c": {
        const { average_glucose } = args as { average_glucose: number };

        if (average_glucose < 40 || average_glucose > 500) {
          throw new Error(
            "Average glucose should be between 40-500 mg/dL. Please provide a realistic value."
          );
        }

        const result = calculateA1C(average_glucose);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  average_glucose_mg_dl: average_glucose,
                  estimated_a1c: result.a1c,
                  a1c_category: result.category,
                  interpretation: result.interpretation,
                  recommended_goals: result.goals,
                  note: "This is an ESTIMATE based on average glucose. Actual A1C is measured via blood test. Consult your healthcare provider for official A1C testing.",
                  formula_used: "A1C ≈ (average glucose + 46.7) / 28.7 (Nathan et al., 2008)",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "a1c_to_glucose": {
        const { a1c } = args as { a1c: number };

        if (a1c < 4 || a1c > 15) {
          throw new Error("A1C should be between 4-15%. Please provide a realistic value.");
        }

        const estimatedAverage = a1cToGlucose(a1c);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  a1c_percent: a1c,
                  estimated_average_glucose_mg_dl: estimatedAverage,
                  interpretation: `An A1C of ${a1c}% corresponds to an estimated average glucose of ${estimatedAverage} mg/dL`,
                  note: "This is the estimated Average Glucose (eAG) based on A1C. Individual readings will vary above and below this average.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "generate_summary_report": {
        const { glucose_readings, meals = [], exercises = [], days = 30 } = args as {
          glucose_readings: any[];
          meals?: any[];
          exercises?: any[];
          days?: number;
        };

        if (!glucose_readings || glucose_readings.length === 0) {
          throw new Error("No glucose readings provided for summary report");
        }

        // Calculate glucose statistics
        const values = glucose_readings.map((r: any) => r.value || r);
        const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Calculate A1C
        const a1cResult = calculateA1C(average);

        // Time in range
        const inRange = values.filter((v: number) => v >= 70 && v <= 180);
        const tirPercent = Math.round((inRange.length / values.length) * 100);

        // Build summary
        const summary = {
          report_date: new Date().toISOString(),
          period_days: days,
          glucose_summary: {
            total_readings: glucose_readings.length,
            average_glucose_mg_dl: Math.round(average),
            estimated_a1c: a1cResult.a1c,
            a1c_category: a1cResult.category,
            min_glucose: min,
            max_glucose: max,
            time_in_range: {
              percentage: tirPercent,
              target: "70-180 mg/dL",
              readings_in_range: inRange.length,
            },
          },
          meal_summary: meals.length > 0 ? {
            total_meals: meals.length,
            average_carbs_per_meal: Math.round(
              meals.reduce((sum: number, m: any) => sum + (m.carbs || 0), 0) / meals.length
            ),
          } : null,
          exercise_summary: exercises.length > 0 ? {
            total_sessions: exercises.length,
            total_minutes: exercises.reduce(
              (sum: number, e: any) => sum + (e.duration_minutes || 0),
              0
            ),
          } : null,
          interpretation: a1cResult.interpretation,
          recommendations: a1cResult.goals,
          note: "Share this report with your healthcare provider at your next appointment. This is a summary only and should not replace professional medical advice.",
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(summary, null, 2),
            },
          ],
        };
      }

      case "export_to_csv": {
        const { data_type, glucose_readings = [], meals = [], exercises = [] } = args as {
          data_type: string;
          glucose_readings?: any[];
          meals?: any[];
          exercises?: any[];
        };

        let csvData = "";
        let filename = "";

        switch (data_type) {
          case "glucose":
            if (glucose_readings.length === 0) {
              throw new Error("No glucose readings to export");
            }
            csvData = generateCSV(
              ["Timestamp", "Glucose (mg/dL)", "Context", "Notes"],
              glucose_readings.map((r: any) => [
                r.timestamp || new Date().toISOString(),
                r.value?.toString() || "0",
                r.context || "",
                r.notes || "",
              ])
            );
            filename = `glucose_export_${new Date().toISOString().split("T")[0]}.csv`;
            break;

          case "meals":
            if (meals.length === 0) {
              throw new Error("No meals to export");
            }
            csvData = generateCSV(
              ["Timestamp", "Meal Type", "Foods", "Carbs (g)", "Notes"],
              meals.map((m: any) => [
                m.timestamp || new Date().toISOString(),
                m.meal_type || "",
                Array.isArray(m.foods) ? m.foods.join("; ") : m.foods || "",
                m.carbs?.toString() || "0",
                m.notes || "",
              ])
            );
            filename = `meals_export_${new Date().toISOString().split("T")[0]}.csv`;
            break;

          case "exercise":
            if (exercises.length === 0) {
              throw new Error("No exercise data to export");
            }
            csvData = generateCSV(
              [
                "Timestamp",
                "Activity",
                "Duration (min)",
                "Intensity",
                "Calories",
                "Glucose Before",
                "Glucose After",
                "Notes",
              ],
              exercises.map((e: any) => [
                e.timestamp || new Date().toISOString(),
                e.activity || "",
                e.duration_minutes?.toString() || "0",
                e.intensity || "",
                e.calories_burned?.toString() || "",
                e.glucose_before?.toString() || "",
                e.glucose_after?.toString() || "",
                e.notes || "",
              ])
            );
            filename = `exercise_export_${new Date().toISOString().split("T")[0]}.csv`;
            break;

          case "all":
            // Export all data types to separate CSVs
            const allData: any = {};

            if (glucose_readings.length > 0) {
              allData.glucose_csv = generateCSV(
                ["Timestamp", "Glucose (mg/dL)", "Context", "Notes"],
                glucose_readings.map((r: any) => [
                  r.timestamp || "",
                  r.value?.toString() || "",
                  r.context || "",
                  r.notes || "",
                ])
              );
            }

            if (meals.length > 0) {
              allData.meals_csv = generateCSV(
                ["Timestamp", "Meal Type", "Foods", "Carbs (g)", "Notes"],
                meals.map((m: any) => [
                  m.timestamp || "",
                  m.meal_type || "",
                  Array.isArray(m.foods) ? m.foods.join("; ") : m.foods || "",
                  m.carbs?.toString() || "",
                  m.notes || "",
                ])
              );
            }

            if (exercises.length > 0) {
              allData.exercise_csv = generateCSV(
                [
                  "Timestamp",
                  "Activity",
                  "Duration (min)",
                  "Intensity",
                  "Calories",
                  "Glucose Before",
                  "Glucose After",
                  "Notes",
                ],
                exercises.map((e: any) => [
                  e.timestamp || "",
                  e.activity || "",
                  e.duration_minutes?.toString() || "",
                  e.intensity || "",
                  e.calories_burned?.toString() || "",
                  e.glucose_before?.toString() || "",
                  e.glucose_after?.toString() || "",
                  e.notes || "",
                ])
              );
            }

            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: true,
                      files_generated: Object.keys(allData),
                      data: allData,
                      note: "CSV data ready for download. Save each section to a .csv file to share with your healthcare provider.",
                    },
                    null,
                    2
                  ),
                },
              ],
            };

          default:
            throw new Error(`Unknown data type: ${data_type}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  filename,
                  csv_data: csvData,
                  row_count: csvData.split("\n").length - 1, // Exclude header
                  note: "Save this CSV data to a file to share with your healthcare provider or for your records.",
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
  console.error("Export Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
