import { cloneElement, useState, useEffect } from 'react';

const breakpoints = {
  min: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
  max: Number.POSITIVE_INFINITY,
};

export default function ReactourTarget({
  name,
  from = 'min',
  to = 'max',
  children,
}) {
  const [className, setClassName] = useState('');

  useEffect(() => {
    if (
      window.innerWidth >= breakpoints[from] &&
      window.innerWidth < breakpoints[to]
    )
      setClassName(`react-tour-${name}`);
  }, []);

  return cloneElement(children, {
    className: `${children.props.className} ${className}`,
  });
}
