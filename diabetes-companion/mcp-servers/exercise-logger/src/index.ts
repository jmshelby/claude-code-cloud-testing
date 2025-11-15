#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

// Exercise types and their approximate calorie burn rates (per minute for 70kg person)
const EXERCISE_TYPES: Record<
  string,
  { calories_per_min: number; category: string; glucose_impact: string }
> = {
  walking: {
    calories_per_min: 4,
    category: "cardio",
    glucose_impact: "moderate decrease",
  },
  "brisk walking": {
    calories_per_min: 5,
    category: "cardio",
    glucose_impact: "moderate decrease",
  },
  jogging: {
    calories_per_min: 7,
    category: "cardio",
    glucose_impact: "significant decrease",
  },
  running: {
    calories_per_min: 10,
    category: "cardio",
    glucose_impact: "significant decrease",
  },
  cycling: {
    calories_per_min: 6,
    category: "cardio",
    glucose_impact: "moderate decrease",
  },
  swimming: {
    calories_per_min: 8,
    category: "cardio",
    glucose_impact: "significant decrease",
  },
  "weight training": {
    calories_per_min: 6,
    category: "strength",
    glucose_impact: "moderate decrease (delayed effect)",
  },
  yoga: {
    calories_per_min: 3,
    category: "flexibility",
    glucose_impact: "mild decrease",
  },
  pilates: {
    calories_per_min: 4,
    category: "strength",
    glucose_impact: "mild decrease",
  },
  dancing: {
    calories_per_min: 5,
    category: "cardio",
    glucose_impact: "moderate decrease",
  },
  "elliptical trainer": {
    calories_per_min: 7,
    category: "cardio",
    glucose_impact: "moderate decrease",
  },
  rowing: {
    calories_per_min: 8,
    category: "cardio",
    glucose_impact: "significant decrease",
  },
  hiking: {
    calories_per_min: 6,
    category: "cardio",
    glucose_impact: "moderate decrease",
  },
  "stair climbing": {
    calories_per_min: 9,
    category: "cardio",
    glucose_impact: "significant decrease",
  },
};

// Exercise log entry
interface ExerciseLog {
  id: string;
  timestamp: string;
  activity: string;
  duration_minutes: number;
  intensity: "light" | "moderate" | "vigorous";
  calories_burned?: number;
  notes?: string;
  glucose_before?: number;
  glucose_after?: number;
}

const exercises: ExerciseLog[] = [];
let exerciseIdCounter = 1;

