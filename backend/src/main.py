from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="CoreTerra Backend")

class HealthCheck(BaseModel):
    status: str
    message: str

@app.get("/", response_model=HealthCheck)
def read_root():
    return HealthCheck(status="ok", message="CoreTerra Backend is running")

@app.get("/health", response_model=HealthCheck)
def health_check():
    return HealthCheck(status="ok", message="System functional")
