import React from 'react';
import useInView from '../../hooks/useInView';
import { splitDigits } from '../../lib/digits';

// transitions.dev "Number pop-in", played once when the number scrolls into view.
// Screen readers get the whole value as real text; the animated digits are hidden from them.
export default function DigitPop({ value }) {
  const [ref, inView] = useInView();
  return (
    <span ref={ref}>
      <span className="sr-only">{value}</span>
      <span className={`t-digit-group ${inView ? 'is-animating' : ''}`} aria-hidden="true">
        {splitDigits(value).map((d, idx) => (
          <span key={idx} className="t-digit" data-stagger={d.stagger ?? undefined}>
            {d.char}
          </span>
        ))}
      </span>
    </span>
  );
}
