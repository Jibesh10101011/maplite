
import google.generativeai as genai
from app.services.geocode import get_location_info
from app.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")

async def generate_gemini_stream(query: str, lat: float, lon: float):
    location_info = get_location_info(lat, lon)
    context = f"You are an assistant helping a user currently located at: {location_info['address']}"

    full_prompt = f"{context}\nUser: {query}"

    chat = model.start_chat(history=[])

    # Stream each part of the response
    for chunk in chat.send_message(full_prompt, stream=True):
        yield f"data: {chunk.text}\n\n"


# curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
#   -H 'Content-Type: application/json' \
#   -H 'X-goog-api-key: AIzaSyAKmFE3PqAwdDU27KNif7WdhlSLxwNkLkE' \
#   -X POST \
#   -d '{
#     "contents": [
#       {
#         "parts": [
#           {
#             "text": "Explain how AI works in a few words"
#           }
#         ]
#       }
#     ]
#   }'