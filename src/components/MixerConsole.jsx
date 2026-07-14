import React, { useEffect, useRef, useState } from 'react';
import { useDJ } from '../context/DJContext';

export default function MixerConsole() {
  const {
    deckATrack,
    deckBTrack,
    deckAKey,
    deckBKey,
    bpm,
    crossfaderVal,
    isPlaying,
    soundConfig,
    activeTransition,
    eqA,
    eqB,
    deckAPitch,
    deckBPitch,
    deckAFile,
    deckBFile,
    isAudioInitialized,
    initAudioEngine,
    togglePlayState,
    triggerCrashCymbal,
    updateBpm,
    onCrossfaderMove,
    resetCrossfaderCenter,
    toggleDrumPart,
    loadLocalAudioFile,
    adjustEQ,
    adjustPitch,
    ejectDeck
  } = useDJ();

  const vizARef = useRef(null);
  const vizBRef = useRef(null);

  // File inputs refs
  const fileAInputRef = useRef(null);
  const fileBInputRef = useRef(null);

  // Drag and drop hover states
  const [dragOverA, setDragOverA] = useState(false);
  const [dragOverB, setDragOverB] = useState(false);

  // Animate mock visualizers when playing
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        // Deck A Visualizer bars
        if (vizARef.current && crossfaderVal < 95) {
          const bars = vizARef.current.children;
          for (let i = 0; i < bars.length; i++) {
            const h = Math.floor(Math.random() * 36) + 4;
            bars[i].style.height = `${h}px`;
            bars[i].style.opacity = '1';
          }
        }
        // Deck B Visualizer bars
        if (vizBRef.current && crossfaderVal > 5) {
          const bars = vizBRef.current.children;
          for (let i = 0; i < bars.length; i++) {
            const h = Math.floor(Math.random() * 36) + 4;
            bars[i].style.height = `${h}px`;
            bars[i].style.opacity = '1';
          }
        }
      }, 100);
    } else {
      // Reset heights
      if (vizARef.current) {
        Array.from(vizARef.current.children).forEach(bar => {
          bar.style.height = '4px';
          bar.style.opacity = '0.3';
        });
      }
      if (vizBRef.current) {
        Array.from(vizBRef.current.children).forEach(bar => {
          bar.style.height = '4px';
          bar.style.opacity = '0.3';
        });
      }
    }

    return () => clearInterval(interval);
  }, [isPlaying, crossfaderVal]);

  // Handle local file selection
  const handleFileChange = (deck, e) => {
    const file = e.target.files?.[0];
    if (file) {
      loadLocalAudioFile(deck, file);
    }
  };

  const handleDragOver = (e, deck) => {
    e.preventDefault();
    if (deck === 'A') setDragOverA(true);
    else setDragOverB(true);
  };

  const handleDragLeave = (deck) => {
    if (deck === 'A') setDragOverA(false);
    else setDragOverB(false);
  };

  const handleDrop = (e, deck) => {
    e.preventDefault();
    if (deck === 'A') setDragOverA(false);
    else setDragOverB(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      loadLocalAudioFile(deck, file);
    } else {
      alert("Please drop a valid audio file (MP3/WAV/etc).");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Visual Mixing Console & Soundboard */}
      <div className="bg-cardBg border border-borderBg rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-spotifyGreen/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-borderBg pb-4 mb-5">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-sliders text-spotifyGreen"></i>
            <h2 className="text-base font-bold tracking-tight text-white uppercase font-heading">
              Harmonic Control Console
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-semibold">BPM:</span>
              <input
                type="number"
                min="115"
                max="145"
                value={bpm}
                onChange={(e) => updateBpm(e.target.value)}
                className="w-16 bg-spotifyBlack border border-borderBg rounded-lg px-2 py-0.5 text-xs text-center text-spotifyGreen font-bold focus:outline-none focus:border-spotifyGreen"
              />
            </div>
          </div>
        </div>

        {/* Deck Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
          
          {/* DECK A (Outgoing Track) */}
          <div
            onDragOver={(e) => handleDragOver(e, 'A')}
            onDragLeave={() => handleDragLeave('A')}
            onDrop={(e) => handleDrop(e, 'A')}
            className={`bg-spotifyBlack border rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
              crossfaderVal < 45 ? 'border-cyan-500/80 shadow-lg shadow-cyan-500/5' : 'border-cyan-500/20'
            } ${dragOverA ? 'border-dashed border-cyan-400 bg-cyan-950/20' : ''}`}
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase">DECK A (Outgoing)</span>
              <span className="text-xs bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/20">
                {deckAKey}
              </span>
            </div>

            {/* Track Info */}
            <div className="flex gap-3 items-center min-h-[50px] mb-3">
              {deckATrack.albumArt ? (
                <img src={deckATrack.albumArt} alt="album art" className="w-12 h-12 rounded object-cover border border-borderBg" />
              ) : (
                <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-zinc-600 border border-borderBg">
                  <i className="fa-solid fa-music"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{deckATrack.name}</h3>
                <p className="text-xs text-zinc-400 truncate">{deckATrack.artist}</p>
                {deckAFile && (
                  <button onClick={() => ejectDeck('A')} className="text-[10px] text-rose-400 hover:underline mt-1 block">
                    <i className="fa-solid fa-trash-can mr-1"></i> Eject File
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop Overlay/Helper if no file loaded */}
            {!deckAFile && (
              <div
                onClick={() => fileAInputRef.current?.click()}
                className="border border-dashed border-borderBg hover:border-cyan-500/50 rounded-lg p-2.5 mb-3 text-center cursor-pointer transition bg-cardBg/30 text-[10px] text-zinc-500"
              >
                <i className="fa-solid fa-cloud-arrow-up text-cyan-400/70 mb-1 text-sm block"></i>
                <span>Drag & Drop local MP3 here to pitch/mix</span>
                <input
                  ref={fileAInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange('A', e)}
                  className="hidden"
                />
              </div>
            )}

            {/* EQ controls for local file */}
            {deckAFile && (
              <div className="space-y-2 mb-4 bg-cardBg/50 p-2.5 rounded-lg border border-borderBg/60 text-xs">
                <div className="flex justify-between font-bold text-[9px] uppercase tracking-wider text-cyan-400 mb-1.5 border-b border-borderBg/30 pb-1">
                  <span>3-Band EQ Control</span>
                  <span>Deck A</span>
                </div>
                
                {/* Low band */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">Low</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    value={eqA.low}
                    onChange={(e) => adjustEQ('A', 'low', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">{eqA.low > 0 ? `+${eqA.low}` : eqA.low}</span>
                </div>

                {/* Mid band */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">Mid</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    value={eqA.mid}
                    onChange={(e) => adjustEQ('A', 'mid', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">{eqA.mid > 0 ? `+${eqA.mid}` : eqA.mid}</span>
                </div>

                {/* High band */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">High</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    value={eqA.high}
                    onChange={(e) => adjustEQ('A', 'high', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">{eqA.high > 0 ? `+${eqA.high}` : eqA.high}</span>
                </div>

                {/* Pitch control */}
                <div className="flex items-center gap-2 pt-1.5 border-t border-borderBg/30 mt-1.5">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">Tempo</span>
                  <input
                    type="range"
                    min="0.9"
                    max="1.1"
                    step="0.005"
                    value={deckAPitch}
                    onChange={(e) => adjustPitch('A', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">
                    {Math.round((deckAPitch - 1) * 100) > 0 ? `+${Math.round((deckAPitch - 1) * 100)}` : Math.round((deckAPitch - 1) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Visualizer Sim A */}
            <div ref={vizARef} className="flex items-end gap-0.5 h-10 border-t border-borderBg/40 pt-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-full bg-cyan-500/30 rounded-t h-1 transition-all duration-100"></div>
              ))}
            </div>
          </div>

          {/* DECK B (Incoming Track) */}
          <div
            onDragOver={(e) => handleDragOver(e, 'B')}
            onDragLeave={() => handleDragLeave('B')}
            onDrop={(e) => handleDrop(e, 'B')}
            className={`bg-spotifyBlack border rounded-xl p-4 transition-all duration-300 relative overflow-hidden ${
              crossfaderVal > 55 ? 'border-fuchsia-500/80 shadow-lg shadow-fuchsia-500/5' : 'border-fuchsia-500/20'
            } ${dragOverB ? 'border-dashed border-fuchsia-400 bg-fuchsia-950/20' : ''}`}
          >
            <div className="absolute top-0 right-0 w-1.5 h-full bg-fuchsia-500"></div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-fuchsia-400 tracking-wider uppercase">DECK B (Incoming)</span>
              <span className="text-xs bg-fuchsia-500/10 text-fuchsia-300 px-2 py-0.5 rounded font-bold border border-fuchsia-500/20">
                {deckBKey}
              </span>
            </div>

            {/* Track Info */}
            <div className="flex gap-3 items-center min-h-[50px] mb-3">
              {deckBTrack.albumArt ? (
                <img src={deckBTrack.albumArt} alt="album art" className="w-12 h-12 rounded object-cover border border-borderBg" />
              ) : (
                <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-zinc-600 border border-borderBg">
                  <i className="fa-solid fa-music"></i>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{deckBTrack.name}</h3>
                <p className="text-xs text-zinc-400 truncate">{deckBTrack.artist}</p>
                {deckBFile && (
                  <button onClick={() => ejectDeck('B')} className="text-[10px] text-rose-400 hover:underline mt-1 block">
                    <i className="fa-solid fa-trash-can mr-1"></i> Eject File
                  </button>
                )}
              </div>
            </div>

            {/* Drag & Drop Overlay/Helper if no file loaded */}
            {!deckBFile && (
              <div
                onClick={() => fileBInputRef.current?.click()}
                className="border border-dashed border-borderBg hover:border-fuchsia-500/50 rounded-lg p-2.5 mb-3 text-center cursor-pointer transition bg-cardBg/30 text-[10px] text-zinc-500"
              >
                <i className="fa-solid fa-cloud-arrow-up text-fuchsia-400/70 mb-1 text-sm block"></i>
                <span>Drag & Drop local MP3 here to pitch/mix</span>
                <input
                  ref={fileBInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange('B', e)}
                  className="hidden"
                />
              </div>
            )}

            {/* EQ controls for local file */}
            {deckBFile && (
              <div className="space-y-2 mb-4 bg-cardBg/50 p-2.5 rounded-lg border border-borderBg/60 text-xs">
                <div className="flex justify-between font-bold text-[9px] uppercase tracking-wider text-fuchsia-400 mb-1.5 border-b border-borderBg/30 pb-1">
                  <span>3-Band EQ Control</span>
                  <span>Deck B</span>
                </div>
                
                {/* Low band */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">Low</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    value={eqB.low}
                    onChange={(e) => adjustEQ('B', 'low', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">{eqB.low > 0 ? `+${eqB.low}` : eqB.low}</span>
                </div>

                {/* Mid band */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">Mid</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    value={eqB.mid}
                    onChange={(e) => adjustEQ('B', 'mid', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">{eqB.mid > 0 ? `+${eqB.mid}` : eqB.mid}</span>
                </div>

                {/* High band */}
                <div className="flex items-center gap-2">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">High</span>
                  <input
                    type="range"
                    min="-12"
                    max="6"
                    value={eqB.high}
                    onChange={(e) => adjustEQ('B', 'high', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">{eqB.high > 0 ? `+${eqB.high}` : eqB.high}</span>
                </div>

                {/* Pitch control */}
                <div className="flex items-center gap-2 pt-1.5 border-t border-borderBg/30 mt-1.5">
                  <span className="w-8 text-[9px] text-zinc-500 uppercase font-semibold">Tempo</span>
                  <input
                    type="range"
                    min="0.9"
                    max="1.1"
                    step="0.005"
                    value={deckBPitch}
                    onChange={(e) => adjustPitch('B', e.target.value)}
                    className="flex-1 h-1.5 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                  />
                  <span className="w-6 text-right text-[10px] font-mono text-zinc-400">
                    {Math.round((deckBPitch - 1) * 100) > 0 ? `+${Math.round((deckBPitch - 1) * 100)}` : Math.round((deckBPitch - 1) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Visualizer Sim B */}
            <div ref={vizBRef} className="flex items-end gap-0.5 h-10 border-t border-borderBg/40 pt-2">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-full bg-fuchsia-500/30 rounded-t h-1 transition-all duration-100"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Central Controls */}
        <div className="flex flex-col gap-4 bg-spotifyBlack p-4 rounded-xl border border-borderBg mb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayState}
                className={`h-10 px-5 font-bold rounded-full flex items-center gap-2 shadow-lg transition duration-200 ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-spotifyGreen hover:bg-emerald-500 text-spotifyBlack shadow-spotifyGreen/20'
                }`}
              >
                <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                <span>{isPlaying ? 'Stop Mix Audio Loop' : 'Play Mix Audio Loop'}</span>
              </button>
              
              <button
                onClick={triggerCrashCymbal}
                className="h-10 w-10 bg-cardBg hover:bg-zinc-800 border border-borderBg rounded-full flex items-center justify-center text-zinc-300 hover:text-white transition duration-200"
                title="Simulate Sweep Drop (Reverb Wave)"
              >
                <i className="fa-solid fa-wind text-sm"></i>
              </button>
            </div>

            {/* Synth Engine Toggles */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => toggleDrumPart('kick')}
                className={`px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 ${
                  soundConfig.kickEnabled
                    ? 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30'
                    : 'bg-spotifyBlack text-zinc-500 border border-borderBg'
                }`}
              >
                <span className={`h-2 w-2 rounded-full inline-block ${soundConfig.kickEnabled ? 'bg-cyan-400' : 'bg-zinc-500'}`}></span>
                4/4 House Kick
              </button>
              <button
                onClick={() => toggleDrumPart('chords')}
                className={`px-3 py-1.5 rounded-full font-semibold transition flex items-center gap-1.5 ${
                  soundConfig.chordsEnabled
                    ? 'bg-spotifyGreen/10 text-spotifyGreen border border-spotifyGreen/30'
                    : 'bg-spotifyBlack text-zinc-500 border border-borderBg'
                }`}
              >
                <span className={`h-2 w-2 rounded-full inline-block ${soundConfig.chordsEnabled ? 'bg-spotifyGreen' : 'bg-zinc-500'}`}></span>
                Synthesizer
              </button>
            </div>
          </div>

          {/* Crossfader */}
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs font-bold tracking-wider text-zinc-500 uppercase mb-2">
              <span>Deck A (100% Vol)</span>
              <span className="text-zinc-400 font-semibold">Active Crossfader Blend</span>
              <span>Deck B (100% Vol)</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={crossfaderVal}
                onInput={(e) => onCrossfaderMove(e.target.value)}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-spotifyGreen"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2">
              <span>Slide to smoothly crossfade frequencies from Deck A to Deck B</span>
              <button onClick={resetCrossfaderCenter} className="text-spotifyGreen hover:text-emerald-400 font-bold">
                Center (50% / 50%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transition Inspector */}
      <div className="bg-cardBg border border-borderBg rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 border-b border-borderBg pb-3 mb-4">
          <i className="fa-solid fa-chart-bar text-spotifyGreen"></i>
          <h2 className="text-base font-bold text-white uppercase tracking-tight font-heading">
            Active Transition Inspector
          </h2>
        </div>

        {/* Score Card */}
        <div className="flex flex-col sm:flex-row gap-5 items-center bg-spotifyBlack/50 border border-borderBg p-4 rounded-xl mb-4">
          <div
            className={`relative flex-shrink-0 w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${
              activeTransition.score >= 9 ? 'border-spotifyGreen animate-pulse' : activeTransition.score >= 7 ? 'border-cyan-500' : 'border-rose-600'
            }`}
          >
            <span className="text-2xl font-bold font-heading text-white">{activeTransition.score}/10</span>
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">Harmony</span>
          </div>

          <div className="flex-grow">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{activeTransition.label}</h4>
              <span
                className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                  activeTransition.score >= 9
                    ? 'bg-emerald-500/10 text-spotifyGreen border border-spotifyGreen/20'
                    : activeTransition.score >= 7
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {activeTransition.score >= 9 ? 'OPTIMAL' : activeTransition.score >= 7 ? 'COMPATIBLE' : 'CLASH DETECTED'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              {activeTransition.type === 'same' &&
                `You are executing the "Pawn Hold" strategy (${deckAKey} → ${deckBKey}). This keeps the mix inside the identical musical scale for ultra-long deep house transitions.`}
              {activeTransition.type === 'step' &&
                `You are playing the "Bishop Step" modulation (${deckAKey} → ${deckBKey}). This transitions the tracks into closely related subdominant frequencies.`}
              {activeTransition.type === 'relative' &&
                `You are executing the "Rook Mood Slide" (${deckAKey} → ${deckBKey}). This shifts the scale mode from Minor to Major without altering any note signatures.`}
              {activeTransition.type === 'energy' &&
                `You are executing the "Knight's Energy Jump" (${deckAKey} → ${deckBKey}). This bypasses the immediate step rules to boost room energy.`}
              {activeTransition.type === 'subdominant' &&
                `You are executing the "Castle Shift" (${deckAKey} → ${deckBKey}). This modulates the track forward by a fifth interval (+7 clock positions).`}
              {activeTransition.type === 'clash' &&
                `Warning! Keys ${deckAKey} and ${deckBKey} represent an illegal chess move on the wheel. There are very few overlapping notes between these scales.`}
            </p>
          </div>
        </div>

        {/* Warning Banner if audio engine not initialized */}
        {!isAudioInitialized && (
          <div className="mb-4 bg-spotifyGreen/10 border border-spotifyGreen/20 p-3 rounded-xl flex items-start gap-3">
            <i className="fa-solid fa-triangle-exclamation text-spotifyGreen mt-0.5"></i>
            <div className="text-xs">
              <span className="font-bold text-spotifyGreen block">Virtual Synthesizer Off</span>
              Tap the{' '}
              <span className="font-bold underline text-emerald-300 cursor-pointer animate-pulse" onClick={initAudioEngine}>
                Play Mix Audio Loop
              </span>{' '}
              button or connect the audio engine to listen to the harmonic blend in real-time.
            </div>
          </div>
        )}

        {/* DJ Pro Tips */}
        <div className="rounded-xl border border-borderBg bg-spotifyBlack/40 p-4 mb-4">
          <h3 className="text-xs font-bold tracking-wider text-spotifyGreen uppercase mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-circle-info"></i> Pro House & Techno DJ Tactics
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {activeTransition.type === 'same' &&
              'Perfect for subterranean house & hypnosis-inducing minimal techno tracks. You can loop basslines and synth lines endlessly without any melody clashing.'}
            {activeTransition.type === 'step' &&
              'This is the gold standard of professional club mixes. It introduces a subtle, uplifting emotional rise (clockwise) or chill release (counter-clockwise) during the crossfade.'}
            {activeTransition.type === 'relative' &&
              'Excellent for transitioning from dark instrumental techno to melodic major vocal tracks. The vocals will sound perfectly tuned without clashing over the incoming bass line.'}
            {activeTransition.type === 'energy' &&
              "Never crossfade these tracks slowly! It will sound muddy. Instead, build up tension on Deck A, then slam-drop Deck B's drop on the first beat of the chorus for a massive burst of energy."}
            {activeTransition.type === 'subdominant' &&
              "Safe to transition, but watch your high mids and lead synthesizers. Make sure to lower Deck A's middle-frequencies on the mixer EQ to prevent acoustic clipping."}
            {activeTransition.type === 'clash' &&
              "Caution: This mix will clash. Perform a clean transition using a high-pass filter on Deck A, or 'echo out' the outgoing song's reverb rather than overlapping active melodies."}
          </p>
        </div>

        {/* Spotify Playlist integration tips */}
        <div className="rounded-xl border border-dashed border-borderBg bg-spotifyBlack/80 p-4">
          <h3 className="text-xs font-bold tracking-wider text-spotifyGreen uppercase mb-2 flex items-center gap-1.5">
            <i className="fa-brands fa-spotify"></i> Spotify Crossfade Implementation
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            To construct gapless DJ sets on Spotify, go to <strong>Spotify Settings &gt; Playback</strong>, toggle <strong>Crossfade</strong> ON, and configure the bar to <strong>8 to 12 seconds</strong>. Organize your playlist using <strong>The Bishop Step (±1)</strong> or <strong>The Rook Slide</strong> key orders. Spotify will automatically overlay the outro/intro elements seamlessly, mimicking a club DJ in the background!
          </p>
        </div>
      </div>
    </div>
  );
}
