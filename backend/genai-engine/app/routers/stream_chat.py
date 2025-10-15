# routers/stream_chat.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from app.services.gemini_stream import generate_gemini_stream
from app.schemas.stream_chat import ChatRequest, ChatResponse
import google.generativeai as genai
from dotenv import load_dotenv
import os

router = APIRouter()


load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))



@router.post("/chat", response_model=ChatResponse)
async def chat_with_ai(req: ChatRequest):
    try:
        print("Request Received")
        print("Location: ", req.location)

        location_context = ""
        if req.location and "latitude" in req.location and "longitude" in req.location:
            lat, lon = req.location["latitude"], req.location["longitude"]
            location_context = f"The user is currently at coordinates ({lat}, {lon})."

        system_instruction = (
            "You are a helpful and knowledgeable AI assistant. "
            "Use the user's location context to provide regionally relevant information, "
            "such as local culture, nearby landmarks, or events. "
            "If the location is missing, respond normally."
        )

        user_message = f"{location_context}\nUser said: {req.message}"
        model = genai.GenerativeModel(
            "gemini-2.5-flash",
            system_instruction=system_instruction,
        )

        response = model.generate_content(user_message)
        reply_text = response.text.strip() if response.text else "Sorry, I couldn’t generate a response."

        return ChatResponse(reply=reply_text)

    except Exception as e:
        print("Chat error:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat-stream")
async def chat_stream(request: Request):
    body = await request.json()
    query = body["query"]
    lat = body["lat"]
    lon = body["lon"]

    return StreamingResponse(generate_gemini_stream(query, lat, lon), media_type="text/event-stream")


