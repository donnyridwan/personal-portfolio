import React from 'react';
import useInView from '../../hooks/useInView';

// Block-level "texts reveal": rises in with blur the first time it scrolls into view
export default function Reveal({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`t-reveal ${inView ? 'is-shown' : ''} ${className}`}>
      {children}
    </div>
  );
}
