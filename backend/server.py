from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import route modules
from backend.routes import contact, testimonials, newsletter, analytics, faq

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="South Calgary Quick Delivery API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Basic health check
@api_router.get("/")
async def root():
    return {"message": "South Calgary Quick Delivery API - Ready to drive traffic!"}

# Include all route modules
api_router.include_router(contact.router, tags=["Contact"])
api_router.include_router(testimonials.router, tags=["Testimonials"])
api_router.include_router(newsletter.router, tags=["Newsletter"])
api_router.include_router(analytics.router, tags=["Analytics"])

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize data on startup"""
    try:
        # Seed testimonials if none exist
        testimonial_count = await db.testimonials.count_documents({})
        if testimonial_count == 0:
            from backend.routes.testimonials import seed_testimonials
            await seed_testimonials()
            logger.info("Seeded initial testimonials")
            
        logger.info("South Calgary Quick Delivery API started successfully")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
