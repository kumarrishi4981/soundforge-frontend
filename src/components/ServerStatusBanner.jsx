import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://soundforge-api.onrender.com';

export default function ServerStatusBanner() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'ready' | 'hidden'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer;
    let isMounted = true;
    const startTime = Date.now();

    const checkServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok && isMounted) {
          setStatus('hidden');
          return;
        }
      } catch (err) {
        if (isMounted) {
          setStatus('waking');
          timer = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          }, 1000);
        }
      }

      // Poll until backend finishes booting
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/health`);
          if (res.ok && isMounted) {
            clearInterval(pollInterval);
            clearInterval(timer);
            setStatus('ready');

            setTimeout(() => {
              if (isMounted) setStatus('hidden');
            }, 3500);
          }
        } catch {
          // Still booting
        }
      }, 4000);

      return () => {
        clearInterval(pollInterval);
        clearInterval(timer);
      };
    };

    checkServer();

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (status === 'checking' || status === 'hidden') return null;

  if (status === 'ready') {
    return (
      <div style={{
        background: 'rgba(0, 240, 255, 0.12)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.4)',
        backdropFilter: 'blur(10px)',
        color: '#00f0ff',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '500',
        fontFamily: "'Space Grotesk', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        zIndex: 999
      }}>
        <span>✅</span>
        <span>SoundForge Cloud Engine Online! Library and patterns connected.</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(90deg, #0a0a1a, #160a2c)',
      borderBottom: '1px solid rgba(255, 45, 149, 0.4)',
      color: '#ffffff',
      padding: '10px 18px',
      fontSize: '13px',
      fontFamily: "'Space Grotesk', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      zIndex: 999
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff2d95' }}>
        <span style={{ animation: 'pulse 1.5s infinite' }}>⚡</span>
        <strong>Audio Cloud Engine Booting</strong>
      </div>
      
      <span style={{ color: '#b44dff' }}>
        Render free tier spins down idle backends. Cloud startup takes ~30s (<strong>{elapsedSeconds}s</strong> elapsed).
      </span>

      <div style={{
        width: '120px',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${Math.min((elapsedSeconds / 35) * 100, 95)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #ff2d95, #00f0ff)',
          transition: 'width 1s linear'
        }} />
      </div>
    </div>
  );
}
