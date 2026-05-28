/**
 * SoundForge — Note Mapping
 *
 * Maps sequencer grid rows (0-15) to chromatic pitches.
 * Row 0 is the highest note (D#4), Row 15 is the lowest (C3).
 *
 * Colour coding groups rows by octave range for visual distinction
 * in the sequencer UI.
 */

/** Chromatic notes from highest row to lowest row */
export const NOTES = [
  'D#4', 'D4', 'C#4', 'C4',   // rows  0-3  (octave 4)
  'B3',  'A#3', 'A3', 'G#3',  // rows  4-7  (octave 3 high)
  'G3',  'F#3', 'F3', 'E3',   // rows  8-11 (octave 3 mid)
  'D#3', 'D3',  'C#3', 'C3',  // rows 12-15 (octave 3 low)
];

/**
 * Returns the note name for a given row index.
 * @param {number} row  0-15
 * @returns {string}    e.g. 'D#4'
 */
export const getNoteName = (row) => {
  if (row < 0 || row >= NOTES.length) return '??';
  return NOTES[row];
};

/**
 * Returns a neon accent colour keyed to the row's octave range.
 *  - Rows  0-3:   neon pink   (#ff2d95)   — top / octave 4
 *  - Rows  4-7:   neon purple (#b44dff)   — upper-mid
 *  - Rows  8-11:  neon cyan   (#00f0ff)   — lower-mid
 *  - Rows 12-15:  neon green  (#39ff14)   — bottom / octave 3 low
 *
 * @param {number} row  0-15
 * @returns {string}    hex colour
 */
export const getNoteColor = (row) => {
  if (row < 4) return '#ff2d95';   // neon pink
  if (row < 8) return '#b44dff';   // neon purple
  if (row < 12) return '#00f0ff';  // neon cyan
  return '#39ff14';                // neon green
};

/**
 * Returns an octave-range label used as a CSS data attribute for
 * subtle row colour banding in the sequencer grid.
 *
 * @param {number} row  0-15
 * @returns {'high'|'mid-high'|'mid-low'|'low'}
 */
export const getOctaveRange = (row) => {
  if (row < 4) return 'high';
  if (row < 8) return 'mid-high';
  if (row < 12) return 'mid-low';
  return 'low';
};

/**
 * Returns true if the note at the given row is a sharp/flat (has # in name).
 * Useful for styling row labels differently.
 *
 * @param {number} row  0-15
 * @returns {boolean}
 */
export const isSharp = (row) => {
  const name = getNoteName(row);
  return name.includes('#');
};
