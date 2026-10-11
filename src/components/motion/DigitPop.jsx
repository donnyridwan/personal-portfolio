import React from 'react';
import useInView from '../../hooks/useInView';
import { splitDigits } from '../../lib/digits';

// transitions.dev "Number pop-in", played once when the number scrolls into view
export default function DigitPop({ value }) {
  const [ref, inView] = useInView();
  return (
    <span ref={ref} className={`t-digit-group ${inView ? 'is-animating' : ''}`} aria-label={value}>
      {splitDigits(value).map((d, idx) => (
        <span key={idx} className="t-digit" data-stagger={d.stagger ?? undefined} aria-hidden="true">
          {d.char}
        </span>
      ))}
    </span>
  );
}
