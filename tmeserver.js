#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

class TimeServer {
  constructor() {
    this.server = new Server(
      {
        name: "time-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "get_current_time",
            description: "Get the current time in various formats",
            inputSchema: {
              type: "object",
              properties: {
                format: {
                  type: "string",
                  description: "Time format: 'iso', 'local', 'utc', or 'unix'",
                  enum: ["iso", "local", "utc", "unix"],
                  default: "iso"
                },
                timezone: {
                  type: "string",
                  description: "Timezone (e.g., 'America/New_York', 'Europe/London')",
                  default: "local"
                }
              },
              required: []
            },
          },
          {
            name: "get_current_date",
            description: "Get the current date in various formats",
            inputSchema: {
              type: "object",
              properties: {
                format: {
                  type: "string",
                  description: "Date format: 'iso', 'local', 'short', 'long', or 'custom'",
                  enum: ["iso", "local", "short", "long", "custom"],
                  default: "iso"
                },
                customFormat: {
                  type: "string",
                  description: "Custom format string (when format is 'custom'). Uses Intl.DateTimeFormat options"
                },
                timezone: {
                  type: "string",
                  description: "Timezone (e.g., 'America/New_York', 'Europe/London')",
                  default: "local"
                }
              },
              required: []
            },
          },
          {
            name: "get_datetime_info",
            description: "Get comprehensive date and time information",
            inputSchema: {
              type: "object",
              properties: {
                timezone: {
                  type: "string",
                  description: "Timezone (e.g., 'America/New_York', 'Europe/London')",
                  default: "local"
                }
              },
              required: []
            },
          },
          {
            name: "format_timestamp",
            description: "Format a given timestamp",
            inputSchema: {
              type: "object",
              properties: {
                timestamp: {
                  type: "number",
                  description: "Unix timestamp in milliseconds"
                },
                format: {
                  type: "string",
                  description: "Output format: 'iso', 'local', 'utc', or 'custom'",
                  enum: ["iso", "local", "utc", "custom"],
                  default: "iso"
                },
                timezone: {
                  type: "string",
                  description: "Timezone for formatting",
                  default: "local"
                }
              },
              required: ["timestamp"]
            },
          }
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_current_time":
            return await this.getCurrentTime(args);
          case "get_current_date":
            return await this.getCurrentDate(args);
          case "get_datetime_info":
            return await this.getDateTimeInfo(args);
          case "format_timestamp":
            return await this.formatTimestamp(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async getCurrentTime(args = {}) {
    const { format = "iso", timezone = "local" } = args;
    const now = new Date();

    let timeString;
    
    switch (format) {
      case "iso":
        timeString = now.toISOString();
        break;
      case "local":
        timeString = now.toLocaleTimeString();
        break;
      case "utc":
        timeString = now.toUTCString();
        break;
      case "unix":
        timeString = Math.floor(now.getTime() / 1000).toString();
        break;
      default:
        timeString = now.toISOString();
    }

    if (timezone !== "local" && format !== "unix") {
      try {
        const options = { timeZone: timezone, timeStyle: "medium" };
        timeString = now.toLocaleTimeString("en-US", options);
      } catch (error) {
        // Fallback if timezone is invalid
        timeString += ` (Note: Invalid timezone '${timezone}', showing in local time)`;
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Current time (${format}): ${timeString}`,
        },
      ],
    };
  }

  async getCurrentDate(args = {}) {
    const { format = "iso", customFormat, timezone = "local" } = args;
    const now = new Date();

    let dateString;

    switch (format) {
      case "iso":
        dateString = now.toISOString().split('T')[0];
        break;
      case "local":
        dateString = now.toLocaleDateString();
        break;
      case "short":
        dateString = now.toLocaleDateString("en-US", { 
          year: "numeric", 
          month: "short", 
          day: "numeric" 
        });
        break;
      case "long":
        dateString = now.toLocaleDateString("en-US", { 
          weekday: "long",
          year: "numeric", 
          month: "long", 
          day: "numeric" 
        });
        break;
      case "custom":
        if (customFormat) {
          try {
            // Parse custom format as JSON for Intl.DateTimeFormat options
            const options = JSON.parse(customFormat);
            dateString = now.toLocaleDateString("en-US", options);
          } catch (error) {
            dateString = `Error parsing custom format: ${error.message}`;
          }
        } else {
          dateString = "Custom format requires customFormat parameter";
        }
        break;
      default:
        dateString = now.toISOString().split('T')[0];
    }

    if (timezone !== "local" && format !== "custom") {
      try {
        const options = { 
          timeZone: timezone, 
          year: "numeric", 
          month: "2-digit", 
          day: "2-digit" 
        };
        dateString = now.toLocaleDateString("en-CA", options); // ISO format
      } catch (error) {
        dateString += ` (Note: Invalid timezone '${timezone}', showing in local time)`;
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Current date (${format}): ${dateString}`,
        },
      ],
    };
  }

  async getDateTimeInfo(args = {}) {
    const { timezone = "local" } = args;
    const now = new Date();

    const info = {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      local: now.toLocaleString(),
      utc: now.toUTCString(),
      unix: Math.floor(now.getTime() / 1000),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" }),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (timezone !== "local") {
      try {
        const tzOptions = { timeZone: timezone };
        info.timezoneSpecific = now.toLocaleString("en-US", tzOptions);
        info.requestedTimezone = timezone;
      } catch (error) {
        info.timezoneError = `Invalid timezone: ${timezone}`;
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Date/Time Information:\n${JSON.stringify(info, null, 2)}`,
        },
      ],
    };
  }

  async formatTimestamp(args) {
    const { timestamp, format = "iso", timezone = "local" } = args;
    
    if (!timestamp) {
      throw new Error("Timestamp is required");
    }

    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      throw new Error("Invalid timestamp");
    }

    let formatted;

    switch (format) {
      case "iso":
        formatted = date.toISOString();
        break;
      case "local":
        formatted = date.toLocaleString();
        break;
      case "utc":
        formatted = date.toUTCString();
        break;
      case "custom":
        if (timezone !== "local") {
          try {
            formatted = date.toLocaleString("en-US", { timeZone: timezone });
          } catch (error) {
            formatted = `${date.toLocaleString()} (Invalid timezone: ${timezone})`;
          }
        } else {
          formatted = date.toLocaleString();
        }
        break;
      default:
        formatted = date.toISOString();
    }

    return {
      content: [
        {
          type: "text",
          text: `Formatted timestamp: ${formatted}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Time MCP server running on stdio");
  }
}

const server = new TimeServer();
server.run().catch(console.error);
