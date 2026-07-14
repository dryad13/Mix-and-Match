// Spotify Key + Mode translation utility to Camelot Wheel system

export const SPOTIFY_KEY_NAMES = {
  0: 'C',
  1: 'C#',
  2: 'D',
  3: 'D#',
  4: 'E',
  5: 'F',
  6: 'F#',
  7: 'G',
  8: 'G#',
  9: 'A',
  10: 'A#',
  11: 'B'
};

const MINOR_MAP = {
  0: { code: '5A', name: 'Cm', fullName: 'C Minor' },
  1: { code: '12A', name: 'C#m', fullName: 'C-Sharp Minor' },
  2: { code: '7A', name: 'Dm', fullName: 'D Minor' },
  3: { code: '2A', name: 'D#m', fullName: 'D-Sharp Minor' },
  4: { code: '9A', name: 'Em', fullName: 'E Minor' },
  5: { code: '4A', name: 'Fm', fullName: 'F Minor' },
  6: { code: '11A', name: 'F#m', fullName: 'F-Sharp Minor' },
  7: { code: '6A', name: 'Gm', fullName: 'G Minor' },
  8: { code: '1A', name: 'G#m', fullName: 'G-Sharp Minor' },
  9: { code: '8A', name: 'Am', fullName: 'A Minor' },
  10: { code: '3A', name: 'A#m', fullName: 'A-Sharp Minor' },
  11: { code: '10A', name: 'Bm', fullName: 'B Minor' }
};

const MAJOR_MAP = {
  0: { code: '8B', name: 'C', fullName: 'C Major' },
  1: { code: '3B', name: 'Db', fullName: 'D-Flat Major' },
  2: { code: '10B', name: 'D', fullName: 'D Major' },
  3: { code: '5B', name: 'Eb', fullName: 'E-Flat Major' },
  4: { code: '12B', name: 'E', fullName: 'E Major' },
  5: { code: '7B', name: 'F', fullName: 'F Major' },
  6: { code: '2B', name: 'F#', fullName: 'F-Sharp Major' },
  7: { code: '9B', name: 'G', fullName: 'G Major' },
  8: { code: '4B', name: 'Ab', fullName: 'A-Flat Major' },
  9: { code: '11B', name: 'A', fullName: 'A Major' },
  10: { code: '6B', name: 'Bb', fullName: 'B-Flat Major' },
  11: { code: '1B', name: 'B', fullName: 'B Major' }
};

/**
 * Convert Spotify key (0-11) and mode (0-1) to Camelot Object
 * @param {number} key 
 * @param {number} mode 
 * @returns {{code: string, name: string, fullName: string}}
 */
export function getCamelotKey(key, mode) {
  // Safe fallbacks
  if (key === undefined || key < 0 || key > 11) {
    return { code: '8A', name: 'Am', fullName: 'A Minor' }; // default
  }
  
  if (mode === 0) {
    return MINOR_MAP[key];
  } else {
    return MAJOR_MAP[key];
  }
}
