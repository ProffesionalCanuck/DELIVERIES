import { useEffect } from 'react';

// Analytics utility component for tracking page views
const Analytics = ({ page }) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/page-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: page || window.location.pathname,
            referrer: document.referrer || null
          }),
        });
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Analytics tracking failed:', error);
      }
    };

    trackPageView();
  }, [page]);

  return null; // This component doesn't render anything
};

// Utility function for tracking phone clicks
export const trackPhoneClick = async (buttonLocation, page = null) => {
  try {
    await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/analytics/phone-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page: page || window.location.pathname,
        button_location: buttonLocation
      }),
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.debug('Phone click tracking failed:', error);
  }
};

export default Analytics;