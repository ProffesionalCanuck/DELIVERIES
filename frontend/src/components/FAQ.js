import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Clock, MapPin, CreditCard, Star } from 'lucide-react';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openItems, setOpenItems] = useState(new Set());

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/faq`);
        if (response.ok) {
          const data = await response.json();
          setFaqs(data);
          // Open popular FAQs by default
          setOpenItems(new Set(data.filter(faq => faq.popular).map(faq => faq.id)));
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        // Fallback to mock data
        setFaqs([
          {
            id: '1',
            question: 'How fast is liquor delivery in deep south Calgary?',
            answer: 'We deliver to all deep south Calgary neighborhoods in 15-20 minutes on average. Unlike city-wide services that take hours, we focus exclusively on areas like Mahogany, Auburn Bay, Copperfield, and McKenzie Lake for lightning-fast service.',
            category: 'delivery',
            popular: true
          },
          {
            id: '2',
            question: 'What neighborhoods do you deliver to?',
            answer: 'We deliver exclusively to deep south Calgary including: Mahogany, Auburn Bay, Copperfield, McKenzie Lake, Chaparral, Cranston, Seton, Legacy, Walden, Okotoks, Chestemere, Shawnessy, Evergreen, Bridlewood, McKenzieTowne, Midnapore, Silverado, Inverness, New Brighton, Hotchkiss, Belmont, Sundance, Milrise, and Douglasdale.',
            category: 'coverage',
            popular: true
          }
        ]);
        setOpenItems(new Set(['1', '2']));
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const toggleItem = (id) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'delivery':
        return <Clock size={20} color="var(--accent-text)" />;
      case 'coverage':
        return <MapPin size={20} color="var(--accent-text)" />;
      case 'payment':
        return <CreditCard size={20} color="var(--accent-text)" />;
      case 'general':
        return <Star size={20} color="var(--accent-text)" />;
      default:
        return <HelpCircle size={20} color="var(--accent-text)" />;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading FAQs...</div>
      </div>
    );
  }

  const categories = [
    { key: 'delivery', label: 'Delivery & Timing', icon: Clock },
    { key: 'coverage', label: 'Coverage Areas', icon: MapPin },
    { key: 'payment', label: 'Payment & Pricing', icon: CreditCard },
    { key: 'general', label: 'General Questions', icon: Star }
  ];

  return (
    <section id="faq" className="section section-bg">
      <div className="container">
        {/* Category filters */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '2rem'
        }}>
          {categories.map(({ key, label, icon: Icon }) => {
            const count = faqs.filter(faq => faq.category === key).length;
            return count > 0 ? (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '8px 16px',
                background: 'white',
                border: '1px solid var(--border-light)',
                borderRadius: '9999px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                <Icon size={16} color="var(--accent-text)" />
                <span>{label} ({count})</span>
              </div>
            ) : null;
          })}
        </div>

        {/* FAQ Items */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {faqs.map((faq) => (
            <div key={faq.id} style={{
              background: 'white',
              border: '1px solid var(--border-light)',
              borderRadius: '12px',
              marginBottom: '1rem',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => toggleItem(faq.id)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--bg-section)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'none';
                }}
              >
                <div style={{ 
                  background: 'var(--accent-wash)', 
                  borderRadius: '8px', 
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '36px'
                }}>
                  {getCategoryIcon(faq.category)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 className="heading-3" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {faq.question}
                    {faq.popular && (
                      <span style={{
                        background: 'var(--accent-primary)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        Popular
                      </span>
                    )}
                  </h3>
                </div>
                
                <div style={{ minWidth: '24px' }}>
                  {openItems.has(faq.id) ? (
                    <ChevronUp size={24} color="var(--accent-text)" />
                  ) : (
                    <ChevronDown size={24} color="var(--text-muted)" />
                  )}
                </div>
              </button>
              
              {openItems.has(faq.id) && (
                <div style={{
                  padding: '0 1.5rem 1.5rem 5rem',
                  borderTop: '1px solid var(--border-light)',
                  background: 'var(--bg-section)',
                  animation: 'accordion-down 0.2s ease-out'
                }}>
                  <p className="body-medium" style={{
                    color: 'var(--text-body)',
                    lineHeight: '1.6',
                    margin: '1rem 0 0 0'
                  }}>
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '2rem',
          border: '1px solid var(--border-light)'
        }}>
          <h3 className="heading-3" style={{ marginBottom: '1rem' }}>
            Still Have Questions?
          </h3>
          <p className="body-medium" style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1.5rem' 
          }}>
            Call us directly for immediate answers and to place your order
          </p>
          <button 
            className="btn-primary"
            onClick={async () => {
              // Track phone click
              await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/phone-click`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  page: 'faq',
                  button_location: 'faq-cta'
                }),
              });
              
              window.location.href = `tel:1-368-338-0225`;
            }}
          >
            Call Now: 1-368-338-0225
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;