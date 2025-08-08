import React from 'react';
import { Clock, ShoppingBag, MapPin, Heart, Star, DollarSign } from 'lucide-react';
import { mockData } from '../mock';

const iconMap = {
  'Clock': Clock,
  'ShoppingBag': ShoppingBag,
  'MapPin': MapPin,
  'Heart': Heart
};

const Services = () => {
  return (
    <section id="services" className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
            Why Choose South Calgary Quick Delivery?
          </h2>
          <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
            Professional liquor delivery service focused exclusively on deep south Calgary neighborhoods
          </p>
        </div>
        
        <div className="services-grid">
          {mockData.services.map((service) => {
            const IconComponent = iconMap[service.icon];
            return (
              <div key={service.id} className="service-card">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '1rem' 
                }}>
                  <div style={{ 
                    background: 'var(--accent-wash)', 
                    borderRadius: '12px', 
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={24} color="var(--accent-text)" />
                  </div>
                  <div>
                    <h3 className="heading-3">{service.title}</h3>
                    <span style={{ 
                      background: 'var(--accent-primary)', 
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {service.highlight}
                    </span>
                  </div>
                </div>
                
                <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Benefits Section */}
        <div style={{ 
          marginTop: '4rem',
          background: 'var(--accent-wash)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h3 className="heading-3" style={{ marginBottom: '1.5rem' }}>
            <span className="text-accent">Amazing Deals</span> on Multiple Items
          </h3>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {mockData.benefits.map((benefit, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                justifyContent: 'center'
              }}>
                <Star size={16} color="var(--accent-text)" fill="var(--accent-primary)" />
                <span className="body-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;