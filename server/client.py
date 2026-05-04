from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain.agents import create_agent
from langchain_ollama import ChatOllama
import asyncio


async def main():
 client = MultiServerMCPClient(
        {
            "weather":{
                "url":"http://127.0.0.1:8000/mcp",
                "transport":"http",
            }
        }
    )

 tools = await client.get_tools()

 llm = ChatOllama(
        model="llama3.1",
        temperature=0.6,
        num_predict=256,
        base_url="http://localhost:11434"
        # other params...
    )
 
 agent= create_agent(llm,tools)
 weather_response = await agent.ainvoke({"messages": "what is the weather in new york?"})
 print("Weather Response: ",weather_response['messages'][-1].content)


asyncio.run(main())

