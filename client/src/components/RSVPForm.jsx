import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { submitRSVP } from '../utils/api';
import { FiMinus, FiPlus, FiCheck, FiSend } from 'react-icons/fi';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  guests: 1,
  attending: 'yes',
  dietary: '',
  message: '',
};

export default function RSVPForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const adjustGuests = (delta) => {
    setForm(prev => ({
      ...prev,
      guests: Math.max(1, Math.min(10, prev.guests + delta)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter your name');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await submitRSVP(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rsvp section" id="rsvp">
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">RSVP</h2>
          <p className="section__subtitle">We'd love to have you there</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="rsvp__wrapper">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                className="rsvp__success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className="rsvp__success-icon"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <FiCheck />
                </motion.div>
                <h3 className="rsvp__success-title">Thank You!</h3>
                <p className="rsvp__success-text">
                  We've received your RSVP. We can't wait to celebrate with you!
                </p>
                <button
                  className="btn btn--outline"
                  onClick={() => { setSubmitted(false); setForm(initialForm); }}
                  style={{ marginTop: 'var(--space-xl)' }}
                >
                  Submit Another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="rsvp__form glass-card"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <div className="rsvp__form-grid">
                  {/* Name */}
                  <div className="input-group">
                    <label htmlFor="rsvp-name">Your Name *</label>
                    <input
                      type="text"
                      id="rsvp-name"
                      name="name"
                      className="input-field"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="input-group">
                    <label htmlFor="rsvp-email">Email</label>
                    <input
                      type="email"
                      id="rsvp-email"
                      name="email"
                      className="input-field"
                      placeholder="your@email.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Phone */}
                  <div className="input-group">
                    <label htmlFor="rsvp-phone">Phone</label>
                    <input
                      type="tel"
                      id="rsvp-phone"
                      name="phone"
                      className="input-field"
                      placeholder="+1 (555) 123-4567"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Guests stepper */}
                  <div className="input-group">
                    <label>Number of Guests</label>
                    <div className="rsvp__stepper">
                      <button
                        type="button"
                        className="rsvp__stepper-btn"
                        onClick={() => adjustGuests(-1)}
                        disabled={form.guests <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="rsvp__stepper-value">{form.guests}</span>
                      <button
                        type="button"
                        className="rsvp__stepper-btn"
                        onClick={() => adjustGuests(1)}
                        disabled={form.guests >= 10}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attending radio cards */}
                <div className="input-group">
                  <label>Will you attend?</label>
                  <div className="rsvp__attending">
                    {[
                      { value: 'yes', label: 'Joyfully Accept', emoji: '🎉' },
                      { value: 'maybe', label: 'Maybe', emoji: '🤔' },
                      { value: 'no', label: 'Regretfully Decline', emoji: '😔' },
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`rsvp__attend-card ${form.attending === option.value ? 'rsvp__attend-card--active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="attending"
                          value={option.value}
                          checked={form.attending === option.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="rsvp__attend-emoji">{option.emoji}</span>
                        <span className="rsvp__attend-label">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dietary */}
                <div className="input-group">
                  <label htmlFor="rsvp-dietary">Dietary Preferences</label>
                  <input
                    type="text"
                    id="rsvp-dietary"
                    name="dietary"
                    className="input-field"
                    placeholder="Vegetarian, allergies, etc."
                    value={form.dietary}
                    onChange={handleChange}
                  />
                </div>

                {/* Message */}
                <div className="input-group">
                  <label htmlFor="rsvp-message">Personal Message</label>
                  <textarea
                    id="rsvp-message"
                    name="message"
                    className="input-field"
                    placeholder="Wishes for the couple..."
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                {/* Error */}
                {error && (
                  <motion.p
                    className="rsvp__error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {error}
                  </motion.p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn--gold btn--lg rsvp__submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <FiSend />
                      Send RSVP
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        .rsvp {
          background: var(--gradient-section);
        }

        .rsvp__wrapper {
          max-width: 600px;
          margin: 0 auto;
        }

        .rsvp__form {
          padding: var(--space-3xl);
        }

        .rsvp__form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 var(--space-xl);
        }

        /* Stepper */
        .rsvp__stepper {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .rsvp__stepper-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(212, 168, 83, 0.1);
          border: 1px solid rgba(212, 168, 83, 0.3);
          color: var(--color-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .rsvp__stepper-btn:hover:not(:disabled) {
          background: rgba(212, 168, 83, 0.2);
          border-color: var(--color-gold);
        }

        .rsvp__stepper-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .rsvp__stepper-value {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--color-gold);
          min-width: 30px;
          text-align: center;
        }

        /* Attending radio cards */
        .rsvp__attending {
          display: flex;
          gap: var(--space-md);
          flex-wrap: wrap;
        }

        .rsvp__attend-card {
          flex: 1;
          min-width: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-lg);
          background: rgba(255, 248, 240, 0.03);
          border: 1px solid rgba(212, 168, 83, 0.15);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: center;
        }

        .rsvp__attend-card:hover {
          border-color: rgba(212, 168, 83, 0.3);
          background: rgba(255, 248, 240, 0.05);
        }

        .rsvp__attend-card--active {
          border-color: var(--color-gold);
          background: rgba(212, 168, 83, 0.1);
          box-shadow: var(--shadow-gold);
        }

        .rsvp__attend-emoji {
          font-size: 1.5rem;
        }

        .rsvp__attend-label {
          font-family: var(--font-heading);
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .rsvp__attend-card--active .rsvp__attend-label {
          color: var(--color-gold);
        }

        /* Error */
        .rsvp__error {
          color: var(--color-error);
          font-size: 0.9rem;
          text-align: center;
          margin-bottom: var(--space-md);
          padding: var(--space-sm) var(--space-md);
          background: rgba(227, 66, 52, 0.1);
          border-radius: var(--radius-md);
          border: 1px solid rgba(227, 66, 52, 0.2);
        }

        /* Submit */
        .rsvp__submit {
          width: 100%;
          margin-top: var(--space-lg);
        }

        /* Success */
        .rsvp__success {
          text-align: center;
          padding: var(--space-4xl) var(--space-xl);
        }

        .rsvp__success-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--gradient-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto var(--space-xl);
          font-size: 2rem;
          color: var(--text-on-gold);
        }

        .rsvp__success-title {
          font-family: var(--font-cursive);
          font-size: 2.5rem;
          color: var(--color-gold);
          margin-bottom: var(--space-md);
        }

        .rsvp__success-text {
          font-size: 1.1rem;
          color: var(--text-secondary);
          max-width: 400px;
          margin: 0 auto;
        }

        @media (max-width: 600px) {
          .rsvp__form {
            padding: var(--space-xl);
          }
          .rsvp__form-grid {
            grid-template-columns: 1fr;
          }
          .rsvp__attending {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  );
}
