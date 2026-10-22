from fastapi import FastAPI
from app.routers.jobs import router as jobs_router

app = FastAPI(
    title="AI Agent for 2D-to-3D",
    description="Backend API for interactive 3D generation",
    version="0.1.0",
)

app.include_router(jobs_router)


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "ai-3d-backend",
    }