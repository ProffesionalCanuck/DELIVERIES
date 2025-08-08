import React from 'react';
import { Phone, Clock, MapPin } from 'lucide-react';
import { mockData } from '../mock';
import { trackPhoneClick } from './Analytics';

const Hero = () => {
  const handleCallNow = async () => {
    await trackPhoneClick('hero', 'main');
    window.location.href = `tel:${mockData.company.phone}`;
  };

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          South Calgary's Fastest
          <br />
          <span className="text-accent">Dial a Bottle</span>
        </h1>
        
        <p className="hero-subtitle">
          24/7 Dial A Bottle in Calgary's Deep South. We'll never be far from you like all the others who go everywhere else. 
          We're dedicated exclusively to Calgary's deep south WHICH MEANS faster delivery times, better service, and we actually know the neighborhood. 
          No more waiting hours for delivery from across the city.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          <button 
            className="btn-primary"
            onClick={handleCallNow}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Phone size={18} />
            Call for Delivery
          </button>
          
          <button 
            className="btn-secondary"
            onClick={scrollToContact}
          >
            View Coverage Areas
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '2rem', 
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          opacity: '0.8'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="var(--accent-text)" />
            <span className="body-small" style={{ color: 'var(--accent-text)', fontWeight: '500' }}>
              24/7 Service
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color="var(--accent-text)" />
            <span className="body-small" style={{ color: 'var(--accent-text)', fontWeight: '500' }}>
              15-20 Minute Delivery
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ 
              background: 'var(--accent-primary)', 
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              🍁
            </span>
            <span className="body-small" style={{ color: 'var(--accent-text)', fontWeight: '500' }}>
              Home-Grown Canadian
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;