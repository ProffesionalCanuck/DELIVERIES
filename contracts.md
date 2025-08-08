# API Contracts - South Calgary Quick Delivery Backend

## Purpose
Transform the website from a static brochure into a dynamic, SEO-optimized, lead-capturing platform that drives traffic and conversions.

## Backend Features to Implement

### 1. Contact Form System
**Mock Data:** Currently buttons link to phone calls only
**Backend Need:** Capture leads who prefer web forms over calls

**API Endpoints:**
- `POST /api/contact` - Submit contact form
- `GET /api/contact-submissions` - Admin view of submissions

**Data Model:**
```javascript
ContactSubmission {
  id: string,
  name: string,
  phone: string,
  email: string,
  neighborhood: string,
  message: string,
  submitted_at: datetime,
  status: "new" | "contacted" | "converted"
}
```

### 2. Blog System (SEO Traffic Driver)
**Mock Data:** No blog currently
**Backend Need:** Create SEO content to rank for keywords

**API Endpoints:**
- `GET /api/blog/posts` - Get all blog posts
- `GET /api/blog/posts/:slug` - Get single post
- `POST /api/blog/posts` - Create new post (admin)

**Data Model:**
```javascript
BlogPost {
  id: string,
  title: string,
  slug: string,
  content: string,
  excerpt: string,
  featured_image: string,
  seo_keywords: [string],
  published: boolean,
  published_at: datetime,
  views: number
}
```

**Initial SEO Blog Posts:**
- "Ultimate Guide to After Hours Alcohol Delivery in Calgary"
- "Why Deep South Calgary Gets Faster Liquor Delivery"
- "Mahogany Party Planning: What to Stock Up On"
- "Canadian Craft Beer Delivery to Auburn Bay"

### 3. Customer Testimonials System
**Mock Data:** No testimonials currently
**Backend Need:** Social proof to increase conversions

**API Endpoints:**
- `GET /api/testimonials` - Get approved testimonials
- `POST /api/testimonials` - Submit new testimonial

**Data Model:**
```javascript
Testimonial {
  id: string,
  name: string,
  neighborhood: string,
  rating: number,
  comment: string,
  delivery_time: string,
  approved: boolean,
  featured: boolean,
  submitted_at: datetime
}
```

### 4. Newsletter Signup
**Mock Data:** No email capture currently
**Backend Need:** Build email list for marketing

**API Endpoints:**
- `POST /api/newsletter` - Subscribe to newsletter
- `GET /api/newsletter/subscribers` - Admin view

**Data Model:**
```javascript
NewsletterSubscriber {
  id: string,
  email: string,
  neighborhood: string,
  subscribed_at: datetime,
  active: boolean
}
```

### 5. FAQ System
**Mock Data:** No FAQ currently  
**Backend Need:** Target long-tail SEO keywords

**API Endpoints:**
- `GET /api/faq` - Get all FAQs
- `POST /api/faq` - Add new FAQ (admin)

**Data Model:**
```javascript
FAQ {
  id: string,
  question: string,
  answer: string,
  category: "delivery" | "payment" | "coverage" | "general",
  order: number,
  popular: boolean
}
```

### 6. Analytics Tracking
**Mock Data:** No visitor tracking
**Backend Need:** Track conversions and popular content

**API Endpoints:**
- `POST /api/analytics/page-view` - Track page views
- `POST /api/analytics/phone-click` - Track phone button clicks
- `GET /api/analytics/stats` - Get traffic stats

**Data Model:**
```javascript
PageView {
  id: string,
  page: string,
  referrer: string,
  user_agent: string,
  ip_address: string,
  timestamp: datetime
}
```

## Frontend Integration Plan

### New Components to Create:
- `ContactForm.js` - Lead capture form
- `BlogList.js` - SEO blog listing
- `BlogPost.js` - Individual blog post
- `Testimonials.js` - Customer reviews section
- `Newsletter.js` - Email signup component
- `FAQ.js` - Frequently asked questions

### Existing Components to Update:
- `Contact.js` - Add contact form
- `Hero.js` - Add newsletter signup
- `Services.js` - Add testimonials
- `Footer.js` - Add blog links and FAQ links

### New Routes:
- `/blog` - Blog listing page
- `/blog/:slug` - Individual blog posts
- `/faq` - FAQ page

## SEO Benefits Expected:
1. **Blog Posts** - Target 50+ long-tail keywords
2. **FAQ Page** - Answer common search queries
3. **Testimonials** - Local social proof for "dial a bottle Calgary"
4. **Contact Forms** - Capture leads who don't call immediately
5. **Analytics** - Track which content drives phone calls

## Implementation Priority:
1. Contact Form (immediate lead capture)
2. Testimonials (social proof)  
3. Blog System (long-term SEO traffic)
4. FAQ (more SEO keywords)
5. Newsletter & Analytics (ongoing optimization)