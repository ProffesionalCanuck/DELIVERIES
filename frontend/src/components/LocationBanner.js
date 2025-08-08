import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { mockData } from '../mock';

const LocationBanner = () => {
  const [locationStatus, setLocationStatus] = useState('loading'); // loading, found, not-found, denied, error
  const [detectedNeighborhood, setDetectedNeighborhood] = useState('');
  const [nearbyAreas, setNearbyAreas] = useState([]);
  const [isInCoverageArea, setIsInCoverageArea] = useState(false);

  // Calgary deep south coordinates for reference
  const deepSouthAreas = {
    'Mahogany': { lat: 50.9045, lng: -114.0123 },
    'Auburn Bay': { lat: 50.8837, lng: -113.9583 },
    'Copperfield': { lat: 50.8954, lng: -113.9876 },
    'McKenzie Lake': { lat: 50.8896, lng: -114.0234 },
    'Chaparral': { lat: 50.9123, lng: -113.9798 },
    'Cranston': { lat: 50.9156, lng: -113.9612 },
    'Seton': { lat: 50.8876, lng: -113.9467 },
    'Legacy': { lat: 50.8767, lng: -113.9734 },
    'Walden': { lat: 50.8698, lng: -113.9845 },
    'Shawnessy': { lat: 50.9089, lng: -114.0678 },
    'Evergreen': { lat: 50.9234, lng: -114.0456 },
    'Bridlewood': { lat: 50.9187, lng: -114.0789 },
    'McKenzieTowne': { lat: 50.8923, lng: -114.0567 }
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearestNeighborhood = (userLat, userLng) => {
    let nearest = null;
    let minDistance = Infinity;
    let nearby = [];

    Object.entries(deepSouthAreas).forEach(([name, coords]) => {
      const distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { name, distance };
      }
      
      if (distance < 8) { // Within 8km radius
        nearby.push({ name, distance });
      }
    });

    return { nearest, nearby: nearby.sort((a, b) => a.distance - b.distance) };
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`
      );
      const data = await response.json();
      
      // Extract neighborhood/suburb info
      const neighborhood = data.address?.suburb || 
                          data.address?.neighbourhood || 
                          data.address?.city_district ||
                          data.address?.hamlet ||
                          data.display_name?.split(',')[0];
      
      return neighborhood;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return null;
    }
  };

  useEffect(() => {
    const detectLocation = async () => {
      if (!navigator.geolocation) {
        setLocationStatus('error');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get neighborhood name from coordinates
            const geoName = await reverseGeocode(latitude, longitude);
            
            // Find nearest coverage areas
            const { nearest, nearby } = findNearestNeighborhood(latitude, longitude);
            
            // Check if detected location matches our coverage areas
            const isInCoverage = mockData.coverageAreas.some(area => 
              geoName?.toLowerCase().includes(area.toLowerCase()) ||
              area.toLowerCase().includes(geoName?.toLowerCase()) ||
              nearest.distance < 3 // Within 3km of coverage area
            );
            
            setDetectedNeighborhood(geoName || nearest.name);
            setNearbyAreas(nearby.slice(0, 3)); // Show top 3 nearby areas
            setIsInCoverageArea(isInCoverage);
            setLocationStatus('found');
            
          } catch (error) {
            console.error('Location detection failed:', error);
            setLocationStatus('error');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationStatus(error.code === 1 ? 'denied' : 'error');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };

    // Add a small delay to not block page load
    const timer = setTimeout(detectLocation, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (locationStatus === 'loading') {
    return (
      <div style={{
        background: 'linear-gradient(45deg, rgba(143, 236, 120, 0.1), rgba(129, 221, 103, 0.1))',
        padding: '12px',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: 'var(--accent-text)',
        borderRadius: '8px',
        margin: '0 auto 1rem auto',
        maxWidth: '600px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}>
        <MapPin size={16} className="spin" />
        <span>Detecting your location for faster service...</span>
      </div>
    );
  }

  if (locationStatus === 'found' && detectedNeighborhood) {
    return (
      <div style={{
        background: isInCoverageArea 
          ? 'linear-gradient(45deg, rgba(143, 236, 120, 0.2), rgba(129, 221, 103, 0.2))'
          : 'linear-gradient(45deg, rgba(255, 196, 88, 0.2), rgba(255, 171, 64, 0.2))',
        padding: '16px',
        textAlign: 'center',
        borderRadius: '12px',
        margin: '0 auto 1.5rem auto',
        maxWidth: '700px',
        border: `1px solid ${isInCoverageArea ? 'rgba(143, 236, 120, 0.3)' : 'rgba(255, 196, 88, 0.3)'}`,
        animation: 'slideIn 0.5s ease'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          {isInCoverageArea ? (
            <CheckCircle size={20} color="var(--accent-text)" />
          ) : (
            <AlertCircle size={20} color="#f59e0b" />
          )}
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            margin: 0,
            color: isInCoverageArea ? 'var(--accent-text)' : '#f59e0b'
          }}>
            {isInCoverageArea 
              ? `Perfect! We deliver to ${detectedNeighborhood}!`
              : `You're not too far from us!`
            }
          </h3>
        </div>
        
        {isInCoverageArea ? (
          <p style={{
            margin: '0 0 0.75rem 0',
            color: 'var(--text-body)',
            fontSize: '0.95rem'
          }}>
            🚀 Lightning-fast 15-20 minute delivery to your area! 
            {nearbyAreas.length > 0 && (
              <span> We also serve nearby areas: {nearbyAreas.map(area => area.name).join(', ')}</span>
            )}
          </p>
        ) : (
          <p style={{
            margin: '0 0 0.75rem 0',
            color: 'var(--text-body)',
            fontSize: '0.95rem'
          }}>
            You're not too far from our service area! We might be able to squeeze you in. 
            Our closest service areas are: {nearbyAreas.map(area => area.name).join(', ')}. 
            Give us a call and we'll see what we can do!
          </p>
        )}
        
        <button
          className="btn-primary"
          onClick={() => window.location.href = `tel:1-368-338-0225`}
          style={{
            fontSize: '0.9rem',
            padding: '8px 16px',
            minHeight: 'auto'
          }}
        >
          {isInCoverageArea ? 'Order Now!' : 'Call - We Might Deliver!'}
        </button>
      </div>
    );
  }

  if (locationStatus === 'denied') {
    return (
      <div style={{
        background: 'rgba(0, 0, 0, 0.05)',
        padding: '12px',
        textAlign: 'center',
        borderRadius: '8px',
        margin: '0 auto 1rem auto',
        maxWidth: '600px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        📍 Enable location access to see if we deliver to your neighborhood
      </div>
    );
  }

  // Don't show anything for errors to keep page clean
  return null;
};

export default LocationBanner;