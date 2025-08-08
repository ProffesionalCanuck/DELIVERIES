import React, { useState } from 'react';
import { Send, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { mockData } from '../mock';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    neighborhood: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  const [errorMessage, setErrorMessage] = useState('');

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
      // Track analytics
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page: 'contact-form-submission',
          referrer: window.location.pathname
        }),
      });

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          neighborhood: '',
          message: ''
        });
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Failed to submit form. Please try calling us directly.');
      console.error('Error submitting contact form:', error);
    }
  };

  const handleCallNow = async () => {
    // Track phone click
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/phone-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: 'contact-form',
        button_location: 'contact-form-cta'
      }),
    });
    
    window.location.href = `tel:${mockData.company.phone}`;
  };

  if (status === 'success') {
    return (
      <div style={{ 
        background: 'var(--accent-wash)',
        borderRadius: '16px',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ 
          background: 'var(--accent-primary)', 
          borderRadius: '50%', 
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto'
        }}>
          <CheckCircle size={28} color="white" />
        </div>
        
        <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
          Message Sent Successfully!
        </h3>
        
        <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Thanks for contacting South Calgary Quick Delivery! We'll get back to you within 1 hour, 
          or call us now for immediate service.
        </p>
        
        <button 
          className="btn-primary"
          onClick={handleCallNow}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
        >
          <Phone size={18} />
          Call Now: {mockData.company.phone}
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      borderRadius: '16px',
      padding: '2rem'
    }}>
      <h3 className="heading-3" style={{ marginBottom: '0.5rem' }}>
        Get a Quick Quote
      </h3>
      <p className="body-medium" style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Tell us what you need delivered and we'll get back to you with timing and pricing
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
                color: 'var(--text-body)'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              color: 'var(--text-primary)'
            }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
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
                color: 'var(--text-body)'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
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
              color: 'var(--text-body)'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            Your Neighborhood *
          </label>
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
              color: 'var(--text-body)'
            }}
          >
            <option value="">Select your neighborhood</option>
            {mockData.coverageAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            color: 'var(--text-primary)'
          }}>
            What do you need delivered?
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="e.g. 2 bottles of wine, 6-pack of beer, specific brands..."
            rows="3"
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'system-ui, sans-serif',
              background: 'white',
              color: 'var(--text-body)',
              resize: 'vertical'
            }}
          />
        </div>

        {status === 'error' && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} color="#dc2626" />
            <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>
              {errorMessage}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit"
            className="btn-primary"
            disabled={status === 'submitting'}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              opacity: status === 'submitting' ? 0.7 : 1
            }}
          >
            <Send size={18} />
            {status === 'submitting' ? 'Sending...' : 'Get Quote'}
          </button>
          
          <button 
            type="button"
            className="btn-secondary"
            onClick={handleCallNow}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Phone size={18} />
            Call Instead
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;