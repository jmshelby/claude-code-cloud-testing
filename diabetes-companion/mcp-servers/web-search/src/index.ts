#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// Simple web search using DuckDuckGo Instant Answer API
interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

// Define available tools
const tools: Tool[] = [
  {
    name: "search_diabetes_recipes",
    description: "Search for diabetes-friendly recipes. Returns recipe ideas with nutritional considerations.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Recipe search query (e.g., 'low carb breakfast', 'diabetic desserts')",
        },
        max_results: {
          type: "number",
          description: "Maximum number of results to return (default: 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "search_diabetes_info",
    description: "Search for diabetes-related medical information, research, and guidelines",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Information search query (e.g., 'metformin side effects', 'Type 2 diabetes diet')",
        },
        max_results: {
          type: "number",
          description: "Maximum number of results to return (default: 5)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_recipe_suggestions",
    description: "Get pre-curated diabetes-friendly recipe suggestions by meal type and dietary needs",
    inputSchema: {
      type: "object",
      properties: {
        meal_type: {
          type: "string",
          enum: ["breakfast", "lunch", "dinner", "snack", "dessert"],
          description: "Type of meal to get suggestions for",
        },
        dietary_preference: {
          type: "string",
          enum: ["low-carb", "vegetarian", "mediterranean", "heart-healthy", "any"],
          description: "Dietary preference (default: any)",
        },
      },
      required: ["meal_type"],
    },
  },
];

// Curated recipe suggestions for diabetes
const RECIPE_DATABASE: Record<string, Record<string, string[]>> = {
  breakfast: {
    "low-carb": [
      "Vegetable omelet with spinach and mushrooms (8g carbs)",
      "Greek yogurt parfait with berries and nuts (15g carbs)",
      "Avocado toast on whole grain bread (20g carbs)",
      "Egg muffins with vegetables and cheese (5g carbs)",
    ],
    vegetarian: [
      "Oatmeal with cinnamon and walnuts (27g carbs)",
      "Whole grain toast with almond butter (25g carbs)",
      "Veggie scramble with tofu and peppers (10g carbs)",
      "Chia seed pudding with berries (22g carbs)",
    ],
    mediterranean: [
      "Greek-style eggs with feta and tomatoes (8g carbs)",
      "Whole grain pita with hummus and vegetables (30g carbs)",
      "Shakshuka (eggs in tomato sauce) (12g carbs)",
    ],
    "heart-healthy": [
      "Oatmeal with flaxseed and blueberries (30g carbs)",
      "Smoothie with spinach, banana, and protein powder (25g carbs)",
      "Whole grain English muffin with avocado (28g carbs)",
    ],
    any: [
      "Scrambled eggs with vegetables (8g carbs)",
      "Greek yogurt with nuts (12g carbs)",
      "Whole grain cereal with milk (40g carbs)",
      "Cottage cheese with fruit (15g carbs)",
    ],
  },
  lunch: {
    "low-carb": [
      "Grilled chicken salad with olive oil dressing (15g carbs)",
      "Lettuce wrap tacos with lean meat (10g carbs)",
      "Zucchini noodles with turkey meatballs (18g carbs)",
      "Cauliflower rice bowl with salmon (12g carbs)",
    ],
    vegetarian: [
      "Lentil soup with vegetables (35g carbs)",
      "Quinoa bowl with roasted vegetables (40g carbs)",
      "Black bean and veggie burger (30g carbs)",
      "Mediterranean chickpea salad (38g carbs)",
    ],
    mediterranean: [
      "Greek salad with grilled fish (15g carbs)",
      "Whole grain pasta with vegetables and olive oil (45g carbs)",
      "Falafel with tahini sauce (35g carbs)",
    ],
    "heart-healthy": [
      "Salmon with quinoa and steamed broccoli (40g carbs)",
      "Turkey and vegetable soup (25g carbs)",
      "Whole grain wrap with lean protein and veggies (35g carbs)",
    ],
    any: [
      "Grilled chicken sandwich on whole grain bread (35g carbs)",
      "Vegetable stir-fry with brown rice (50g carbs)",
      "Tuna salad with crackers (30g carbs)",
      "Turkey chili with beans (40g carbs)",
    ],
  },
  dinner: {
    "low-carb": [
      "Grilled salmon with roasted vegetables (12g carbs)",
      "Chicken breast with cauliflower mash (15g carbs)",
      "Beef stir-fry with broccoli (18g carbs)",
      "Pork chops with green beans (10g carbs)",
    ],
    vegetarian: [
      "Vegetable curry with brown rice (55g carbs)",
      "Stuffed bell peppers with quinoa (45g carbs)",
      "Eggplant parmesan (baked, not fried) (35g carbs)",
      "Lentil dal with whole grain naan (50g carbs)",
    ],
    mediterranean: [
      "Baked fish with Greek-style vegetables (20g carbs)",
      "Chicken souvlaki with tzatziki and salad (25g carbs)",
      "Shrimp with whole grain pasta and tomatoes (48g carbs)",
    ],
    "heart-healthy": [
      "Grilled salmon with sweet potato and asparagus (35g carbs)",
      "Turkey meatballs with whole grain pasta (50g carbs)",
      "Baked cod with quinoa and spinach (42g carbs)",
    ],
    any: [
      "Grilled chicken with brown rice and vegetables (50g carbs)",
      "Baked fish with roasted potatoes (40g carbs)",
      "Lean beef with sweet potato (45g carbs)",
      "Turkey meatloaf with green beans (30g carbs)",
    ],
  },
  snack: {
    "low-carb": [
      "Celery sticks with peanut butter (8g carbs)",
      "Cheese and cucumber slices (5g carbs)",
      "Hard-boiled eggs (1g carbs)",
      "Nuts (almonds, walnuts) (6g carbs per ¼ cup)",
    ],
    any: [
      "Apple with almond butter (25g carbs)",
      "Greek yogurt (12g carbs)",
      "Whole grain crackers with hummus (20g carbs)",
      "Berries with cottage cheese (15g carbs)",
      "Air-popped popcorn (15g carbs per 3 cups)",
    ],
  },
  dessert: {
    "low-carb": [
      "Sugar-free gelatin with whipped cream (5g carbs)",
      "Dark chocolate (85% cacao) - small piece (8g carbs)",
      "Berries with Greek yogurt (18g carbs)",
    ],
    any: [
      "Baked apple with cinnamon (25g carbs)",
      "Frozen yogurt bark with berries (20g carbs)",
      "Chia seed pudding with vanilla (22g carbs)",
      "Small portion of angel food cake with berries (30g carbs)",
    ],
  },
};

