from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    location: dict | None = None


class ChatResponse(BaseModel):
    reply: str

