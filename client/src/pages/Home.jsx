import React from 'react';
import { SiteProvider, useSiteData } from '../context/SiteContext';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Countdown from '../components/Countdown';
import CoupleStory from '../components/CoupleStory';
import FloralDivider from '../components/FloralDivider';
import EventDetails from '../components/EventDetails';
import FoodMenu from '../components/FoodMenu';
import YouTubePlayer from '../components/YouTubePlayer';
import Akshintalu from '../components/Akshintalu';
import RSVPForm from '../components/RSVPForm';
import GiftRegistry from '../components/GiftRegistry';
import FamilyDetails from '../components/FamilyDetails';
import Footer from '../components/Footer';

function HomeContent() {
  const { loading } = useSiteData();

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
      <Navigation />
      <Hero />
      <Countdown />
      <CoupleStory />
      <FloralDivider />
      <EventDetails />
      <FloralDivider />
      <FoodMenu />
      <FloralDivider />
      <YouTubePlayer />
      <FloralDivider />
      <Akshintalu />
      <RSVPForm />
      <FloralDivider />
      <GiftRegistry />
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
