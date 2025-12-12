import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.storage import init_db
from src.capture import router as capture_router
from src.clarify import router as clarify_router
from src.organize import router as organize_router
from src.review import router as review_router
from src.auth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB
    init_db()
    yield
    # Shutdown: Clean up if needed


app = FastAPI(title="CoreTerra Backend", lifespan=lifespan)

# CORS Configuration
# Origins can be configured via CORS_ORIGINS environment variable (comma-separated)
cors_origins_env = os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
)
allowed_origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(capture_router)
app.include_router(clarify_router)
app.include_router(organize_router)
app.include_router(review_router)
app.include_router(auth_router)


@app.get("/health")
def health_check():
    return {"status": "ok", "message": "System functional", "version": "0.1.0"}
