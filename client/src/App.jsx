import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Videos from './pages/Videos';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

export default function App() {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = true;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        // autoplay may be blocked until user interaction
      }
    };

    const handleInteraction = async () => {
      if (!audio) return;
      audio.muted = false;
      try {
        await audio.play();
      } catch (error) {
        // still may be blocked by some browsers, but unmute state is now set
      }
      setIsMuted(false);
    };

    playAudio();
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <BrowserRouter>
      <audio
        ref={audioRef}
        src="/My Audio.mp3"
        autoPlay
        loop
        muted={isMuted}
        preload="auto"
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
