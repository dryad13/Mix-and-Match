import React from 'react';
import { useDJ, CAMELOT_KEYS, CHESS_MOVE_TYPES } from '../context/DJContext';

const wheelCenter = 225;
const radiusA = 100; // Center radius for Inner (Minor A) ring
const radiusB = 170; // Center radius for Outer (Major B) ring

export default function CamelotWheel() {
  const {
    selectorTarget,
    setSelectorTarget,
    deckAKey,
    deckBKey,
    activeMoveId,
    selectKey,
    applyChessPlaybookMove,
  } = useDJ();

  // Maps to the exact geometric center of each Camelot sector slice
  const getKeyCoordinates = (key) => {
    const info = CAMELOT_KEYS[key];
    if (!info) return { x: wheelCenter, y: wheelCenter };
    
    const sliceIndex = info.num; // 1 to 12
    const radius = info.letter === 'A' ? radiusA : radiusB;
    
    // 12 o'clock represents sliceIndex 1. Slices are spaced 30 degrees apart.
    // Angle offset of -90 degrees lines up 1A/1B perfectly vertically at the top.
    const angleOffset = -90;
    const sliceAngle = angleOffset + (sliceIndex - 1) * 30; // Center of the slice
    const angleRad = (sliceAngle * Math.PI) / 180;

    return {
      x: wheelCenter + radius * Math.cos(angleRad),
      y: wheelCenter + radius * Math.sin(angleRad),
    };
  };

  const getSvgRingPath = (cx, cy, r1, r2, startAngle, endAngle) => {
    const x1_out = cx + r2 * Math.cos(startAngle);
    const y1_out = cy + r2 * Math.sin(startAngle);
    const x2_out = cx + r2 * Math.cos(endAngle);
    const y2_out = cy + r2 * Math.sin(endAngle);

    const x1_in = cx + r1 * Math.cos(startAngle);
    const y1_in = cy + r1 * Math.sin(startAngle);
    const x2_in = cx + r1 * Math.cos(endAngle);
    const y2_in = cy + r1 * Math.sin(endAngle);

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return `M ${x1_out} ${y1_out} A ${r2} ${r2} 0 ${largeArc} 1 ${x2_out} ${y2_out} L ${x2_in} ${y2_in} A ${r1} ${r1} 0 ${largeArc} 0 ${x1_in} ${y1_in} Z`;
  };

  // Helper to determine compatibility outline of a specific slice
  const checkCompatibility = (keyA, keyB) => {
    if (keyA === keyB) return { compatible: true, type: 'same' };
    const kA = CAMELOT_KEYS[keyA];
    const kB = CAMELOT_KEYS[keyB];
    if (!kA || !kB) return { compatible: false };

    if (kA.num === kB.num && kA.letter !== kB.letter) return { compatible: true, type: 'relative' };
    if (kA.letter === kB.letter) {
      const diff = Math.abs(kA.num - kB.num);
      if (diff === 1 || diff === 11) return { compatible: true, type: 'step' };
      if (diff === 2 || diff === 10) return { compatible: true, type: 'energy' };
      if (diff === 7 || diff === 5) return { compatible: true, type: 'subdominant' };
    }
    return { compatible: false };
  };

  const onWheelSliceClick = (key) => {
    selectKey(key, selectorTarget);
    // Swap selector target to help user plan the next deck easily
    setSelectorTarget(selectorTarget === 'A' ? 'B' : 'A');
  };

  // Build the wheel segments
  const renderSlices = () => {
    const slices = [];
    const angleOffset = -90; // 12 o'clock setup

    for (let i = 1; i <= 12; i++) {
      const startAngle = ((angleOffset + (i - 1) * 30 - 15) * Math.PI) / 180;
      const endAngle = ((angleOffset + i * 30 - 15) * Math.PI) / 180;
      const textAngle = startAngle + (endAngle - startAngle) / 2;

      // Inner Minor (A)
      const tagA = `${i}A`;
      const infoA = CAMELOT_KEYS[tagA];
      const txA = wheelCenter + 100 * Math.cos(textAngle);
      const tyA = wheelCenter + 100 * Math.sin(textAngle);

      let opacityA = '0.2';
      let strokeA = '#0b0b0b';
      let strokeWidthA = '2';

      if (tagA === deckAKey) {
        opacityA = '1';
        strokeA = '#06b6d4'; // cyan
        strokeWidthA = '4';
      } else if (tagA === deckBKey) {
        opacityA = '1';
        strokeA = '#d946ef'; // fuchsia
        strokeWidthA = '4';
      } else {
        const comp = checkCompatibility(deckAKey, tagA);
        if (comp.compatible) {
          opacityA = '0.55';
          strokeA = '#1DB954'; // green glow
          strokeWidthA = '1';
        }
      }

      slices.push(
        <g key={`group-${tagA}`}>
          <path
            d={getSvgRingPath(wheelCenter, wheelCenter, 65, 135, startAngle, endAngle)}
            id={`slice-${tagA}`}
            onClick={() => onWheelSliceClick(tagA)}
            className="cursor-pointer transition-all duration-300 hover:brightness-125"
            fill={infoA.color}
            opacity={opacityA}
            stroke={strokeA}
            strokeWidth={strokeWidthA}
          />
          <text
            x={txA}
            y={tyA - 4}
            fill="#ffffff"
            fontSize="11"
            fontWeight="bold"
            fontFamily="Space Grotesk"
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none"
          >
            {tagA}
          </text>
          <text
            x={txA}
            y={tyA + 8}
            fill="#a3a3a3"
            fontSize="8"
            fontFamily="Plus Jakarta Sans"
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none opacity-80"
          >
            {infoA.name}
          </text>
        </g>
      );

      // Outer Major (B)
      const tagB = `${i}B`;
      const infoB = CAMELOT_KEYS[tagB];
      const txB = wheelCenter + 170 * Math.cos(textAngle);
      const tyB = wheelCenter + 170 * Math.sin(textAngle);

      let opacityB = '0.2';
      let strokeB = '#0b0b0b';
      let strokeWidthB = '2';

      if (tagB === deckAKey) {
        opacityB = '1';
        strokeB = '#06b6d4';
        strokeWidthB = '4';
      } else if (tagB === deckBKey) {
        opacityB = '1';
        strokeB = '#d946ef';
        strokeWidthB = '4';
      } else {
        const comp = checkCompatibility(deckAKey, tagB);
        if (comp.compatible) {
          opacityB = '0.55';
          strokeB = '#1DB954';
          strokeWidthB = '1';
        }
      }

      slices.push(
        <g key={`group-${tagB}`}>
          <path
            d={getSvgRingPath(wheelCenter, wheelCenter, 135, 205, startAngle, endAngle)}
            id={`slice-${tagB}`}
            onClick={() => onWheelSliceClick(tagB)}
            className="cursor-pointer transition-all duration-300 hover:brightness-125"
            fill={infoB.color}
            opacity={opacityB}
            stroke={strokeB}
            strokeWidth={strokeWidthB}
          />
          <text
            x={txB}
            y={tyB - 4}
            fill="#ffffff"
            fontSize="11"
            fontWeight="bold"
            fontFamily="Space Grotesk"
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none"
          >
            {tagB}
          </text>
          <text
            x={txB}
            y={tyB + 8}
            fill="#a3a3a3"
            fontSize="8"
            fontFamily="Plus Jakarta Sans"
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none opacity-80"
          >
            {infoB.name}
          </text>
        </g>
      );
    }

    return slices;
  };

  // Render connector line
  const renderVectorOverlay = () => {
    if (deckAKey === deckBKey) {
      const coords = getKeyCoordinates(deckAKey);
      return (
        <g>
          <circle cx={coords.x} cy={coords.y} r="15" fill="none" stroke="#1DB954" strokeWidth="2" opacity="0.8">
            <animate attributeName="r" values="10;25;10" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={coords.x} cy={coords.y} r="5" fill="#1DB954" />
        </g>
      );
    }

    const start = getKeyCoordinates(deckAKey);
    const end = getKeyCoordinates(deckBKey);

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    const compResult = checkCompatibility(deckAKey, deckBKey);
    let distanceLabel = 'Jump';
    if (compResult.type === 'step') distanceLabel = '±1 Step';
    else if (compResult.type === 'relative') distanceLabel = 'Mood Slide';
    else if (compResult.type === 'energy') distanceLabel = '+2 Energy';
    else if (compResult.type === 'subdominant') distanceLabel = 'Castle Shift';

    return (
      <g>
        <line
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
          stroke="#1DB954"
          strokeWidth="3"
          markerEnd="url(#arrow)"
          className="animated-vector-line"
        />
        <circle cx={start.x} cy={start.y} r={6} fill="#06b6d4" stroke="#0b0b0b" strokeWidth="1.5" />
        <circle cx={end.x} cy={end.y} r={6} fill="#d946ef" stroke="#0b0b0b" strokeWidth="1.5" />
        <g transform={`translate(${midX}, ${midY})`}>
          <rect x="-35" y="-10" width="70" height="20" rx="10" fill="#181818" stroke="#1DB954" strokeWidth="1" />
          <text
            x="0"
            y="0"
            dy="3.5"
            fill="#1DB954"
            fontSize="8"
            fontFamily="Space Grotesk"
            fontWeight="bold"
            textAnchor="middle"
            className="select-none pointer-events-none"
          >
            {distanceLabel}
          </text>
        </g>
      </g>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Camelot Wheel Card */}
      <div className="bg-cardBg border border-borderBg rounded-2xl p-4 lg:p-6 shadow-xl relative overflow-hidden flex flex-col items-center">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest text-spotifyGreen font-bold bg-spotifyBlack px-2.5 py-1 rounded-md border border-borderBg">
            Live Chessboard Wheel
          </span>
        </div>

        {/* Target Deck Selection */}
        <div className="absolute top-4 right-4 z-10 flex bg-spotifyBlack p-1 rounded-full border border-borderBg">
          <button
            onClick={() => setSelectorTarget('A')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              selectorTarget === 'A' ? 'bg-cyan-500 text-spotifyBlack font-bold' : 'text-zinc-400'
            }`}
          >
            Edit Deck A (Start)
          </button>
          <button
            onClick={() => setSelectorTarget('B')}
            className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
              selectorTarget === 'B' ? 'bg-fuchsia-500 text-spotifyBlack font-bold' : 'text-zinc-400'
            }`}
          >
            Edit Deck B (Target)
          </button>
        </div>

        {/* SVG Camelot Wheel */}
        <div className="relative w-full max-w-[430px] aspect-square my-6 flex items-center justify-center">
          <svg id="camelot-svg" viewBox="0 0 450 450" className="w-full h-full drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] select-none">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 L 2 5 z" fill="#1DB954" />
              </marker>
            </defs>
            {renderSlices()}
            {renderVectorOverlay()}
          </svg>

          {/* Center Overlay */}
          <div className="absolute w-[100px] h-[100px] rounded-full bg-spotifyBlack border-2 border-borderBg flex flex-col items-center justify-center text-center shadow-inner pointer-events-none z-10">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">MODE PATH</span>
            <div className="text-xs font-bold text-spotifyGreen tracking-tighter uppercase my-0.5" id="active-path-label">
              {activeMoveId ? CHESS_MOVE_TYPES[activeMoveId]?.shortMove : 'Custom'}
            </div>
            <div className="text-[10px] text-zinc-300 font-mono font-semibold">126 BPM</div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full border-t border-borderBg pt-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs text-zinc-400 mb-1">
            <div className="flex items-center justify-center gap-1.5 bg-spotifyBlack py-1.5 rounded-lg border border-borderBg">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span>
              <span>Deck A (Outgoing)</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-spotifyBlack py-1.5 rounded-lg border border-borderBg">
              <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-500 inline-block"></span>
              <span>Deck B (Incoming)</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-spotifyBlack py-1.5 rounded-lg border border-borderBg">
              <span className="w-2.5 h-2.5 rounded-full bg-spotifyGreen inline-block animate-pulse"></span>
              <span>Valid Target</span>
            </div>
            <div className="flex items-center justify-center gap-1.5 bg-spotifyBlack py-1.5 rounded-lg border border-borderBg">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"></span>
              <span>Dissonance Clash</span>
            </div>
          </div>
        </div>
      </div>

      {/* Playbook Controller */}
      <div className="bg-cardBg border border-borderBg rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3 border-b border-borderBg pb-3">
          <h3 className="text-sm font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
            <i className="fa-solid fa-chess-board text-spotifyGreen animate-pulse"></i> Interactive DJ Chess Playbook
          </h3>
          <span className="text-[9px] bg-emerald-950/60 border border-emerald-800 text-spotifyGreen px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            Rule Guide
          </span>
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          Click a tactical DJ Chess move below. The system automatically recalculates Deck B's target key, animates the physical direction arrow on the wheel, and adapts the virtual audio loop frequencies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.keys(CHESS_MOVE_TYPES).map((key) => {
            const move = CHESS_MOVE_TYPES[key];
            const target = move.calculateTarget(deckAKey);
            const isMatch = target === deckBKey;

            return (
              <button
                key={key}
                onClick={() => applyChessPlaybookMove(key)}
                className={`flex flex-col items-start p-3 rounded-xl transition text-left group ${
                  isMatch
                    ? 'bg-emerald-950/20 border border-spotifyGreen/60 scale-[1.01] shadow-md shadow-spotifyGreen/5'
                    : 'bg-spotifyBlack/60 hover:bg-spotifyBlack border border-borderBg hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-spotifyGreen group-hover:text-emerald-400 flex items-center gap-1.5">
                    <i className="fa-solid fa-chess-pawn text-[10px]"></i> {move.name}
                  </span>
                  <span className="text-[9px] font-mono bg-spotifyBlack px-1.5 py-0.5 rounded text-zinc-400 border border-borderBg font-bold uppercase">
                    {deckAKey} → {target}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold italic mt-1">
                  Chess Rule: {move.chessAnalogy}
                </span>
                <span className="text-[11px] text-zinc-400 mt-1.5 leading-relaxed">
                  {move.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
