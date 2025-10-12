# services/geocode.py

from fastapi import HTTPException
from httpx import (
    AsyncClient,
    HTTPStatusError,
    RequestError
)

async def get_location_info(lat: float, lon: float):
    try: 
        async with AsyncClient() as client:
            url = f"https://nominatim.openstreetmap.org/reverse"
            response = await client.get(url, params={
                "lat": lat,
                "lon": lon,
                "format": "json"
            })
            params = {
                "lat": lat,
                "lon": lon,
                "format": "json",
            }
            
            response.raise_for_status()
            return response.json()
    
    except HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Upstream error: {e.response.text}"
        )
    
    except RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach external API: {str(e)}"
        )
