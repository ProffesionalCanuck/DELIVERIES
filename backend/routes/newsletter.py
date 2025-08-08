from fastapi import APIRouter, HTTPException
from typing import List
from backend.models import NewsletterSubscriber, NewsletterSubscribe
from backend.server import db
from backend.routes.sms import send_weekend_promotion_sms
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/newsletter", response_model=NewsletterSubscriber)
async def subscribe_newsletter(subscriber_data: NewsletterSubscribe):
    """Subscribe to newsletter"""
    try:
        # Check if email already exists
        existing = await db.newsletter_subscribers.find_one({"email": subscriber_data.email})
        if existing:
            # If exists but inactive, reactivate
            if not existing.get("active", True):
                await db.newsletter_subscribers.update_one(
                    {"email": subscriber_data.email},
                    {"$set": {"active": True, "neighborhood": subscriber_data.neighborhood}}
                )
                
                # Send SMS notification for weekend promotion
                sms_sent = send_weekend_promotion_sms(subscriber_data.email, subscriber_data.neighborhood)
                if sms_sent:
                    logger.info("Weekend promotion SMS sent to business phone")
                
                return NewsletterSubscriber(**existing)
            else:
                # Still send SMS for existing active subscribers (they might be signing up for weekend promo)
                sms_sent = send_weekend_promotion_sms(subscriber_data.email, subscriber_data.neighborhood)
                if sms_sent:
                    logger.info("Weekend promotion SMS sent to business phone (existing subscriber)")
                
                raise HTTPException(status_code=409, detail="Email already subscribed")
        
        # Create new subscriber
        subscriber_obj = NewsletterSubscriber(**subscriber_data.dict())
        
        # Save to database
        result = await db.newsletter_subscribers.insert_one(subscriber_obj.dict())
        
        if result.inserted_id:
            logger.info(f"New newsletter subscriber: {subscriber_data.email} from {subscriber_data.neighborhood}")
            
            # Send SMS notification for weekend promotion
            sms_sent = send_weekend_promotion_sms(subscriber_data.email, subscriber_data.neighborhood)
            if sms_sent:
                logger.info("Weekend promotion SMS sent to business phone")
            else:
                logger.warning("Weekend promotion SMS failed - check Twilio credentials")
            
            return subscriber_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save subscription")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error saving newsletter subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/newsletter/{email}")
async def unsubscribe_newsletter(email: str):
    """Unsubscribe from newsletter"""
    try:
        result = await db.newsletter_subscribers.update_one(
            {"email": email},
            {"$set": {"active": False}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Email not found")
            
        return {"message": "Successfully unsubscribed"}
        
    except Exception as e:
        logger.error(f"Error unsubscribing: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/newsletter/subscribers", response_model=List[NewsletterSubscriber])
async def get_newsletter_subscribers(active_only: bool = True):
    """Get newsletter subscribers (admin endpoint)"""
    try:
        query = {"active": True} if active_only else {}
        subscribers = await db.newsletter_subscribers.find(query).sort("subscribed_at", -1).to_list(1000)
        return [NewsletterSubscriber(**subscriber) for subscriber in subscribers]
        
    except Exception as e:
        logger.error(f"Error retrieving newsletter subscribers: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")