import { useState, useEffect } from 'react';

export function usePageTransition(isVisible: boolean = true, delay: number = 200) {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isVisible && !shouldRender) {
      setShouldRender(true);
    } else if (!isVisible && shouldRender) {
      setIsActive(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender, delay]);

  useEffect(() => {
    if (shouldRender) {
      const timer = setTimeout(() => {
        setIsActive(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [shouldRender]);

  return { shouldRender, isActive };
}