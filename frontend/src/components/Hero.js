import React from 'react';
import { Phone, Clock, MapPin } from 'lucide-react';
import { mockData } from '../mock';

const Hero = () => {
  const handleCallNow = () => {
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
          Calgary's Fastest
          <br />
          <span className="text-accent">Liquor Delivery</span>
        </h1>
        
        <p className="hero-subtitle">
          24/7 dial-a-bottle service exclusively for deep south Calgary. 
          Home-grown Canadian business delivering beer, wine, and spirits to your door in 30-45 minutes.
          When you need liquor near me or after hours alcohol delivery, we're here to help!
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
              Deep South Calgary Only
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