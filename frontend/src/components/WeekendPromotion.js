import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Clock, Percent } from 'lucide-react';
import { mockData } from '../mock';

const WeekendPromotion = () => {
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
        setMessage('🎉 Discount code sent to your email! Use code WEEKEND30 when you call to order.');
        setFormData({ email: '', neighborhood: '' });
      } else if (response.status === 409) {
        setStatus('success');
        setMessage('🎉 You\'re already subscribed! Use code WEEKEND30 when you call to get your discount.');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Failed to get discount code. Please try calling us directly at 1-368-338-0225');
      console.error('Error subscribing to promotion:', error);
    }
  };

  // Get current date info for the promotion
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 || dayOfWeek === 5; // Friday, Saturday, Sunday

  if (!isWeekend && today.getDay() !== 4) { // Don't show if not Thu-Sun
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FF6B6B, #FF8E8E)',
      color: 'white',
      padding: '2rem',
      borderRadius: '16px',
      margin: '2rem 0',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.3)'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        opacity: 0.3
      }} />
      
      <div style={{
        position: 'absolute',
        bottom: '-30px',
        left: '-30px',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        opacity: 0.3
      }} />

      {status === 'success' ? (
        <div style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}>
            <CheckCircle size={40} color="white" />
          </div>
          
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Discount Code Unlocked! 🎉
          </h3>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#FF6B6B',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            fontWeight: '700',
            fontSize: '1.2rem',
            textShadow: 'none'
          }}>
            Code: <span style={{ fontSize: '1.4rem' }}>WEEKEND30</span>
          </div>
          
          <p style={{
            opacity: 0.9,
            marginBottom: '1.5rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            {message}
          </p>
          
          <button 
            className="btn-primary"
            onClick={() => window.location.href = `tel:1-368-338-0225`}
            style={{
              background: 'white',
              color: '#FF6B6B',
              border: 'none',
              fontWeight: '700'
            }}
          >
            Call Now: 1-368-338-0225
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Percent size={28} color="white" />
            </div>
            
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <Clock size={16} color="white" opacity="0.8" />
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  THIS WEEKEND ONLY
                </span>
              </div>
              <h3 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}>
                30% OFF Two Items!
              </h3>
            </div>
          </div>

          <p style={{
            fontSize: '1.1rem',
            marginBottom: '1.5rem',
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Get your exclusive discount code instantly! Valid on any 2-item order in deep south Calgary.
          </p>

          <form onSubmit={handleSubmit} style={{ 
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '1.5rem',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email for instant discount code"
                required
                style={{
                  padding: '14px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'system-ui, sans-serif',
                  background: 'white',
                  color: '#333'
                }}
              />
              
              <select
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                required
                style={{
                  padding: '14px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'system-ui, sans-serif',
                  background: 'white',
                  color: '#333'
                }}
              >
                <option value="">Select your neighborhood</option>
                {mockData.coverageAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {status === 'error' && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={16} color="white" />
                <span style={{ fontSize: '0.9rem' }}>
                  {message}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                padding: '14px',
                background: 'white',
                color: '#FF6B6B',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: status === 'submitting' ? 0.7 : 1
              }}
            >
              {status === 'submitting' ? 'Getting Your Code...' : '🎯 Get 30% OFF Code Now'}
            </button>
          </form>

          <p style={{
            fontSize: '0.85rem',
            marginTop: '1rem',
            opacity: 0.7,
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }}>
            Valid this weekend only. Discount applies to 2+ item orders. Call with your code to redeem.
          </p>
        </div>
      )}
    </div>
  );
};

export default WeekendPromotion;