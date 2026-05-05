import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // 1. Connect to PostgreSQL via MCP
  const transport = new StdioClientTransport({
    command: "npx",
    args: [
      "-y",
      "@modelcontextprotocol/server-postgres",
      process.env.DATABASE_URL
    ]
  });

  const mcpClient = new Client({ name: "vscode-ollama-db", version: "1.0.0" });
  await mcpClient.connect(transport);
  console.log("✅ MCP connected to PostgreSQL");

  // 2. List available tools
  const { tools } = await mcpClient.listTools();
  console.log("🔧 Available tools:", tools.map(t => t.name));

  await mcpClient.close();
}

main().catch(console.error);