import React from 'react';
import Navigation from '../components/Navigation';
import YouTubePlayer from '../components/YouTubePlayer';
import Footer from '../components/Footer';
import { useSiteData } from '../context/SiteContext';

export default function Videos() {
  const { loading } = useSiteData();

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-screen__text">Ranjith & Nithya</p>
        <div className="loading-screen__dots">
          <span className="loading-screen__dot" />
          <span className="loading-screen__dot" />
          <span className="loading-screen__dot" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navigation />
      <div style={{ flex: 1, paddingTop: '100px', background: 'var(--cream, #F6F1EB)' }}>
        <YouTubePlayer />
      </div>
      <Footer />
    </div>
  );
}
