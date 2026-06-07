import React from 'react';
import { motion } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { FiMapPin, FiCalendar } from 'react-icons/fi';

const defaultEvents = [
  {
    id: 1,
    name: 'Engagement',
    subtitle: 'THE SACRED ENGAGEMENT',
    date: 'June 19, 2026',
    time: '11:50 AM',
    venue: 'Mount Pocono, PA',
    address: '133 Montanesca Road, 18344',
    description: 'Join us as we exchange rings and make our first promise to each other, surrounded by the blessings of our elders and the love of our families.',
    guestsAttending: '74 GUESTS ATTENDING',
    icon: '💍',
  }
];

function parseDateForTimeline(dateStr) {
  if (!dateStr) return { bigDay: '19', month: 'JUN', weekday: 'FRIDAY' };
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return { bigDay: dateStr.substring(0, 2), month: 'MTH', weekday: 'DAY' };
    return {
      bigDay: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      weekday: d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
    };
  } catch {
    return { bigDay: '19', month: 'JUN', weekday: 'FRIDAY' };
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

export default function EventDetails() {
  const { events } = useSiteData();
  const displayEvents = events?.length > 0 ? events : defaultEvents;

  return (
    <section className="section" id="events">
      <div className="section__container events-container">
        
        <motion.div 
          className="section__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="events__main-title">Events</h2>
        </motion.div>

        <div className="timeline">
          <div className="timeline__center-line"></div>
          
          {displayEvents.map((ev, i) => {
            const dateParts = parseDateForTimeline(ev.date);
            const isEven = i % 2 === 0;

            return (
              <div key={ev.id || ev._id} className={`timeline__row ${isEven ? 'timeline__row--left' : 'timeline__row--right'}`}>
                
                {/* Event Card Side */}
                <motion.div 
                  className="timeline__card-wrapper"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-50px' }}
                  variants={cardVariants}
                >
                  <div className="timeline__card">
                    <div className="timeline__card-header">
                      {ev.icon && <span className="timeline__card-icon">{ev.icon}</span>}
                      {ev.subtitle && <span className="timeline__card-subtitle">{ev.subtitle}</span>}
                    </div>
                    
                    <h3 className="timeline__card-title">{ev.name}</h3>
                    <div className="timeline__card-divider"></div>
                    
                    {ev.description && (
                      <p className="timeline__card-desc">{ev.description}</p>
                    )}

                    <div className="timeline__card-meta">
                      <span className="timeline__card-datetime">{ev.date} · {ev.time}</span>
                      <span className="timeline__card-venue">{ev.venue}</span>
                      <span className="timeline__card-venue">{ev.address}</span>
                      
                      {ev.guestsAttending && (
                        <div className="timeline__card-guests">
                          <span className="timeline__card-star">✦</span> {ev.guestsAttending}
                        </div>
                      )}
                    </div>

                    <div className="timeline__card-actions">
                      <a href={ev.mapLink || '#'} target="_blank" rel="noopener noreferrer" className="timeline__btn">
                        <FiMapPin /> VIEW MAPS
                      </a>
                      <a href={ev.calendarLink || '#'} target="_blank" rel="noopener noreferrer" className="timeline__btn">
                        <FiCalendar /> ADD TO CALENDAR
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Center Node */}
                <div className="timeline__node-wrapper">
                  <div className="timeline__node">
                    <div className="timeline__node-inner"></div>
                  </div>
                </div>

                {/* Date Side */}
                <motion.div 
                  className="timeline__date-wrapper"
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                >
                  <div className="timeline__date">
                    <span className="timeline__date-big">{dateParts.bigDay}</span>
                    <div className="timeline__date-sub">
                      <span className="timeline__date-line"></span>
                      <span>{dateParts.month} · {dateParts.weekday}</span>
                    </div>
                  </div>
                </motion.div>

              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .events-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .events__main-title {
          font-family: var(--font-cursive);
          font-size: clamp(3.5rem, 8vw, 6rem);
          color: var(--color-gold);
          text-align: center;
          margin-bottom: 80px;
          font-weight: 300;
        }

        .timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 60px;
          padding: 20px 0;
        }

        .timeline__center-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 1px;
          background: rgba(var(--color-primary-rgb), 0.15);
        }

        .timeline__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          position: relative;
        }

        .timeline__row--left {
          flex-direction: row;
        }

        .timeline__row--right {
          flex-direction: row-reverse;
        }

        .timeline__card-wrapper {
          width: calc(50% - 40px);
          display: flex;
        }
        
        .timeline__row--left .timeline__card-wrapper { justify-content: flex-end; }
        .timeline__row--right .timeline__card-wrapper { justify-content: flex-start; }

        .timeline__card {
          background: var(--color-burgundy);
          color: var(--color-ivory);
          padding: 40px 32px;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow-lg);
          border-left: 4px solid var(--color-gold);
        }

        .timeline__card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .timeline__card-icon {
          font-size: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        .timeline__card-subtitle {
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--color-gold-light);
        }

        .timeline__card-title {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-style: italic;
          color: var(--color-gold);
          margin-bottom: 16px;
          line-height: 1.1;
        }

        .timeline__card-divider {
          width: 30px;
          height: 1px;
          background: rgba(255,255,255,0.2);
          margin-bottom: 24px;
        }

        .timeline__card-desc {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-style: italic;
          color: rgba(255,255,255,0.85);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .timeline__card-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 32px;
        }

        .timeline__card-datetime,
        .timeline__card-venue {
          font-family: var(--font-body);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--color-gold-light);
        }

        .timeline__card-guests {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: var(--color-gold);
        }
        .timeline__card-star { font-size: 0.8rem; }

        .timeline__card-actions {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }

        .timeline__btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: var(--color-ivory);
          text-transform: uppercase;
          transition: color 0.3s;
        }
        .timeline__btn:hover { color: var(--color-gold); }

        .timeline__node-wrapper {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }

        .timeline__node {
          width: 20px;
          height: 20px;
          background: var(--color-ivory);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .timeline__node-inner {
          width: 12px;
          height: 12px;
          background: var(--color-burgundy);
          transform: rotate(45deg);
        }

        .timeline__date-wrapper {
          width: calc(50% - 60px);
          display: flex;
        }
        
        .timeline__row--left .timeline__date-wrapper { justify-content: flex-start; text-align: left; }
        .timeline__row--right .timeline__date-wrapper { justify-content: flex-end; text-align: right; }

        .timeline__date {
          display: flex;
          flex-direction: column;
        }
        .timeline__row--right .timeline__date { align-items: flex-end; }

        .timeline__date-big {
          font-family: var(--font-heading);
          font-size: clamp(5rem, 10vw, 8rem);
          font-style: italic;
          color: var(--color-gold);
          line-height: 0.9;
        }

        .timeline__date-sub {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: -10px;
        }
        
        .timeline__row--right .timeline__date-sub { flex-direction: row-reverse; }

        .timeline__date-line {
          width: 30px;
          height: 1px;
          background: var(--color-gold);
        }

        .timeline__date-sub span:not(.timeline__date-line) {
          font-family: var(--font-body);
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          color: var(--color-gold-dark);
        }

        @media (max-width: 768px) {
          .timeline__center-line,
          .timeline__node-wrapper {
            display: none;
          }

          .timeline {
            gap: 40px;
          }

          .timeline__row {
            flex-direction: column-reverse !important;
            align-items: center;
            gap: 20px;
          }

          .timeline__card-wrapper,
          .timeline__date-wrapper {
            width: 100%;
            justify-content: center !important;
            text-align: center !important;
          }

          .timeline__date { align-items: center !important; }
          .timeline__date-sub { flex-direction: row !important; }
          
          .timeline__card {
            border-left: none;
            border-top: 4px solid var(--color-gold);
            text-align: center;
            align-items: center;
            display: flex;
            flex-direction: column;
          }

          .timeline__card-actions { justify-content: center; }
        }
      `}</style>
    </section>
  );
}
