from fastapi import APIRouter, HTTPException, Request
from typing import List
from datetime import datetime
from backend.models import ContactSubmission, ContactSubmissionCreate
from backend.server import db
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/contact", response_model=ContactSubmission)
async def submit_contact_form(contact_data: ContactSubmissionCreate):
    """Submit a new contact form submission"""
    try:
        # Create contact submission object
        contact_obj = ContactSubmission(**contact_data.dict())
        
        # Save to database
        result = await db.contact_submissions.insert_one(contact_obj.dict())
        
        if result.inserted_id:
            logger.info(f"New contact submission from {contact_data.name} in {contact_data.neighborhood}")
            return contact_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save contact submission")
            
    except Exception as e:
        logger.error(f"Error saving contact submission: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/contact-submissions", response_model=List[ContactSubmission])
async def get_contact_submissions(limit: int = 50):
    """Get contact form submissions (admin endpoint)"""
    try:
        # Get recent submissions
        submissions = await db.contact_submissions.find().sort("submitted_at", -1).limit(limit).to_list(limit)
        return [ContactSubmission(**submission) for submission in submissions]
    except Exception as e:
        logger.error(f"Error retrieving contact submissions: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.patch("/contact-submissions/{submission_id}/status")
async def update_submission_status(submission_id: str, status: str):
    """Update contact submission status"""
    try:
        valid_statuses = ["new", "contacted", "converted"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {valid_statuses}")
        
        result = await db.contact_submissions.update_one(
            {"id": submission_id},
            {"$set": {"status": status}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Contact submission not found")
            
        return {"message": "Status updated successfully"}
        
    except Exception as e:
        logger.error(f"Error updating submission status: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")