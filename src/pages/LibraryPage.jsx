import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mini grid preview component
const GridPreview = ({ grid }) => {
  if (!grid || !grid.length) return null;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(16, 1fr)',
      gap: '1px',
      width: '100%',
      aspectRatio: '1',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(10,10,26,0.6)',
      padding: '4px',
    }}>
      {grid.flat().map((active, i) => (
        <div key={i} style={{
          borderRadius: '1px',
          background: active
            ? `hsl(${320 - (Math.floor(i / 16) * 12)}, 100%, 60%)`
            : 'rgba(255,255,255,0.03)',
          transition: 'background 0.2s',
        }} />
      ))}
    </div>
  );
};

// Animated equalizer bars
const EqBars = ({ count = 5, color = '#b44dff' }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{
        width: '4px',
        borderRadius: '2px',
        background: color,
        animation: `eq-bar ${0.5 + Math.random() * 0.5}s ease-in-out infinite alternate`,
        animationDelay: `${i * 0.1}s`,
        height: '100%',
      }} />
    ))}
  </div>
);

import { PRESET_PATTERNS } from '../data/presets';

const CARD_COLORS = [
  { border: '#ff2d95', bg: 'rgba(255,45,149,0.06)', shadow: 'rgba(255,45,149,0.15)' },
  { border: '#00f0ff', bg: 'rgba(0,240,255,0.06)', shadow: 'rgba(0,240,255,0.15)' },
  { border: '#b44dff', bg: 'rgba(180,77,255,0.06)', shadow: 'rgba(180,77,255,0.15)' },
  { border: '#39ff14', bg: 'rgba(57,255,20,0.06)', shadow: 'rgba(57,255,20,0.15)' },
  { border: '#ff6b2b', bg: 'rgba(255,107,43,0.06)', shadow: 'rgba(255,107,43,0.15)' },
];

