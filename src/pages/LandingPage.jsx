import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-hero">
      {/* Background decoration */}
      <div className="wave-decoration">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 C1680,120 1920,0 2160,60 C2400,120 2640,0 2880,60" fill="none" stroke="rgba(0,240,255,0.3)" strokeWidth="2"/>
          <path d="M0,80 C240,20 480,100 720,40 C960,80 1200,20 1440,80 C1680,20 1920,100 2160,40 C2400,80 2640,20 2880,80" fill="none" stroke="rgba(255,45,149,0.2)" strokeWidth="2"/>
        </svg>
      </div>

      {/* Hero Content */}
      <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>🎵</div>
      <h1 className="landing-title">SOUNDFORGE</h1>
      <p className="landing-subtitle">
        Collaborative Real-Time Synthesizer & Sequencer.
        Create music together — compose beats, shape sounds, and visualize audio in real-time with anyone, anywhere.
      </p>

      {/* CTAs */}
      <div className="landing-ctas">
        <Link to="/studio" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
          🎹 Start Creating
        </Link>
        <Link to="/library" className="btn-secondary" style={{ padding: '14px 36px', fontSize: '1.05rem' }}>
          📚 Browse Library
        </Link>
      </div>

      {/* Features */}
      <div className="landing-features">
        <div className="feature-card">
          <span className="feature-icon">🎹</span>
          <h3 className="feature-title">Step Sequencer</h3>
          <p className="feature-desc">
            A 16×16 beat matrix with chromatic note mapping across 2 octaves.
            Click cells to compose patterns and hear them play in real-time.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">🔊</span>
          <h3 className="feature-title">Live Synthesis</h3>
          <p className="feature-desc">
            Powered by the Web Audio API with 4 waveforms, ADSR envelopes,
            filters, reverb, delay, distortion, and chorus effects.
          </p>
        </div>

        <div className="feature-card">
          <span className="feature-icon">👥</span>
          <h3 className="feature-title">Multiplayer</h3>
          <p className="feature-desc">
            Create rooms and compose with friends in real-time.
            Every grid toggle, knob twist, and BPM change syncs instantly.
          </p>
        </div>
      </div>

      {/* Tech badges */}
      <div style={{
        display: 'flex', gap: '12px', marginTop: '48px', flexWrap: 'wrap', justifyContent: 'center',
        opacity: 0.5, fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px'
      }}>
        {['REACT', 'TONE.JS', 'SOCKET.IO', 'NODE.JS', 'MONGODB'].map((t) => (
          <span key={t} style={{
            padding: '4px 12px',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
