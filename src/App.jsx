import React from 'react';
import CamelotWheel from './components/CamelotWheel';
import MixerConsole from './components/MixerConsole';
import SpotifyTrackFinder from './components/SpotifyTrackFinder';
import { useDJ } from './context/DJContext';
import { useSpotify } from './context/SpotifyContext';

export default function App() {
  const { isPlaying, togglePlayState, isAudioInitialized, initAudioEngine } = useDJ();
  const { token } = useSpotify();

  return (
    <div className="text-zinc-100 min-h-screen flex flex-col justify-between overflow-x-hidden">
      
      {/* Top Header */}
      <header className="border-b border-borderBg bg-spotifyDark/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-spotifyGreen to-emerald-700 flex items-center justify-center shadow-lg shadow-spotifyGreen/20">
              <i className="fa-solid fa-compact-disc text-xl text-white animate-spin-slow"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-heading">
                SPOTIFY HARMONIC STUDIO
              </h1>
              <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <i className="fa-brands fa-spotify text-spotifyGreen text-sm"></i>
                Camelot Wheel Chess-Move Modulator & Audio Transition Sandbox
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex text-xs px-3 py-1 bg-spotifyBlack border border-borderBg rounded-full text-zinc-400 items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-spotifyGreen animate-ping"></span>
              {isAudioInitialized ? 'Realtime Synth Core Active' : 'Sound Core Ready'}
            </span>
            <button
              onClick={togglePlayState}
              className={`px-4 py-1.5 font-bold text-xs rounded-full transition-all duration-300 shadow-lg flex items-center gap-2 ${
                isPlaying 
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-gradient-to-r from-spotifyGreen to-emerald-600 hover:from-emerald-500 hover:to-spotifyGreen text-spotifyBlack shadow-spotifyGreen/20'
              }`}
            >
              <i className={`fa-solid ${isPlaying ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
              <span>{isPlaying ? 'Disable Mix Audio' : 'Activate Studio Sound'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 lg:py-8 space-y-8">
        
        {/* Row 1: The Wheel & Mixer Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Camelot Wheel & Playbook */}
          <div className="lg:col-span-6">
            <CamelotWheel />
          </div>

          {/* Right Column: Console & Transition Inspector */}
          <div className="lg:col-span-6">
            <MixerConsole />
          </div>
        </div>

        {/* Row 2: Spotify Track Search & Playlists */}
        <section className="border-t border-borderBg pt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white font-heading">
              <i className="fa-solid fa-compact-disc text-spotifyGreen mr-2 animate-spin-slow"></i>
              Spotify Integrator & Harmonic Sorting Builder
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Connect your Spotify account to query track BPMs, pull Camelot Keys, compile setlists, and sort playlists harmonically to push directly back to your library.
            </p>
          </div>
          <SpotifyTrackFinder />
        </section>

        {/* Row 3: Step-by-Step Training */}
        <section className="border-t border-borderBg pt-8 pb-4">
          <div className="bg-cardBg border border-borderBg rounded-2xl p-6 lg:p-8 shadow-xl">
            <h2 className="text-lg lg:text-xl font-bold text-white mb-6 border-b border-borderBg pb-4 flex items-center gap-2 font-heading">
              <i className="fa-solid fa-graduation-cap text-spotifyGreen"></i>
              DJ Training: Step-by-Step Interactive Guide to Camelot Moves
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-spotifyBlack p-4 rounded-xl border border-borderBg space-y-3 relative">
                <div className="absolute top-2 right-2 text-3xl font-heading font-black text-borderBg/40">01</div>
                <span className="text-xs font-bold uppercase tracking-wider text-spotifyGreen">Step 1</span>
                <h3 className="text-sm font-bold text-white font-heading">Select Base Deck A</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Set the top target selector to <span className="text-cyan-400 font-semibold">"Edit Deck A"</span>, then select an initial key on the SVG Camelot Wheel (e.g., <strong>8A</strong> - Am).
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-spotifyBlack p-4 rounded-xl border border-borderBg space-y-3 relative">
                <div className="absolute top-2 right-2 text-3xl font-heading font-black text-borderBg/40">02</div>
                <span className="text-xs font-bold uppercase tracking-wider text-spotifyGreen">Step 2</span>
                <h3 className="text-sm font-bold text-white font-heading">Select Step Strategy</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Select any tactic from the <strong className="text-zinc-300">DJ Chess Playbook</strong>. Observe the dynamic vector arrows and glowing targets adjust on the wheel.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-spotifyBlack p-4 rounded-xl border border-borderBg space-y-3 relative">
                <div className="absolute top-2 right-2 text-3xl font-heading font-black text-borderBg/40">03</div>
                <span className="text-xs font-bold uppercase tracking-wider text-spotifyGreen">Step 3</span>
                <h3 className="text-sm font-bold text-white font-heading">Add Local MP3 Files</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Drag and drop local audio files onto Deck A or Deck B. Adjust their tempo slide, cut EQs, and crossfade to hear a real-time blend!
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-spotifyBlack p-4 rounded-xl border border-borderBg space-y-3 relative">
                <div className="absolute top-2 right-2 text-3xl font-heading font-black text-borderBg/40">04</div>
                <span className="text-xs font-bold uppercase tracking-wider text-spotifyGreen">Step 4</span>
                <h3 className="text-sm font-bold text-white font-heading">Sort & Save Setlists</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Add Spotify tracks to the Mix Playlist, click <strong className="text-spotifyGreen">Harmonic Sort</strong> to align them, and export them directly to your Spotify profile.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-borderBg bg-spotifyBlack px-4 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Spotify Harmonic Mixer Lab. Made specifically for planning House & Techno sets.</p>
          <div className="flex items-center gap-4">
            <span className="text-spotifyGreen font-semibold flex items-center gap-1">
              <i className="fa-solid fa-shield"></i> Verified Vector Calculations
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
