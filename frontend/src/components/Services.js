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
      </div>
    </section>
  );
};

export default Services;