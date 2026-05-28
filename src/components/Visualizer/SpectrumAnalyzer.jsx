import React, { useRef, useEffect, useCallback } from 'react';

const SpectrumAnalyzer = ({ audioEngine, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastValuesRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Get FFT data
    let fftValues = null;
    try {
      fftValues = audioEngine?.getFFTValues?.();
    } catch (e) {
      // Audio engine not ready
    }

    // Use last values for smooth fade-out or empty array
    if (fftValues && fftValues.length > 0) {
      lastValuesRef.current = Array.from(fftValues);
    }

    const values = lastValuesRef.current;
    if (!values || values.length === 0) {
      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    const barCount = 64;
    const barWidth = (width / barCount) * 0.75;
    const gap = (width / barCount) * 0.25;

    // Create gradient for bars
    const gradient = ctx.createLinearGradient(0, height, 0, 0);
    gradient.addColorStop(0, '#00f0ff');
    gradient.addColorStop(0.4, '#00f0ff');
    gradient.addColorStop(0.7, '#b44dff');
    gradient.addColorStop(1, '#ff2d95');

    const step = Math.floor(values.length / barCount);

    for (let i = 0; i < barCount; i++) {
      // Average a range of FFT bins
      let sum = 0;
      const startBin = i * step;
      const endBin = Math.min(startBin + step, values.length);
      for (let j = startBin; j < endBin; j++) {
        // FFT values from Tone.js are in dB (-Infinity to 0)
        // Normalize to 0-1 range
        const normalized = Math.max(0, (values[j] + 100) / 100);
        sum += normalized;
      }
      const avg = sum / (endBin - startBin);
      const barHeight = avg * height * 0.9;

      const x = i * (barWidth + gap) + gap / 2;
      const y = height - barHeight;

      // Glow effect
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff80';

      // Draw bar
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Top cap with brighter glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ff2d9580';
      ctx.fillStyle = '#ff2d95';
      ctx.fillRect(x, y, barWidth, 2);
    }

    // Reset shadow
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [audioEngine]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas resolution for crisp rendering
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    // Use CSS dimensions for drawing
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      // One last draw to show fade
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Clear after stopping
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      lastValuesRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, draw]);

  return (
    <div className="visualizer-container spectrum-analyzer">
      <div className="visualizer-label">SPECTRUM</div>
      <canvas ref={canvasRef} className="visualizer-canvas" />
    </div>
  );
};

export default React.memo(SpectrumAnalyzer);
