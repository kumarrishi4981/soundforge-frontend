import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ServerStatusBanner from './components/ServerStatusBanner';

// Pages - lazy load to prevent loading large Tone.js audio engine logic on the landing page
const LandingPage = lazy(() => import('./pages/LandingPage'));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));

export default function App() {
  return (
    <BrowserRouter>
      <ServerStatusBanner />
      <Suspense fallback={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#0a0a1a',
          color: '#00f0ff',
          fontFamily: "'Space Grotesk', sans-serif"
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(0, 240, 255, 0.2)',
            borderTopColor: '#ff2d95',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '16px', fontSize: '14px', letterSpacing: '0.05em', color: '#b44dff' }}>Synthesizing Studio...</p>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/studio" element={<StudioPage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
