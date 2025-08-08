from fastapi import APIRouter, HTTPException
import os
from twilio.rest import Client
from backend.models import ContactSubmission
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Twilio configuration
TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER')
BUSINESS_PHONE_NUMBER = "1-368-338-0225"  # Your business phone number


def send_sms_notification(contact_submission: ContactSubmission):
    """Send SMS notification for new contact form submission"""
    try:
        # Check if Twilio credentials are configured
        if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
            logger.warning("Twilio credentials not configured - SMS notification skipped")
            return False
            
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Format the message
        message_body = f"""🚀 NEW DELIVERY REQUEST!

👤 Customer: {contact_submission.name}
📱 Phone: {contact_submission.phone}
📧 Email: {contact_submission.email}
📍 Area: {contact_submission.neighborhood}

📝 Order Details:
{contact_submission.message}

💰 Call now for instant quote!"""
        
        # Send the SMS
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=BUSINESS_PHONE_NUMBER.replace('-', '').replace('(', '').replace(')', '').replace(' ', '')  # Clean phone format
        )
        
        logger.info(f"SMS notification sent successfully: {message.sid}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send SMS notification: {str(e)}")
        return False


def send_weekend_promotion_sms(email: str, neighborhood: str):
    """Send SMS notification for weekend promotion signup"""
    try:
        # Check if Twilio credentials are configured
        if not all([TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER]):
            logger.warning("Twilio credentials not configured - SMS notification skipped")
            return False
            
        # Initialize Twilio client
        client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        
        # Format the message
        message_body = f"""🎯 WEEKEND PROMOTION SIGNUP!

📧 Email: {email}
📍 Area: {neighborhood}

🔥 Customer wants 30% OFF code!
Call them ASAP to convert this lead!

Use code: WEEKEND30"""
        
        # Send the SMS
        message = client.messages.create(
            body=message_body,
            from_=TWILIO_PHONE_NUMBER,
            to=BUSINESS_PHONE_NUMBER.replace('-', '').replace('(', '').replace(')', '').replace(' ', '')
        )
        
        logger.info(f"Weekend promotion SMS sent successfully: {message.sid}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send weekend promotion SMS: {str(e)}")
        return False