# MCP Server Setup Guide

This guide helps you set up Model Context Protocol (MCP) servers for efficient development with Claude.

## Recommended MCP Servers

### 1. Supabase MCP (HIGH PRIORITY)
Enables Claude to access your database, run queries, and manage schema directly.

**Installation:**
```bash
npm install -g @supabase/mcp-server
```

**Configuration (in your Copilot chat settings):**
Add to your MCP servers configuration:
```json
{
  "supabase": {
    "command": "npx",
    "args": ["@supabase/mcp-server"],
    "env": {
      "SUPABASE_URL": "your_supabase_url",
      "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
    }
  }
}
```

**Get your credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Settings → API → Copy:
   - Project URL → `SUPABASE_URL`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY` (use this, not anon key)

**What it enables:**
- Query your database directly
- View and manage tables, functions, triggers
- Check RLS policies
- Run migrations
- Analyze query performance

---

### 2. Anthropic Docs MCP (MEDIUM PRIORITY)
Quick reference for Anthropic APIs without leaving your IDE.

**Installation:**
```bash
npm install -g @anthropic-ai/mcp-server-anthropic
```

**Configuration:**
```json
{
  "anthropic-docs": {
    "command": "npx",
    "args": ["@anthropic-ai/mcp-server-anthropic"]
  }
}
```

**What it enables:**
- Browse Anthropic API documentation
- Check available models and parameters
- Review best practices for Claude usage

---

### 3. GitHub MCP (OPTIONAL)
Useful for repository exploration and issue management.

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-github
```

**Configuration:**
```json
{
  "github": {
    "command": "npx",
    "args": ["@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your_github_token"
    }
  }
}
```

**Get your token:**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` and `read:user` scopes

---

## How to Configure in VS Code

### Option A: Using Copilot Chat Settings (Recommended for VS Code Insiders)

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "copilot.advanced"
3. Find "Copilot Advanced Settings" and click "Edit in settings.json"
4. Add your MCP configuration:

```json
"copilot.advanced": {
  "mcp": {
    "servers": {
      "supabase": {
        "command": "npx",
        "args": ["@supabase/mcp-server"],
        "env": {
          "SUPABASE_URL": "your_project_url",
          "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key"
        }
      },
      "anthropic-docs": {
        "command": "npx",
        "args": ["@anthropic-ai/mcp-server-anthropic"]
      }
    }
  }
}
```

### Option B: Using .code-workspace File

Open `Gravi.code-workspace` and add to settings:

```json
"copilot.advanced": {
  "mcp": {
    "servers": {
      "supabase": {
        "command": "npx",
        "args": ["@supabase/mcp-server"],
        "env": {
          "SUPABASE_URL": "${env:SUPABASE_URL}",
          "SUPABASE_SERVICE_ROLE_KEY": "${env:SUPABASE_SERVICE_ROLE_KEY}"
        }
      }
    }
  }
}
```

Then add to your `.env.local`:
```
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Best Practices

1. **Never commit credentials** - Use environment variables
2. **Use Service Role Key for MCP** - Gives full database access (keep secure)
3. **Use Anon Key in app** - Your React app uses the anon key (already in use)
4. **Test connection** - Ask Claude: "Can you help me query the users table?"

---

## Common Use Cases

### With Supabase MCP:
```
"Show me the schema for the sessions table"
"Query recent sessions grouped by mode"
"Check RLS policies on the analysis table"
"Generate a migration for adding a new column"
"Explain the current database indexes"
```

### With Anthropic Docs MCP:
```
"What are the latest Claude models available?"
"Show me the token limits for Claude 3.5 Sonnet"
"How do I structure JSON in system prompts?"
```

---

## Troubleshooting

**MCP server not connecting?**
- Check credentials are correct
- Verify npx can find the package: `npx @supabase/mcp-server --version`
- Check VS Code Copilot Chat output panel

**Permission denied errors?**
- Ensure Service Role Key is used (not anon key)
- Verify SUPABASE_URL format: `https://xxxx.supabase.co`

**Want to disable a server temporarily?**
- Remove it from the `servers` object or comment it out

---

## Next Steps

1. Get your Supabase credentials from dashboard
2. Add them to VS Code settings or environment
3. Restart VS Code
4. Ask Claude: "Can you help me understand my database schema?"
5. Enjoy more efficient development! 🚀
