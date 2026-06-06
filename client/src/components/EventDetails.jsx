import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { GiPartyPopper, GiIndianPalace, GiFlowers } from 'react-icons/gi';

const eventIcons = {
  'Mehendi': GiFlowers,
  'Haldi': GiFlowers,
  'Sangeet': GiPartyPopper,
  'Wedding': GiIndianPalace,
  'Reception': GiPartyPopper,
};

function EventCard({ event, index, isLeft }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const IconComponent = eventIcons[event.name] || GiIndianPalace;

  return (
    <motion.div
      ref={ref}
      className={`event-card ${isLeft ? 'event-card--left' : 'event-card--right'}`}
      initial={{ opacity: 0, x: isLeft ? -60 : 60 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      <div className="event-card__content glass-card">
        <div className="event-card__icon-wrapper">
          <IconComponent className="event-card__icon" />
        </div>
        <h3 className="event-card__name">{event.name}</h3>
        {event.date && (
          <div className="event-card__detail">
            <FiCalendar />
            <span>{event.date}</span>
          </div>
        )}
        {event.time && (
          <div className="event-card__detail">
            <FiClock />
            <span>{event.time}</span>
          </div>
        )}
        {event.venue && (
          <div className="event-card__detail">
            <FiMapPin />
            <span>{event.venue}</span>
          </div>
        )}
        {event.description && (
          <p className="event-card__desc">{event.description}</p>
        )}
      </div>

      {/* Timeline dot */}
      <motion.div
        className="event-card__dot"
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </motion.div>
  );
}

// Default events if none from API
const defaultEvents = [
  { id: 1, name: 'Mehendi', date: 'June 22, 2026', time: '4:00 PM', venue: 'Bride\'s Residence', description: 'Traditional mehendi ceremony with music and dance' },
  { id: 2, name: 'Haldi', date: 'June 23, 2026', time: '10:00 AM', venue: 'Family Home', description: 'Turmeric ceremony for the bride and groom' },
  { id: 3, name: 'Sangeet', date: 'June 23, 2026', time: '7:00 PM', venue: 'Grand Ballroom', description: 'A night of music, dance, and celebration' },
  { id: 4, name: 'Wedding', date: 'June 24, 2026', time: '9:00 AM', venue: 'Temple Hall', description: 'Traditional South Indian wedding ceremony' },
  { id: 5, name: 'Reception', date: 'June 24, 2026', time: '7:00 PM', venue: 'Grand Ballroom', description: 'Reception dinner and celebration' },
];

export default function EventDetails() {
  const { events } = useSiteData();
  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <section className="events section" id="events">
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Wedding Celebrations</h2>
          <p className="section__subtitle">Join us for each beautiful moment</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="events__timeline">
          <div className="events__line" />
          {displayEvents.map((event, index) => (
            <EventCard
              key={event.id || index}
              event={event}
              index={index}
              isLeft={index % 2 === 0}
            />
          ))}
        </div>
      </div>

      <style>{`
        .events {
          background: var(--gradient-section);
        }

        .events__timeline {
          position: relative;
          max-width: 900px;
          margin: 0 auto;
        }

        .events__line {
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            var(--color-gold) 10%,
            var(--color-gold) 90%,
            transparent 100%
          );
          opacity: 0.3;
          transform: translateX(-50%);
        }

        .event-card {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: var(--space-3xl);
          width: 50%;
        }

        .event-card--left {
          padding-right: var(--space-3xl);
          justify-content: flex-end;
        }

        .event-card--right {
          margin-left: 50%;
          padding-left: var(--space-3xl);
          justify-content: flex-start;
        }

        .event-card__content {
          padding: var(--space-xl);
          max-width: 380px;
          width: 100%;
        }

        .event-card__icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(212, 168, 83, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--space-md);
          border: 1px solid rgba(212, 168, 83, 0.2);
        }

        .event-card__icon {
          font-size: 1.3rem;
          color: var(--color-gold);
        }

        .event-card__name {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--space-md);
        }

        .event-card__detail {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: var(--space-xs);
        }

        .event-card__detail svg {
          color: var(--color-gold);
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .event-card__desc {
          font-size: 0.9rem;
          color: var(--text-tertiary);
          margin-top: var(--space-md);
          line-height: 1.6;
        }

        .event-card__dot {
          position: absolute;
          width: 14px;
          height: 14px;
          background: var(--color-gold);
          border-radius: 50%;
          border: 3px solid var(--color-burgundy-deep);
          box-shadow: 0 0 10px rgba(212, 168, 83, 0.4);
        }

        .event-card--left .event-card__dot {
          right: -7px;
        }

        .event-card--right .event-card__dot {
          left: -7px;
        }

        /* Mobile: single column */
        @media (max-width: 768px) {
          .events__line {
            left: 20px;
          }

          .event-card,
          .event-card--left,
          .event-card--right {
            width: 100%;
            margin-left: 0;
            padding-left: 50px;
            padding-right: 0;
            justify-content: flex-start;
          }

          .event-card--left .event-card__dot,
          .event-card--right .event-card__dot {
            left: 13px;
            right: auto;
          }

          .event-card__content {
            max-width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
