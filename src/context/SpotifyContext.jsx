import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { getCamelotKey } from '../utils/camelot';

const SpotifyContext = createContext();

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
// Automatically resolve Netlify redirect URI or use local config
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 
                     (typeof window !== 'undefined' ? `${window.location.origin}/` : 'http://localhost:5173/');

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read'
].join(' ');

// Cryptographic helpers for PKCE
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(v) {
  const hashed = await sha256(v);
  return base64urlencode(hashed);
}

export function SpotifyProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [spotifyUser, setSpotifyUser] = useState(null);
  const timeoutRef = useRef(null);
  const authAttempted = useRef(false);

  const clearSession = () => {
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_token_expiry');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_code_verifier');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToken(null);
    setSpotifyUser(null);
    setUserPlaylists([]);
  };

  const setupTokenExpiryTimeout = (delayMs) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      refreshAccessToken();
    }, delayMs);
  };

  const fetchAccessToken = async (code) => {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      console.error("Code verifier not found in localStorage");
      alert("Error: Spotify code verifier was not found in your browser storage. Please try logging in again.");
      clearSession();
      return;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token, refresh_token, expires_in } = data;
        const expiryTime = Date.now() + Number(expires_in) * 1000;

        localStorage.setItem('spotify_access_token', access_token);
        localStorage.setItem('spotify_token_expiry', String(expiryTime));
        if (refresh_token) {
          localStorage.setItem('spotify_refresh_token', refresh_token);
        }

        setToken(access_token);
        await fetchUserProfile(access_token);
        setupTokenExpiryTimeout(Number(expires_in) * 1000);
      } else {
        const errorText = await response.text();
        console.error("Failed to exchange code for token:", errorText);
        alert(`Authentication Error: Failed to retrieve access token from Spotify.\n\nDetails: ${errorText}`);
        clearSession();
      }
    } catch (err) {
      console.error("Error exchanging code for token:", err);
      alert(`Network Error: Failed to connect to Spotify accounts service.\n\nDetails: ${err.message || err}`);
      clearSession();
    }
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      clearSession();
      return;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token, refresh_token: newRefreshToken, expires_in } = data;
        const expiryTime = Date.now() + Number(expires_in) * 1000;

        localStorage.setItem('spotify_access_token', access_token);
        localStorage.setItem('spotify_token_expiry', String(expiryTime));
        if (newRefreshToken) {
          localStorage.setItem('spotify_refresh_token', newRefreshToken);
        }

        setToken(access_token);
        await fetchUserProfile(access_token);
        setupTokenExpiryTimeout(Number(expires_in) * 1000);
      } else {
        console.error("Failed to refresh token:", await response.text());
        clearSession();
      }
    } catch (err) {
      console.error("Error refreshing token:", err);
      clearSession();
    }
  };

  // Authentication: Check URL params or localStorage for existing session
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if returning from Spotify auth redirect (URL contains '?code=...')
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        if (authAttempted.current) return;
        authAttempted.current = true;

        // Clear code/state from URL parameters immediately to prevent multiple fetches
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.history.pushState({}, document.title, url.pathname + url.search);

        await fetchAccessToken(code);
        return;
      }

      // 2. Check local storage
      const storedToken = localStorage.getItem('spotify_access_token');
      const storedExpiry = localStorage.getItem('spotify_token_expiry');
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      const now = Date.now();

      if (storedToken && storedExpiry && now < Number(storedExpiry)) {
        setToken(storedToken);
        await fetchUserProfile(storedToken);
        const remainingTime = Number(storedExpiry) - now;
        setupTokenExpiryTimeout(remainingTime);
      } else if (refreshToken) {
        await refreshAccessToken();
      } else {
        clearSession();
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (!CLIENT_ID || CLIENT_ID === 'your_spotify_client_id_here') {
      alert("Please configure your VITE_SPOTIFY_CLIENT_ID environment variable in .env.local!");
      return;
    }

    try {
      const verifier = generateRandomString(64);
      const challenge = await generateCodeChallenge(verifier);
      localStorage.setItem('spotify_code_verifier', verifier);

      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'code',
        redirect_uri: REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: challenge,
        scope: SCOPES
      });

      window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (err) {
      console.error("Error generating PKCE code challenge:", err);
      alert("Failed to initiate Spotify login. Please try again.");
    }
  };

  const handleLogout = () => {
    clearSession();
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSpotifyUser(data);
      } else {
        const errorText = await res.text();
        console.error("Error fetching user profile:", res.status, errorText);
        if (res.status === 403) {
          alert("Access Forbidden (403): Your Spotify account may not be whitelisted in the Spotify Developer Dashboard for this app.\n\nSince your app is in 'Development' mode, you must add your Spotify account email under 'Users and Roles' in the Spotify App settings.");
        } else if (res.status === 401) {
          clearSession();
        }
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  // Fetch lists of playlists from user
  const fetchPlaylists = async () => {
    if (!token) return;
    setIsLoadingPlaylists(true);
    try {
      const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserPlaylists(data.items || []);
      } else {
        const errorText = await res.text();
        console.error("Error fetching playlists:", res.status, errorText);
        if (res.status === 403) {
          alert("Access Forbidden (403): Your Spotify account may not be whitelisted in the Spotify Developer Dashboard for this app.\n\nPlease go to your Spotify Developer Dashboard -> Users and Roles, and whitelist the email address of this Spotify account.");
        } else {
          alert(`Error fetching playlists (${res.status}): ${errorText}`);
        }
      }
    } catch (err) {
      console.error("Error fetching playlists:", err);
      alert(`Network error fetching playlists: ${err.message || err}`);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  // Fetch track metadata + audio features (BPM, keys)
  const fetchTrackAudioFeatures = async (trackIds) => {
    if (!token || !trackIds || trackIds.length === 0) return {};
    
    // Chunk requests into batches of 100 as per Spotify constraints
    const batches = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      batches.push(trackIds.slice(i, i + 100));
    }

    try {
      const featuresMap = {};
      for (const batch of batches) {
        const idsStr = batch.join(',');
        const res = await fetch(`https://api.spotify.com/v1/audio-features?ids=${idsStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audio_features) {
            data.audio_features.forEach((feat) => {
              if (feat) {
                const camelot = getCamelotKey(feat.key, feat.mode);
                featuresMap[feat.id] = {
                  bpm: Math.round(feat.tempo),
                  key: feat.key,
                  mode: feat.mode,
                  camelotCode: camelot.code,
                  keyName: camelot.name,
                  keyFullName: camelot.fullName,
                  energy: feat.energy,
                  danceability: feat.danceability,
                  valence: feat.valence
                };
              }
            });
          }
        }
      }
      return featuresMap;
    } catch (err) {
      console.error("Error fetching audio features:", err);
      return {};
    }
  };

  // Fetch tracks for a specific playlist
  const getPlaylistTracks = async (playlistId) => {
    if (!token) return [];
    try {
      let tracks = [];
      let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;
      
      // Page through all tracks (limit to max 300 tracks for responsive mixing)
      let pages = 0;
      while (nextUrl && pages < 3) {
        const res = await fetch(nextUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) break;
        
        const data = await res.json();
        tracks = [...tracks, ...(data.items || [])];
        nextUrl = data.next;
        pages++;
      }

      // Filter null tracks and map them
      const cleanTracks = tracks
        .filter(item => item && item.track)
        .map(item => ({
          id: item.track.id,
          name: item.track.name,
          artist: item.track.artists.map(a => a.name).join(', '),
          album: item.track.album.name,
          albumArt: item.track.album.images?.[0]?.url || '',
          durationMs: item.track.duration_ms
        }));

      // Fetch keys and BPMs in batch
      const trackIds = cleanTracks.map(t => t.id).filter(id => !!id);
      const features = await fetchTrackAudioFeatures(trackIds);

      // Merge features into track object
      return cleanTracks.map(t => ({
        ...t,
        ...(features[t.id] || { bpm: 120, camelotCode: '8A', keyName: 'Am', keyFullName: 'A Minor', energy: 0.5, danceability: 0.5, valence: 0.5 })
      }));

    } catch (err) {
      console.error("Error getting playlist tracks:", err);
      return [];
    }
  };

  // Search Spotify tracks
  const searchTracks = async (query) => {
    if (!token || !query) return [];
    try {
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const rawTracks = data.tracks?.items || [];
        const cleanTracks = rawTracks.map(track => ({
          id: track.id,
          name: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          album: track.album.name,
          albumArt: track.album.images?.[0]?.url || '',
          durationMs: track.duration_ms
        }));

        const trackIds = cleanTracks.map(t => t.id);
        const features = await fetchTrackAudioFeatures(trackIds);

        return cleanTracks.map(t => ({
          ...t,
          ...(features[t.id] || { bpm: 120, camelotCode: '8A', keyName: 'Am', keyFullName: 'A Minor', energy: 0.5, danceability: 0.5, valence: 0.5 })
        }));
      } else {
        const errorText = await res.text();
        console.error("Error searching tracks:", res.status, errorText);
        if (res.status === 403) {
          alert("Access Forbidden (403): Your Spotify account may not be whitelisted in the Spotify Developer Dashboard for this app.\n\nPlease go to your Spotify Developer Dashboard -> Users and Roles, and whitelist the email address of this Spotify account.");
        } else {
          alert(`Error searching tracks (${res.status}): ${errorText}`);
        }
      }
      return [];
    } catch (err) {
      console.error("Error searching tracks:", err);
      alert(`Network error searching tracks: ${err.message || err}`);
      return [];
    }
  };



  // Create playlist and add tracks
  const exportPlaylist = async (name, trackIds) => {
    if (!token || !spotifyUser || !trackIds || trackIds.length === 0) return null;
    try {
      // 1. Create playlist
      const createRes = await fetch(`https://api.spotify.com/v1/users/${spotifyUser.id}/playlists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          description: 'Harmonically sorted playlist created with Spotify Harmonic DJ Studio.',
          public: false
        })
      });

      if (!createRes.ok) return null;
      const playlist = await createRes.json();

      // 2. Add tracks (limit 100 per call, we chunk it)
      const uris = trackIds.map(id => `spotify:track:${id}`);
      for (let i = 0; i < uris.length; i += 100) {
        const chunk = uris.slice(i, i + 100);
        await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ uris: chunk })
        });
      }

      return playlist;
    } catch (err) {
      console.error("Error exporting playlist:", err);
      return null;
    }
  };

  return (
    <SpotifyContext.Provider value={{
      token,
      spotifyUser,
      userPlaylists,
      isLoadingPlaylists,
      handleLogin,
      handleLogout,
      fetchPlaylists,
      getPlaylistTracks,
      searchTracks,
      exportPlaylist
    }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  return useContext(SpotifyContext);
}
