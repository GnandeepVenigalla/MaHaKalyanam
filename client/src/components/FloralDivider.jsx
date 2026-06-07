import React from 'react';

export default function FloralDivider() {
  return (
    <div style={{ textAlign: 'center', padding: '12px 0', overflow: 'hidden' }}>
      <svg width="200" height="20" viewBox="0 0 200 20" fill="none" style={{ margin: '0 auto', display: 'block', opacity: 0.35 }}>
        <line x1="0" y1="10" x2="80" y2="10" stroke="var(--cream-dark, #E0D5C7)" strokeWidth="1" />
        <circle cx="90" cy="10" r="2" fill="var(--copper, #B87D4B)" />
        <circle cx="100" cy="10" r="3" fill="var(--copper, #B87D4B)" />
        <circle cx="110" cy="10" r="2" fill="var(--copper, #B87D4B)" />
        <line x1="120" y1="10" x2="200" y2="10" stroke="var(--cream-dark, #E0D5C7)" strokeWidth="1" />
      </svg>
    </div>
  );
}
