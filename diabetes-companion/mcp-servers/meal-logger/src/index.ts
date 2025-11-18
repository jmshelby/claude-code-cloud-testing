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

// Storage for meal logs
interface MealLog {
  timestamp: string;
  meal_type: string; // breakfast, lunch, dinner, snack
  foods: string[];
  carbs: number; // grams of carbohydrates
  notes?: string;
}

// Data directory and file path
const DATA_DIR = path.join(os.homedir(), ".diabetes-companion");
const DATA_FILE = path.join(DATA_DIR, "meals.json");

let meals: MealLog[] = [];

// Ensure data directory exists
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.error(`Created data directory: ${DATA_DIR}`);
  }
}

// Load meals from JSON file
function loadMeals() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      meals = JSON.parse(data);
      console.error(`Loaded ${meals.length} meal logs from ${DATA_FILE}`);
    } else {
      console.error("No existing data file found. Starting with empty meals.");
    }
  } catch (error) {
    console.error(`Error loading meals: ${error}. Starting with empty meals.`);
    meals = [];
  }
}

// Save meals to JSON file
function saveMeals() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(meals, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving meals: ${error}`);
  }
}

// Initialize storage
ensureDataDirectory();
loadMeals();

// Common foods and their approximate carb content per serving
const foodDatabase: Record<string, { serving: string; carbs: number }> = {
  // Grains & Starches
  "white rice": { serving: "1 cup cooked", carbs: 45 },
  "brown rice": { serving: "1 cup cooked", carbs: 45 },
  "pasta": { serving: "1 cup cooked", carbs: 43 },
  "bread": { serving: "1 slice", carbs: 15 },
  "whole wheat bread": { serving: "1 slice", carbs: 12 },
  "oatmeal": { serving: "1 cup cooked", carbs: 27 },
  "quinoa": { serving: "1 cup cooked", carbs: 39 },
  "tortilla": { serving: "1 medium (6 inch)", carbs: 15 },

  // Fruits
  "apple": { serving: "1 medium", carbs: 25 },
  "banana": { serving: "1 medium", carbs: 27 },
  "orange": { serving: "1 medium", carbs: 15 },
  "grapes": { serving: "1 cup", carbs: 27 },
  "strawberries": { serving: "1 cup", carbs: 12 },
  "blueberries": { serving: "1 cup", carbs: 21 },
  "watermelon": { serving: "1 cup diced", carbs: 12 },

  // Vegetables
  "potato": { serving: "1 medium baked", carbs: 37 },
  "sweet potato": { serving: "1 medium baked", carbs: 24 },
  "corn": { serving: "1 cup", carbs: 27 },
  "peas": { serving: "1 cup", carbs: 21 },
  "carrots": { serving: "1 cup cooked", carbs: 12 },
  "broccoli": { serving: "1 cup cooked", carbs: 11 },
  "green beans": { serving: "1 cup", carbs: 10 },

  // Proteins
  "chicken breast": { serving: "3 oz cooked", carbs: 0 },
  "salmon": { serving: "3 oz cooked", carbs: 0 },
  "eggs": { serving: "1 large", carbs: 1 },
  "beans": { serving: "1 cup cooked", carbs: 40 },
  "lentils": { serving: "1 cup cooked", carbs: 40 },

  // Dairy
  "milk": { serving: "1 cup", carbs: 12 },
  "yogurt": { serving: "1 cup plain", carbs: 17 },
  "greek yogurt": { serving: "1 cup plain", carbs: 9 },
  "cheese": { serving: "1 oz", carbs: 1 },

  // Common dishes
  "pizza": { serving: "1 slice regular", carbs: 30 },
  "sandwich": { serving: "1 typical sandwich", carbs: 40 },
  "burger": { serving: "1 burger with bun", carbs: 35 },
};

// Define available tools
const tools: Tool[] = [
  {
    name: "log_meal",
    description: "Log a meal with meal type (breakfast/lunch/dinner/snack), foods consumed, estimated carbohydrates in grams, and optional notes",
    inputSchema: {
      type: "object",
      properties: {
        meal_type: {
          type: "string",
          description: "Type of meal (breakfast, lunch, dinner, or snack)",
          enum: ["breakfast", "lunch", "dinner", "snack"],
        },
        foods: {
          type: "array",
          items: { type: "string" },
          description: "List of foods consumed in this meal",
        },
        carbs: {
          type: "number",
          description: "Total carbohydrates in grams for this meal",
        },
        notes: {
          type: "string",
          description: "Optional notes about the meal",
        },
      },
      required: ["meal_type", "foods", "carbs"],
    },
  },
  {
    name: "lookup_food_carbs",
    description: "Look up carbohydrate content for common foods. Returns serving size and carb count.",
    inputSchema: {
      type: "object",
      properties: {
        food: {
          type: "string",
          description: "Name of the food to look up (e.g., 'apple', 'rice', 'chicken')",
        },
      },
      required: ["food"],
    },
  },
  {
    name: "get_recent_meals",
    description: "Get recent meal logs. Optionally specify how many meals to retrieve (default: 5)",
    inputSchema: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "Number of recent meals to retrieve (default: 5)",
        },
      },
    },
  },
  {
    name: "get_daily_summary",
    description: "Get summary of meals and total carbohydrates for today",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "estimate_meal_carbs",
    description: "Get an estimate of total carbohydrates for a list of foods. Useful for planning meals.",
    inputSchema: {
      type: "object",
      properties: {
        foods: {
          type: "array",
          items: { type: "string" },
          description: "List of foods to estimate carbs for",
        },
      },
      required: ["foods"],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "meal-logger",
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
      case "log_meal": {
        const { meal_type, foods, carbs, notes } = args as {
          meal_type: string;
          foods: string[];
          carbs: number;
          notes?: string;
        };

        const meal: MealLog = {
          timestamp: new Date().toISOString(),
          meal_type,
          foods,
          carbs,
          notes,
        };

        meals.push(meal);
        saveMeals(); // Persist to disk

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                meal,
                message: `Logged ${meal_type} with ${carbs}g carbs. Foods: ${foods.join(", ")}`,
              }, null, 2),
            },
          ],
        };
      }

      case "lookup_food_carbs": {
        const { food } = args as { food: string };
        const foodLower = food.toLowerCase().trim();

        // Try exact match first
        let result = foodDatabase[foodLower];

        // If no exact match, try partial match
        if (!result) {
          const partialMatch = Object.keys(foodDatabase).find(key =>
            key.includes(foodLower) || foodLower.includes(key)
          );
          if (partialMatch) {
            result = foodDatabase[partialMatch];
          }
        }

        if (result) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  food: foodLower,
                  serving: result.serving,
                  carbs: result.carbs,
                  unit: "grams",
                }, null, 2),
              },
            ],
          };
        } else {
          // Return list of similar foods if available
          const suggestions = Object.keys(foodDatabase)
            .filter(key => {
              const words = foodLower.split(" ");
              return words.some(word => key.includes(word));
            })
            .slice(0, 5);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  food: foodLower,
                  found: false,
                  message: "Food not found in database. Try searching online or consulting nutrition labels.",
                  suggestions: suggestions.length > 0 ? suggestions : undefined,
                }, null, 2),
              },
            ],
          };
        }
      }

      case "get_recent_meals": {
        const { count = 5 } = args as { count?: number };
        const recentMeals = meals.slice(-count).reverse();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                count: recentMeals.length,
                meals: recentMeals,
              }, null, 2),
            },
          ],
        };
      }

      case "get_daily_summary": {
        const today = new Date().toISOString().split('T')[0];
        const todaysMeals = meals.filter(meal =>
          meal.timestamp.startsWith(today)
        );

        const totalCarbs = todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0);

        const mealsByType = {
          breakfast: todaysMeals.filter(m => m.meal_type === "breakfast"),
          lunch: todaysMeals.filter(m => m.meal_type === "lunch"),
          dinner: todaysMeals.filter(m => m.meal_type === "dinner"),
          snack: todaysMeals.filter(m => m.meal_type === "snack"),
        };

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                date: today,
                total_meals: todaysMeals.length,
                total_carbs: totalCarbs,
                meals_by_type: {
                  breakfast: mealsByType.breakfast.length,
                  lunch: mealsByType.lunch.length,
                  dinner: mealsByType.dinner.length,
                  snack: mealsByType.snack.length,
                },
                meals: todaysMeals,
              }, null, 2),
            },
          ],
        };
      }

      case "estimate_meal_carbs": {
        const { foods } = args as { foods: string[] };

        const estimates = foods.map(food => {
          const foodLower = food.toLowerCase().trim();
          const exactMatch = foodDatabase[foodLower];

          if (exactMatch) {
            return {
              food: foodLower,
              serving: exactMatch.serving,
              carbs: exactMatch.carbs,
              found: true,
            };
          }

          // Try partial match
          const partialMatch = Object.keys(foodDatabase).find(key =>
            key.includes(foodLower) || foodLower.includes(key)
          );

          if (partialMatch) {
            const match = foodDatabase[partialMatch];
            return {
              food: foodLower,
              matched_as: partialMatch,
              serving: match.serving,
              carbs: match.carbs,
              found: true,
            };
          }

          return {
            food: foodLower,
            found: false,
            message: "Not in database - please look up online or check nutrition label",
          };
        });

        const totalEstimate = estimates
          .filter(e => e.found)
          .reduce((sum, e) => sum + (e.carbs || 0), 0);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                foods: estimates,
                estimated_total_carbs: totalEstimate,
                note: "Estimates are approximate. Actual values depend on portion sizes and preparation methods.",
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
  console.error("Meal Logger MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
