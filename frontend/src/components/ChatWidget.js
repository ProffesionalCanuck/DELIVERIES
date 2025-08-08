import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, User, Clock } from 'lucide-react';
import { mockData } from '../mock';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [lastSeen, setLastSeen] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message when chat opens
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          id: 1,
          text: "Hi! I'm here to help with your liquor delivery needs in deep south Calgary. What can I get delivered to you today?",
          sender: 'business',
          timestamp: new Date()
        }]);
        setLastSeen('Just now');
      }, 500);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add customer message
    const customerMessage = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'customer',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, customerMessage]);
    setNewMessage('');
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate business response (in real implementation, this would be WebSocket)
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Thanks for that! Let me check what we can deliver to your area. What neighborhood are you in?",
        "Perfect! I can definitely help with that order. What's your address for delivery?",
        "Great choice! That's available for delivery today. Would you like me to add anything else?",
        "I can get that delivered in 15-20 minutes. What's the best phone number to reach you?",
        "Absolutely! Let me get your order started. Can I get your name and phone number?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: randomResponse,
        sender: 'business',
        timestamp: new Date()
      }]);
      setLastSeen('Just now');
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  };

  const handleCallNow = () => {
    window.location.href = `tel:${mockData.company.phone}`;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'var(--gradient-button)',
            border: 'none',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(143, 236, 120, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            animation: 'pulse 2s infinite'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
          }}
        >
          <MessageCircle size={28} color="white" />
        </button>
        
        {/* Floating message hint */}
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          background: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          fontSize: '0.85rem',
          fontWeight: '500',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
          animation: 'slideIn 0.3s ease'
        }}>
          Chat with us for instant quotes!
        </div>
        
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '350px',
      height: '500px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      border: '1px solid var(--border-light)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-button)',
        color: 'white',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={16} />
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
              South Calgary Quick Delivery
            </div>
            <div style={{ 
              fontSize: '0.8rem', 
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                background: '#4ade80',
                borderRadius: '50%'
              }} />
              Online now • Last seen {lastSeen}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleCallNow}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Phone size={16} color="white" />
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} color="white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: '#f8fafc'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            justifyContent: message.sender === 'customer' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: '16px',
              background: message.sender === 'customer' 
                ? 'var(--accent-primary)' 
                : 'white',
              color: message.sender === 'customer' ? 'white' : 'var(--text-body)',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              {message.text}
              <div style={{
                fontSize: '0.7rem',
                opacity: 0.7,
                marginTop: '4px',
                textAlign: message.sender === 'customer' ? 'right' : 'left'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start'
          }}>
            <div style={{
              padding: '10px 14px',
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        background: 'white',
        borderTop: '1px solid var(--border-light)'
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-end'
        }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 12px',
              border: '1px solid var(--border-light)',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontFamily: 'system-ui, sans-serif',
              background: '#f8fafc',
              resize: 'none',
              outline: 'none'
            }}
          />
          
          <button
            type="submit"
            style={{
              background: 'var(--gradient-button)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={16} color="white" />
          </button>
        </form>
      </div>
      
      <style>{`
        .typing-dots span {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.4s infinite;
        }
        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatWidget;