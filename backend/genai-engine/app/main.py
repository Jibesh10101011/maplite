from fastapi import Depends, FastAPI

from app.dependencies import get_query_token, get_token_header
from app.internal import admin
from app.routers import (
    items, 
    users, 
    locations,
    stream_chat
)
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware


# app = FastAPI(dependencies=[Depends(get_query_token)])
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(items.router)
app.include_router(locations.router)
app.include_router(stream_chat.router)

app.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_token_header)],
    responses={418: {"description": "I'm a teapot"}},
)


@app.get("/")
async def root():
    return {"message": "Hello Bigger Applications!", "dbUrl": settings.DB_URL}