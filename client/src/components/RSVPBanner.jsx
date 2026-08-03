import React, { useState } from 'react';

export default function RSVPBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="rsvp-banner">
      <span className="rsvp-banner__icon">🌸</span>
      <p className="rsvp-banner__text">
        Kindly confirm your attendance by <strong>August 10, 2026</strong>
      </p>
      <span className="rsvp-banner__icon">🌸</span>
      <button
        className="rsvp-banner__close"
        onClick={() => setVisible(false)}
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
}
