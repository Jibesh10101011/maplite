# routers/stream_chat.py
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from app.services.gemini_stream import generate_gemini_stream

router = APIRouter()

@router.post("/chat-stream")
async def chat_stream(request: Request):
    body = await request.json()
    query = body["query"]
    lat = body["lat"]
    lon = body["lon"]

    return StreamingResponse(generate_gemini_stream(query, lat, lon), media_type="text/event-stream")
