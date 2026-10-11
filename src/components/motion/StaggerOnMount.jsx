import React, { useEffect, useState } from 'react';

// transitions.dev "Texts reveal": children with t-stagger-line--N classes rise in one after another on mount
export default function StaggerOnMount({ as: Tag = 'div', className = '', children }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    // Wait a frame so the hidden state paints before the transition starts
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return <Tag className={`t-stagger ${shown ? 'is-shown' : ''} ${className}`}>{children}</Tag>;
}
