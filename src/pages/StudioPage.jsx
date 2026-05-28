import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import audioEngine from '../audio/audioEngine';
import socket from '../socket/socket';
import SequencerGrid from '../components/Sequencer/SequencerGrid';
import TransportBar from '../components/Sequencer/TransportBar';
import SynthPanel from '../components/Synthesizer/SynthPanel';
import FilterPanel from '../components/Synthesizer/FilterPanel';
import EffectsPanel from '../components/Synthesizer/EffectsPanel';
import SpectrumAnalyzer from '../components/Visualizer/SpectrumAnalyzer';
import Oscilloscope from '../components/Visualizer/Oscilloscope';
import RoomJoin from '../components/Room/RoomJoin';
import UserPresence from '../components/Room/UserPresence';
import { PRESET_PATTERNS } from '../data/presets';

const createEmptyGrid = () => Array.from({ length: 16 }, () => Array(16).fill(false));

export default function StudioPage() {
  const location = useLocation();

  /* ── Core State ──────────────────────────────────────────────────────── */
  const [grid, setGrid] = useState(createEmptyGrid);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [bpm, setBpm] = useState(120);

  /* ── Synth State ─────────────────────────────────────────────────────── */
  const [waveform, setWaveform] = useState('triangle');
  const [envelope, setEnvelope] = useState({
    attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5,
  });
  const [filterType, setFilterType] = useState('lowpass');
  const [filterFreq, setFilterFreq] = useState(2000);
  const [filterQ, setFilterQ] = useState(1);
  const [effects, setEffects] = useState({
    reverb: { enabled: false, wet: 0.3 },
    delay: { enabled: false, wet: 0.3, feedback: 0.3 },
    distortion: { enabled: false, amount: 0.4 },
    chorus: { enabled: false, wet: 0.3 },
  });

  /* ── Room State ──────────────────────────────────────────────────────── */
  const [isInRoom, setIsInRoom] = useState(false);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [users, setUsers] = useState([]);
  const audioInitialized = useRef(false);

  /* ── Audio Init ──────────────────────────────────────────────────────── */
  const initAudio = useCallback(async () => {
    if (audioInitialized.current) return;
    try {
      await audioEngine.init();
      audioEngine.onStepChange = (step) => setCurrentStep(step);
      audioInitialized.current = true;
    } catch (err) {
      console.error('Audio init failed:', err);
    }
  }, []);

  /* ── Socket Listeners ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!isInRoom) return;

    const handleGridUpdate = ({ row, col, active }) => {
      setGrid((prev) => {
        const next = prev.map((r) => [...r]);
        next[row][col] = active;
        audioEngine.setGrid(next);
        return next;
      });
    };

    const handleGridCleared = () => {
      const empty = createEmptyGrid();
      setGrid(empty);
      audioEngine.clearGrid();
    };

    const handleUserJoined = ({ users: roomUsers }) => setUsers(roomUsers);
    const handleUserLeft = ({ users: roomUsers }) => setUsers(roomUsers);

    const handleTransportPlay = () => {
      audioEngine.play();
      setIsPlaying(true);
    };

    const handleTransportStop = () => {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
    };

    const handleBpmChange = ({ bpm: newBpm }) => {
      setBpm(newBpm);
      audioEngine.setBPM(newBpm);
    };

    const handleWaveformChange = ({ waveform: wf }) => {
      setWaveform(wf);
      audioEngine.setWaveform(wf);
    };

    const handleSynthConfig = (config) => {
      if (config.envelope) {
        setEnvelope(config.envelope);
        const { attack, decay, sustain, release } = config.envelope;
        audioEngine.setEnvelope(attack, decay, sustain, release);
      }
      if (config.filterType !== undefined) {
        setFilterType(config.filterType);
        audioEngine.setFilter(config.filterType, config.filterFreq, config.filterQ);
      }
      if (config.filterFreq !== undefined) {
        setFilterFreq(config.filterFreq);
        audioEngine.setFilter(filterType, config.filterFreq, filterQ);
      }
      if (config.filterQ !== undefined) {
        setFilterQ(config.filterQ);
        audioEngine.setFilter(filterType, filterFreq, config.filterQ);
      }
      if (config.effects) {
        setEffects(config.effects);
        applyEffects(config.effects);
      }
    };

    const handlePatternLoaded = (data) => {
      if (data.grid) {
        setGrid(data.grid);
        audioEngine.setGrid(data.grid);
      }
      if (data.bpm) {
        setBpm(data.bpm);
        audioEngine.setBPM(data.bpm);
      }
      if (data.waveform) {
        setWaveform(data.waveform);
        audioEngine.setWaveform(data.waveform);
      }
      if (data.synthConfig) {
        if (data.synthConfig.envelope) {
          setEnvelope(data.synthConfig.envelope);
          const { attack, decay, sustain, release } = data.synthConfig.envelope;
          audioEngine.setEnvelope(attack, decay, sustain, release);
        }
        if (data.synthConfig.filterType !== undefined) {
          setFilterType(data.synthConfig.filterType);
          audioEngine.setFilter(data.synthConfig.filterType, data.synthConfig.filterFreq, data.synthConfig.filterQ);
        }
        if (data.synthConfig.filterFreq !== undefined) {
          setFilterFreq(data.synthConfig.filterFreq);
        }
        if (data.synthConfig.filterQ !== undefined) {
          setFilterQ(data.synthConfig.filterQ);
        }
      }
      if (data.effects) {
        setEffects(data.effects);
        applyEffects(data.effects);
      }
    };

    socket.on('grid:update', handleGridUpdate);
    socket.on('grid:cleared', handleGridCleared);
    socket.on('room:user-joined', handleUserJoined);
    socket.on('room:user-left', handleUserLeft);
    socket.on('transport:play', handleTransportPlay);
    socket.on('transport:stop', handleTransportStop);
    socket.on('transport:bpm', handleBpmChange);
    socket.on('synth:waveform', handleWaveformChange);
    socket.on('synth:config', handleSynthConfig);
    socket.on('room:pattern-loaded', handlePatternLoaded);

    return () => {
      socket.off('grid:update', handleGridUpdate);
      socket.off('grid:cleared', handleGridCleared);
      socket.off('room:user-joined', handleUserJoined);
      socket.off('room:user-left', handleUserLeft);
      socket.off('transport:play', handleTransportPlay);
      socket.off('transport:stop', handleTransportStop);
      socket.off('transport:bpm', handleBpmChange);
      socket.off('synth:waveform', handleWaveformChange);
      socket.off('synth:config', handleSynthConfig);
      socket.off('room:pattern-loaded', handlePatternLoaded);
    };
  }, [isInRoom, filterType, filterFreq, filterQ]);

  /* ── Apply Effects Helper ────────────────────────────────────────────── */
  const applyEffects = (fx) => {
    audioEngine.setReverb(fx.reverb.enabled ? fx.reverb.wet : 0);
    audioEngine.setDelay(fx.delay.enabled ? fx.delay.wet : 0, undefined, fx.delay.feedback);
    audioEngine.setDistortion(fx.distortion.enabled ? 1 : 0, fx.distortion.amount);
    audioEngine.setChorus(fx.chorus.enabled ? fx.chorus.wet : 0);
  };

  /* ── Room Join ───────────────────────────────────────────────────────── */
  const handleJoinRoom = async ({ username: name, roomCode: code, isCreator }, onError) => {
    try {
      await initAudio();
    } catch (err) {
      console.error('Audio initialization failed:', err);
      if (onError) onError('Could not initialize audio engine.');
      return;
    }
    
    setUsername(name);

    // Setup connection error handler
    const handleConnectError = (err) => {
      console.error('Socket connection error:', err);
      if (onError) onError('Could not connect to server. Please ensure the backend is running.');
      cleanupListeners();
      socket.disconnect();
    };

    // Setup room error handler
    const handleRoomError = (data) => {
      console.error('Room error:', data);
      if (onError) onError(data.message || 'An error occurred.');
      cleanupListeners();
      socket.disconnect();
    };

    // Setup success handler
    const handleSuccess = (data) => {
      setRoomCode(data.code);
      setUsers(data.users || []);
      
      if (data.grid) {
        setGrid(data.grid);
        audioEngine.setGrid(data.grid);
      }
      if (data.bpm) {
        setBpm(data.bpm);
        audioEngine.setBPM(data.bpm);
      }
      if (data.waveform) {
        setWaveform(data.waveform);
        audioEngine.setWaveform(data.waveform);
      }
      if (data.synthConfig) {
        if (data.synthConfig.envelope) {
          setEnvelope(data.synthConfig.envelope);
          const { attack, decay, sustain, release } = data.synthConfig.envelope;
          audioEngine.setEnvelope(attack, decay, sustain, release);
        }
        if (data.synthConfig.filterType !== undefined) {
          setFilterType(data.synthConfig.filterType);
          audioEngine.setFilter(data.synthConfig.filterType, data.synthConfig.filterFreq, data.synthConfig.filterQ);
        }
        if (data.synthConfig.filterFreq !== undefined) {
          setFilterFreq(data.synthConfig.filterFreq);
        }
        if (data.synthConfig.filterQ !== undefined) {
          setFilterQ(data.synthConfig.filterQ);
        }
      }
      if (data.effects) {
        setEffects(data.effects);
        applyEffects(data.effects);
      }

      setIsInRoom(true);
      cleanupListeners();
    };

    const cleanupListeners = () => {
      socket.off('connect_error', handleConnectError);
      socket.off('room:error', handleRoomError);
      socket.off('room:created', handleSuccess);
      socket.off('room:joined', handleSuccess);
    };

    socket.on('connect_error', handleConnectError);
    socket.on('room:error', handleRoomError);
    socket.once(isCreator ? 'room:created' : 'room:joined', handleSuccess);

    socket.connect();

    if (isCreator) {
      const initialData = location.state?.pattern ? {
        username: name,
        grid: location.state.pattern.grid,
        bpm: location.state.pattern.bpm,
        waveform: location.state.pattern.waveform,
        synthConfig: location.state.pattern.synthConfig,
        effects: location.state.pattern.effects,
      } : { username: name };

      socket.emit('room:create', initialData);
    } else {
      socket.emit('room:join', { code, username: name });
    }
  };

  /* ── Load Preset ─────────────────────────────────────────────────────── */
  const handleLoadPreset = (preset) => {
    socket.emit('room:load-pattern', {
      grid: preset.grid,
      bpm: preset.bpm,
      waveform: preset.waveform,
      synthConfig: preset.synthConfig,
      effects: preset.effects,
    });
  };

  /* ── Grid Toggle ─────────────────────────────────────────────────────── */
  const handleToggleCell = (row, col) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[row][col] = !next[row][col];
      audioEngine.setGrid(next);
      socket.emit('grid:toggle', { row, col });
      return next;
    });
  };

  /* ── Transport ───────────────────────────────────────────────────────── */
  const handlePlay = () => {
    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentStep(-1);
      socket.emit('transport:stop');
    } else {
      audioEngine.play();
      setIsPlaying(true);
      socket.emit('transport:play');
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentStep(-1);
    socket.emit('transport:stop');
  };

  const handleBpmChange = (newBpm) => {
    setBpm(newBpm);
    audioEngine.setBPM(newBpm);
    socket.emit('transport:bpm', { bpm: newBpm });
  };

  const handleClear = () => {
    const empty = createEmptyGrid();
    setGrid(empty);
    audioEngine.clearGrid();
    socket.emit('grid:clear');
  };

  /* ── Synth Controls ──────────────────────────────────────────────────── */
  const handleWaveformChange = (wf) => {
    setWaveform(wf);
    audioEngine.setWaveform(wf);
    socket.emit('synth:waveform', { waveform: wf });
  };

  const handleEnvelopeChange = (param, value) => {
    const newEnv = { ...envelope, [param]: value };
    setEnvelope(newEnv);
    audioEngine.setEnvelope(newEnv.attack, newEnv.decay, newEnv.sustain, newEnv.release);
    socket.emit('synth:config', { envelope: newEnv });
  };

  const handleFilterChange = (param, value) => {
    let ft = filterType, ff = filterFreq, fq = filterQ;
    if (param === 'type') { ft = value; setFilterType(value); }
    if (param === 'freq') { ff = value; setFilterFreq(value); }
    if (param === 'q') { fq = value; setFilterQ(value); }
    audioEngine.setFilter(ft, ff, fq);
    socket.emit('synth:config', { filterType: ft, filterFreq: ff, filterQ: fq });
  };

  const handleEffectChange = (effect, param, value) => {
    setEffects((prev) => {
      const next = { ...prev, [effect]: { ...prev[effect], [param]: value } };
      applyEffects(next);
      socket.emit('synth:config', { effects: next });
      return next;
    });
  };

  /* ── Cleanup ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    return () => {
      audioEngine.dispose();
      socket.disconnect();
    };
  }, []);

  /* ── Render: Room Join ───────────────────────────────────────────────── */
  if (!isInRoom) {
    return (
      <div className="room-join-overlay">
        <RoomJoin onJoinRoom={handleJoinRoom} />
      </div>
    );
  }

  /* ── Render: Studio ──────────────────────────────────────────────────── */
  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-logo">SOUNDFORGE</div>
        <div className="header-center" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span className="room-code">🔗 {roomCode}</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              fontFamily: "'Orbitron', sans-serif",
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>Preset:</span>
            <select
              defaultValue=""
              onChange={(e) => {
                const selectedId = e.target.value;
                if (!selectedId) return;
                const pattern = PRESET_PATTERNS.find((p) => p._id === selectedId);
                if (pattern) {
                  handleLoadPreset(pattern);
                }
                e.target.value = ''; // Reset select after loading
              }}
              style={{
                background: 'rgba(26, 26, 62, 0.8)',
                border: '1.5px solid rgba(180, 77, 255, 0.25)',
                borderRadius: '8px',
                color: 'var(--neon-cyan)',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '6px 28px 6px 12px',
                outline: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2300f0ff%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'calc(100% - 10px) center',
                boxShadow: '0 0 10px rgba(180, 77, 255, 0.05)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--neon-cyan)';
                e.target.style.boxShadow = '0 0 15px rgba(0, 240, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(180, 77, 255, 0.25)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="" disabled>-- Select Preset --</option>
              {PRESET_PATTERNS.map((p) => (
                <option key={p._id} value={p._id} style={{ background: '#0c0c1e', color: 'var(--text-primary)' }}>
                  {p.title} ({p.waveform.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="header-right">
          <UserPresence users={users} currentUser={username} />
        </div>
      </header>

      {/* Studio Layout */}
      <div className="studio-layout">
        {/* Main: Sequencer Grid */}
        <div className="studio-main">
          <SequencerGrid
            grid={grid}
            onToggleCell={handleToggleCell}
            currentStep={currentStep}
            isPlaying={isPlaying}
          />
        </div>

        {/* Sidebar: Controls */}
        <div className="studio-sidebar">
          <SynthPanel
            waveform={waveform}
            envelope={envelope}
            onWaveformChange={handleWaveformChange}
            onEnvelopeChange={handleEnvelopeChange}
          />
          <FilterPanel
            filterType={filterType}
            filterFreq={filterFreq}
            filterQ={filterQ}
            onFilterChange={handleFilterChange}
          />
          <EffectsPanel
            effects={effects}
            onEffectChange={handleEffectChange}
          />
        </div>

        {/* Transport */}
        <div className="studio-transport">
          <TransportBar
            isPlaying={isPlaying}
            bpm={bpm}
            currentStep={currentStep}
            onPlay={handlePlay}
            onStop={handleStop}
            onBpmChange={handleBpmChange}
            onClear={handleClear}
          />
        </div>

        {/* Visualizers */}
        <div className="studio-visualizers">
          <SpectrumAnalyzer audioEngine={audioEngine} isPlaying={isPlaying} />
          <Oscilloscope audioEngine={audioEngine} isPlaying={isPlaying} />
        </div>
      </div>
    </div>
  );
}
