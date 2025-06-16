# MCP Time Server

A Model Context Protocol (MCP) server that provides time and date functionality. This server exposes tools for getting current time, date, and formatting timestamps in various formats and timezones.

![image](https://github.com/user-attachments/assets/a4b9775e-9976-47ad-996d-ba0b4bcf2845)



## Features

- **get_current_time**: Get current time in ISO, local, UTC, or Unix timestamp format
- **get_current_date**: Get current date in various formats (ISO, local, short, long, custom)
- **get_datetime_info**: Get comprehensive date/time information including timezone details
- **format_timestamp**: Format any Unix timestamp to readable formats

## Installation

1. clone MCP server:
```bash
git clone https://github.com/PierreGode/timeMCP.git
cd timeMCP
```

2. Save the server code as `timeserver.js` and the package configuration as `package.json`

3. Install dependencies:
```bash
npm install
```

4. If in Linux Make the server executable:
```bash
chmod +x timeserver.js
```

## Usage

### Running the Server

The server runs on stdio transport (standard input/output):

```bash
node timeserver.js
```


In Claude desktop for example.
edit claude_desktop_config.json
```bash
{
  "mcpServers": {
    "time-server": {
      "command": "node",
      "args": ["C:\\Users\\youruser\\Documents\\timeMCP\\timeserver.js"],
      "env": {}
    }
  }
}
```


### Available Tools

#### 1. get_current_time
Get the current time in various formats.

**Parameters:**
- `format` (optional): "iso", "local", "utc", or "unix" (default: "iso")
- `timezone` (optional): Timezone string like "America/New_York" (default: "local")

**Example:**
```json
{
  "format": "local",
  "timezone": "Europe/London"
}
```

#### 2. get_current_date
Get the current date in various formats.

**Parameters:**
- `format` (optional): "iso", "local", "short", "long", or "custom" (default: "iso")
- `customFormat` (optional): JSON string of Intl.DateTimeFormat options (when format is "custom")
- `timezone` (optional): Timezone string (default: "local")

**Example:**
```json
{
  "format": "long",
  "timezone": "Asia/Tokyo"
}
```

#### 3. get_datetime_info
Get comprehensive date and time information.

**Parameters:**
- `timezone` (optional): Timezone string (default: "local")

**Example:**
```json
{
  "timezone": "America/Los_Angeles"
}
```

#### 4. format_timestamp
Format a Unix timestamp.

**Parameters:**
- `timestamp` (required): Unix timestamp in milliseconds
- `format` (optional): "iso", "local", "utc", or "custom" (default: "iso")
- `timezone` (optional): Timezone string (default: "local")

**Example:**
```json
{
  "timestamp": 1703097600000,
  "format": "local",
  "timezone": "UTC"
}
```

## Integration with MCP Clients

To use this server with an MCP client (like Claude Desktop), add it to your MCP configuration:

### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "time-server": {
      "command": "node",
      "args": ["/path/to/your/mcp-time-server/server.js"],
      "env": {}
    }
  }
}
```

### Other MCP Clients

For other MCP clients, refer to their documentation on how to configure MCP servers. The server uses stdio transport and follows the standard MCP protocol.

## Example Responses

### Current Time (ISO format):
```
Current time (iso): 2024-12-20T14:30:45.123Z
```

### Current Date (long format):
```
Current date (long): Friday, December 20, 2024
```

### DateTime Info:
```json
{
  "timestamp": 1703097845123,
  "iso": "2024-12-20T14:30:45.123Z",
  "local": "12/20/2024, 2:30:45 PM",
  "utc": "Fri, 20 Dec 2024 14:30:45 GMT",
  "unix": 1703097845,
  "year": 2024,
  "month": 12,
  "day": 20,
  "hour": 14,
  "minute": 30,
  "second": 45,
  "dayOfWeek": "Friday",
  "timezone": "America/New_York"
}
```

## Development

To run in development mode with debugging:

```bash
npm run dev
```

## Error Handling

The server includes comprehensive error handling for:
- Invalid timezones
- Invalid timestamps
- Malformed custom format strings
- Missing required parameters

## License

MIT License
