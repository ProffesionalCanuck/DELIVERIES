from fastapi import APIRouter, HTTPException
from typing import List
from backend.models import FAQ, FAQCreate
from backend.server import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/faq", response_model=List[FAQ])
async def get_faqs(category: str = None):
    """Get frequently asked questions"""
    try:
        # Build query
        query = {}
        if category:
            query["category"] = category
        
        # Get FAQs sorted by order and popularity
        faqs = await db.faqs.find(query).sort([("popular", -1), ("order", 1)]).to_list(100)
        return [FAQ(**faq) for faq in faqs]
        
    except Exception as e:
        logger.error(f"Error retrieving FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/faq", response_model=FAQ)
async def create_faq(faq_data: FAQCreate):
    """Create a new FAQ (admin endpoint)"""
    try:
        faq_obj = FAQ(**faq_data.dict())
        
        result = await db.faqs.insert_one(faq_obj.dict())
        
        if result.inserted_id:
            logger.info(f"New FAQ created: {faq_data.question}")
            return faq_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save FAQ")
            
    except Exception as e:
        logger.error(f"Error creating FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Seed initial FAQs
async def seed_faqs():
    """Add initial SEO-optimized FAQs"""
    initial_faqs = [
        {
            "question": "How fast is liquor delivery in deep south Calgary?",
            "answer": "We deliver to all deep south Calgary neighborhoods in 15-20 minutes on average. Unlike city-wide services that take hours, we focus exclusively on areas like Mahogany, Auburn Bay, Copperfield, and McKenzie Lake for lightning-fast service.",
            "category": "delivery",
            "order": 1,
            "popular": True
        },
        {
            "question": "What neighborhoods do you deliver to?",
            "answer": "We deliver exclusively to deep south Calgary including: Mahogany, Auburn Bay, Copperfield, McKenzie Lake, Chaparral, Cranston, Seton, Legacy, Walden, Okotoks, Chestemere, Shawnessy, Evergreen, Bridlewood, McKenzieTowne, Midnapore, Silverado, Inverness, New Brighton, Hotchkiss, Belmont, Sundance, Milrise, and Douglasdale.",
            "category": "coverage",
            "order": 2,
            "popular": True
        },
        {
            "question": "Do you deliver 24/7 for after hours alcohol?",
            "answer": "Yes! We provide 24/7 dial-a-bottle service for after hours alcohol delivery. Whether you need beer, wine, or spirits at 2 AM or any time, we're available around the clock for deep south Calgary residents.",
            "category": "delivery",
            "order": 3,
            "popular": True
        },
        {
            "question": "What payment methods do you accept?",
            "answer": "We accept cash and all major credit/debit cards at your door. Payment is collected upon delivery - no need to pay online. Our drivers carry portable card readers for your convenience.",
            "category": "payment",
            "order": 4,
            "popular": True
        },
        {
            "question": "Do you have delivery fees?",
            "answer": "Yes, we charge a small delivery fee. However, we offer amazing deals on multiple items - order 2 or more products and save! Contact us at 1-368-338-0225 for current pricing and promotions.",
            "category": "payment",
            "order": 5,
            "popular": False
        },
        {
            "question": "Why choose South Calgary Quick Delivery over other services?",
            "answer": "We're exclusively focused on deep south Calgary, which means: 1) 15-20 minute delivery vs hours from city-wide services, 2) We know your neighborhood personally, 3) No waiting for drivers coming from across Calgary, 4) Home-grown Canadian business that cares about your community.",
            "category": "general",
            "order": 6,
            "popular": True
        },
        {
            "question": "Can you deliver beer, wine, and spirits?",
            "answer": "Absolutely! We deliver all types of alcohol including craft beer, wine, premium spirits, coolers, and mixers. Our drivers can source from various liquor stores to get exactly what you need.",
            "category": "general",
            "order": 7,
            "popular": False
        },
        {
            "question": "How do I place an order for liquor delivery?",
            "answer": "Simply call us at 1-368-338-0225 and tell us what you need and your address. We'll confirm your location is in our deep south Calgary coverage area and give you an accurate delivery time. It's that easy!",
            "category": "general",
            "order": 8,
            "popular": True
        }
    ]
    
    for faq_data in initial_faqs:
        faq = FAQ(**faq_data)
        await db.faqs.insert_one(faq.dict())