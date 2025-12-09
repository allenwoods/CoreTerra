from fastapi import FastAPI
from contextlib import asynccontextmanager
from src.storage import init_db
from src.capture import router as capture_router
from src.clarify import router as clarify_router
from src.organize import router as organize_router
from src.review import router as review_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB
    init_db()
    yield
    # Shutdown: Clean up if needed

app = FastAPI(title="CoreTerra Backend", lifespan=lifespan)

# Include Routers
app.include_router(capture_router)
app.include_router(clarify_router)
app.include_router(organize_router)
app.include_router(review_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "System functional"}
