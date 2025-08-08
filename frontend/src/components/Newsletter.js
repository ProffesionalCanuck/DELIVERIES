import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { mockData } from '../mock';

const Newsletter = ({ inline = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    neighborhood: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Successfully subscribed! We\'ll keep you updated on deals and service news.');
        setFormData({ email: '', neighborhood: '' });
      } else if (response.status === 409) {
        setStatus('error');
        setMessage('This email is already subscribed to our newsletter.');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to subscribe. Please try again later.');
      console.error('Error subscribing to newsletter:', error);
    }
  };

  const containerStyle = inline 
    ? {
        background: 'var(--accent-wash)',
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '1rem'
      }
    : {
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        padding: '2rem'
      };

  return (
    <div style={containerStyle}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem',
        marginBottom: '1rem' 
      }}>
        <div style={{ 
          background: 'var(--accent-primary)', 
          borderRadius: '8px', 
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Mail size={20} color="white" />
        </div>
        <div>
          <h3 className="heading-3">
            Stay Updated on Deep South Calgary Deals
          </h3>
          {!inline && (
            <p className="body-medium" style={{ color: 'var(--text-secondary)', margin: '0.5rem 0 0 0' }}>
              Get notified about special promotions, new coverage areas, and exclusive offers
            </p>
          )}
        </div>
      </div>

      {status === 'success' ? (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={20} color="#16a34a" />
          <span style={{ color: '#16a34a', fontWeight: '500' }}>
            {message}
          </span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: inline ? '1fr' : '1fr 200px', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
              style={{
                padding: '12px 16px',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'system-ui, sans-serif',
                background: 'white',
                color: 'var(--text-body)'
              }}
            />
            
            {!inline && (
              <select
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                required
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'system-ui, sans-serif',
                  background: 'white',
                  color: 'var(--text-body)'
                }}
              >
                <option value="">Your neighborhood</option>
                {mockData.coverageAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            )}
          </div>

          {inline && (
            <select
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'system-ui, sans-serif',
                background: 'white',
                color: 'var(--text-body)',
                marginBottom: '1rem'
              }}
            >
              <option value="">Select your neighborhood</option>
              {mockData.coverageAreas.map((area) => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          )}

          {status === 'error' && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} color="#dc2626" />
              <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
                {message}
              </span>
            </div>
          )}

          <button 
            type="submit"
            className={inline ? "btn-secondary" : "btn-primary"}
            disabled={status === 'submitting'}
            style={{ 
              width: inline ? '100%' : 'auto',
              opacity: status === 'submitting' ? 0.7 : 1
            }}
          >
            {status === 'submitting' ? 'Subscribing...' : 'Subscribe for Deals'}
          </button>
        </form>
      )}
    </div>
  );
};

export default Newsletter;