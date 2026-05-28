/**
 * SoundForge — Shared Preset Patterns
 *
 * Mapped to 16x16 grid coordinates, custom oscillator types,
 * ADSR envelopes, resonant filter cutoff thresholds, and delay/reverb/distortion wetness.
 */

export const PRESET_PATTERNS = [
  {
    _id: 'preset-1',
    title: 'Neon Dreams',
    author: 'SoundForge',
    bpm: 120,
    waveform: 'triangle',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && c % 4 === 0) || (r === 11 && c % 4 === 2) ||
        (r === 7 && (c === 4 || c === 12)) || (r === 3 && c === 8)
      )
    ),
    synthConfig: {
      envelope: { attack: 0.08, decay: 0.2, sustain: 0.4, release: 0.6 },
      filterType: 'lowpass',
      filterFreq: 1800,
      filterQ: 1
    },
    effects: {
      reverb: { enabled: true, wet: 0.3 },
      delay: { enabled: true, wet: 0.25, feedback: 0.3 },
      distortion: { enabled: false, amount: 0.4 },
      chorus: { enabled: false, wet: 0.3 }
    }
  },
  {
    _id: 'preset-2',
    title: 'Cyber Pulse',
    author: 'SoundForge',
    bpm: 140,
    waveform: 'sawtooth',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 14 && c % 2 === 0) || (r === 10 && c % 4 === 1) ||
        (r === 6 && c % 8 === 3) || (r === 2 && c === 0)
      )
    ),
    synthConfig: {
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.2, release: 0.3 },
      filterType: 'lowpass',
      filterFreq: 2500,
      filterQ: 1.5
    },
    effects: {
      reverb: { enabled: false, wet: 0.3 },
      delay: { enabled: true, wet: 0.2, feedback: 0.2 },
      distortion: { enabled: true, amount: 0.3 },
      chorus: { enabled: false, wet: 0.3 }
    }
  },
  {
    _id: 'preset-3',
    title: 'Retro Wave',
    author: 'SoundForge',
    bpm: 100,
    waveform: 'square',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && (c === 0 || c === 4 || c === 8 || c === 12)) ||
        (r === 12 && c % 8 === 2) || (r === 8 && (c === 6 || c === 14)) ||
        (r === 4 && c === 10)
      )
    ),
    synthConfig: {
      envelope: { attack: 0.05, decay: 0.25, sustain: 0.3, release: 0.5 },
      filterType: 'lowpass',
      filterFreq: 1200,
      filterQ: 1
    },
    effects: {
      reverb: { enabled: true, wet: 0.25 },
      delay: { enabled: false, wet: 0.3, feedback: 0.3 },
      distortion: { enabled: false, amount: 0.4 },
      chorus: { enabled: true, wet: 0.35 }
    }
  },
  {
    _id: 'preset-4',
    title: 'Acid Sunrise',
    author: 'SoundForge',
    bpm: 128,
    waveform: 'sawtooth',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && c % 3 === 0) || (r === 13 && (c === 1 || c === 7 || c === 10)) ||
        (r === 9 && (c === 2 || c === 8 || c === 14)) || (r === 5 && (c === 4 || c === 11 || c === 13)) ||
        (r === 1 && (c === 5 || c === 12))
      )
    ),
    synthConfig: {
      envelope: { attack: 0.01, decay: 0.12, sustain: 0.4, release: 0.2 },
      filterType: 'lowpass',
      filterFreq: 3000,
      filterQ: 3.5
    },
    effects: {
      reverb: { enabled: false, wet: 0.3 },
      delay: { enabled: true, wet: 0.3, feedback: 0.45 },
      distortion: { enabled: true, amount: 0.2 },
      chorus: { enabled: false, wet: 0.3 }
    }
  },
  {
    _id: 'preset-5',
    title: 'Chiptune Hero',
    author: 'SoundForge',
    bpm: 150,
    waveform: 'square',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && c % 2 === 0) || (r === 12 && c % 4 === 1) ||
        (r === 8 && c % 4 === 2) || (r === 3 && c % 4 === 3) ||
        (r === 0 && (c === 4 || c === 12))
      )
    ),
    synthConfig: {
      envelope: { attack: 0.001, decay: 0.08, sustain: 0.0, release: 0.05 },
      filterType: 'highpass',
      filterFreq: 500,
      filterQ: 1
    },
    effects: {
      reverb: { enabled: false, wet: 0.3 },
      delay: { enabled: false, wet: 0.3, feedback: 0.3 },
      distortion: { enabled: false, amount: 0.4 },
      chorus: { enabled: false, wet: 0.3 }
    }
  },
  {
    _id: 'preset-6',
    title: 'Ambient Clouds',
    author: 'SoundForge',
    bpm: 80,
    waveform: 'sine',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && c % 8 === 0) || (r === 11 && c % 4 === 0) ||
        (r === 8 && c % 4 === 2) || (r === 4 && c % 8 === 4) ||
        (r === 1 && (c === 6 || c === 14))
      )
    ),
    synthConfig: {
      envelope: { attack: 0.35, decay: 0.5, sustain: 0.8, release: 1.2 },
      filterType: 'lowpass',
      filterFreq: 800,
      filterQ: 0.8
    },
    effects: {
      reverb: { enabled: true, wet: 0.65 },
      delay: { enabled: false, wet: 0.3, feedback: 0.3 },
      distortion: { enabled: false, amount: 0.4 },
      chorus: { enabled: true, wet: 0.4 }
    }
  },
  {
    _id: 'preset-7',
    title: 'Subterranean',
    author: 'SoundForge',
    bpm: 124,
    waveform: 'sawtooth',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && (c % 4 === 0 || c % 4 === 1)) ||
        (r === 14 && (c % 4 === 2 || c % 4 === 3)) ||
        (r === 11 && c % 8 === 4) || (r === 7 && c % 8 === 6)
      )
    ),
    synthConfig: {
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.4 },
      filterType: 'lowpass',
      filterFreq: 600,
      filterQ: 1.2
    },
    effects: {
      reverb: { enabled: true, wet: 0.2 },
      delay: { enabled: false, wet: 0.3, feedback: 0.3 },
      distortion: { enabled: true, amount: 0.45 },
      chorus: { enabled: false, wet: 0.3 }
    }
  },
  {
    _id: 'preset-8',
    title: 'Funk Machine',
    author: 'SoundForge',
    bpm: 115,
    waveform: 'triangle',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 15 && (c === 0 || c === 3 || c === 8 || c === 11)) ||
        (r === 12 && c % 4 === 2) || (r === 9 && (c === 4 || c === 12)) ||
        (r === 6 && (c === 5 || c === 9 || c === 13)) ||
        (r === 3 && (c === 7 || c === 15))
      )
    ),
    synthConfig: {
      envelope: { attack: 0.04, decay: 0.18, sustain: 0.3, release: 0.3 },
      filterType: 'bandpass',
      filterFreq: 1500,
      filterQ: 2.0
    },
    effects: {
      reverb: { enabled: false, wet: 0.3 },
      delay: { enabled: true, wet: 0.15, feedback: 0.25 },
      distortion: { enabled: false, amount: 0.4 },
      chorus: { enabled: true, wet: 0.25 }
    }
  },
  {
    _id: 'preset-9',
    title: 'Starlight',
    author: 'SoundForge',
    bpm: 130,
    waveform: 'sine',
    isPreset: true,
    createdAt: new Date().toISOString(),
    grid: Array.from({ length: 16 }, (_, r) =>
      Array.from({ length: 16 }, (_, c) =>
        (r === 13 && c % 4 === 0) || (r === 10 && c % 4 === 2) ||
        (r === 5 && c % 2 === 1) || (r === 2 && (c === 4 || c === 12)) ||
        (r === 0 && (c === 6 || c === 14))
      )
    ),
    synthConfig: {
      envelope: { attack: 0.15, decay: 0.3, sustain: 0.5, release: 0.8 },
      filterType: 'lowpass',
      filterFreq: 2200,
      filterQ: 1
    },
    effects: {
      reverb: { enabled: true, wet: 0.45 },
      delay: { enabled: true, wet: 0.4, feedback: 0.5 },
      distortion: { enabled: false, amount: 0.4 },
      chorus: { enabled: false, wet: 0.3 }
    }
  }
];
