import { useMemo } from 'react';
import { NOTES, getNoteColor } from '../../audio/noteMap';

const ROWS = 16;
const COLS = 16;

export default function SequencerGrid({ grid, onToggleCell, currentStep, isPlaying }) {
  const octaveZone = (row) => {
    if (row < 4) return 'octave-high';
    if (row < 8) return 'octave-mid-high';
    if (row < 12) return 'octave-mid-low';
    return 'octave-low';
  };

  const rowZone = (row) => {
    if (row < 4) return 0;
    if (row < 8) return 1;
    if (row < 12) return 2;
    return 3;
  };

  const colNumbers = useMemo(
    () => Array.from({ length: COLS }, (_, i) => i + 1),
    []
  );

  return (
    <div className="sequencer-wrapper">
      {/* Column numbers */}
      <div className="sequencer-column-numbers">
        <div /> {/* spacer for row labels */}
        {colNumbers.map((n) => (
          <div key={n} className="col-number">{n}</div>
        ))}
      </div>

      {/* Grid rows */}
      {Array.from({ length: ROWS }, (_, row) => (
        <div
          key={row}
          className={`sequencer-grid grid-row-zone-${rowZone(row)}`}
        >
          {/* Row label */}
          <div
            className="grid-row-label"
            style={{ color: getNoteColor(row) }}
          >
            {NOTES[row]}
          </div>

          {/* Cells */}
          {Array.from({ length: COLS }, (_, col) => {
            const isActive = grid[row]?.[col] ?? false;
            const isPlayhead = col === currentStep;
            const isPlayingCell = isActive && isPlayhead && isPlaying;

            let className = 'grid-cell';
            if (isActive) className += ` active ${octaveZone(row)}`;
            if (isPlayhead) className += ' playhead';
            if (isPlayingCell) className += ' playing';

            return (
              <div
                key={col}
                className={className}
                onClick={() => onToggleCell(row, col)}
                role="button"
                tabIndex={0}
                aria-label={`${NOTES[row]} step ${col + 1} ${isActive ? 'active' : 'inactive'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onToggleCell(row, col);
                  }
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
