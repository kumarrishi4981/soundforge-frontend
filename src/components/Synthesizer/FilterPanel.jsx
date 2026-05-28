export default function FilterPanel({ filterType, filterFreq, filterQ, onFilterChange }) {
  const types = ['lowpass', 'highpass', 'bandpass', 'notch'];

  const formatFreq = (f) => {
    if (f >= 1000) return `${(f / 1000).toFixed(1)}kHz`;
    return `${Math.round(f)}Hz`;
  };

  // Logarithmic slider: map linear 0-1 to 20-20000Hz
  const freqToSlider = (f) => {
    return (Math.log(f / 20) / Math.log(1000)) * 100;
  };

  const sliderToFreq = (v) => {
    return 20 * Math.pow(1000, v / 100);
  };

  return (
    <div className="control-panel">
      <div className="panel-title">Filter</div>

      {/* Filter type selector */}
      <div className="filter-selector">
        {types.map((t) => (
          <button
            key={t}
            className={`filter-btn ${filterType === t ? 'active' : ''}`}
            onClick={() => onFilterChange('type', t)}
          >
            {t === 'lowpass' ? 'LPF' : t === 'highpass' ? 'HPF' : t === 'bandpass' ? 'BPF' : 'NCH'}
          </button>
        ))}
      </div>

      {/* Frequency */}
      <div className="param-group">
        <div className="param-header">
          <span className="param-label">Frequency</span>
          <span className="param-value">{formatFreq(filterFreq)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={freqToSlider(filterFreq)}
          onChange={(e) => onFilterChange('freq', sliderToFreq(Number(e.target.value)))}
        />
      </div>

      {/* Resonance */}
      <div className="param-group">
        <div className="param-header">
          <span className="param-label">Resonance</span>
          <span className="param-value">{filterQ.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="18"
          step="0.1"
          value={filterQ}
          onChange={(e) => onFilterChange('q', Number(e.target.value))}
        />
      </div>
    </div>
  );
}
