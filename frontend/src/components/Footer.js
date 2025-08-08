import React from 'react';
import { Phone, MapPin, Clock, Leaf } from 'lucide-react';
import { mockData } from '../mock';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'var(--text-primary)',
      color: 'white',
      padding: '3rem 0 1rem 0'
    }}>
      <div className="container">
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Company Info */}
          <div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ 
                background: 'var(--accent-primary)', 
                borderRadius: '8px', 
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Leaf size={20} color="white" />
              </div>
              <h3 style={{ 
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0
              }}>
                {mockData.company.name}
              </h3>
            </div>
            
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.6',
              margin: '0 0 1rem 0'
            }}>
              Home-grown Canadian liquor delivery service exclusively serving deep south Calgary neighborhoods with 24/7 availability.
            </p>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--accent-primary)'
            }}>
              <span>🍁</span>
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                Proudly Canadian Owned & Operated
              </span>
            </div>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 style={{ 
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>
              Contact Information
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Phone size={16} color="var(--accent-primary)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {mockData.company.phone}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={16} color="var(--accent-primary)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  {mockData.company.hours}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={16} color="var(--accent-primary)" />
                <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  Deep South Calgary Only
                </span>
              </div>
            </div>
          </div>
          
          {/* SEO Keywords */}
          <div>
            <h4 style={{ 
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '1rem',
              margin: '0 0 1rem 0'
            }}>
              Our Services
            </h4>
            
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {[
                'Dial-a-bottle Calgary',
                'Liquor delivery service',
                '24/7 alcohol delivery',
                'Beer, wine & spirits delivery',
                'Emergency alcohol delivery',
                'Multiple item discounts'
              ].map((service, index) => (
                <span key={index} style={{ 
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '0.9rem'
                }}>
                  • {service}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ 
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '1.5rem',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            © 2025 {mockData.company.name}. All rights reserved. | 
            Professional liquor delivery service for deep south Calgary neighborhoods.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;