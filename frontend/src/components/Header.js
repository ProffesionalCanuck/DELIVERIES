import React from 'react';
import { Phone } from 'lucide-react';
import { mockData } from '../mock';

const Header = () => {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="nav-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ 
          background: 'var(--gradient-button)', 
          borderRadius: '8px', 
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Phone size={20} color="white" />
        </div>
        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          {mockData.company.name}
        </span>
      </div>
      
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button 
          onClick={() => scrollToSection('services')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '1rem',
            fontWeight: '500',
            padding: '6px 12px',
            borderRadius: '9999px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.05)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = 'var(--text-muted)';
          }}
        >
          Services
        </button>
        
        <button 
          onClick={() => scrollToSection('coverage')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '1rem',
            fontWeight: '500',
            padding: '6px 12px',
            borderRadius: '9999px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.05)';
            e.target.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = 'var(--text-muted)';
          }}
        >
          Coverage Area
        </button>
        
        <button 
          onClick={() => scrollToSection('contact')}
          className="btn-primary"
        >
          Call Now
        </button>
      </nav>
    </header>
  );
};

export default Header;