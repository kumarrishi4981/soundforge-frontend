import { useState, useCallback, useEffect, useRef } from 'react';

const FLOATING_NOTES = ['♩', '♪', '♫', '♬', '🎵', '🎶', '🎹', '🎸', '🥁', '🎷'];

const RoomJoin = ({ onJoinRoom }) => {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState('choose');
  const [error, setError] = useState('');
  const canvasRef = useRef(null);

  // Animated background waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      time += 0.015;

      // Draw multiple sine waves
      const waves = [
        { amp: 30, freq: 0.008, speed: 1, color: 'rgba(255,45,149,0.12)', width: 2 },
        { amp: 20, freq: 0.012, speed: 1.5, color: 'rgba(0,240,255,0.10)', width: 1.5 },
        { amp: 40, freq: 0.006, speed: 0.7, color: 'rgba(180,77,255,0.08)', width: 2.5 },
        { amp: 15, freq: 0.015, speed: 2, color: 'rgba(57,255,20,0.06)', width: 1 },
      ];

      waves.forEach(({ amp, freq, speed, color, width }) => {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        for (let x = 0; x <= w; x += 2) {
          const y = h / 2 + Math.sin(x * freq + time * speed) * amp
            + Math.sin(x * freq * 2.3 + time * speed * 0.8) * amp * 0.3;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const validate = () => {
    if (!username.trim()) { setError('Enter a name to get started'); return false; }
    if (username.trim().length < 2) { setError('Name too short — at least 2 characters'); return false; }
    setError('');
    return true;
  };

  const handleCreate = useCallback(() => {
    if (!validate()) return;
    onJoinRoom({ username: username.trim(), roomCode: '', isCreator: true }, setError);
  }, [username, onJoinRoom]);

  const handleJoin = useCallback(() => {
    if (!validate()) return;
    if (!roomCode.trim()) { setError('Enter the room code from your friend'); return; }
    onJoinRoom({ username: username.trim(), roomCode: roomCode.trim().toUpperCase(), isCreator: false }, setError);
  }, [username, roomCode, onJoinRoom]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (mode === 'create') handleCreate();
      else if (mode === 'join') handleJoin();
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: 'radial-gradient(ellipse at 30% 20%, rgba(180,77,255,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,45,149,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(0,240,255,0.05) 0%, transparent 60%), #0a0a1a',
    }}>
      {/* Animated waveform background */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Floating music notes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {FLOATING_NOTES.map((note, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontSize: `${18 + Math.random() * 24}px`,
            left: `${5 + (i * 9.5)}%`,
            top: `${-10}%`,
            opacity: 0.12 + Math.random() * 0.08,
            animation: `float-note ${8 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.7}s`,
          }}>{note}</span>
        ))}
      </div>

      {/* Main Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '520px',
        padding: '48px 40px',
        background: 'rgba(12, 12, 30, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(180,77,255,0.2)',
        borderRadius: '24px',
        boxShadow: '0 0 60px rgba(180,77,255,0.08), 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        animation: 'slide-in 0.6s ease',
      }}>
        {/* Decorative top bar */}
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--neon-pink), var(--neon-cyan), transparent)',
          borderRadius: '0 0 2px 2px',
        }} />

        {/* Logo Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(255,45,149,0.15), rgba(0,240,255,0.15))',
            border: '1px solid rgba(180,77,255,0.2)',
            marginBottom: '20px',
            fontSize: '32px',
            animation: 'float 3s ease-in-out infinite',
          }}>🎵</div>

          <h1 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: 'clamp(1.8rem, 5vw, 2.4rem)',
            background: 'linear-gradient(135deg, #ff2d95 0%, #b44dff 40%, #00f0ff 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradient-shift 4s ease infinite',
            marginBottom: '8px',
            letterSpacing: '3px',
          }}>SOUNDFORGE</h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 300,
            letterSpacing: '2px',
          }}>Create • Collaborate • Compose</p>
        </div>

        {/* Username Input */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--neon-cyan)',
            letterSpacing: '3px',
            marginBottom: '8px',
            textShadow: '0 0 8px rgba(0,240,255,0.3)',
          }}>YOUR NAME</label>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '1.1rem', opacity: 0.5, pointerEvents: 'none',
            }}>👤</span>
            <input
              type="text"
              placeholder="Enter your producer name..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              maxLength={20}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                background: 'rgba(26,26,62,0.8)',
                border: '1.5px solid rgba(180,77,255,0.2)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--neon-cyan)';
                e.target.style.boxShadow = '0 0 20px rgba(0,240,255,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(180,77,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Mode: Choose */}
        {mode === 'choose' && (
          <div style={{ display: 'flex', gap: '12px', animation: 'slide-in 0.3s ease' }}>
            <button onClick={() => setMode('create')} style={{
              flex: 1, padding: '20px 16px',
              background: 'linear-gradient(135deg, rgba(255,45,149,0.12), rgba(180,77,255,0.12))',
              border: '1.5px solid rgba(255,45,149,0.25)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--neon-pink)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255,45,149,0.15)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,45,149,0.25)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <span style={{ fontSize: '2rem' }}>🚀</span>
              <span style={{
                fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--neon-pink)',
              }}>CREATE ROOM</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Start a new session & invite friends
              </span>
            </button>

            <button onClick={() => setMode('join')} style={{
              flex: 1, padding: '20px 16px',
              background: 'linear-gradient(135deg, rgba(0,240,255,0.08), rgba(180,77,255,0.08))',
              border: '1.5px solid rgba(0,240,255,0.2)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--neon-cyan)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,240,255,0.15)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <span style={{ fontSize: '2rem' }}>🔗</span>
              <span style={{
                fontFamily: "'Orbitron', sans-serif", fontWeight: 700,
                fontSize: '0.75rem', letterSpacing: '2px', color: 'var(--neon-cyan)',
              }}>JOIN ROOM</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Enter a code to join a session
              </span>
            </button>
          </div>
        )}

        {/* Mode: Create */}
        {mode === 'create' && (
          <div style={{ animation: 'slide-in 0.3s ease' }}>
            <div style={{
              textAlign: 'center', padding: '24px',
              background: 'linear-gradient(135deg, rgba(255,45,149,0.06), rgba(180,77,255,0.06))',
              borderRadius: '16px',
              border: '1px solid rgba(255,45,149,0.15)',
              marginBottom: '20px',
            }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🎧</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                You'll get a <strong style={{ color: 'var(--neon-cyan)' }}>unique room code</strong> to share with your collaborators
              </p>
            </div>

            <button onClick={handleCreate} style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, var(--neon-pink), var(--neon-purple))',
              border: 'none', borderRadius: '12px',
              color: '#fff',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700, fontSize: '0.85rem', letterSpacing: '2px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255,45,149,0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255,45,149,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,45,149,0.3)';
            }}>
              🚀 LAUNCH ROOM
            </button>

            <button onClick={() => { setMode('choose'); setError(''); }} style={{
              display: 'block', width: '100%', marginTop: '12px',
              padding: '10px', background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              cursor: 'pointer', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              ← Back to options
            </button>
          </div>
        )}

        {/* Mode: Join */}
        {mode === 'join' && (
          <div style={{ animation: 'slide-in 0.3s ease' }}>
            <label style={{
              display: 'block',
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '0.65rem', fontWeight: 700,
              color: 'var(--neon-purple)',
              letterSpacing: '3px', marginBottom: '8px',
              textShadow: '0 0 8px rgba(180,77,255,0.3)',
            }}>ROOM CODE</label>

            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <span style={{
                position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                fontSize: '1.1rem', opacity: 0.5, pointerEvents: 'none',
              }}>🔗</span>
              <input
                type="text"
                placeholder="ENTER CODE"
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                onKeyDown={handleKeyDown}
                maxLength={8}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  background: 'rgba(26,26,62,0.8)',
                  border: '1.5px solid rgba(180,77,255,0.25)',
                  borderRadius: '12px',
                  color: 'var(--neon-cyan)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  letterSpacing: '8px',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--neon-purple)';
                  e.target.style.boxShadow = '0 0 20px rgba(180,77,255,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(180,77,255,0.25)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button onClick={handleJoin} style={{
              width: '100%', padding: '16px',
              background: 'linear-gradient(135deg, var(--neon-cyan), var(--neon-purple))',
              border: 'none', borderRadius: '12px',
              color: '#fff',
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700, fontSize: '0.85rem', letterSpacing: '2px',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0,240,255,0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(0,240,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(0,240,255,0.3)';
            }}>
              🔗 JOIN SESSION
            </button>

            <button onClick={() => { setMode('choose'); setError(''); }} style={{
              display: 'block', width: '100%', marginTop: '12px',
              padding: '10px', background: 'transparent', border: 'none',
              color: 'var(--text-muted)', fontSize: '0.85rem',
              cursor: 'pointer', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              ← Back to options
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px', padding: '10px 16px',
            background: 'rgba(255,71,87,0.1)',
            border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: '10px',
            color: '#ff6b7d',
            fontSize: '0.82rem',
            textAlign: 'center',
            animation: 'slide-in 0.2s ease',
          }}>⚠️ {error}</div>
        )}

        {/* Bottom hint */}
        <div style={{
          marginTop: '28px', textAlign: 'center',
          fontSize: '0.72rem', color: 'var(--text-muted)',
          opacity: 0.6,
        }}>
          🎹 Powered by Web Audio API & Tone.js
        </div>
      </div>

      {/* CSS for floating notes animation */}
      <style>{`
        @keyframes float-note {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-20vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RoomJoin;
