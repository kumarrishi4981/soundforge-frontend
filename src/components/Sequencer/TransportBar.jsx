export default function TransportBar({ isPlaying, bpm, onPlay, onStop, onBpmChange, onClear, onSave, currentStep }) {
  return (
    <div className="transport-bar">
      {/* Play / Stop / Clear */}
      <div className="transport-buttons">
        <button
          className={`transport-btn play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={onPlay}
          title="Play"
          aria-label="Play"
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          className="transport-btn stop-btn"
          onClick={onStop}
          title="Stop"
          aria-label="Stop"
        >
          ■
        </button>

        <button
          className="transport-btn clear-btn"
          onClick={onClear}
          title="Clear grid"
          aria-label="Clear grid"
        >
          🗑
        </button>

        <button
          className="transport-btn save-btn"
          onClick={onSave}
          title="Save pattern"
          aria-label="Save pattern"
          style={{
            borderColor: 'var(--neon-green)',
            color: 'var(--neon-green)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--glow-green)';
            e.currentTarget.style.background = 'rgba(57, 255, 20, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'var(--bg-elevated)';
          }}
        >
          💾
        </button>
      </div>

      {/* BPM */}
      <div className="bpm-section">
        <div>
          <div className="bpm-display">{bpm}</div>
          <div className="bpm-label">BPM</div>
        </div>

        <div className="bpm-slider-wrap">
          <input
            type="range"
            min="60"
            max="200"
            step="1"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            aria-label="Tempo"
          />
        </div>
      </div>

      {/* Step indicator */}
      <div className="step-indicator">
        STEP {currentStep >= 0 ? String(currentStep + 1).padStart(2, '0') : '--'} / 16
      </div>
    </div>
  );
}
