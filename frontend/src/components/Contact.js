import React from 'react';
import { Phone, Clock, MapPin, DollarSign, Star } from 'lucide-react';
import { mockData } from '../mock';

const Contact = () => {
  const handleCall = () => {
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginBottom: '3rem'
        }}>
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
          </div>
          
          {/* Service Details Card */}
          <div style={{ 
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: '16px',
            padding: '2rem'
          }}>
            <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>
              Service Details
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: 'var(--accent-wash)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={20} color="var(--accent-text)" />
                </div>
                <div>
                  <div className="body-medium" style={{ fontWeight: '600' }}>
                    Operating Hours
                  </div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>
                    24/7 - Always Available
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: 'var(--accent-wash)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <MapPin size={20} color="var(--accent-text)" />
                </div>
                <div>
                  <div className="body-medium" style={{ fontWeight: '600' }}>
                    Delivery Time
                  </div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>
                    15-20 minutes average
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: 'var(--accent-wash)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <DollarSign size={20} color="var(--accent-text)" />
                </div>
                <div>
                  <div className="body-medium" style={{ fontWeight: '600' }}>
                    Payment
                  </div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>
                    Cash or card at your door
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ 
                  background: 'var(--accent-wash)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Star size={20} color="var(--accent-text)" />
                </div>
                <div>
                  <div className="body-medium" style={{ fontWeight: '600' }}>
                    Multiple Item Deals
                  </div>
                  <div className="body-small" style={{ color: 'var(--text-secondary)' }}>
                    Save on 2+ item orders
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* SEO Optimized Call to Action */}
        <div style={{ 
          background: 'var(--accent-wash)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
            Calgary's Premier <span className="text-accent">Dial-a-Bottle</span> & After Hours Alcohol Service
          </h3>
          <p className="body-medium" style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem',
            maxWidth: '600px',
            margin: '0 auto 1.5rem auto'
          }}>
            When you need alcohol delivery in Calgary's deep south, trust our local Canadian business. 
            Fast, reliable liquor delivery service with amazing deals on multiple items. No markup pricing - 
            same-day beer, wine, and spirits delivery from YYC's fastest courier service.
          </p>
          <button className="btn-primary" onClick={handleCall}>
            Order Your Liquor Delivery Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default Contact;