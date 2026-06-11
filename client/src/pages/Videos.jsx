import React from 'react';
import Navigation from '../components/Navigation';
import YouTubePlayer from '../components/YouTubePlayer';
import Footer from '../components/Footer';
import { useSiteData, SiteProvider } from '../context/SiteContext';
import { LanguageProvider } from '../context/LanguageContext';
import CoupleStory from '../components/CoupleStory';

function VideosContent() {
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
        <CoupleStory />
        <YouTubePlayer />
      </div>
      <Footer />
    </div>
  );
}

export default function Videos() {
  return (
    <LanguageProvider>
      <SiteProvider>
        <VideosContent />
      </SiteProvider>
    </LanguageProvider>
  );
}