// Define available tools
const tools: Tool[] = [
  {
    name: "log_exercise",
    description:
      "Log an exercise activity with type, duration, intensity, and optional glucose readings before/after",
    inputSchema: {
      type: "object",
      properties: {
        activity: {
          type: "string",
          description:
            "Type of exercise (e.g., walking, running, cycling, swimming, yoga)",
        },
        duration_minutes: {
          type: "number",
          description: "Duration of exercise in minutes",
        },
        intensity: {
          type: "string",
          enum: ["light", "moderate", "vigorous"],
          description: "Intensity level of the exercise",
        },
        glucose_before: {
          type: "number",
          description: "Optional blood glucose reading before exercise (mg/dL)",
        },
        glucose_after: {
          type: "number",
          description: "Optional blood glucose reading after exercise (mg/dL)",
        },
        notes: {
          type: "string",
          description: "Optional notes about the exercise session",
        },
      },
      required: ["activity", "duration_minutes", "intensity"],
    },
  },
  {
    name: "get_exercise_info",
    description: "Get information about a specific type of exercise including calorie burn and glucose impact",
    inputSchema: {
      type: "object",
      properties: {
        activity: {
          type: "string",
          description: "Type of exercise to get information about",
        },
      },
      required: ["activity"],
    },
  },
  {
    name: "get_recent_exercises",
    description: "Get recent exercise logs. Optionally specify how many to retrieve (default: 7)",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of recent exercises to retrieve (default: 7)",
        },
      },
    },
  },
  {
    name: "get_weekly_summary",
    description: "Get exercise summary for the current week including total duration, calories burned, and activity breakdown",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_exercise_recommendations",
    description: "Get exercise recommendations for diabetes management based on ADA guidelines",
    inputSchema: {
      type: "object",
      properties: {
        fitness_level: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced"],
          description: "Current fitness level (default: beginner)",
        },
      },
    },
  },
  {
    name: "analyze_glucose_impact",
    description: "Analyze how exercise affects blood glucose levels based on logged data",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "exercise-logger",
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
      case "log_exercise": {
        const {
          activity,
          duration_minutes,
          intensity,
          glucose_before,
          glucose_after,
          notes,
        } = args as {
          activity: string;
          duration_minutes: number;
          intensity: "light" | "moderate" | "vigorous";
          glucose_before?: number;
          glucose_after?: number;
          notes?: string;
        };

        // Calculate calories burned
        const activityLower = activity.toLowerCase();
        const exerciseInfo = EXERCISE_TYPES[activityLower];
        let calories_burned: number | undefined;

        if (exerciseInfo) {
          let multiplier = 1.0;
          if (intensity === "light") multiplier = 0.7;
          else if (intensity === "vigorous") multiplier = 1.3;

          calories_burned = Math.round(
            exerciseInfo.calories_per_min * duration_minutes * multiplier
          );
        }

        const exercise: ExerciseLog = {
          id: `exercise_${exerciseIdCounter++}`,
          timestamp: new Date().toISOString(),
          activity,
          duration_minutes,
          intensity,
          calories_burned,
          glucose_before,
          glucose_after,
          notes,
        };

        exercises.push(exercise);

        // Provide feedback about glucose impact
        let glucoseFeedback = "";
        if (glucose_before && glucose_after) {
          const change = glucose_after - glucose_before;
          if (change < -30) {
            glucoseFeedback =
              " Your blood glucose decreased significantly. Great job! Monitor for signs of hypoglycemia.";
          } else if (change < 0) {
            glucoseFeedback =
              " Your blood glucose decreased as expected with exercise.";
          } else if (change > 0) {
            glucoseFeedback =
              " Your blood glucose increased slightly. This can happen with very intense exercise (stress hormones).";
          }
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  exercise,
                  message: `Logged ${duration_minutes} minutes of ${intensity} ${activity}. ${calories_burned ? `Burned ~${calories_burned} calories.` : ''}${glucoseFeedback}`,
                  glucose_info: exerciseInfo
                    ? {
                        expected_impact: exerciseInfo.glucose_impact,
                        category: exerciseInfo.category,
                      }
                    : undefined,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_exercise_info": {
        const { activity } = args as { activity: string };
        const activityLower = activity.toLowerCase();
        const info = EXERCISE_TYPES[activityLower];

        if (!info) {
          // Return list of available exercises
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    activity,
                    found: false,
                    message: "Exercise type not found in database.",
                    available_exercises: Object.keys(EXERCISE_TYPES),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  activity: activityLower,
                  calories_per_minute: info.calories_per_min,
                  category: info.category,
                  glucose_impact: info.glucose_impact,
                  example_30min_calories: Math.round(info.calories_per_min * 30),
                  diabetes_benefits:
                    "Regular exercise helps lower blood glucose, improve insulin sensitivity, and manage weight.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_recent_exercises": {
        const { count = 7 } = args as { count?: number };
        const recent = exercises.slice(-count).reverse();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: recent.length,
                  exercises: recent,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_weekly_summary": {
        // Get exercises from last 7 days
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const weekExercises = exercises.filter(
          (e) => new Date(e.timestamp) >= weekAgo
        );

        if (weekExercises.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: "No exercise logged in the past 7 days.",
                    recommendation:
                      "The ADA recommends at least 150 minutes of moderate-intensity aerobic activity per week.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const totalMinutes = weekExercises.reduce(
          (sum, e) => sum + e.duration_minutes,
          0
        );
        const totalCalories = weekExercises.reduce(
          (sum, e) => sum + (e.calories_burned || 0),
          0
        );

        // Count by activity type
        const activityCounts: Record<string, number> = {};
        const activityMinutes: Record<string, number> = {};

        weekExercises.forEach((e) => {
          activityCounts[e.activity] = (activityCounts[e.activity] || 0) + 1;
          activityMinutes[e.activity] =
            (activityMinutes[e.activity] || 0) + e.duration_minutes;
        });

        // ADA recommendation: 150 minutes per week
        const adaGoal = 150;
        const percentOfGoal = Math.round((totalMinutes / adaGoal) * 100);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  period: "Last 7 days",
                  total_sessions: weekExercises.length,
                  total_minutes: totalMinutes,
                  total_calories: Math.round(totalCalories),
                  average_session_minutes: Math.round(
                    totalMinutes / weekExercises.length
                  ),
                  activities: Object.entries(activityMinutes).map(
                    ([activity, minutes]) => ({
                      activity,
                      sessions: activityCounts[activity],
                      total_minutes: minutes,
                    })
                  ),
                  ada_goal: {
                    weekly_target_minutes: adaGoal,
                    current_minutes: totalMinutes,
                    percent_of_goal: percentOfGoal,
                    status:
                      percentOfGoal >= 100
                        ? "Excellent! You've met the weekly goal!"
                        : percentOfGoal >= 70
                          ? "Good progress toward your weekly goal"
                          : "Keep going! Try to increase activity",
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_exercise_recommendations": {
        const { fitness_level = "beginner" } = args as {
          fitness_level?: "beginner" | "intermediate" | "advanced";
        };

        const recommendations: Record<
          string,
          {
            aerobic: string[];
            strength: string[];
            flexibility: string[];
            weekly_plan: string;
          }
        > = {
          beginner: {
            aerobic: [
              "Walking: Start with 10-15 minutes daily, gradually increase to 30 minutes",
              "Cycling: Low resistance, 15-20 minutes, 3-4 times per week",
              "Swimming: Light laps or water aerobics, 20-30 minutes",
            ],
            strength: [
              "Bodyweight exercises: Wall push-ups, chair squats, 2 sets of 10 reps",
              "Light resistance bands: 2-3 times per week",
              "Focus on major muscle groups",
            ],
            flexibility: [
              "Gentle stretching: 5-10 minutes daily",
              "Yoga for beginners: 20-30 minutes, 2-3 times per week",
            ],
            weekly_plan:
              "Aim for 150 minutes total: 30 minutes walking 5 days/week, plus 2 days of light strength training",
          },
          intermediate: {
            aerobic: [
              "Brisk walking or jogging: 30-45 minutes, 5 days per week",
              "Cycling: Moderate resistance, 30-40 minutes, 3-4 times per week",
              "Swimming: Continuous laps, 30-40 minutes",
              "Dancing or group fitness classes",
            ],
            strength: [
              "Weight training: 2-3 times per week, 3 sets of 12 reps",
              "Resistance bands or dumbbells: All major muscle groups",
              "Core strengthening exercises",
            ],
            flexibility: [
              "Stretching routine: 10-15 minutes after workouts",
              "Yoga: 30-45 minutes, 2-3 times per week",
            ],
            weekly_plan:
              "Aim for 200+ minutes: Mix of cardio (150 min) and strength training (2-3 sessions)",
          },
          advanced: {
            aerobic: [
              "Running or HIIT: 30-60 minutes, 4-5 days per week",
              "Cycling: High resistance or interval training, 45-60 minutes",
              "Swimming: Interval training, 45-60 minutes",
              "Sports activities: Tennis, basketball, etc.",
            ],
            strength: [
              "Weight training: 3-4 times per week, progressive overload",
              "Compound exercises: Squats, deadlifts, bench press",
              "Split routine: Different muscle groups each day",
            ],
            flexibility: [
              "Dynamic stretching before workouts: 10 minutes",
              "Static stretching after: 15 minutes",
              "Yoga or Pilates: 45-60 minutes, 2-3 times per week",
            ],
            weekly_plan:
              "Aim for 250+ minutes: Varied intensity cardio (180+ min) and strength training (4 sessions)",
          },
        };

        const rec = recommendations[fitness_level];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  fitness_level,
                  recommendations: rec,
                  diabetes_specific_tips: [
                    "Check blood glucose before and after exercise",
                    "Exercise 1-2 hours after meals when glucose is higher",
                    "Keep fast-acting carbs handy for hypoglycemia (glucose <70 mg/dL)",
                    "Stay hydrated - drink water before, during, and after",
                    "Wear proper footwear and check feet for blisters",
                    "Start slowly and gradually increase intensity",
                    "Exercise at the same time each day for consistency",
                  ],
                  safety_notes: [
                    "Stop if you feel dizzy, short of breath, or have chest pain",
                    "If glucose is >250 mg/dL, check for ketones before vigorous exercise",
                    "If glucose is <100 mg/dL before exercise, have a small snack",
                  ],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "analyze_glucose_impact": {
        // Find exercises with both before and after glucose readings
        const withGlucose = exercises.filter(
          (e) => e.glucose_before && e.glucose_after
        );

        if (withGlucose.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message:
                      "No exercise logs with glucose readings found. Log exercises with before/after glucose to track impact.",
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        const impacts = withGlucose.map((e) => ({
          activity: e.activity,
          duration: e.duration_minutes,
          intensity: e.intensity,
          glucose_before: e.glucose_before!,
          glucose_after: e.glucose_after!,
          change: e.glucose_after! - e.glucose_before!,
          timestamp: e.timestamp,
        }));

        const averageChange =
          impacts.reduce((sum, i) => sum + i.change, 0) / impacts.length;

        const decreases = impacts.filter((i) => i.change < 0);
        const increases = impacts.filter((i) => i.change >= 0);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  total_sessions_analyzed: withGlucose.length,
                  average_glucose_change: Math.round(averageChange * 10) / 10,
                  sessions_with_decrease: decreases.length,
                  sessions_with_increase: increases.length,
                  impacts: impacts.slice(-10), // Last 10
                  insights: [
                    averageChange < -20
                      ? "Exercise is significantly lowering your blood glucose"
                      : averageChange < 0
                        ? "Exercise is helping lower your blood glucose"
                        : "Some exercises may raise glucose temporarily due to stress hormones",
                    decreases.length > 0
                      ? "Continue monitoring to prevent hypoglycemia during/after exercise"
                      : "Track your glucose before and after exercise for better insights",
                  ],
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
  console.error("Exercise Logger MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
