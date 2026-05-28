/**
 * SoundForge Audio Engine
 *
 * Singleton wrapper around Tone.js that manages:
 *   - 8-voice PolySynth with configurable oscillator & envelope
 *   - Effects chain: Filter → Distortion → Chorus → Delay → Reverb
 *   - Analysis nodes: FFT (64-bin) + Waveform (256-sample)
 *   - 16-step sequencer driving a 16-row chromatic grid
 *
 * Usage:
 *   import audioEngine from './audioEngine';
 *   await audioEngine.init();   // call on user gesture
 *   audioEngine.play();
 */

import * as Tone from 'tone';
import { NOTES } from './noteMap';

class AudioEngine {
  constructor() {
    /* ── State ─────────────────────────────────────────────────────────── */
    this.isInitialized = false;
    this.isPlaying = false;
    this.bpm = 120;
    this.currentStep = -1;

    // 16 rows × 16 columns — row 0 is the highest pitch
    this.grid = Array.from({ length: 16 }, () => Array(16).fill(false));

    // UI callback: called with the current step index (0-15) or -1 on stop
    this.onStepChange = null;

    /* ── Audio Nodes (created lazily in init()) ────────────────────────── */
    this.synth = null;
    this.filter = null;
    this.reverb = null;
    this.delay = null;
    this.distortion = null;
    this.chorus = null;
    this.fft = null;
    this.waveform = null;
    this.sequence = null;

    /* ── Limiter to protect speakers ───────────────────────────────────── */
    this.limiter = null;
  }

