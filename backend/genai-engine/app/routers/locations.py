from fastapi import (
    APIRouter,
    HTTPException
)

from httpx import (
    AsyncClient,
    HTTPStatusError,
    RequestError
)

from app.config import settings

router = APIRouter()

@router.get("/location-info/")
async def location_info(lat: float, lon: float):
    try: 
        async with AsyncClient() as client:
            url=settings.GEO_LOCATION_API
            params = {
                "lat": lat,
                "lon": lon,
                "format": "json",
            }
            response = await client.get(url=url, params=params)  
            response.raise_for_status()
            response.json()

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
