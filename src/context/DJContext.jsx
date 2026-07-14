import React, { createContext, useState, useEffect, useRef, useContext } from 'react';

const DJContext = createContext();

// Camelot Keys Database
export const CAMELOT_KEYS = {
  // Minor Keys (A)
  '1A': { num: 1, letter: 'A', name: 'G#m', fullName: 'G-Sharp Minor', freq: 207.65, majorRel: '1B', chordType: 'minor', color: '#019451' },
  '2A': { num: 2, letter: 'A', name: 'D#m', fullName: 'D-Sharp Minor', freq: 155.56, majorRel: '2B', chordType: 'minor', color: '#00A896' },
  '3A': { num: 3, letter: 'A', name: 'A#m', fullName: 'A-Sharp Minor', freq: 233.08, majorRel: '3B', chordType: 'minor', color: '#028090' },
  '4A': { num: 4, letter: 'A', name: 'Fm', fullName: 'F Minor', freq: 174.61, majorRel: '4B', chordType: 'minor', color: '#006494' },
  '5A': { num: 5, letter: 'A', name: 'Cm', fullName: 'C Minor', freq: 130.81, majorRel: '5B', chordType: 'minor', color: '#1446a0' },
  '6A': { num: 6, letter: 'A', name: 'Gm', fullName: 'G Minor', freq: 196.00, majorRel: '6B', chordType: 'minor', color: '#3f37c9' },
  '7A': { num: 7, letter: 'A', name: 'Dm', fullName: 'D Minor', freq: 146.83, majorRel: '7B', chordType: 'minor', color: '#7209b7' },
  '8A': { num: 8, letter: 'A', name: 'Am', fullName: 'A Minor', freq: 220.00, majorRel: '8B', chordType: 'minor', color: '#f72585' },
  '9A': { num: 9, letter: 'A', name: 'Em', fullName: 'E Minor', freq: 164.81, majorRel: '9B', chordType: 'minor', color: '#e01e37' },
  '10A': { num: 10, letter: 'A', name: 'Bm', fullName: 'B Minor', freq: 246.94, majorRel: '10B', chordType: 'minor', color: '#f77f00' },
  '11A': { num: 11, letter: 'A', name: 'F#m', fullName: 'F-Sharp Minor', freq: 185.00, majorRel: '11B', chordType: 'minor', color: '#fcbf49' },
  '12A': { num: 12, letter: 'A', name: 'C#m', fullName: 'C-Sharp Minor', freq: 138.59, majorRel: '12B', chordType: 'minor', color: '#eae2b7' },
  
  // Major Keys (B)
  '1B': { num: 1, letter: 'B', name: 'B', fullName: 'B Major', freq: 246.94, minorRel: '1A', chordType: 'major', color: '#2ec4b6' },
  '2B': { num: 2, letter: 'B', name: 'F#', fullName: 'F-Sharp Major', freq: 185.00, minorRel: '2A', chordType: 'major', color: '#c1121f' },
  '3B': { num: 3, letter: 'B', name: 'Db', fullName: 'D-Flat Major', freq: 277.18, minorRel: '3A', chordType: 'major', color: '#a7c957' },
  '4B': { num: 4, letter: 'B', name: 'Ab', fullName: 'A-Flat Major', freq: 207.65, minorRel: '4A', chordType: 'major', color: '#1d3557' },
  '5B': { num: 5, letter: 'B', name: 'Eb', fullName: 'E-Flat Major', freq: 155.56, minorRel: '5A', chordType: 'major', color: '#457b9d' },
  '6B': { num: 6, letter: 'B', name: 'Bb', fullName: 'B-Flat Major', freq: 233.08, minorRel: '6A', chordType: 'major', color: '#a8dadc' },
  '7B': { num: 7, letter: 'B', name: 'F', fullName: 'F Major', freq: 174.61, minorRel: '7A', chordType: 'major', color: '#e63946' },
  '8B': { num: 8, letter: 'B', name: 'C', fullName: 'C Major', freq: 261.63, minorRel: '8A', chordType: 'major', color: '#f1c0e8' },
  '9B': { num: 9, letter: 'B', name: 'G', fullName: 'G Major', freq: 196.00, minorRel: '9A', chordType: 'major', color: '#cfbaf0' },
  '10B': { num: 10, letter: 'B', name: 'D', fullName: 'D Major', freq: 293.66, minorRel: '10A', chordType: 'major', color: '#a3c4f3' },
  '11B': { num: 11, letter: 'B', name: 'A', fullName: 'A Major', freq: 220.00, minorRel: '11A', chordType: 'major', color: '#b9fbc0' },
  '12B': { num: 12, letter: 'B', name: 'E', fullName: 'E Major', freq: 164.81, minorRel: '12A', chordType: 'major', color: '#fbf8cc' }
};

