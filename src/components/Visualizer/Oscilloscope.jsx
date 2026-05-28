import React, { useRef, useEffect, useCallback } from 'react';

const Oscilloscope = ({ audioEngine, isPlaying }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const drawGrid = useCallback((ctx, width, height) => {
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.08)';
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    const vLines = 10;
    for (let i = 0; i <= vLines; i++) {
      const x = (width / vLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Horizontal grid lines
    const hLines = 6;
    for (let i = 0; i <= hLines; i++) {
      const y = (height / hLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Center line (brighter)
    ctx.strokeStyle = 'rgba(57, 255, 20, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Center vertical
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height);

    // Get waveform data
    let waveformValues = null;
    try {
      waveformValues = audioEngine?.getWaveformValues?.();
    } catch (e) {
      // Audio engine not ready
    }

    if (!waveformValues || waveformValues.length === 0) {
      // Draw flat line at center when no data
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#39ff14';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(draw);
      return;
    }

    // Draw waveform with glow
    // Outer glow layer
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#39ff1480';
    ctx.strokeStyle = '#39ff1440';
    ctx.lineWidth = 6;
    ctx.beginPath();

    const sliceWidth = width / waveformValues.length;
    let x = 0;

    for (let i = 0; i < waveformValues.length; i++) {
      // Waveform values from Tone.js are -1 to 1
      const v = waveformValues[i];
      const y = ((1 - v) / 2) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();

    // Core line (bright)
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#39ff14';
    ctx.strokeStyle = '#39ff14';
    ctx.lineWidth = 2;
    ctx.beginPath();
    x = 0;

    for (let i = 0; i < waveformValues.length; i++) {
      const v = waveformValues[i];
      const y = ((1 - v) / 2) * height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    animationRef.current = requestAnimationFrame(draw);
  }, [audioEngine, drawGrid]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(draw);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      // Draw idle state (flat line + grid)
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        drawGrid(ctx, width, height);

        ctx.strokeStyle = '#39ff1460';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#39ff14';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, draw, drawGrid]);

  return (
    <div className="visualizer-container oscilloscope">
      <div className="visualizer-label">WAVEFORM</div>
      <canvas ref={canvasRef} className="visualizer-canvas" />
    </div>
  );
};

export default React.memo(Oscilloscope);
