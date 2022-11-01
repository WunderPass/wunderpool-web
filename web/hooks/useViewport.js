import { useEffect, useState } from 'react';

export default function UseViewport() {
  const [viewport, setViewport] = useState({
    maxHeight: '100vh',
    maxWidth: '100vw',
  });

  const updateViewport = () => {
    setViewport({
      maxHeight: window.visualViewport.height,
      maxWidth: window.visualViewport.width,
    });
  };

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.visualViewport !== 'undefined'
    ) {
      updateViewport();

      window.visualViewport.addEventListener('resize', updateViewport);

      return () =>
        window.visualViewport.removeEventListener('resize', updateViewport);
    }
  }, []);

  return viewport;
}