// Playbook moves configuration
export const CHESS_MOVE_TYPES = {
  'pawn_hold': {
    id: 'pawn_hold',
    name: 'The Pawn Hold',
    chessAnalogy: 'Defensive slide',
    description: 'Mix inside same key (0 steps). 100% harmonically flawless.',
    shortMove: 'Hold (0)',
    calculateTarget: (currentKey) => currentKey
  },
  'bishop_clockwise': {
    id: 'bishop_clockwise',
    name: 'The Bishop Upward Step',
    chessAnalogy: '1 space clockwise',
    description: 'Rise up +1 clock hour (e.g. 8A → 9A). Creates a warm, natural emotional tension lift.',
    shortMove: 'Step (+1)',
    calculateTarget: (currentKey) => {
      const info = CAMELOT_KEYS[currentKey];
      let nextNum = info.num + 1;
      if (nextNum > 12) nextNum = 1;
      return `${nextNum}${info.letter}`;
    }
  },
  'bishop_counter': {
    id: 'bishop_counter',
    name: 'The Bishop Downward Step',
    chessAnalogy: '1 space counter-clockwise',
    description: 'Step down -1 clock hour (e.g. 8A → 7A). Cools down room energy gracefully.',
    shortMove: 'Step (-1)',
    calculateTarget: (currentKey) => {
      const info = CAMELOT_KEYS[currentKey];
      let nextNum = info.num - 1;
      if (nextNum < 1) nextNum = 12;
      return `${nextNum}${info.letter}`;
    }
  },
  'rook_slide': {
    id: 'rook_slide',
    name: 'The Rook Slide',
    chessAnalogy: 'Vertical swap',
    description: 'Swap between Minor and Major (same number, change letter, e.g. 8A → 8B). Perfect transition to introduce bright major vocals into dark techno.',
    shortMove: 'Mood Swap',
    calculateTarget: (currentKey) => {
      const info = CAMELOT_KEYS[currentKey];
      const nextLetter = info.letter === 'A' ? 'B' : 'A';
      return `${info.num}${nextLetter}`;
    }
  },
  'knight_jump_plus2': {
    id: 'knight_jump_plus2',
    name: "The Knight's Energy Jump",
    chessAnalogy: '2 spaces clockwise jump',
    description: 'Skip +2 hours forward (e.g. 8A → 10A). Immediate, noticeable raise in energy level for peak drops.',
    shortMove: 'Boost (+2)',
    calculateTarget: (currentKey) => {
      const info = CAMELOT_KEYS[currentKey];
      let nextNum = info.num + 2;
      if (nextNum > 12) nextNum = nextNum - 12;
      return `${nextNum}${info.letter}`;
    }
  },
  'queen_subdominant_plus7': {
    id: 'queen_subdominant_plus7',
    name: 'The Castle Shift',
    chessAnalogy: '+7 spaces jump',
    description: 'Modulate +7 clock hours forward (e.g. 8A → 3A). Structural subdominant harmony swap.',
    shortMove: 'Castle (+7)',
    calculateTarget: (currentKey) => {
      const info = CAMELOT_KEYS[currentKey];
      let nextNum = info.num + 7;
      if (nextNum > 12) nextNum = nextNum - 12;
      return `${nextNum}${info.letter}`;
    }
  }
};

