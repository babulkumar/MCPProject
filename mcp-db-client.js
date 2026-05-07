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

  // 2. Get available tools
  const { tools } = await mcpClient.listTools();

  // 3. Ask Ollama a question in plain English
  const userQuery = "Show me all customers";

  console.log(`\n💬 User: ${userQuery}`);

  const ollamaRes = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL,
      stream: false,
      messages: [{ role: "user", content: userQuery }],
      tools: tools.map(t => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.inputSchema
        }
      }))
    })
  });

  const ollamaData = await ollamaRes.json();
  const message = ollamaData.message;

  // 4. If Ollama calls a tool, execute it via MCP
  if (message?.tool_calls?.length > 0) {
    for (const toolCall of message.tool_calls) {
      console.log(`\n⚙️  Calling tool: ${toolCall.function.name}`);

      const toolResult = await mcpClient.callTool({
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments)
      });

      console.log("📦 Result:", JSON.stringify(toolResult, null, 2));
    }
  } else {
    console.log("💬 Ollama response:", message.content);
  }

  await mcpClient.close();
}

main().catch(console.error);