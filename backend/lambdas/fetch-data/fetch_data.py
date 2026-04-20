import json
import urllib.request

#event is a dict containing input data eg {"city": "Irvine", "weather": "sunny"}
#context provides info about the runtime
def lambda_handler(event, context):
    #get coordinates from react app via step functions
    #default to Irvine, CA if no city provided
    latitude = event.get("latitude", 33.6839)
    longitude = event.get("longitude", -117.8265)

    #build the url
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}&longitude={longitude}&"
        f"hourly=temperature_2m,cloud_cover,shortwave_radiation&"
        f"forecast_days=7&"
        f"timezone=auto"
    )

    try:
        with urllib.request.urlopen(url) as response:
            data = json.loads(response.read().decode())

            # 1. Access the hourly data block
            hourly = data.get('hourly', {})
            times = hourly.get('time', [])
            temps = hourly.get('temperature_2m', [])
            clouds = hourly.get('cloud_cover', [])
            solar = hourly.get('shortwave_radiation', [])

            #map all 168 hours (168 hours in a week)
            forecast_data = []
            for i in range(len(times)):
                forecast_data.append({
                    "time": times[i],
                    "temperature": temps[i],   # Celsius by default
                    "cloud_cover": clouds[i],  # Percentage (0-100)
                    "solar_radiation": solar[i] # W/m²
                })
            #return full week to the step function
            return {
                "location": {"latitude": latitude, "longitude": longitude},
                "units": {
                    "temp": "Celsius",
                    "clouds": "Percentage",
                    "solar": "W/m²"
                },
                "forecast": forecast_data
            }
            
    except Exception as e:
        return {
            "statusCode": 500, "error": str(e)
        }


