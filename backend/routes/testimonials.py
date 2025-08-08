from fastapi import APIRouter, HTTPException
from typing import List
from backend.models import Testimonial, TestimonialCreate
from backend.server import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/testimonials", response_model=Testimonial)
async def submit_testimonial(testimonial_data: TestimonialCreate):
    """Submit a new customer testimonial"""
    try:
        # Create testimonial object (starts as unapproved)
        testimonial_obj = Testimonial(**testimonial_data.dict())
        
        # Save to database
        result = await db.testimonials.insert_one(testimonial_obj.dict())
        
        if result.inserted_id:
            logger.info(f"New testimonial from {testimonial_data.name} in {testimonial_data.neighborhood}")
            return testimonial_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save testimonial")
            
    except Exception as e:
        logger.error(f"Error saving testimonial: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/testimonials", response_model=List[Testimonial])
async def get_testimonials(approved_only: bool = True, featured_only: bool = False):
    """Get customer testimonials"""
    try:
        # Build query
        query = {}
        if approved_only:
            query["approved"] = True
        if featured_only:
            query["featured"] = True
        
        # Get testimonials sorted by rating and recency
        testimonials = await db.testimonials.find(query).sort([("rating", -1), ("submitted_at", -1)]).limit(20).to_list(20)
        return [Testimonial(**testimonial) for testimonial in testimonials]
        
    except Exception as e:
        logger.error(f"Error retrieving testimonials: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/testimonials/{testimonial_id}/approve")
async def approve_testimonial(testimonial_id: str, featured: bool = False):
    """Approve and optionally feature a testimonial"""
    try:
        update_data = {"approved": True}
        if featured:
            update_data["featured"] = True
            
        result = await db.testimonials.update_one(
            {"id": testimonial_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Testimonial not found")
            
        return {"message": "Testimonial approved successfully"}
        
    except Exception as e:
        logger.error(f"Error approving testimonial: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Seed some initial testimonials
async def seed_testimonials():
    """Add some initial testimonials for demo purposes"""
    initial_testimonials = [
        {
            "name": "Sarah M.",
            "neighborhood": "Mahogany",
            "rating": 5,
            "comment": "Amazing service! Called at 11 PM and had my wine delivered in 18 minutes. These guys actually know where Mahogany is unlike other services!",
            "delivery_time": "18 minutes",
            "approved": True,
            "featured": True
        },
        {
            "name": "Mike C.",
            "neighborhood": "Auburn Bay",
            "rating": 5,
            "comment": "Finally, a delivery service that doesn't take 2 hours! South Calgary Quick Delivery saved our dinner party. Will definitely use again.",
            "delivery_time": "16 minutes",
            "approved": True,
            "featured": True
        },
        {
            "name": "Jessica L.",
            "neighborhood": "Copperfield",
            "rating": 5,
            "comment": "Best liquor delivery in Calgary! Fast, friendly, and they know all the neighborhoods in deep south. No more waiting forever for delivery from downtown.",
            "delivery_time": "22 minutes",
            "approved": True,
            "featured": False
        }
    ]
    
    for testimonial_data in initial_testimonials:
        testimonial = Testimonial(**testimonial_data)
        await db.testimonials.insert_one(testimonial.dict())