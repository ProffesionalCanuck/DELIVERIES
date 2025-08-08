import React from 'react';
import { Phone, Clock, MapPin, DollarSign, Star } from 'lucide-react';
import { mockData } from '../mock';
import { trackPhoneClick } from './Analytics';
import ContactForm from './ContactForm';

const Contact = () => {
  const handleCall = async () => {
    await trackPhoneClick('contact-section', 'main');
    window.location.href = `tel:${mockData.company.phone}`;
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
            Ready for <span className="text-accent">Quick Delivery?</span>
          </h2>
          <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
            Call us now for same-day liquor delivery to your deep south Calgary location
          </p>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Contact Form */}
          <ContactForm />
          
          {/* Contact Info Card */}
          <div style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              background: 'var(--gradient-button)', 
              borderRadius: '50%', 
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Phone size={32} color="white" />
            </div>
            
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>
              Call for Delivery
            </h3>
            
            <p style={{ 
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--accent-text)',
              marginBottom: '0.5rem'
            }}>
              {mockData.company.phone}
            </p>
            
            <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Available 24/7 for your convenience
            </p>
            
            <button 
              className="btn-primary"
              onClick={handleCall}
              style={{ width: '100%' }}
            >
              Call Now
            </button>

            {/* Service Details */}
            <div style={{ 
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border-light)'
            }}>
              <h4 className="heading-3" style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>
                Service Details
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} color="var(--accent-text)" />
                  <div>
                    <div className="body-small" style={{ fontWeight: '600' }}>24/7 Service</div>
                    <div className="caption">Always available</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={16} color="var(--accent-text)" />
                  <div>
                    <div className="body-small" style={{ fontWeight: '600' }}>15-20 min delivery</div>
                    <div className="caption">Deep south Calgary</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <DollarSign size={16} color="var(--accent-text)" />
                  <div>
                    <div className="body-small" style={{ fontWeight: '600' }}>Cash or card</div>
                    <div className="caption">Payment at door</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;