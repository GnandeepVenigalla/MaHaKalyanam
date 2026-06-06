import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSiteData } from '../context/SiteContext';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function YouTubePlayer() {
  const { media } = useSiteData();
  const [currentIndex, setCurrentIndex] = useState(0);

  const videos = (media || []).filter(m => {
    const id = getYouTubeId(m.url);
    return id !== null;
  });

  if (videos.length === 0) return null;

  const currentVideo = videos[currentIndex];
  const videoId = getYouTubeId(currentVideo?.url);

  const goNext = () => setCurrentIndex(i => (i + 1) % videos.length);
  const goPrev = () => setCurrentIndex(i => (i - 1 + videos.length) % videos.length);

  return (
    <section className="youtube section" id="story-video">
      <div className="section__container">
        <div className="section__header">
          <h2 className="section__title">Watch Our Journey</h2>
          <p className="section__subtitle">Moments captured in time</p>
          <div className="section__ornament">
            <span className="section__ornament-dot" />
          </div>
        </div>

        <div className="youtube__wrapper">
          <div className="youtube__frame gold-border">
            <div className="youtube__aspect">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                title={currentVideo?.title || 'Wedding Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="youtube__iframe"
              />
            </div>
          </div>

          {currentVideo?.title && (
            <p className="youtube__title">{currentVideo.title}</p>
          )}

          {videos.length > 1 && (
            <div className="youtube__nav">
              <button className="youtube__nav-btn" onClick={goPrev}>
                <FiChevronLeft />
              </button>
              <span className="youtube__nav-count">
                {currentIndex + 1} / {videos.length}
              </span>
              <button className="youtube__nav-btn" onClick={goNext}>
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .youtube {
          background: var(--gradient-section);
        }

        .youtube__wrapper {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .youtube__frame {
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-xl), var(--shadow-gold);
        }

        .youtube__aspect {
          position: relative;
          width: 100%;
          padding-top: 56.25%;
        }

        .youtube__iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .youtube__title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-top: var(--space-lg);
          font-style: italic;
        }

        .youtube__nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-lg);
          margin-top: var(--space-xl);
        }

        .youtube__nav-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(212, 168, 83, 0.1);
          border: 1px solid rgba(212, 168, 83, 0.3);
          color: var(--color-gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all var(--transition-base);
        }

        .youtube__nav-btn:hover {
          background: rgba(212, 168, 83, 0.2);
          border-color: var(--color-gold);
        }

        .youtube__nav-count {
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-tertiary);
          letter-spacing: 0.1em;
        }
      `}</style>
    </section>
  );
}
