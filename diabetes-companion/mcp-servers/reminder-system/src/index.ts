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

// Reminder types
interface Reminder {
  id: string;
  type: "glucose_test" | "medication" | "custom";
  title: string;
  description?: string;
  time: string; // HH:MM format
  recurring: boolean;
  days?: string[]; // For recurring: ["monday", "tuesday", etc.]
  enabled: boolean;
  created_at: string;
}

// Data directory and file path
const DATA_DIR = path.join(os.homedir(), ".diabetes-companion");
const DATA_FILE = path.join(DATA_DIR, "reminders.json");

let reminders: Reminder[] = [];
let reminderIdCounter = 1;

// Ensure data directory exists
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.error(`Created data directory: ${DATA_DIR}`);
  }
}

// Load reminders from JSON file
function loadReminders() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(data);
      reminders = parsed.reminders || [];
      reminderIdCounter = parsed.nextId || 1;
      console.error(`Loaded ${reminders.length} reminders from ${DATA_FILE}`);
    } else {
      console.error("No existing data file found. Starting with empty reminders.");
    }
  } catch (error) {
    console.error(`Error loading reminders: ${error}. Starting with empty reminders.`);
    reminders = [];
    reminderIdCounter = 1;
  }
}

// Save reminders to JSON file
function saveReminders() {
  try {
    const data = {
      reminders,
      nextId: reminderIdCounter,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving reminders: ${error}`);
  }
}

// Initialize storage
ensureDataDirectory();
loadReminders();

// Recommended testing schedule for newly diagnosed diabetics
const RECOMMENDED_TEST_SCHEDULE = [
  { time: "07:00", title: "Fasting glucose test", description: "Test before breakfast" },
  { time: "09:00", title: "Post-breakfast glucose test", description: "Test 2 hours after breakfast" },
  { time: "12:00", title: "Pre-lunch glucose test", description: "Test before lunch" },
  { time: "14:00", title: "Post-lunch glucose test", description: "Test 2 hours after lunch" },
  { time: "18:00", title: "Pre-dinner glucose test", description: "Test before dinner" },
  { time: "20:00", title: "Post-dinner glucose test", description: "Test 2 hours after dinner" },
  { time: "22:00", title: "Bedtime glucose test", description: "Test before bed" },
];

// Helper to format time from now
function getTimeUntilReminder(reminderTime: string): string {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(":").map(Number);

  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes, 0, 0);

  // If reminder time has passed today, set it for tomorrow
  if (reminderDate <= now) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  const diffMs = reminderDate.getTime() - now.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours < 1) {
    return `${diffMins} minutes`;
  } else if (diffHours < 24) {
    return `${diffHours} hours`;
  } else {
    const days = Math.floor(diffHours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}

// Helper to get next reminder
function getNextReminder(): Reminder | null {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const activeReminders = reminders.filter(r => r.enabled);
  if (activeReminders.length === 0) return null;

  // Sort by time and find next one
  const sorted = activeReminders.sort((a, b) => a.time.localeCompare(b.time));

  // Find first reminder after current time
  let next = sorted.find(r => r.time > currentTime);

  // If no reminder found after current time, use first reminder (for tomorrow)
  if (!next) {
    next = sorted[0];
  }

  return next;
}

// Define available tools
const tools: Tool[] = [
  {
    name: "create_reminder",
    description: "Create a new reminder for glucose testing, medication, or custom purposes",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["glucose_test", "medication", "custom"],
          description: "Type of reminder",
        },
        title: {
          type: "string",
          description: "Title of the reminder",
        },
        time: {
          type: "string",
          description: "Time in HH:MM format (24-hour)",
        },
        description: {
          type: "string",
          description: "Optional description",
        },
        recurring: {
          type: "boolean",
          description: "Whether this reminder repeats daily (default: true)",
        },
      },
      required: ["type", "title", "time"],
    },
  },
  {
    name: "setup_testing_schedule",
    description: "Set up a recommended blood glucose testing schedule based on meal times",
    inputSchema: {
      type: "object",
      properties: {
        intensity: {
          type: "string",
          enum: ["minimal", "standard", "intensive"],
          description: "Testing frequency: minimal (2x/day), standard (4x/day), intensive (7x/day)",
        },
        breakfast_time: {
          type: "string",
          description: "Breakfast time in HH:MM format (optional, defaults to 07:00)",
        },
        lunch_time: {
          type: "string",
          description: "Lunch time in HH:MM format (optional, defaults to 12:00)",
        },
        dinner_time: {
          type: "string",
          description: "Dinner time in HH:MM format (optional, defaults to 18:00)",
        },
      },
      required: ["intensity"],
    },
  },
  {
    name: "list_reminders",
    description: "List all reminders, optionally filtered by type or active status",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["glucose_test", "medication", "custom", "all"],
          description: "Filter by reminder type (default: all)",
        },
        active_only: {
          type: "boolean",
          description: "Show only enabled reminders (default: true)",
        },
      },
    },
  },
  {
    name: "get_next_reminder",
    description: "Get the next upcoming reminder with time remaining",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "toggle_reminder",
    description: "Enable or disable a reminder by ID",
    inputSchema: {
      type: "object",
      properties: {
        reminder_id: {
          type: "string",
          description: "ID of the reminder to toggle",
        },
        enabled: {
          type: "boolean",
          description: "Set to true to enable, false to disable",
        },
      },
      required: ["reminder_id", "enabled"],
    },
  },
  {
    name: "delete_reminder",
    description: "Delete a reminder by ID",
    inputSchema: {
      type: "object",
      properties: {
        reminder_id: {
          type: "string",
          description: "ID of the reminder to delete",
        },
      },
      required: ["reminder_id"],
    },
  },
];

// Create server instance
const server = new Server(
  {
    name: "reminder-system",
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
      case "create_reminder": {
        const { type, title, time, description, recurring = true } = args as {
          type: "glucose_test" | "medication" | "custom";
          title: string;
          time: string;
          description?: string;
          recurring?: boolean;
        };

        // Validate time format
        if (!/^\d{2}:\d{2}$/.test(time)) {
          throw new Error("Time must be in HH:MM format (e.g., 07:30)");
        }

        const reminder: Reminder = {
          id: `reminder_${reminderIdCounter++}`,
          type,
          title,
          description,
          time,
          recurring,
          enabled: true,
          created_at: new Date().toISOString(),
        };

        reminders.push(reminder);
        saveReminders(); // Persist to disk

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  reminder,
                  message: `Created ${recurring ? 'daily' : 'one-time'} reminder: ${title} at ${time}`,
                  time_until: getTimeUntilReminder(time),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "setup_testing_schedule": {
        const {
          intensity,
          breakfast_time = "07:00",
          lunch_time = "12:00",
          dinner_time = "18:00",
        } = args as {
          intensity: "minimal" | "standard" | "intensive";
          breakfast_time?: string;
          lunch_time?: string;
          dinner_time?: string;
        };

        // Clear existing glucose test reminders
        const existingCount = reminders.length;
        reminders.splice(
          0,
          reminders.length,
          ...reminders.filter((r) => r.type !== "glucose_test")
        );

        const schedules = [];

        if (intensity === "minimal") {
          // Morning fasting + one post-meal
          schedules.push({
            time: breakfast_time,
            title: "Fasting glucose test",
            description: "Test before breakfast",
          });
          schedules.push({
            time: addHours(dinner_time, 2),
            title: "Post-dinner glucose test",
            description: "Test 2 hours after dinner",
          });
        } else if (intensity === "standard") {
          // Before breakfast, after breakfast, before dinner, bedtime
          schedules.push({
            time: breakfast_time,
            title: "Fasting glucose test",
            description: "Test before breakfast",
          });
          schedules.push({
            time: addHours(breakfast_time, 2),
            title: "Post-breakfast glucose test",
            description: "Test 2 hours after breakfast",
          });
          schedules.push({
            time: dinner_time,
            title: "Pre-dinner glucose test",
            description: "Test before dinner",
          });
          schedules.push({
            time: "22:00",
            title: "Bedtime glucose test",
            description: "Test before bed",
          });
        } else {
          // Intensive: before and after each meal + bedtime
          schedules.push({
            time: breakfast_time,
            title: "Fasting glucose test",
            description: "Test before breakfast",
          });
          schedules.push({
            time: addHours(breakfast_time, 2),
            title: "Post-breakfast glucose test",
            description: "Test 2 hours after breakfast",
          });
          schedules.push({
            time: lunch_time,
            title: "Pre-lunch glucose test",
            description: "Test before lunch",
          });
          schedules.push({
            time: addHours(lunch_time, 2),
            title: "Post-lunch glucose test",
            description: "Test 2 hours after lunch",
          });
          schedules.push({
            time: dinner_time,
            title: "Pre-dinner glucose test",
            description: "Test before dinner",
          });
          schedules.push({
            time: addHours(dinner_time, 2),
            title: "Post-dinner glucose test",
            description: "Test 2 hours after dinner",
          });
          schedules.push({
            time: "22:00",
            title: "Bedtime glucose test",
            description: "Test before bed",
          });
        }

        // Create reminders from schedule
        schedules.forEach((schedule) => {
          const reminder: Reminder = {
            id: `reminder_${reminderIdCounter++}`,
            type: "glucose_test",
            title: schedule.title,
            description: schedule.description,
            time: schedule.time,
            recurring: true,
            enabled: true,
            created_at: new Date().toISOString(),
          };
          reminders.push(reminder);
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  intensity,
                  reminders_created: schedules.length,
                  schedule: schedules,
                  message: `Set up ${intensity} testing schedule with ${schedules.length} daily reminders`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "list_reminders": {
        const { type = "all", active_only = true } = args as {
          type?: string;
          active_only?: boolean;
        };

        let filtered = reminders;

        if (type !== "all") {
          filtered = filtered.filter((r) => r.type === type);
        }

        if (active_only) {
          filtered = filtered.filter((r) => r.enabled);
        }

        // Sort by time
        filtered.sort((a, b) => a.time.localeCompare(b.time));

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: filtered.length,
                  reminders: filtered.map((r) => ({
                    ...r,
                    time_until: r.enabled ? getTimeUntilReminder(r.time) : null,
                  })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "get_next_reminder": {
        const next = getNextReminder();

        if (!next) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message: "No active reminders set. Create reminders to stay on track!",
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
                  next_reminder: {
                    ...next,
                    time_until: getTimeUntilReminder(next.time),
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "toggle_reminder": {
        const { reminder_id, enabled } = args as {
          reminder_id: string;
          enabled: boolean;
        };

        const reminder = reminders.find((r) => r.id === reminder_id);
        if (!reminder) {
          throw new Error(`Reminder ${reminder_id} not found`);
        }

        reminder.enabled = enabled;
        saveReminders(); // Persist to disk

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  reminder,
                  message: `Reminder ${enabled ? 'enabled' : 'disabled'}: ${reminder.title}`,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "delete_reminder": {
        const { reminder_id } = args as { reminder_id: string };

        const index = reminders.findIndex((r) => r.id === reminder_id);
        if (index === -1) {
          throw new Error(`Reminder ${reminder_id} not found`);
        }

        const deleted = reminders.splice(index, 1)[0];
        saveReminders(); // Persist to disk

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: true,
                  deleted_reminder: deleted,
                  message: `Deleted reminder: ${deleted.title}`,
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

// Helper function to add hours to time string
function addHours(time: string, hoursToAdd: number): string {
  const [hours, minutes] = time.split(":").map(Number);
  const newHours = (hours + hoursToAdd) % 24;
  return `${newHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Reminder System MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
