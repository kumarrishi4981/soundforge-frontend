import React, { useCallback } from 'react';

const WaveformIcon = ({ type, isActive }) => {
  const color = isActive ? '#ff2d95' : '#8888aa';
  const glow = isActive ? 'drop-shadow(0 0 6px #ff2d95)' : 'none';

  const paths = {
    sine: 'M2,15 Q8,2 14,15 Q20,28 26,15',
    square: 'M2,22 L2,8 L14,8 L14,22 L26,22 L26,8',
    sawtooth: 'M2,22 L14,8 L14,22 L26,8',
    triangle: 'M2,22 L8,8 L14,22 L20,8 L26,22',
  };

  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      style={{ filter: glow, transition: 'filter 0.3s ease' }}
    >
      <path
        d={paths[type]}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

const WAVEFORMS = ['sine', 'square', 'sawtooth', 'triangle'];

const ADSR_CONFIG = [
  { key: 'attack', label: 'Attack', min: 0.001, max: 2, step: 0.001, unit: 's' },
  { key: 'decay', label: 'Decay', min: 0.01, max: 2, step: 0.01, unit: 's' },
  { key: 'sustain', label: 'Sustain', min: 0, max: 1, step: 0.01, unit: '' },
  { key: 'release', label: 'Release', min: 0.01, max: 5, step: 0.01, unit: 's' },
];

const SynthPanel = ({ waveform, envelope, onWaveformChange, onEnvelopeChange }) => {
  const handleEnvelopeChange = useCallback(
    (key, value) => {
      onEnvelopeChange(key, parseFloat(value));
    },
    [onEnvelopeChange]
  );

  return (
    <div className="control-panel">
      <div className="panel-title">OSCILLATOR</div>

      {/* Waveform Selector */}
      <div className="param-group">
        <div className="param-label" style={{marginBottom: '8px'}}>Waveform</div>
        <div className="waveform-selector">
          {WAVEFORMS.map((wf) => (
            <button
              key={wf}
              className={`waveform-btn ${waveform === wf ? 'active' : ''}`}
              onClick={() => onWaveformChange(wf)}
              aria-label={`${wf} waveform`}
              title={wf.charAt(0).toUpperCase() + wf.slice(1)}
            >
              <WaveformIcon type={wf} isActive={waveform === wf} />
              <span>{wf.slice(0, 3).toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ADSR Envelope */}
      {ADSR_CONFIG.map(({ key, label, min, max, step, unit }) => (
        <div className="param-group" key={key}>
          <div className="param-header">
            <span className="param-label">{label}</span>
            <span className="param-value">
              {envelope[key]?.toFixed(key === 'attack' ? 3 : 2)}{unit}
            </span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={envelope[key] ?? min}
            onChange={(e) => handleEnvelopeChange(key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default React.memo(SynthPanel);
