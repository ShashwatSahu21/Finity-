"""
Finity – AI Financial Companion
FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered financial companion for students and young earners in India",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix=settings.API_PREFIX)


@app.on_event("startup")
async def startup_event():
    import asyncio
    from app.services import market_db
    # Load cache from DB immediately on startup
    market_db.load_cache_from_db()
    # Start the autoupdate loop in the background
    asyncio.create_task(market_db.autoupdate_loop())



@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "disclaimer": "This is an educational tool, not financial advice.",
    }
