import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Automatically resets scroll position to the top of the window
 * whenever the route or pathname changes.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instant scroll to top on page change
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