export default function LibraryPage() {
  const [patterns, setPatterns] = useState([]);
  const [localPatterns, setLocalPatterns] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Load local patterns from localStorage
    try {
      const local = JSON.parse(localStorage.getItem('soundforge_local_patterns') || '[]');
      setLocalPatterns(local);
    } catch (err) {
      console.error('Failed to load local patterns:', err);
    }

    const fetchPatterns = async () => {
      try {
        const res = await fetch(`${API_URL}/api/patterns`);
        if (res.ok) {
          const data = await res.json();
          setPatterns(data);
        }
      } catch (err) {
        console.error('Failed to fetch patterns:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatterns();
  }, []);

  const handleDelete = async (e, pattern) => {
    e.stopPropagation(); // Prevent navigating to studio
    const confirmDelete = window.confirm(`Are you sure you want to delete "${pattern.title}"?`);
    if (!confirmDelete) return;

    if (pattern.isLocal) {
      try {
        const local = JSON.parse(localStorage.getItem('soundforge_local_patterns') || '[]');
        const updated = local.filter((p) => p._id !== pattern._id);
        localStorage.setItem('soundforge_local_patterns', JSON.stringify(updated));
        setLocalPatterns(updated);
      } catch (err) {
        console.error('Failed to delete local pattern:', err);
      }
    } else {
      try {
        const res = await fetch(`${API_URL}/api/patterns/${pattern._id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setPatterns(patterns.filter((p) => p._id !== pattern._id));
        } else {
          const data = await res.json();
          alert(data.error || 'Failed to delete pattern from cloud.');
        }
      } catch (err) {
        console.error('Failed to delete cloud pattern:', err);
        alert('Failed to connect to backend server for deletion.');
      }
    }
  };

  const allPatterns = [...PRESET_PATTERNS, ...localPatterns, ...patterns];
  const filtered = allPatterns.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.author.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="header">
        <Link to="/" className="header-logo" style={{ textDecoration: 'none' }}>SOUNDFORGE</Link>

        <div className="header-center">
          <EqBars count={4} color="var(--neon-purple)" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Sound Library</span>
        </div>

        <Link to="/studio" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.78rem' }}>🎹 Open Studio</Link>
      </header>

      {/* Hero Banner */}
      <div style={{
        position: 'relative',
        padding: '60px 24px 48px',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(180,77,255,0.12) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', gap: '8px', alignItems: 'center',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '2.5rem' }}>🎶</span>
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.6rem, 4vw, 2.5rem)',
            background: 'linear-gradient(135deg, var(--neon-pink) 0%, var(--neon-purple) 50%, var(--neon-cyan) 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 4s ease infinite',
            marginBottom: '12px',
          }}>Sound Library</h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem', fontWeight: 300,
            maxWidth: '500px', margin: '0 auto 32px',
            lineHeight: 1.6,
          }}>
            Explore patterns, load presets, and find inspiration. Every beat tells a story — discover yours.
          </p>

          {/* Search */}
          <div style={{
            position: 'relative',
            maxWidth: '480px', margin: '0 auto',
          }}>
            <span style={{
              position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '1rem', opacity: 0.4, pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search patterns, artists, styles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '16px 20px 16px 50px',
                background: 'rgba(26,26,62,0.7)',
                border: '1.5px solid rgba(180,77,255,0.2)',
                borderRadius: '14px',
                color: 'var(--text-primary)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(12px)',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--neon-cyan)';
                e.target.style.boxShadow = '0 0 24px rgba(0,240,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(180,77,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '32px',
            marginTop: '24px',
          }}>
            {[
              { n: allPatterns.length, label: 'Patterns' },
              { n: PRESET_PATTERNS.length, label: 'Presets' },
              { n: patterns.length, label: 'Community' },
            ].map(({ n, label }) => (
              <div key={label}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 900, fontSize: '1.4rem',
                  color: 'var(--neon-cyan)',
                  textShadow: '0 0 10px rgba(0,240,255,0.3)',
                }}>{n}</div>
                <div style={{
                  fontSize: '0.68rem', color: 'var(--text-muted)',
                  letterSpacing: '1px', textTransform: 'uppercase',
                }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 24px 60px',
      }}>
        {loading ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
          }}>
            <div style={{
              width: '60px', height: '60px', margin: '0 auto 20px',
              border: '3px solid rgba(180,77,255,0.2)',
              borderTop: '3px solid var(--neon-purple)',
              borderRadius: '50%',
              animation: 'spin-slow 1s linear infinite',
            }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading sounds...</p>
          </div>
        ) : (
          <>
            {/* Section title */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '24px',
            }}>
              <div style={{
                width: '4px', height: '24px',
                background: 'linear-gradient(180deg, var(--neon-pink), var(--neon-purple))',
                borderRadius: '2px',
              }} />
              <h2 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700, fontSize: '0.9rem',
                letterSpacing: '3px', color: 'var(--text-primary)',
              }}>
                {search ? 'SEARCH RESULTS' : 'ALL PATTERNS'}
              </h2>
              <span style={{
                padding: '3px 10px',
                background: 'rgba(180,77,255,0.15)',
                borderRadius: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem', color: 'var(--neon-purple)',
              }}>{filtered.length}</span>
            </div>

            {/* Pattern Grid */}
            {filtered.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                background: 'rgba(18,18,42,0.5)',
                borderRadius: '20px',
                border: '1px dashed rgba(180,77,255,0.15)',
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🔇</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '8px' }}>
                  No matching patterns
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                  Try a different search or create something new
                </p>
                <Link to="/studio" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-purple))',
                  border: 'none', borderRadius: '10px',
                  color: '#fff', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.9rem',
                  boxShadow: '0 0 16px rgba(255,45,149,0.3)',
                }}>🎹 Create in Studio</Link>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}>
                {filtered.map((pattern, i) => {
                  const c = CARD_COLORS[i % CARD_COLORS.length];
                  return (
                    <div key={pattern._id} style={{
                      padding: '20px',
                      background: c.bg,
                      border: `1px solid ${c.border}25`,
                      borderRadius: '16px',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      animation: `slide-in 0.4s ease backwards`,
                      animationDelay: `${i * 0.06}s`,
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.borderColor = c.border + '60';
                      e.currentTarget.style.boxShadow = `0 12px 40px ${c.shadow}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = c.border + '25';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => navigate('/studio', { state: { pattern } })}>

                      {/* Grid Preview */}
                      {pattern.grid && (
                        <div style={{ marginBottom: '16px' }}>
                          <GridPreview grid={pattern.grid} />
                        </div>
                      )}

                      {/* Delete Button (Only for custom user patterns, not system presets) */}
                      {!pattern.isPreset && (
                        <button
                          title="Delete pattern"
                          onClick={(e) => handleDelete(e, pattern)}
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255, 71, 87, 0.25)',
                            background: 'rgba(255, 71, 87, 0.06)',
                            color: 'var(--neon-red)',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            zIndex: 10,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 71, 87, 0.2)';
                            e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 71, 87, 0.4)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 71, 87, 0.06)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          🗑️
                        </button>
                      )}

                      {/* Info */}
                      <div style={{
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                      }}>
                        <div>
                          <h3 style={{
                            fontFamily: "'Orbitron', sans-serif",
                            fontWeight: 700, fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            marginBottom: '6px', letterSpacing: '0.5px',
                          }}>{pattern.title}</h3>

                          <div style={{
                            display: 'flex', gap: '12px',
                            fontSize: '0.72rem', color: 'var(--text-muted)',
                          }}>
                            <span>👤 {pattern.author}</span>
                            <span style={{ color: c.border }}>♩ {pattern.bpm} BPM</span>
                          </div>
                        </div>

                        {/* Badge */}
                        <div style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px',
                        }}>
                          {pattern.isPreset && (
                            <span style={{
                              padding: '3px 8px',
                              background: 'rgba(255,45,149,0.15)',
                              border: '1px solid rgba(255,45,149,0.3)',
                              borderRadius: '6px',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              color: 'var(--neon-pink)',
                              letterSpacing: '1px',
                            }}>PRESET</span>
                          )}
                          {pattern.isLocal && (
                            <span style={{
                              padding: '3px 8px',
                              background: 'rgba(57,255,20,0.15)',
                              border: '1px solid rgba(57,255,20,0.3)',
                              borderRadius: '6px',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              color: 'var(--neon-green)',
                              letterSpacing: '1px',
                            }}>LOCAL</span>
                          )}
                          <span style={{
                            padding: '3px 8px',
                            background: 'rgba(0,240,255,0.08)',
                            borderRadius: '6px',
                            fontSize: '0.6rem',
                            color: 'var(--neon-cyan)',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>🎛 {pattern.waveform}</span>
                        </div>
                      </div>

                      {/* Load bar */}
                      <div style={{
                        marginTop: '14px',
                        padding: '8px 0',
                        borderTop: `1px solid ${c.border}15`,
                        textAlign: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: c.border,
                        letterSpacing: '1px',
                        transition: 'all 0.2s',
                      }}>
                        ▶ LOAD IN STUDIO
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom CTA */}
            <div style={{
              marginTop: '48px', textAlign: 'center',
              padding: '40px',
              background: 'linear-gradient(135deg, rgba(255,45,149,0.05), rgba(180,77,255,0.05), rgba(0,240,255,0.05))',
              borderRadius: '20px',
              border: '1px solid rgba(180,77,255,0.1)',
            }}>
              <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: '12px' }}>🎵</span>
              <h3 style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700, fontSize: '1rem',
                color: 'var(--text-primary)',
                marginBottom: '8px', letterSpacing: '2px',
              }}>Ready to make something new?</h3>
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.85rem',
                marginBottom: '20px',
              }}>Jump into the studio and craft your next masterpiece</p>
              <Link to="/studio" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px',
                background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-purple))',
                border: 'none', borderRadius: '12px',
                color: '#fff', textDecoration: 'none',
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px',
                boxShadow: '0 0 20px rgba(255,45,149,0.3)',
                transition: 'all 0.3s',
              }}>🚀 LAUNCH STUDIO</Link>
            </div>
          </>
        )}
      </div>

      {/* EQ bar animation */}
      <style>{`
        @keyframes eq-bar {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
}
