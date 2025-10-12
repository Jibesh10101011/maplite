# services/image_search.py

from fastapi import (
    HTTPException
)

from httpx import (
    AsyncClient,
    HTTPStatusError,
    RequestError
)


from ..config import settings

async def get_image_for_location(city: str):

    IMAGE_LOCATION_API_ENDPOINT = settings.IMAGE_LOCATION_API_ENDPOINT
    try: 
        async with AsyncClient() as client:

            # response = requests.get(IMAGE_LOCATION_API, params={
            #     "query": city,
            #     "client_id": "YOUR_UNSPLASH_ACCESS_KEY"
            # })
            # data = response.json()
            # return data["urls"]["regular"]

            response = await client.get(url=IMAGE_LOCATION_API_ENDPOINT, params={
                "query": city,
                "client_id": settings.IMAGE_LOCATION_API_KEY
            })

            data = response.json()
            return data["urls"]["regular"]
    
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
