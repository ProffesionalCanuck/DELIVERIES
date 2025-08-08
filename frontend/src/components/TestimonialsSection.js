import React, { useState, useEffect } from 'react';
import { Star, Quote, MapPin } from 'lucide-react';

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials?approved_only=true`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        // Fallback to mock data if backend fails
        setTestimonials([
          {
            id: '1',
            name: 'Sarah M.',
            neighborhood: 'Mahogany',
            rating: 5,
            comment: 'Amazing service! Called at 11 PM and had my wine delivered in 18 minutes. These guys actually know where Mahogany is unlike other services!',
            delivery_time: '18 minutes'
          },
          {
            id: '2',
            name: 'Mike C.',
            neighborhood: 'Auburn Bay',
            rating: 5,
            comment: 'Finally, a delivery service that doesn\'t take 2 hours! South Calgary Quick Delivery saved our dinner party. Will definitely use again.',
            delivery_time: '16 minutes'
          },
          {
            id: '3',
            name: 'Jessica L.',
            neighborhood: 'Copperfield',
            rating: 5,
            comment: 'Best liquor delivery in Calgary! Fast, friendly, and they know all the neighborhoods in deep south. No more waiting forever for delivery from downtown.',
            delivery_time: '22 minutes'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? '#FFD700' : '#E5E5E5'}
        fill={index < rating ? '#FFD700' : 'transparent'}
      />
    ));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading testimonials...</div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {testimonials.slice(0, 6).map((testimonial) => (
            <div 
              key={testimonial.id}
              className="service-card"
              style={{
                position: 'relative',
                paddingTop: '3rem'
              }}
            >
              {/* Quote icon */}
              <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1.5rem',
                opacity: 0.1
              }}>
                <Quote size={32} color="var(--accent-primary)" />
              </div>
              
              {/* Rating */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {renderStars(testimonial.rating)}
                </div>
                <span style={{ 
                  background: 'var(--accent-primary)', 
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  Delivered in {testimonial.delivery_time}
                </span>
              </div>
              
              {/* Comment */}
              <p className="body-medium" style={{ 
                color: 'var(--text-body)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                "{testimonial.comment}"
              </p>
              
              {/* Customer info */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-light)'
              }}>
                <div style={{ 
                  background: 'var(--accent-wash)', 
                  borderRadius: '8px', 
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={14} color="var(--accent-text)" />
                </div>
                <div>
                  <div className="body-medium" style={{ fontWeight: '600' }}>
                    {testimonial.name}
                  </div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>
                    {testimonial.neighborhood}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA Section */}
        <div style={{ 
          background: 'var(--accent-wash)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
            Join Our Happy Customers!
          </h3>
          <p className="body-medium" style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem' 
          }}>
            Experience the fastest liquor delivery in deep south Calgary
          </p>
          <button 
            className="btn-primary"
            onClick={async () => {
              // Track phone click
              await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/phone-click`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  page: 'testimonials',
                  button_location: 'testimonials-cta'
                }),
              });
              
              window.location.href = `tel:1-368-338-0225`;
            }}
          >
            Call Now: 1-368-338-0225
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;