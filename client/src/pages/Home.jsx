import React, { useState } from 'react';
import { SiteProvider, useSiteData } from '../context/SiteContext';
import EnvelopeIntro from '../components/EnvelopeIntro';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import FloralDivider from '../components/FloralDivider';
import EventDetails from '../components/EventDetails';
import FoodMenu from '../components/FoodMenu';
import YouTubePlayer from '../components/YouTubePlayer';
import RSVPForm from '../components/RSVPForm';
import FamilyDetails from '../components/FamilyDetails';
import Footer from '../components/Footer';

function HomeContent() {
  const { loading, content } = useSiteData();
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <p className="loading-screen__text">Ranjith & Nithaya</p>
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
      {/* Envelope intro overlay */}
      {!envelopeOpen && (
        <EnvelopeIntro
          onOpen={() => setEnvelopeOpen(true)}
          groomName={content.groom_name}
          brideName={content.bride_name}
        />
      )}

      <Navigation />
      <Hero />
      <EventDetails />
      <FloralDivider />
      <FoodMenu />
      <FloralDivider />
      <YouTubePlayer />
      <FloralDivider />
      <RSVPForm />
      <FamilyDetails />
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
