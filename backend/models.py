from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
import uuid


# Contact Form Models
class ContactSubmissionCreate(BaseModel):
    name: str
    phone: str
    email: EmailStr
    neighborhood: str
    message: str

class ContactSubmission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: str
    neighborhood: str
    message: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="new")  # "new", "contacted", "converted"


# Blog Models
class BlogPostCreate(BaseModel):
    title: str
    content: str
    excerpt: str
    featured_image: Optional[str] = None
    seo_keywords: List[str] = []
    published: bool = False

class BlogPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    content: str
    excerpt: str
    featured_image: Optional[str] = None
    seo_keywords: List[str] = []
    published: bool = False
    published_at: Optional[datetime] = None
    views: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Testimonials Models
class TestimonialCreate(BaseModel):
    name: str
    neighborhood: str
    rating: int = Field(ge=1, le=5)
    comment: str
    delivery_time: str

class Testimonial(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    neighborhood: str
    rating: int
    comment: str
    delivery_time: str
    approved: bool = Field(default=False)
    featured: bool = Field(default=False)
    submitted_at: datetime = Field(default_factory=datetime.utcnow)


# Newsletter Models
class NewsletterSubscribe(BaseModel):
    email: EmailStr
    neighborhood: str

class NewsletterSubscriber(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    neighborhood: str
    subscribed_at: datetime = Field(default_factory=datetime.utcnow)
    active: bool = Field(default=True)


# FAQ Models
class FAQCreate(BaseModel):
    question: str
    answer: str
    category: str  # "delivery", "payment", "coverage", "general"
    order: int = 0
    popular: bool = False

class FAQ(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str
    category: str
    order: int
    popular: bool
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Analytics Models
class PageViewCreate(BaseModel):
    page: str
    referrer: Optional[str] = None

class PageView(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str
    referrer: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class PhoneClickCreate(BaseModel):
    page: str
    button_location: str  # "header", "hero", "contact"

class PhoneClick(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    page: str
    button_location: str
    ip_address: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)