import React, { useState } from 'react';
import { SiteProvider, useSiteData } from '../context/SiteContext';
import EnvelopeIntro from '../components/EnvelopeIntro';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import FloralDivider from '../components/FloralDivider';
import EventDetails from '../components/EventDetails';
import YouTubePlayer from '../components/YouTubePlayer';
import RSVPForm from '../components/RSVPForm';
import FamilyDetails from '../components/FamilyDetails';
import GiftRegistry from '../components/GiftRegistry';
import Footer from '../components/Footer';

function HomeContent() {
  const { loading, content } = useSiteData();
  const [introOpen, setIntroOpen] = useState(false);

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
    <>
      {!introOpen && (
        <EnvelopeIntro
          onOpen={() => setIntroOpen(true)}
          groomName={content.groom_name}
          brideName={content.bride_name}
        />
      )}

      <Navigation />
      <Hero />
      <FamilyDetails />
      <EventDetails />
      <FloralDivider />
      <YouTubePlayer />
      <FloralDivider />
      <GiftRegistry />
      <FloralDivider />
      <RSVPForm />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <SiteProvider>
      <HomeContent />
    </SiteProvider>
  );
}
