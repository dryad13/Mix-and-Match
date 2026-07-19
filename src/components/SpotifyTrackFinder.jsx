import React, { useState } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import { useDJ } from '../context/DJContext';

export default function SpotifyTrackFinder() {
  const {
    token,
    spotifyUser,
    userPlaylists,
    isLoadingPlaylists,
    handleLogin,
    handleLogout,
    fetchPlaylists,
    getPlaylistTracks,
    searchTracks,
    exportPlaylist,
    getTrackDetails
  } = useSpotify();

  const {
    setDeckATrack,
    setDeckBTrack,
    selectKey
  } = useDJ();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchOffset, setSearchOffset] = useState(0);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [dragOverQueue, setDragOverQueue] = useState(false);

  // Playlist workspace queue
  const [mixQueue, setMixQueue] = useState([]);
  const [exportName, setExportName] = useState('Harmonic DJ Set');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchOffset(0);
    
    // Clear playlist state to show search results
    setSelectedPlaylistId('');
    setPlaylistTracks([]);
    
    try {
      const results = await searchTracks(searchQuery, 0);
      setSearchResults(results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLoadMoreSearch = async () => {
    if (isLoadingMore || !searchQuery.trim()) return;
    setIsLoadingMore(true);
    const nextOffset = searchOffset + 10;
    try {
      const results = await searchTracks(searchQuery, nextOffset);
      if (results && results.length > 0) {
        setSearchResults(prev => [...prev, ...results]);
        setSearchOffset(nextOffset);
      } else {
        alert("No more search results found.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleSelectPlaylist = async (e) => {
    const id = e.target.value;
    setSelectedPlaylistId(id);
    if (!id) {
      setPlaylistTracks([]);
      return;
    }
    
    // Clear search state to show playlist tracks
    setSearchQuery('');
    setSearchResults([]);
    setSearchOffset(0);
    
    setIsLoadingTracks(true);
    try {
      const tracks = await getPlaylistTracks(id);
      setPlaylistTracks(tracks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  const handleClearView = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSearchOffset(0);
    setSelectedPlaylistId('');
    setPlaylistTracks([]);
  };

  const loadToDeck = (deck, track) => {
    const trackObj = {
      id: track.id,
      name: track.name,
      artist: track.artist,
      albumArt: track.albumArt,
      bpm: track.bpm,
      camelotCode: track.camelotCode
    };

    if (deck === 'A') {
      setDeckATrack(trackObj);
      selectKey(track.camelotCode, 'A');
    } else {
      setDeckBTrack(trackObj);
      selectKey(track.camelotCode, 'B');
    }
  };

  const addToQueue = (track) => {
    if (mixQueue.some(t => t.id === track.id)) return;
    setMixQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (id) => {
    setMixQueue(prev => prev.filter(t => t.id !== id));
  };

  const clearQueue = () => {
    setMixQueue([]);
    setExportResult(null);
  };

  // GREEDY HARMONIC SORTING ALGORITHM
  // Orders tracks to minimize key transitions
  const sortQueueHarmonically = () => {
    if (mixQueue.length <= 1) return;

    const remaining = [...mixQueue];
    const sorted = [];

    // Start with the first track in the queue
    sorted.push(remaining.shift());

    // Helper compatibility scoring (higher is better)
    const getTransitionScore = (keyA, keyB) => {
      if (keyA === keyB) return 10; // Pawn hold
      const numA = parseInt(keyA);
      const letterA = keyA.slice(-1);
      const numB = parseInt(keyB);
      const letterB = keyB.slice(-1);

      if (numA === numB && letterA !== letterB) return 9.2; // Rook slide
      if (letterA === letterB) {
        const diff = Math.abs(numA - numB);
        if (diff === 1 || diff === 11) return 9.8; // Bishop step
        if (diff === 7 || diff === 5) return 8.8; // Castle shift
        if (diff === 2 || diff === 10) return 8.5; // Knight jump
      }
      return 1.0; // Clash
    };

    while (remaining.length > 0) {
      const lastTrack = sorted[sorted.length - 1];
      let bestIndex = 0;
      let highestScore = -1;

      for (let i = 0; i < remaining.length; i++) {
        const score = getTransitionScore(lastTrack.camelotCode, remaining[i].camelotCode);
        
        // Prioritize score, secondary sorting on BPM proximity
        if (score > highestScore) {
          highestScore = score;
          bestIndex = i;
        } else if (score === highestScore) {
          const bpmDiffCurrent = Math.abs(lastTrack.bpm - remaining[i].bpm);
          const bpmDiffBest = Math.abs(lastTrack.bpm - remaining[bestIndex].bpm);
          if (bpmDiffCurrent < bpmDiffBest) {
            bestIndex = i;
          }
        }
      }

      sorted.push(remaining.splice(bestIndex, 1)[0]);
    }

    setMixQueue(sorted);
  };

  const handleExport = async () => {
    if (mixQueue.length === 0) return;
    setIsExporting(true);
    setExportResult(null);
    try {
      const trackIds = mixQueue.map(t => t.id);
      const playlist = await exportPlaylist(exportName, trackIds);
      if (playlist) {
        setExportResult({ success: true, url: playlist.external_urls.spotify, name: playlist.name });
      } else {
        setExportResult({ success: false });
      }
    } catch (err) {
      console.error(err);
      setExportResult({ success: false });
    } finally {
      setIsExporting(false);
    }
  };

  // Helper styling for keys
  const getKeyColorClass = (code) => {
    if (code.endsWith('A')) return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
  };

  if (!token) {
    return (
      <div className="bg-cardBg border border-borderBg rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center min-h-[300px] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-spotifyGreen/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="h-16 w-16 rounded-full bg-spotifyGreen/10 flex items-center justify-center text-spotifyGreen text-3xl mb-4 animate-pulse">
          <i className="fa-brands fa-spotify"></i>
        </div>
        <h2 className="text-lg font-bold text-white font-heading mb-2">Connect Spotify Music Core</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          Log in with your Spotify account to query track BPMs, load Camelot Keys, import playlists, and sort mixing queues harmonically.
        </p>
        <button
          onClick={handleLogin}
          className="px-6 py-2.5 bg-spotifyGreen hover:bg-emerald-500 text-spotifyBlack font-extrabold text-sm rounded-full transition-all duration-300 shadow-lg shadow-spotifyGreen/20 flex items-center gap-2 transform hover:scale-[1.02]"
        >
          <i className="fa-brands fa-spotify text-lg"></i>
          <span>Authorize Spotify Access</span>
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Search / Playlist Loading Column */}
      <div className="xl:col-span-7 bg-cardBg border border-borderBg rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        
        <div className="flex items-center justify-between border-b border-borderBg pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-brands fa-spotify text-spotifyGreen text-lg"></i>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Spotify Track Search
            </h2>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-zinc-400 bg-spotifyBlack/50 px-3 py-1 rounded-full border border-borderBg">
            {spotifyUser?.images?.[0]?.url && (
              <img src={spotifyUser.images[0].url} alt="profile" className="w-4 h-4 rounded-full" />
            )}
            <span className="font-semibold">{spotifyUser?.display_name || 'Connected'}</span>
            <button onClick={handleLogout} className="text-rose-400 hover:text-rose-300 ml-1.5 font-bold" title="Logout">
              <i className="fa-solid fa-right-from-bracket"></i>
            </button>
          </div>
        </div>

        {/* Input Tools */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Text Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search tracks, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-spotifyBlack border border-borderBg rounded-xl px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-spotifyGreen"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="px-3 bg-spotifyGreen hover:bg-emerald-500 text-spotifyBlack font-bold rounded-xl transition duration-200 flex items-center justify-center"
            >
              {isSearching ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            </button>
          </form>

          {/* Playlists Selector */}
          <div className="flex gap-2">
            <select
              value={selectedPlaylistId}
              onChange={handleSelectPlaylist}
              className="flex-1 bg-spotifyBlack border border-borderBg rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-spotifyGreen cursor-pointer"
            >
              <option value="">-- Load Playlist --</option>
              {isLoadingPlaylists ? (
                <option disabled>Loading playlists...</option>
              ) : (
                userPlaylists.map(pl => (
                  <option key={pl.id} value={pl.id}>{pl.name} ({pl.tracks?.total})</option>
                ))
              )}
            </select>
            <button
              type="button"
              onClick={fetchPlaylists}
              disabled={isLoadingPlaylists}
              className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition duration-200 flex items-center justify-center"
              title="Refresh Playlists"
            >
              <i className={`fa-solid fa-rotate-right ${isLoadingPlaylists ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Active View Indicator */}
        {(searchResults.length > 0 || playlistTracks.length > 0) && (
          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1 py-0.5 border-t border-borderBg/20 pt-2">
            <span>
              Showing: {searchResults.length > 0 ? (
                <span>Search results for <span className="text-spotifyGreen font-semibold">"{searchQuery || 'recent search'}"</span></span>
              ) : (
                <span>Playlist: <span className="text-spotifyGreen font-semibold">{userPlaylists.find(p => p.id === selectedPlaylistId)?.name || 'Selected Playlist'}</span></span>
              )}
            </span>
            <button
              type="button"
              onClick={handleClearView}
              className="text-[10px] text-zinc-500 hover:text-rose-400 font-bold flex items-center gap-1 transition"
            >
              <i className="fa-solid fa-xmark"></i> Clear view
            </button>
          </div>
        )}

        {/* Tracks List */}
        <div className="flex-grow max-h-[360px] overflow-y-auto border border-borderBg rounded-xl bg-spotifyBlack/40">
          {isLoadingTracks ? (
            <div className="flex flex-col items-center justify-center p-8 text-zinc-400 gap-2">
              <i className="fa-solid fa-circle-notch animate-spin text-spotifyGreen text-xl"></i>
              <span className="text-xs">Fetching tracks and resolving Camelot Keys...</span>
            </div>
          ) : (
            <div className="divide-y divide-borderBg/40">
              {/* If search results are showing */}
              {searchResults.length > 0 && searchResults.map(track => (
                <div
                  key={`search-${track.id}`}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', `spotify:track:${track.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="flex items-center justify-between p-2.5 hover:bg-spotifyBlack/60 transition group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {track.albumArt ? (
                      <img src={track.albumArt} alt="album art" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                        <i className="fa-solid fa-music"></i>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{track.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  
                  {/* Badges and actions */}
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${getKeyColorClass(track.camelotCode)}`}>
                      {track.camelotCode} ({track.keyName})
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 font-mono w-12 text-center">
                      {track.bpm} BPM
                    </span>
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => loadToDeck('A', track)}
                        className="px-2 py-1 text-[9px] bg-cyan-950/60 border border-cyan-800 text-cyan-400 font-bold rounded hover:bg-cyan-900 transition"
                      >
                        Deck A
                      </button>
                      <button
                        onClick={() => loadToDeck('B', track)}
                        className="px-2 py-1 text-[9px] bg-fuchsia-950/60 border border-fuchsia-800 text-fuchsia-400 font-bold rounded hover:bg-fuchsia-900 transition"
                      >
                        Deck B
                      </button>
                      <button
                        onClick={() => addToQueue(track)}
                        className="p-1 text-xs text-spotifyGreen hover:text-emerald-300 hover:bg-spotifyGreen/10 rounded transition"
                        title="Add to Mix Playlist"
                      >
                        <i className="fa-solid fa-circle-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load More search results button */}
              {searchResults.length > 0 && (
                <div className="p-2.5 flex justify-center bg-spotifyBlack/20">
                  <button
                    onClick={handleLoadMoreSearch}
                    disabled={isLoadingMore}
                    className="px-4 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-bold rounded-full transition flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <i className="fa-solid fa-spinner animate-spin"></i> Loading More...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-arrow-down"></i> Load More Tracks
                      </>
                    )}
                  </button>
                </div>
              )}

              {playlistTracks.length > 0 && searchResults.length === 0 && playlistTracks.map(track => (
                <div
                  key={`playlist-${track.id}`}
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', `spotify:track:${track.id}`);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="flex items-center justify-between p-2.5 hover:bg-spotifyBlack/60 transition group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {track.albumArt ? (
                      <img src={track.albumArt} alt="album art" className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs">
                        <i className="fa-solid fa-music"></i>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{track.name}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                  
                  {/* Badges and actions */}
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${getKeyColorClass(track.camelotCode)}`}>
                      {track.camelotCode} ({track.keyName})
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500 font-mono w-12 text-center">
                      {track.bpm} BPM
                    </span>
                    <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => loadToDeck('A', track)}
                        className="px-2 py-1 text-[9px] bg-cyan-950/60 border border-cyan-800 text-cyan-400 font-bold rounded hover:bg-cyan-900 transition"
                      >
                        Deck A
                      </button>
                      <button
                        onClick={() => loadToDeck('B', track)}
                        className="px-2 py-1 text-[9px] bg-fuchsia-950/60 border border-fuchsia-800 text-fuchsia-400 font-bold rounded hover:bg-fuchsia-900 transition"
                      >
                        Deck B
                      </button>
                      <button
                        onClick={() => addToQueue(track)}
                        className="p-1 text-xs text-spotifyGreen hover:text-emerald-300 hover:bg-spotifyGreen/10 rounded transition"
                        title="Add to Mix Playlist"
                      >
                        <i className="fa-solid fa-circle-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {searchResults.length === 0 && playlistTracks.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-1.5 text-center">
                  <i className="fa-solid fa-magnifying-glass text-lg text-zinc-600"></i>
                  <span className="text-xs">Search for tracks or choose a playlist to fetch BPM & Camelot Keys.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Playlist Mixer Queue Column */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOverQueue(true);
        }}
        onDragLeave={() => setDragOverQueue(false)}
        onDrop={async (e) => {
          e.preventDefault();
          setDragOverQueue(false);

          const data = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
          if (data) {
            const match = data.match(/(?:track\/|track:)([a-zA-Z0-9]{22})/);
            if (match) {
              const trackId = match[1];
              try {
                const track = await getTrackDetails(trackId);
                if (track) {
                  addToQueue(track);
                } else {
                  alert("Failed to fetch track from Spotify. Verify that it is a valid track and you are logged in.");
                }
              } catch (err) {
                console.error("Error loading dropped track to queue:", err);
              }
            }
          }
        }}
        className={`xl:col-span-5 bg-cardBg border rounded-2xl p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden transition-all duration-200 ${
          dragOverQueue ? 'border-spotifyGreen scale-[1.01] shadow-spotifyGreen/10' : 'border-borderBg'
        }`}
      >
        <div className="absolute -right-12 -bottom-12 w-28 h-28 bg-spotifyGreen/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between border-b border-borderBg pb-3">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-list-check text-spotifyGreen"></i>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-heading">
              Mix Playlist Queue
            </h2>
          </div>
          
          <div className="flex items-center gap-1.5">
            {mixQueue.length > 1 && (
              <button
                onClick={sortQueueHarmonically}
                className="px-2.5 py-1 bg-spotifyGreen/10 hover:bg-spotifyGreen/20 text-spotifyGreen border border-spotifyGreen/30 font-bold text-[10px] rounded-full transition flex items-center gap-1"
                title="Sort tracks harmonically using Camelot compatibility rules"
              >
                <i className="fa-solid fa-shuffle"></i> Harmonic Sort
              </button>
            )}
            {mixQueue.length > 0 && (
              <button onClick={clearQueue} className="text-zinc-500 hover:text-rose-400 text-xs font-semibold">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Queue Items */}
        <div className="flex-grow max-h-[220px] overflow-y-auto border border-borderBg rounded-xl bg-spotifyBlack/40">
          <div className="divide-y divide-borderBg/40">
            {mixQueue.map((track, idx) => (
              <div key={`queue-${track.id}-${idx}`} className="flex items-center justify-between p-2 hover:bg-spotifyBlack/40 transition">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="text-[10px] font-mono text-zinc-500 w-4 text-center">{idx + 1}</span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-bold text-white truncate">{track.name}</h4>
                    <p className="text-[9px] text-zinc-500 truncate">{track.artist}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${getKeyColorClass(track.camelotCode)}`}>
                    {track.camelotCode}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-500 font-mono w-10 text-center">
                    {track.bpm}
                  </span>
                  <button onClick={() => removeFromQueue(track.id)} className="text-zinc-500 hover:text-rose-400 p-0.5 text-xs transition">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            ))}

            {mixQueue.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-zinc-500 gap-1.5 text-center">
                <i className="fa-solid fa-plus-minus text-lg text-zinc-600"></i>
                <span className="text-xs">Queue is empty. Click "+" on tracks to construct a setlist.</span>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        {mixQueue.length > 0 && (
          <div className="mt-auto space-y-3 pt-3 border-t border-borderBg bg-cardBg/60">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Export playlist name"
                value={exportName}
                onChange={(e) => setExportName(e.target.value)}
                className="flex-1 bg-spotifyBlack border border-borderBg rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-spotifyGreen"
              />
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-1.5 bg-spotifyGreen hover:bg-emerald-500 text-spotifyBlack font-extrabold text-xs rounded-xl transition duration-200 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isExporting ? (
                  <>
                    <i className="fa-solid fa-spinner animate-spin"></i>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-brands fa-spotify"></i>
                    <span>Save to Spotify</span>
                  </>
                )}
              </button>
            </div>

            {exportResult && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex justify-between items-center ${
                  exportResult.success
                    ? 'bg-emerald-950/20 border-emerald-800 text-emerald-400'
                    : 'bg-rose-950/20 border-rose-800 text-rose-400'
                }`}
              >
                <div>
                  {exportResult.success ? (
                    <>
                      <span className="font-bold">Success!</span> Playlist "{exportResult.name}" created.
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Failed.</span> Unable to export playlist.
                    </>
                  )}
                </div>
                {exportResult.success && (
                  <a
                    href={exportResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-spotifyGreen text-spotifyBlack font-bold rounded-lg text-[10px] hover:bg-emerald-400 transition"
                  >
                    Open Spotify
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
