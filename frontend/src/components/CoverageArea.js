import React, { useState } from 'react';
import { MapPin, Search, CheckCircle } from 'lucide-react';
import { mockData } from '../mock';

const CoverageArea = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredAreas = mockData.coverageAreas.filter(area =>
    area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="coverage" className="section section-bg">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="heading-2" style={{ marginBottom: '1rem' }}>
            <span className="text-accent">Deep South Calgary</span> Coverage Areas
          </h2>
          <p className="body-large" style={{ color: 'var(--text-secondary)' }}>
            We deliver exclusively to deep south Calgary neighborhoods for faster service
          </p>
        </div>
        
        {/* Search Bar */}
        <div style={{ 
          maxWidth: '500px',
          margin: '0 auto 2rem auto',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={20} 
              color="var(--text-muted)"
              style={{ 
                position: 'absolute',
                left: '16px',
                zIndex: 1
              }}
            />
            <input
              type="text"
              placeholder="Search your neighborhood..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                border: '1px solid var(--border-light)',
                borderRadius: '9999px',
                fontSize: '1rem',
                fontFamily: 'system-ui, sans-serif',
                background: 'white',
                color: 'var(--text-body)',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent-primary)';
                e.target.style.boxShadow = '0 0 0 3px rgba(148, 242, 127, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-light)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
        
        {/* Neighborhoods Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.5rem',
          marginBottom: '2rem'
        }}>
          {filteredAreas.map((area, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '8px 12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid var(--border-light)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--accent-primary)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-light)';
              e.target.style.transform = 'translateY(0)';
            }}
            >
              <CheckCircle size={16} color="var(--accent-text)" />
              <span className="body-medium" style={{ fontSize: '0.9rem' }}>
                {area}
              </span>
            </div>
          ))}
        </div>
        
        {filteredAreas.length === 0 && searchTerm && (
          <div style={{ 
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid var(--border-light)'
          }}>
            <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>
              Area Not Found
            </h3>
            <p className="body-medium" style={{ color: 'var(--text-secondary)' }}>
              Don't see your neighborhood? Call us and we'll let you know if we can deliver to your area!
            </p>
          </div>
        )}
        
        <div style={{ 
          textAlign: 'center',
          padding: '2rem',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
            Don't See Your Neighborhood?
          </h3>
          <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Our coverage area is growing! Call us to check if we deliver to your location.
          </p>
          <button className="btn-primary">
            Call to Confirm Coverage
          </button>
        </div>
      </div>
    </section>
  );
};

export default CoverageArea;