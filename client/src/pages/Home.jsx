import React, { useState } from 'react';
import { SiteProvider, useSiteData } from '../context/SiteContext';
import { LanguageProvider } from '../context/LanguageContext';
import EnvelopeIntro from '../components/EnvelopeIntro';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import FloralDivider from '../components/FloralDivider';
import EventDetails from '../components/EventDetails';
import RSVPForm from '../components/RSVPForm';
import FamilyDetails from '../components/FamilyDetails';
import Footer from '../components/Footer';

function HomeContent() {
  const { loading, content } = useSiteData();
  // 'hidden'  → intro showing, main content invisible
  // 'visible' → intro fully exited, main content fades + Hero animates
  const [mainState, setMainState] = useState('hidden');

  const handleIntroOpen = () => {
    // Wait for the intro's 600ms exit fade to finish, then reveal
    setTimeout(() => setMainState('visible'), 650);
  };

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

  const isVisible = mainState === 'visible';

  return (
    <>
      {!isVisible && (
        <EnvelopeIntro
          onOpen={handleIntroOpen}
          groomName={content.groom_name}
          brideName={content.bride_name}
        />
      )}

      {/* Main page — invisible until intro fully exits, then fades in */}
      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: isVisible ? 'auto' : 'none',
        }}
      >
        <Navigation />
        {/* key forces Hero to fully remount (fresh animations) once visible */}
        <Hero key={isVisible ? 'shown' : 'hidden'} shouldAnimate={isVisible} />
        <FamilyDetails />
        <EventDetails />
        <FloralDivider />
        <RSVPForm />
        <Footer />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <SiteProvider>
        <HomeContent />
      </SiteProvider>
    </LanguageProvider>
  );
}
