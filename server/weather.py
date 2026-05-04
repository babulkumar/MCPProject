from mcp.server.fastmcp import FastMCP
import requests
import certifi
import urllib.request
import json

#Initialize FastMCP server
mcp = FastMCP("weather")

#Constants
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"

#This is how LLM will know which function to call based on the docstring
@mcp.tool()
async def get_weather_alert(state:str)-> dict:
    """Get current weather report for a given state name."""

    # Step 1: Get coordinates from state name
    url = f"http://wttr.in/{state}?format=j1"  # http not https — no SSL

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

        current = data["current_condition"][0]

        return {
            "state": state,
            "temperature_c": current["temp_C"],
            "feels_like_c": current["FeelsLikeC"],
            "humidity_%": current["humidity"],
            "wind_speed_kmph": current["windspeedKmph"],
            "wind_direction": current["winddir16Point"],
            "precipitation_mm": current["precipMM"],
            "visibility_km": current["visibility"],
            "description": current["weatherDesc"][0]["value"]
        }

    except Exception as e:
        return {"error": str(e)}

  
     

  


#Run the server "Weather" on HTTP protocol
if __name__ =="__main__":
    mcp.run(transport="streamable-http")