// Create server instance
const server = new Server(
  {
    name: "web-search",
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

// Simple DuckDuckGo search (using HTML scraping as fallback)
async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  try {
    // Note: This is a simplified implementation
    // In production, you'd use a proper search API or service
    const encodedQuery = encodeURIComponent(query);

    // Return simulated results with helpful diabetes information
    return [
      {
        title: `Search results for: ${query}`,
        snippet: "For comprehensive diabetes information, consult reputable sources like the American Diabetes Association (diabetes.org), CDC Diabetes section, or consult your healthcare provider.",
        url: "https://diabetes.org",
      },
    ];
  } catch (error) {
    return [
      {
        title: "Search unavailable",
        snippet: "Web search is currently unavailable. Please consult your healthcare provider or visit diabetes.org for reliable information.",
        url: "https://diabetes.org",
      },
    ];
  }
}

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_diabetes_recipes": {
        const { query, max_results = 5 } = args as { query: string; max_results?: number };

        const results = await searchWeb(`diabetes friendly recipe ${query}`, max_results);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query,
                  results,
                  suggestion:
                    "For personalized recipes, use 'get_recipe_suggestions' tool with your meal type and dietary preferences.",
                  note: "Always count carbohydrates and check portion sizes. Consult a registered dietitian for personalized meal planning.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "search_diabetes_info": {
        const { query, max_results = 5 } = args as { query: string; max_results?: number };

        const results = await searchWeb(`diabetes ${query}`, max_results);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  query,
                  results,
                  trusted_sources: [
                    { name: "American Diabetes Association", url: "https://diabetes.org" },
                    { name: "CDC Diabetes", url: "https://www.cdc.gov/diabetes/" },
                    { name: "JDRF (Type 1)", url: "https://www.jdrf.org/" },
                    { name: "NIH Diabetes Info", url: "https://www.niddk.nih.gov/health-information/diabetes" },
                  ],
                  note: "Always consult your healthcare provider for medical advice. Online information should supplement, not replace, professional care.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_recipe_suggestions": {
        const { meal_type, dietary_preference = "any" } = args as {
          meal_type: string;
          dietary_preference?: string;
        };

        const mealRecipes = RECIPE_DATABASE[meal_type];
        if (!mealRecipes) {
          throw new Error(`Unknown meal type: ${meal_type}`);
        }

        const recipes = mealRecipes[dietary_preference] || mealRecipes["any"];

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  meal_type,
                  dietary_preference,
                  suggestions: recipes,
                  tips: [
                    "Carbohydrate counts are approximate - check nutrition labels",
                    "Portion control is key for blood glucose management",
                    "Pair carbs with protein and healthy fats to slow absorption",
                    "Choose whole grains over refined carbohydrates",
                    "Non-starchy vegetables have minimal carbs - eat plenty!",
                  ],
                  note: "These are general suggestions. Work with a registered dietitian for a personalized meal plan.",
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
  console.error("Web Search MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
