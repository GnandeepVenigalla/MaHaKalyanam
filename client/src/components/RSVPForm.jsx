import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitRSVP, fetchEvents } from '../utils/api';
import { FiCheck, FiMinus, FiPlus } from 'react-icons/fi';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export default function RSVPForm() {
  const [form, setForm] = useState(initialForm);
  const [events, setEvents] = useState([]);
  const [eventSelections, setEventSelections] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents().then(data => {
      if (data && Array.isArray(data)) {
        setEvents(data);
        const initSelections = {};
        data.forEach(ev => { initSelections[ev._id || ev.id] = 0; });
        setEventSelections(initSelections);
      }
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const adjustEventGuests = (eventId, delta) => {
    setEventSelections(prev => ({
      ...prev,
      [eventId]: Math.max(0, Math.min(10, (prev[eventId] || 0) + delta))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Please enter your name'); return; }
    
    const attendingEvents = events
      .filter(ev => eventSelections[ev._id || ev.id] > 0)
      .map(ev => ({ eventId: ev._id || ev.id, eventName: ev.name, guests: eventSelections[ev._id || ev.id] }));

    try {
      setSubmitting(true);
      setError('');
      await submitRSVP({
        ...form,
        events: attendingEvents
      });
      setSubmitted(true);
    } catch (err) { setError(err.message || 'Failed to submit RSVP.'); } 
    finally { setSubmitting(false); }
  };

  return (
    <section className="rsvp-section" id="rsvp">
      <div className="rsvp-container">
        <motion.div 
          className="rsvp-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="rsvp-label">✦ JOIN THE CELEBRATION ✦</span>
          <h2 className="rsvp-title">We'd Love to See You</h2>
          <p className="rsvp-subtitle">A few details to help us celebrate with you</p>
        </motion.div>

        <div className="rsvp-wrapper">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="rsvp-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="rsvp-success-icon"><FiCheck /></div>
                <h3 className="rsvp-success-title">Thank You!</h3>
                <p className="rsvp-success-text">Your response has been recorded. We can't wait to celebrate with you.</p>
                <button className="btn btn--outline" onClick={() => { 
                  setSubmitted(false); 
                  setForm(initialForm); 
                  const reset = {}; 
                  events.forEach(ev => { reset[ev._id || ev.id] = 0; }); 
                  setEventSelections(reset); 
                }}>
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="rsvp-form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* GUEST DETAILS */}
                <div className="rsvp-section-block">
                  <h4 className="rsvp-section-title">✦ GUEST DETAILS</h4>
                  <div className="rsvp-inputs">
                    <input type="text" name="name" className="rsvp-input-line" placeholder="Your Name *" value={form.name} onChange={handleChange} required />
                    <input type="tel" name="phone" className="rsvp-input-line" placeholder="Phone Number *" value={form.phone} onChange={handleChange} required />
                    <input type="email" name="email" className="rsvp-input-line" placeholder="Email (for confirmation)" value={form.email} onChange={handleChange} />
                  </div>
                </div>

                {/* WHICH EVENTS */}
                <div className="rsvp-section-block">
                  <h4 className="rsvp-section-title">✦ WHICH EVENTS?</h4>
                  <p className="rsvp-hint">Tap + to join an event</p>
                  
                  <div className="rsvp-events-list">
                    {events.map((ev) => {
                      const id = ev._id || ev.id;
                      const count = eventSelections[id] || 0;
                      const isActive = count > 0;

                      return (
                        <div key={id} className={`rsvp-event-card ${isActive ? 'active' : ''}`}>
                          <div className="rsvp-event-info">
                            <h5 className="rsvp-event-name">{ev.name}</h5>
                            <span className="rsvp-event-meta">{ev.date} · {ev.time}</span>
                          </div>
                          <div className="rsvp-event-icon">{ev.icon}</div>
                          
                          <div className="rsvp-event-controls">
                            <button type="button" className="rsvp-ctrl-btn" onClick={() => adjustEventGuests(id, -1)} disabled={count === 0}><FiMinus /></button>
                            <span className="rsvp-ctrl-val">{isActive ? `✓ ${count} GUESTS` : 'NOT ATTENDING'}</span>
                            <button type="button" className="rsvp-ctrl-btn" onClick={() => adjustEventGuests(id, 1)} disabled={count >= 10}><FiPlus /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OPTIONAL MESSAGE */}
                <div className="rsvp-section-block">
                  <input type="text" name="message" className="rsvp-input-line" placeholder="Message for the couple (Optional)" value={form.message} onChange={handleChange} />
                </div>

                {error && <div className="rsvp-error">{error}</div>}

                <div className="rsvp-submit-wrap">
                  <button type="submit" className="btn btn--gold rsvp-submit" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send RSVP'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .rsvp-section {
          padding: 120px 24px;
          background: var(--color-ivory);
        }
        
        .rsvp-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .rsvp-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .rsvp-label {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.25em;
          color: var(--color-gold);
          text-transform: uppercase;
          display: block;
          margin-bottom: 16px;
        }

        .rsvp-title {
          font-family: var(--font-heading);
          font-size: clamp(3rem, 6vw, 4.5rem);
          font-style: italic;
          color: var(--color-burgundy);
          line-height: 1;
          margin-bottom: 16px;
        }

        .rsvp-subtitle {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-style: italic;
          color: var(--text-secondary);
        }

        .rsvp-section-block {
          margin-bottom: 48px;
        }

        .rsvp-section-title {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          color: var(--color-gold-dark);
          text-transform: uppercase;
          margin-bottom: 24px;
        }

        .rsvp-hint {
          font-family: var(--font-heading);
          font-style: italic;
          color: var(--text-tertiary);
          margin-top: -16px;
          margin-bottom: 24px;
        }

        .rsvp-inputs {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .rsvp-input-line {
          width: 100%;
          background: transparent;
          border: none;
          border-bottom: 1px solid #D8CEB3;
          padding: 8px 0;
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-style: italic;
          color: #1A1A1A;
          transition: border-color 0.3s;
        }
        .rsvp-input-line::placeholder { color: rgba(0, 0, 0, 0.35); font-style: italic; }
        .rsvp-input-line:focus { outline: none; border-bottom-color: #B29B69; }

        .rsvp-events-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .rsvp-event-card {
          border: 1px solid var(--color-champagne);
          background: rgba(var(--text-primary-rgb), 0.02);
          padding: 24px;
          position: relative;
          transition: all 0.3s;
        }

        .rsvp-event-card.active {
          background: var(--color-burgundy);
          border-color: var(--color-burgundy);
          color: var(--color-ivory);
        }

        .rsvp-event-info {
          margin-bottom: 32px;
        }

        .rsvp-event-name {
          font-family: var(--font-heading);
          font-size: 1.8rem;
          font-style: italic;
          color: inherit;
          margin-bottom: 8px;
        }
        .rsvp-event-card:not(.active) .rsvp-event-name { color: var(--text-primary); }

        .rsvp-event-meta {
          font-family: var(--font-body);
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          opacity: 0.8;
        }

        .rsvp-event-icon {
          position: absolute;
          top: 24px;
          right: 24px;
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .rsvp-event-controls {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(0,0,0,0.1);
          padding-top: 24px;
        }
        .rsvp-event-card.active .rsvp-event-controls { border-top-color: rgba(255,255,255,0.15); }

        .rsvp-ctrl-btn {
          width: 44px; height: 44px;
          border: 1px solid #E6DDC4;
          background: #FFFFFF;
          color: #1A1A1A;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.2rem;
        }
        .rsvp-event-card.active .rsvp-ctrl-btn { border-color: rgba(255,255,255,0.3); background: transparent; color: var(--color-ivory); }
        .rsvp-ctrl-btn:hover:not(:disabled) { border-color: var(--color-gold); color: var(--color-gold); }
        .rsvp-ctrl-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .rsvp-ctrl-val {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }
        .rsvp-event-card.active .rsvp-ctrl-val { color: var(--color-ivory); }

        .rsvp-submit-wrap { text-align: center; margin-top: 60px; display: flex; justify-content: center; }
        .rsvp-submit { 
          width: 100%; 
          max-width: 380px; 
          background: #1A1A1A; 
          color: #FFFFFF; 
          border-radius: 50px; 
          padding: 20px; 
          border: none;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .rsvp-submit:hover:not(:disabled) { background: #000000; transform: translateY(-2px); }
        .rsvp-error { color: #ef4444; font-size: 0.9rem; text-align: center; margin-top: 24px; }

        .rsvp-success { text-align: center; padding: 60px 40px; }
        .rsvp-success-icon {
          width: 64px; height: 64px; margin: 0 auto 24px;
          border-radius: 50%; background: var(--color-gold); color: var(--color-burgundy-deep);
          display: flex; align-items: center; justify-content: center; font-size: 2rem;
        }
        .rsvp-success-title { font-size: 2.5rem; color: var(--color-burgundy); margin-bottom: 12px; font-family: var(--font-heading); font-style: italic; }
        .rsvp-success-text { font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 32px; font-family: var(--font-heading); font-style: italic; }

        @media (max-width: 768px) {
          .rsvp-section { padding: 80px 24px; }
          .rsvp-title { font-size: 2.8rem; }
          .rsvp-event-card { padding: 20px; }
          .rsvp-event-name { font-size: 1.5rem; }
          .rsvp-event-controls { padding-top: 20px; }
        }
      `}</style>
    </section>
  );
}
