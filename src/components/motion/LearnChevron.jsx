import React from 'react';

// transitions.dev "Learn more hover" chevron; the parent link needs the `t-learn` class
export default function LearnChevron({ direction = 'right', className = '' }) {
  return (
    <span className={`t-learn-chevron ${className}`} aria-hidden="true">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        style={direction === 'left' ? { transform: 'scaleX(-1)' } : undefined}
      >
        <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
        <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
      </svg>
    </span>
  );
}
