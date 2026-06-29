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
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        setIsPlaying(false);
      }
    };

    playAudio();
  }, []);

  return (
    <BrowserRouter>
      <audio
        ref={audioRef}
        src="/My Audio.mp3"
        loop
        muted={false}
        preload="auto"
      />
      {!isPlaying && (
        <button
          type="button"
          className="btn btn--gold"
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }}
          style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 999, padding: '12px 18px' }}
        >
          Play Music
        </button>
      )}
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
