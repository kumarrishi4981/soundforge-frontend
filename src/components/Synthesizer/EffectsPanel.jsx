import React, { useCallback } from 'react';

const EFFECTS_CONFIG = [
  {
    key: 'reverb',
    label: 'REVERB',
    icon: '🌊',
    color: '#b44dff',
    params: [{ key: 'wet', label: 'Wet', min: 0, max: 1, step: 0.01 }],
  },
  {
    key: 'delay',
    label: 'DELAY',
    icon: '📡',
    color: '#00f0ff',
    params: [
      { key: 'wet', label: 'Wet', min: 0, max: 1, step: 0.01 },
      { key: 'feedback', label: 'Feedback', min: 0, max: 0.95, step: 0.01 },
    ],
  },
  {
    key: 'distortion',
    label: 'DISTORT',
    icon: '⚡',
    color: '#ff6b2b',
    params: [{ key: 'amount', label: 'Amount', min: 0, max: 1, step: 0.01 }],
  },
  {
    key: 'chorus',
    label: 'CHORUS',
    icon: '✨',
    color: '#39ff14',
    params: [{ key: 'wet', label: 'Wet', min: 0, max: 1, step: 0.01 }],
  },
];

const EffectsPanel = ({ effects, onEffectChange }) => {
  const handleToggle = useCallback(
    (effectKey) => {
      onEffectChange(effectKey, 'enabled', !effects[effectKey]?.enabled);
    },
    [effects, onEffectChange]
  );

  const handleParamChange = useCallback(
    (effectKey, paramKey, value) => {
      onEffectChange(effectKey, paramKey, parseFloat(value));
    },
    [onEffectChange]
  );

  return (
    <div className="control-panel">
      <div className="panel-title">EFFECTS</div>

      <div className="effects-grid">
        {EFFECTS_CONFIG.map(({ key, label, icon, color, params }) => {
          const effect = effects[key];
          if (!effect) return null;
          const isEnabled = effect.enabled;

          return (
            <div
              key={key}
              className={`effect-block ${isEnabled ? 'active' : ''}`}
              style={{
                borderColor: isEnabled ? color : undefined,
              }}
            >
              {/* Header with toggle */}
              <div className="effect-header">
                <span className="effect-name">{icon} {label}</span>
                <div
                  className={`effect-toggle ${isEnabled ? 'active' : ''}`}
                  onClick={() => handleToggle(key)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Toggle ${label}`}
                />
              </div>

              {/* Parameter sliders */}
              {params.map((param) => (
                <div className="param-group" key={param.key} style={{ marginBottom: '6px' }}>
                  <div className="param-header">
                    <span className="param-label" style={{ fontSize: '0.6rem' }}>{param.label}</span>
                    <span className="param-value" style={{ fontSize: '0.6rem' }}>
                      {(effect[param.key] ?? param.min).toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={effect[param.key] ?? param.min}
                    disabled={!isEnabled}
                    onChange={(e) => handleParamChange(key, param.key, e.target.value)}
                    style={{ opacity: isEnabled ? 1 : 0.4 }}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(EffectsPanel);
