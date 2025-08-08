from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any
from backend.models import PageView, PageViewCreate, PhoneClick, PhoneClickCreate
from backend.server import db
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/analytics/page-view")
async def track_page_view(page_data: PageViewCreate, request: Request):
    """Track a page view"""
    try:
        # Create page view object with request details
        page_view = PageView(
            page=page_data.page,
            referrer=page_data.referrer,
            user_agent=request.headers.get("user-agent"),
            ip_address=request.client.host if request.client else None
        )
        
        # Save to database
        await db.page_views.insert_one(page_view.dict())
        
        return {"message": "Page view tracked"}
        
    except Exception as e:
        logger.error(f"Error tracking page view: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/analytics/phone-click")
async def track_phone_click(click_data: PhoneClickCreate, request: Request):
    """Track a phone button click"""
    try:
        # Create phone click object
        phone_click = PhoneClick(
            page=click_data.page,
            button_location=click_data.button_location,
            ip_address=request.client.host if request.client else None
        )
        
        # Save to database
        await db.phone_clicks.insert_one(phone_click.dict())
        
        logger.info(f"Phone click tracked: {click_data.button_location} on {click_data.page}")
        return {"message": "Phone click tracked"}
        
    except Exception as e:
        logger.error(f"Error tracking phone click: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/analytics/stats")
async def get_analytics_stats(days: int = 7) -> Dict[str, Any]:
    """Get analytics stats for the last N days"""
    try:
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get page views
        page_views = await db.page_views.count_documents({
            "timestamp": {"$gte": start_date, "$lte": end_date}
        })
        
        # Get phone clicks
        phone_clicks = await db.phone_clicks.count_documents({
            "timestamp": {"$gte": start_date, "$lte": end_date}
        })
        
        # Get top pages
        top_pages_pipeline = [
            {"$match": {"timestamp": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {"_id": "$page", "views": {"$sum": 1}}},
            {"$sort": {"views": -1}},
            {"$limit": 10}
        ]
        
        top_pages_cursor = db.page_views.aggregate(top_pages_pipeline)
        top_pages = await top_pages_cursor.to_list(10)
        
        # Get conversion rate (phone clicks / page views)
        conversion_rate = (phone_clicks / page_views * 100) if page_views > 0 else 0
        
        # Get recent contact submissions
        recent_contacts = await db.contact_submissions.count_documents({
            "submitted_at": {"$gte": start_date, "$lte": end_date}
        })
        
        return {
            "period_days": days,
            "page_views": page_views,
            "phone_clicks": phone_clicks,
            "conversion_rate": round(conversion_rate, 2),
            "contact_submissions": recent_contacts,
            "top_pages": top_pages
        }
        
    except Exception as e:
        logger.error(f"Error retrieving analytics stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")