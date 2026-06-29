import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function YouTubePlayer() {
  const { youtube } = useSiteData();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const defaultVideos = [
    { id: 1, title: 'Rajith and Nithya - Pre Wedding shoot', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ];

  const videos = youtube?.length > 0 ? youtube : defaultVideos;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const currentVideo = videos[currentIndex];

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <section className="yt section" id="videos" ref={ref}>
      <div className="section__container">
        <motion.div
          className="section__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <span className="section__label">Our Story</span>
          <h2 className="section__title">Watch Our Journey</h2>
          <p className="section__subtitle">Moments we've shared together</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </motion.div>

        <motion.div
          className="yt__player"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <div className="yt__frame">
            <iframe
              src={getEmbedUrl(currentVideo?.url)}
              title={currentVideo?.title || 'Wedding Video'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {currentVideo?.title && (
            <p className="yt__title">{currentVideo.title}</p>
          )}
        </motion.div>

        {videos.length > 1 && (
          <div className="yt__nav">
            <button
              className="yt__nav-btn"
              onClick={() => setCurrentIndex(i => (i - 1 + videos.length) % videos.length)}
              aria-label="Previous video"
            >
              <FiChevronLeft />
            </button>
            <span className="yt__nav-count">{currentIndex + 1} / {videos.length}</span>
            <button
              className="yt__nav-btn"
              onClick={() => setCurrentIndex(i => (i + 1) % videos.length)}
              aria-label="Next video"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      <style>{`
        .yt {
          background: var(--cream, #F6F1EB);
        }
        .yt__player {
          max-width: 800px;
          margin: 0 auto;
        }
        .yt__frame {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%;
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          background: var(--charcoal, #2C2C2C);
          box-shadow: var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.08));
        }
        .yt__frame iframe {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          border: none;
        }
        .yt__title {
          text-align: center;
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--charcoal-soft, #4A4A4A);
          margin-top: 16px;
          opacity: 0.6;
        }
        .yt__nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 24px;
        }
        .yt__nav-btn {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--white, #FDFAF6);
          border: 1px solid var(--cream-dark, #E0D5C7);
          display: flex; align-items: center; justify-content: center;
          color: var(--charcoal, #2C2C2C);
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .yt__nav-btn:hover {
          border-color: var(--copper, #B87D4B);
          box-shadow: var(--shadow-sm);
        }
        .yt__nav-count {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--charcoal-soft, #4A4A4A);
          opacity: 0.5;
          letter-spacing: 0.1em;
        }
      `}</style>
    </section>
  );
}