export function DJProvider({ children }) {
  // UI states
  const [selectorTarget, setSelectorTarget] = useState('B');
  const [deckAKey, setDeckAKey] = useState('8A');
  const [deckBKey, setDeckBKey] = useState('9A');
  const [deckATrack, setDeckATrack] = useState({ id: 'acid-loop', name: 'Deep Hypnotic Acid', artist: 'Synthesizer Core', bpm: 126, camelotCode: '8A' });
  const [deckBTrack, setDeckBTrack] = useState({ id: 'chords-loop', name: 'Industrial Chords', artist: 'Synthesizer Core', bpm: 126, camelotCode: '9A' });
  
  const [bpm, setBpm] = useState(126);
  const [crossfaderVal, setCrossfaderVal] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundConfig, setSoundConfig] = useState({ kickEnabled: true, chordsEnabled: true });
  const [activeMoveId, setActiveMoveId] = useState('bishop_clockwise');
  
  // Real-time audio engine audio nodes refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const deckAGainRef = useRef(null);
  const deckBGainRef = useRef(null);
  const schedulerIntervalRef = useRef(null);
  const currentStepRef = useRef(0);
  
  // Synthesizer groups refs
  const synthARef = useRef(null);
  const synthBRef = useRef(null);

  // Deck Audio Buffers (for uploaded local files)
  const [deckAFile, setDeckAFile] = useState(null);
  const [deckBFile, setDeckBFile] = useState(null);
  const [deckABuffer, setDeckABuffer] = useState(null);
  const [deckBBuffer, setDeckBBuffer] = useState(null);
  
  // Running sound nodes refs (so we can stop or change rate on the fly)
  const deckASourceRef = useRef(null);
  const deckBSourceRef = useRef(null);

  // 3-Band EQ filter refs for Deck A
  const eqLowARef = useRef(null);
  const eqMidARef = useRef(null);
  const eqHighARef = useRef(null);

  // 3-Band EQ filter refs for Deck B
  const eqLowBRef = useRef(null);
  const eqMidBRef = useRef(null);
  const eqHighBRef = useRef(null);

  // EQ level states (ranges from -12dB to +6dB)
  const [eqA, setEqA] = useState({ low: 0, mid: 0, high: 0 });
  const [eqB, setEqB] = useState({ low: 0, mid: 0, high: 0 });

  // Pitch/Tempo factor controls
  const [deckAPitch, setDeckAPitch] = useState(1.0); // pitch multiplication factor
  const [deckBPitch, setDeckBPitch] = useState(1.0);

  // Calculate harmonic compatibility index
  const checkCompatibility = (keyA, keyB) => {
    if (keyA === keyB) {
      return { compatible: true, type: 'same', score: 10, label: 'The Pawn Hold (Safe Match)', colorClass: 'bg-emerald-500/10 text-emerald-300 border-spotifyGreen' };
    }

    const kA = CAMELOT_KEYS[keyA];
    const kB = CAMELOT_KEYS[keyB];

    if (!kA || !kB) {
      return { compatible: false, type: 'clash', score: 1.0, label: 'Invalid Keys', colorClass: 'bg-rose-500/10 text-rose-300' };
    }

    // Mood swap Rook Slide
    if (kA.num === kB.num && kA.letter !== kB.letter) {
      return { compatible: true, type: 'relative', score: 9.2, label: 'The Rook Slide (Relative Mood Swap)', colorClass: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/40' };
    }

    // Bishop modulation
    if (kA.letter === kB.letter) {
      const diff = Math.abs(kA.num - kB.num);
      if (diff === 1 || diff === 11) {
        return { compatible: true, type: 'step', score: 9.8, label: 'The Bishop Step (Harmonic Modulation)', colorClass: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/40' };
      }
      
      // Knight jump energy step
      if (diff === 2 || diff === 10) {
        return { compatible: true, type: 'energy', score: 8.5, label: "The Knight's Energy Jump", colorClass: 'bg-amber-500/10 text-amber-300 border-amber-500/40' };
      }

      // Castle shift subdominant
      if (diff === 7 || diff === 5) {
        return { compatible: true, type: 'subdominant', score: 8.8, label: 'The Castle Shift (Dominant Transition)', colorClass: 'bg-blue-500/10 text-blue-300 border-blue-500/40' };
      }
    }

    return { compatible: false, type: 'clash', score: 2.5, label: 'Dissonant Audio Clash Warning!', colorClass: 'bg-rose-500/10 text-rose-300 border-rose-600' };
  };

  const activeTransition = checkCompatibility(deckAKey, deckBKey);

  // Initialize Web Audio Engine
  const initAudioEngine = async () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;
      
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.8, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // Deck A routing chain: Source -> EQ Low -> EQ Mid -> EQ High -> Deck Gain -> Master
      const eqLowA = ctx.createBiquadFilter();
      eqLowA.type = 'lowshelf';
      eqLowA.frequency.value = 250;
      eqLowA.gain.value = 0;
      eqLowARef.current = eqLowA;

      const eqMidA = ctx.createBiquadFilter();
      eqMidA.type = 'peaking';
      eqMidA.frequency.value = 1000;
      eqMidA.Q.value = 1.0;
      eqMidA.gain.value = 0;
      eqMidARef.current = eqMidA;

      const eqHighA = ctx.createBiquadFilter();
      eqHighA.type = 'highshelf';
      eqHighA.frequency.value = 4000;
      eqHighA.gain.value = 0;
      eqHighARef.current = eqHighA;

      const deckAGain = ctx.createGain();
      deckAGain.gain.setValueAtTime(1.0, ctx.currentTime);
      
      eqLowA.connect(eqMidA);
      eqMidA.connect(eqHighA);
      eqHighA.connect(deckAGain);
      deckAGain.connect(masterGain);
      deckAGainRef.current = deckAGain;

      // Deck B routing chain: Source -> EQ Low -> EQ Mid -> EQ High -> Deck Gain -> Master
      const eqLowB = ctx.createBiquadFilter();
      eqLowB.type = 'lowshelf';
      eqLowB.frequency.value = 250;
      eqLowB.gain.value = 0;
      eqLowBRef.current = eqLowB;

      const eqMidB = ctx.createBiquadFilter();
      eqMidB.type = 'peaking';
      eqMidB.frequency.value = 1000;
      eqMidB.Q.value = 1.0;
      eqMidB.gain.value = 0;
      eqMidBRef.current = eqMidB;

      const eqHighB = ctx.createBiquadFilter();
      eqHighB.type = 'highshelf';
      eqHighB.frequency.value = 4000;
      eqHighB.gain.value = 0;
      eqHighBRef.current = eqHighB;

      const deckBGain = ctx.createGain();
      deckBGain.gain.setValueAtTime(0.0, ctx.currentTime); // start silent since crossfader is at 0
      
      eqLowB.connect(eqMidB);
      eqMidB.connect(eqHighB);
      eqHighB.connect(deckBGain);
      deckBGain.connect(masterGain);
      deckBGainRef.current = deckBGain;

      // Create Synths connected to the start of the EQ chains
      synthARef.current = createSynthGroup(ctx, eqLowA);
      synthBRef.current = createSynthGroup(ctx, eqLowB);

      // Start the sequencer loop
      runBeatScheduler(ctx);

      // Synchronize initial crossfader position
      const gainA = (100 - crossfaderVal) / 100;
      const gainB = crossfaderVal / 100;
      deckAGain.gain.setValueAtTime(gainA, ctx.currentTime);
      deckBGain.gain.setValueAtTime(gainB, ctx.currentTime);

      // Synchronize frequencies
      setChordFreqs(synthARef.current, CAMELOT_KEYS[deckAKey], ctx);
      setChordFreqs(synthBRef.current, CAMELOT_KEYS[deckBKey], ctx);

    } catch (err) {
      console.error("Audio engine failed to start:", err);
    }
  };

  const disableAudioEngine = () => {
    if (!audioCtxRef.current) return;
    
    clearInterval(schedulerIntervalRef.current);
    
    // Stop local source nodes if playing
    if (deckASourceRef.current) {
      try { deckASourceRef.current.stop(); } catch (e) {}
      deckASourceRef.current = null;
    }
    if (deckBSourceRef.current) {
      try { deckBSourceRef.current.stop(); } catch (e) {}
      deckBSourceRef.current = null;
    }

    // Close context
    audioCtxRef.current.close();
    audioCtxRef.current = null;
    setIsPlaying(false);
  };

  // Synthesizer Node Group Creator
  const createSynthGroup = (ctx, destinationNode) => {
    const root = ctx.createOscillator();
    const third = ctx.createOscillator();
    const fifth = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();

    root.type = 'sawtooth';
    third.type = 'triangle';
    fifth.type = 'triangle';

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime); // Warm filter frequency

    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

    root.connect(filter);
    third.connect(filter);
    fifth.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destinationNode);

    root.start();
    third.start();
    fifth.start();

    return { root, third, fifth, filter, gainNode };
  };

  const setChordFreqs = (synthGroup, keyData, ctx) => {
    if (!synthGroup || !keyData) return;

    const rootFreq = keyData.freq;
    let thirdFreq, fifthFreq;

    if (keyData.chordType === 'minor') {
      thirdFreq = rootFreq * 1.1892; // Minor Third
      fifthFreq = rootFreq * 1.4983; // Perfect Fifth
    } else {
      thirdFreq = rootFreq * 1.2599; // Major Third
      fifthFreq = rootFreq * 1.4983; // Perfect Fifth
    }

    const now = ctx.currentTime;
    synthGroup.root.frequency.exponentialRampToValueAtTime(rootFreq, now + 0.15);
    synthGroup.third.frequency.exponentialRampToValueAtTime(thirdFreq, now + 0.15);
    synthGroup.fifth.frequency.exponentialRampToValueAtTime(fifthFreq, now + 0.15);
  };

  // Update synth frequencies when deck keys change
  useEffect(() => {
    if (audioCtxRef.current) {
      setChordFreqs(synthARef.current, CAMELOT_KEYS[deckAKey], audioCtxRef.current);
      setChordFreqs(synthBRef.current, CAMELOT_KEYS[deckBKey], audioCtxRef.current);
    }
  }, [deckAKey, deckBKey]);

  // Sequencer loop
  const runBeatScheduler = (ctx) => {
    // interval calculated dynamically based on current BPM state
    let stepTime = 60 / bpm / 2; // Eighth notes
    
    // Clear existing
    if (schedulerIntervalRef.current) {
      clearInterval(schedulerIntervalRef.current);
    }

    schedulerIntervalRef.current = setInterval(() => {
      if (!isPlaying || !audioCtxRef.current) return;

      const timeNow = ctx.currentTime;

      if (currentStepRef.current % 2 === 0) {
        if (soundConfig.kickEnabled) {
          playSynthesizedKick(ctx, timeNow);
        }
        
        // Emulate compression pump (ducking)
        if (soundConfig.chordsEnabled) {
          if (synthARef.current) applySidechainEnvelope(synthARef.current, timeNow);
          if (synthBRef.current) applySidechainEnvelope(synthBRef.current, timeNow);
        }
      }

      currentStepRef.current = (currentStepRef.current + 1) % 8;
    }, stepTime * 1000);
  };

  // Restarts scheduler when BPM changes
  useEffect(() => {
    if (audioCtxRef.current && isPlaying) {
      runBeatScheduler(audioCtxRef.current);
    }
  }, [bpm, isPlaying]);

  const playSynthesizedKick = (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(masterGainRef.current);

    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 0.08);

    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.start(time);
    osc.stop(time + 0.2);
  };

  const applySidechainEnvelope = (synthGroup, time) => {
    const baseGain = 0.08;
    synthGroup.gainNode.gain.cancelScheduledValues(time);
    synthGroup.gainNode.gain.setValueAtTime(baseGain, time);
    synthGroup.gainNode.gain.exponentialRampToValueAtTime(0.005, time + 0.03); // Duck compression peak
    synthGroup.gainNode.gain.exponentialRampToValueAtTime(baseGain, time + 0.18); // Recovery
  };

  // Decode local audio file into buffer
  const loadLocalAudioFile = async (deck, file) => {
    if (!audioCtxRef.current) {
      await initAudioEngine();
    }
    const ctx = audioCtxRef.current;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result;
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        
        if (deck === 'A') {
          setDeckAFile(file);
          setDeckABuffer(audioBuffer);
          setDeckATrack({
            id: 'local-a',
            name: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Local File',
            bpm: bpm, // default lock to current session bpm
            camelotCode: deckAKey
          });

          // Mute synth since we now have file audio
          if (synthARef.current) {
            synthARef.current.gainNode.gain.value = 0;
          }
          
          if (isPlaying) {
            startDeckBuffer('A', audioBuffer);
          }
        } else {
          setDeckBFile(file);
          setDeckBBuffer(audioBuffer);
          setDeckBTrack({
            id: 'local-b',
            name: file.name.replace(/\.[^/.]+$/, ""),
            artist: 'Local File',
            bpm: bpm,
            camelotCode: deckBKey
          });

          // Mute synth
          if (synthBRef.current) {
            synthBRef.current.gainNode.gain.value = 0;
          }

          if (isPlaying) {
            startDeckBuffer('B', audioBuffer);
          }
        }
      } catch (err) {
        console.error("Error decoding audio file:", err);
        alert("Failed to decode audio file. Make sure it's a valid audio format (MP3/WAV/AAC).");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Play decoded buffer
  const startDeckBuffer = (deck, buffer) => {
    if (!audioCtxRef.current || !buffer) return;
    const ctx = audioCtxRef.current;

    // Stop existing source node
    if (deck === 'A') {
      if (deckASourceRef.current) {
        try { deckASourceRef.current.stop(); } catch (e) {}
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = deckAPitch;
      // Connect to Deck A's filter chain
      source.connect(eqLowARef.current);
      source.start(0);
      deckASourceRef.current = source;
    } else {
      if (deckBSourceRef.current) {
        try { deckBSourceRef.current.stop(); } catch (e) {}
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = deckBPitch;
      // Connect to Deck B's filter chain
      source.connect(eqLowBRef.current);
      source.start(0);
      deckBSourceRef.current = source;
    }
  };

  const stopDeckBuffer = (deck) => {
    if (deck === 'A' && deckASourceRef.current) {
      try { deckASourceRef.current.stop(); } catch (e) {}
      deckASourceRef.current = null;
    } else if (deck === 'B' && deckBSourceRef.current) {
      try { deckBSourceRef.current.stop(); } catch (e) {}
      deckBSourceRef.current = null;
    }
  };

  // EQ adjustments (value range -12 to 6, mapped to filter gains)
  const adjustEQ = (deck, band, value) => {
    const gainVal = Number(value); // -12 to +6 dB
    if (deck === 'A') {
      setEqA(prev => ({ ...prev, [band]: gainVal }));
      if (band === 'low' && eqLowARef.current) eqLowARef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
      if (band === 'mid' && eqMidARef.current) eqMidARef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
      if (band === 'high' && eqHighARef.current) eqHighARef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
    } else {
      setEqB(prev => ({ ...prev, [band]: gainVal }));
      if (band === 'low' && eqLowBRef.current) eqLowBRef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
      if (band === 'mid' && eqMidBRef.current) eqMidBRef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
      if (band === 'high' && eqHighBRef.current) eqHighBRef.current.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
    }
  };

  // Pitch/Tempo adjustments (value range 0.90 to 1.10, i.e. +-10% tempo)
  const adjustPitch = (deck, factor) => {
    const num = Number(factor);
    if (deck === 'A') {
      setDeckAPitch(num);
      if (deckASourceRef.current) {
        deckASourceRef.current.playbackRate.setValueAtTime(num, audioCtxRef.current.currentTime);
      }
    } else {
      setDeckBPitch(num);
      if (deckBSourceRef.current) {
        deckBSourceRef.current.playbackRate.setValueAtTime(num, audioCtxRef.current.currentTime);
      }
    }
  };

  // Global actions
  const togglePlayState = async () => {
    if (!audioCtxRef.current) {
      await initAudioEngine();
    }

    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (nextPlay) {
      // Resume context if suspended (browser security autoplays)
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }

      // Unmute synths if no file loaded
      if (!deckABuffer && synthARef.current) synthARef.current.gainNode.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
      if (!deckBBuffer && synthBRef.current) synthBRef.current.gainNode.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);

      // Start local buffers
      if (deckABuffer) startDeckBuffer('A', deckABuffer);
      if (deckBBuffer) startDeckBuffer('B', deckBBuffer);
    } else {
      // Stop local buffers
      stopDeckBuffer('A');
      stopDeckBuffer('B');

      // Mute synths
      if (synthARef.current) synthARef.current.gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (synthBRef.current) synthBRef.current.gainNode.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    }
  };

  const triggerCrashCymbal = async () => {
    if (!audioCtxRef.current) {
      await initAudioEngine();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6500, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGainRef.current);

    noiseNode.start();
  };

  const updateBpm = (val) => {
    const cleanedVal = Math.max(115, Math.min(145, parseInt(val) || 126));
    setBpm(cleanedVal);
  };

  const onCrossfaderMove = (value) => {
    const crossVal = parseInt(value);
    setCrossfaderVal(crossVal);
    
    if (audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      const gainA = (100 - crossVal) / 100;
      const gainB = crossVal / 100;

      deckAGainRef.current.gain.linearRampToValueAtTime(gainA, now + 0.05);
      deckBGainRef.current.gain.linearRampToValueAtTime(gainB, now + 0.05);
    }
  };

  const resetCrossfaderCenter = () => {
    onCrossfaderMove(50);
  };

  const toggleDrumPart = (part) => {
    setSoundConfig(prev => {
      const updated = { ...prev, [part]: !prev[part] };
      
      // If we are turning off chords, mute synths
      if (part === 'chords' && audioCtxRef.current) {
        const gainVal = updated.chordsEnabled ? 0.06 : 0;
        if (!deckABuffer && synthARef.current) synthARef.current.gainNode.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
        if (!deckBBuffer && synthBRef.current) synthBRef.current.gainNode.gain.setValueAtTime(gainVal, audioCtxRef.current.currentTime);
      }
      return updated;
    });
  };

  const selectKey = (key, deck) => {
    if (deck === 'A') {
      setDeckAKey(key);
      setDeckATrack(prev => ({
        ...prev,
        camelotCode: key
      }));
    } else {
      setDeckBKey(key);
      setDeckBTrack(prev => ({
        ...prev,
        camelotCode: key
      }));
    }
    setActiveMoveId(null); // clear playbook move highlight since user clicked key directly
  };

  const applyChessPlaybookMove = (moveId) => {
    setActiveMoveId(moveId);
    const move = CHESS_MOVE_TYPES[moveId];
    const targetKey = move.calculateTarget(deckAKey);
    selectKey(targetKey, 'B');

    if (audioCtxRef.current && !isPlaying) {
      togglePlayState();
    }
  };

  // Eject local file and restore synth core playback
  const ejectDeck = (deck) => {
    if (deck === 'A') {
      stopDeckBuffer('A');
      setDeckAFile(null);
      setDeckABuffer(null);
      setDeckATrack({ id: 'acid-loop', name: 'Deep Hypnotic Acid', artist: 'Synthesizer Core', bpm: bpm, camelotCode: deckAKey });
      setDeckAPitch(1.0);
      setEqA({ low: 0, mid: 0, high: 0 });
      if (eqLowARef.current) eqLowARef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (eqMidARef.current) eqMidARef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (eqHighARef.current) eqHighARef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (isPlaying && synthARef.current && soundConfig.chordsEnabled) {
        synthARef.current.gainNode.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
      }
    } else {
      stopDeckBuffer('B');
      setDeckBFile(null);
      setDeckBBuffer(null);
      setDeckBTrack({ id: 'chords-loop', name: 'Industrial Chords', artist: 'Synthesizer Core', bpm: bpm, camelotCode: deckBKey });
      setDeckBPitch(1.0);
      setEqB({ low: 0, mid: 0, high: 0 });
      if (eqLowBRef.current) eqLowBRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (eqMidBRef.current) eqMidBRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (eqHighBRef.current) eqHighBRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      if (isPlaying && synthBRef.current && soundConfig.chordsEnabled) {
        synthBRef.current.gainNode.gain.setValueAtTime(0.06, audioCtxRef.current.currentTime);
      }
    }
  };

  return (
    <DJContext.Provider value={{
      selectorTarget,
      setSelectorTarget,
      deckAKey,
      deckBKey,
      deckATrack,
      deckBTrack,
      setDeckATrack,
      setDeckBTrack,
      bpm,
      crossfaderVal,
      isPlaying,
      soundConfig,
      activeMoveId,
      activeTransition,
      eqA,
      eqB,
      deckAPitch,
      deckBPitch,
      deckAFile,
      deckBFile,
      initAudioEngine,
      disableAudioEngine,
      togglePlayState,
      triggerCrashCymbal,
      updateBpm,
      onCrossfaderMove,
      resetCrossfaderCenter,
      toggleDrumPart,
      selectKey,
      applyChessPlaybookMove,
      loadLocalAudioFile,
      adjustEQ,
      adjustPitch,
      ejectDeck,
      isAudioInitialized: !!audioCtxRef.current
    }}>
      {children}
    </DJContext.Provider>
  );
}

export function useDJ() {
  return useContext(DJContext);
}