  /* ===================================================================
   * Initialisation — MUST be called inside a user-gesture handler
   * (click, keydown, etc.) so browsers unlock the AudioContext.
   * =================================================================== */
  async init() {
    if (this.isInitialized) return;

    await Tone.start();

    /* ── Synth ────────────────────────────────────────────────────────── */
    this.synth = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 8,
      voice: Tone.Synth,
      options: {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
        },
      },
    });

    /* ── Effects ──────────────────────────────────────────────────────── */
    this.filter = new Tone.Filter({
      type: 'lowpass',
      frequency: 2000,
      Q: 1,
    });

    this.distortion = new Tone.Distortion({
      distortion: 0,
      wet: 0,
    });

    this.chorus = new Tone.Chorus({
      frequency: 1.5,
      delayTime: 3.5,
      depth: 0.7,
      wet: 0,
    }).start(); // Chorus LFO must be started

    this.delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.3,
      wet: 0,
    });

    this.reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0,
    });

    // Wait for reverb IR to generate (required by Tone.js)
    await this.reverb.ready;

    /* ── Analysis ─────────────────────────────────────────────────────── */
    this.fft = new Tone.FFT(64);
    this.waveform = new Tone.Waveform(256);

    /* ── Safety limiter ───────────────────────────────────────────────── */
    this.limiter = new Tone.Limiter(-3);

    /* ── Signal chain ─────────────────────────────────────────────────── */
    // synth → filter → distortion → chorus → delay → reverb → limiter → fft → waveform → destination
    this.synth.chain(
      this.filter,
      this.distortion,
      this.chorus,
      this.delay,
      this.reverb,
      this.limiter,
      this.fft,
      this.waveform,
      Tone.getDestination()
    );

    /* ── Sequencer ────────────────────────────────────────────────────── */
    const steps = Array.from({ length: 16 }, (_, i) => i);

    this.sequence = new Tone.Sequence(
      (time, step) => {
        this.currentStep = step;

        // Notify the UI (off the audio thread via setTimeout)
        if (this.onStepChange) {
          const cb = this.onStepChange;
          Tone.getDraw().schedule(() => cb(step), time);
        }

        // Collect active notes for this column
        const notes = [];
        for (let row = 0; row < 16; row++) {
          if (this.grid[row][step]) {
            notes.push(this.getNoteForRow(row));
          }
        }

        if (notes.length > 0) {
          this.synth.triggerAttackRelease(notes, '16n', time);
        }
      },
      steps,
      '16n'
    );

    /* ── Transport ────────────────────────────────────────────────────── */
    Tone.getTransport().bpm.value = this.bpm;

    this.isInitialized = true;
  }

  /* ===================================================================
   * Note Mapping
   *
   * Uses the shared NOTES array from noteMap.js.
   * Row 0 → highest note (D#4), Row 15 → lowest note (C3).
   * =================================================================== */
  getNoteForRow(row) {
    if (row < 0 || row >= NOTES.length) return 'C3';
    return NOTES[row];
  }

  /* ===================================================================
   * Transport Controls
   * =================================================================== */

  play() {
    if (!this.isInitialized) return;
    if (this.isPlaying) return;
    this.sequence.start(0);
    Tone.getTransport().start();
    this.isPlaying = true;
  }

  stop() {
    if (!this.isInitialized) return;
    Tone.getTransport().stop();
    this.sequence.stop();
    this.currentStep = -1;
    if (this.onStepChange) this.onStepChange(-1);
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play();
    }
  }

  /* ===================================================================
   * BPM
   * =================================================================== */

  setBPM(bpm) {
    const clamped = Math.max(30, Math.min(300, Number(bpm) || 120));
    this.bpm = clamped;
    if (this.isInitialized) {
      Tone.getTransport().bpm.value = clamped;
    }
  }

  /* ===================================================================
   * Grid Manipulation
   * =================================================================== */

  setGrid(grid) {
    if (
      Array.isArray(grid) &&
      grid.length === 16 &&
      grid.every((r) => Array.isArray(r) && r.length === 16)
    ) {
      this.grid = grid.map((row) => row.map(Boolean));
    }
  }

  toggleCell(row, col) {
    if (row < 0 || row >= 16 || col < 0 || col >= 16) return false;
    this.grid[row][col] = !this.grid[row][col];
    return this.grid[row][col];
  }

  clearGrid() {
    this.grid = Array.from({ length: 16 }, () => Array(16).fill(false));
  }

  /* ===================================================================
   * Synth Parameters
   * =================================================================== */

  /** @param {'sine'|'square'|'sawtooth'|'triangle'} type */
  setOscillatorType(type) {
    const allowed = ['sine', 'square', 'sawtooth', 'triangle'];
    if (!this.synth || !allowed.includes(type)) return;
    this.synth.set({ oscillator: { type } });
  }

  /** Legacy alias */
  setWaveform(type) {
    this.setOscillatorType(type);
  }

  setEnvelope(attack, decay, sustain, release) {
    if (!this.synth) return;
    this.synth.set({
      envelope: {
        attack: clamp(attack, 0.001, 4),
        decay: clamp(decay, 0.001, 4),
        sustain: clamp(sustain, 0, 1),
        release: clamp(release, 0.001, 8),
      },
    });
  }

  /* ===================================================================
   * Effects Parameters
   * =================================================================== */

  /**
   * @param {'lowpass'|'highpass'|'bandpass'|'notch'} type
   * @param {number} frequency  20-20000 Hz
   * @param {number} Q          0.1-18
   */
  setFilter(type, frequency, Q) {
    if (!this.filter) return;
    const validTypes = ['lowpass', 'highpass', 'bandpass', 'notch'];
    if (validTypes.includes(type)) this.filter.type = type;
    if (typeof frequency === 'number') {
      this.filter.frequency.value = clamp(frequency, 20, 20000);
    }
    if (typeof Q === 'number') {
      this.filter.Q.value = clamp(Q, 0.1, 18);
    }
  }

  setReverb(wet, decay) {
    if (!this.reverb) return;
    if (typeof wet === 'number') this.reverb.wet.value = clamp(wet, 0, 1);
    // Note: changing decay on the fly regenerates the IR — avoid per-frame calls
    if (typeof decay === 'number') {
      this.reverb.decay = clamp(decay, 0.1, 30);
    }
  }

  setDelay(wet, time, feedback) {
    if (!this.delay) return;
    if (typeof wet === 'number') this.delay.wet.value = clamp(wet, 0, 1);
    if (typeof feedback === 'number') {
      this.delay.feedback.value = clamp(feedback, 0, 0.95);
    }
    // delayTime can be a Tone.js time value (e.g. '8n') or seconds
    if (time !== undefined && time !== null) {
      this.delay.delayTime.value = time;
    }
  }

  setDistortion(wet, amount) {
    if (!this.distortion) return;
    if (typeof wet === 'number') this.distortion.wet.value = clamp(wet, 0, 1);
    if (typeof amount === 'number') {
      this.distortion.distortion = clamp(amount, 0, 1);
    }
  }

  setChorus(wet, rate, depth) {
    if (!this.chorus) return;
    if (typeof wet === 'number') this.chorus.wet.value = clamp(wet, 0, 1);
    if (typeof rate === 'number') this.chorus.frequency.value = clamp(rate, 0.1, 10);
    if (typeof depth === 'number') this.chorus.depth = clamp(depth, 0, 1);
  }

  /* ===================================================================
   * Analysis — call in requestAnimationFrame for visualizers
   * =================================================================== */

  /** @returns {Float32Array} 64-bin FFT magnitude values (dB) */
  getFFTValues() {
    if (!this.fft) return new Float32Array(64);
    return this.fft.getValue();
  }

  /** @returns {Float32Array} 256-sample waveform amplitude values (-1 … 1) */
  getWaveformValues() {
    if (!this.waveform) return new Float32Array(256);
    return this.waveform.getValue();
  }

  /* ===================================================================
   * Cleanup
   * =================================================================== */

  dispose() {
    this.stop();

    const nodes = [
      this.sequence,
      this.synth,
      this.filter,
      this.distortion,
      this.chorus,
      this.delay,
      this.reverb,
      this.limiter,
      this.fft,
      this.waveform,
    ];

    for (const node of nodes) {
      try {
        if (node && typeof node.dispose === 'function') node.dispose();
      } catch {
        // Tone.js occasionally throws during teardown — swallow silently
      }
    }

    this.synth = null;
    this.filter = null;
    this.distortion = null;
    this.chorus = null;
    this.delay = null;
    this.reverb = null;
    this.limiter = null;
    this.fft = null;
    this.waveform = null;
    this.sequence = null;
    this.isInitialized = false;
  }
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || min));
}

/* ── Singleton Export ─────────────────────────────────────────────────── */
const audioEngine = new AudioEngine();
export default audioEngine;
