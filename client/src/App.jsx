import { useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function App() {
  // ---------------------------------------------------------------------------
  // LOGIC (UNCHANGED)
  // ---------------------------------------------------------------------------
  const [tracks, setTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [mood, setMood] = useState('');
  const [playlist, setPlaylist] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [loadingTop, setLoadingTop] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const audioRef = useRef(null);

  const fetchTracks = async () => {
    const res = await axios.get(`${API_URL}/api/tracks`);
    setTracks(res.data.tracks || []);
  };

  const fetchTopTracks = async () => {
    setLoadingTop(true);
    try {
      const res = await axios.get(`${API_URL}/api/stats/top-tracks`);
      setTopTracks(res.data.tracks || []);
    } finally {
      setLoadingTop(false);
    }
  };

  useEffect(() => {
    fetchTracks();
    fetchTopTracks();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('audio', file);

    setUploading(true);
    try {
      await axios.post(`${API_URL}/api/tracks/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchTracks();
      await fetchTopTracks();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePlaylist = async () => {
    if (!mood.trim()) {
      alert('Enter a mood');
      return;
    }
    setLoadingPlaylist(true);
    try {
      const res = await axios.post(`${API_URL}/api/playlists/generate`, { mood });
      const p = res.data.playlist;
      setPlaylist(p);
      setCurrentIndex(0);
      setTimeout(() => {
        audioRef.current?.play();
      }, 100);
      await fetchTopTracks();
    } catch (err) {
      console.error(err);
      alert('Failed to generate playlist');
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const getPlaylistTrackAtIndex = (index) => {
    if (!playlist || !playlist.tracks || !playlist.tracks[index]) return null;
    const item = playlist.tracks[index];
    const track = item.track || item.trackId || item;
    return track;
  };

  const handleNext = () => {
    if (!playlist || !playlist.tracks) return;
    const next = currentIndex + 1;
    if (next < playlist.tracks.length) {
      setCurrentIndex(next);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const handlePrev = () => {
    if (!playlist || !playlist.tracks) return;
    const prev = currentIndex - 1;
    if (prev >= 0) {
      setCurrentIndex(prev);
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  const currentTrack = getPlaylistTrackAtIndex(currentIndex);
  const currentSrc = currentTrack ? `${API_URL}${currentTrack.fileUrl}` : '';

  // ---------------------------------------------------------------------------
  // STYLES (FIXED GRID + WIDER LAYOUT)
  // ---------------------------------------------------------------------------
  
  const baseFont = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    WebkitFontSmoothing: 'antialiased',
  };

  // Main layout container - WIDER
  const containerStyle = {
    width: '96%',        // FIXED: Wider screen coverage
    maxWidth: 1600,      // FIXED: Bigger max-width
    margin: '0 auto',
    padding: '40px 20px',
  };

  // Modern Card with diffuse shadow
  const card = {
    position: 'relative',
    background: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.06), 0 2px 10px -2px rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.03)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const h1Style = {
    fontSize: 42,
    fontWeight: 700,
    letterSpacing: '-0.03em',
    color: '#000',
    margin: 0,
  };

  const sectionTitle = {
    fontSize: 16,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: '#111',
    margin: '0 0 4px 0',
  };

  const sectionDesc = {
    fontSize: 13,
    color: '#888',
    margin: 0,
    lineHeight: 1.4,
  };

  const pill = {
    fontSize: 11,
    fontWeight: 500,
    padding: '6px 12px',
    borderRadius: 100,
    backgroundColor: '#F5F5F7',
    color: '#666',
    border: '1px solid rgba(0,0,0,0.02)',
  };

  const inputStyle = {
    width: '100%',
    fontSize: 15,
    padding: '14px 18px',
    borderRadius: 16,
    border: '1px solid #E5E5E5',
    outline: 'none',
    backgroundColor: '#FAFAFA',
    transition: 'all 0.2s ease',
    color: '#000',
  };

  const btnPrimary = (disabled) => ({
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    padding: '14px 28px',
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    transition: 'transform 0.1s ease, box-shadow 0.2s ease',
    whiteSpace: 'nowrap',
  });

  const btnSecondary = {
    background: '#fff',
    color: '#000',
    border: '1px solid #E5E5E5',
    borderRadius: 100,
    padding: '8px 16px',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
  };

  const uploadZone = {
    border: '2px dashed #E5E5E5',
    borderRadius: 20,
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background 0.2s ease',
    background: '#FAFAFA',
  };

  return (
    <div style={{ 
      ...baseFont, 
      minHeight: '100vh', 
      backgroundColor: '#FAFAFA',
      color: '#111'
    }}>
      
      <div style={containerStyle}>
        {/* HEADER */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          marginBottom: 40 
        }}>
          <div>
            <h1 style={h1Style}>Mood<span style={{ fontWeight: 300, color: '#666' }}>DJ</span></h1>
            <p style={{ fontSize: 15, color: '#666', marginTop: 6 }}>
              Your personal AI music curator.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={pill}>Version 2.0</span>
            <span style={pill}>AI-Core</span>
          </div>
        </header>

        {/* MAIN GRID - FIXED: Proper 2-column layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.6fr 1fr', // FIXED - 60/40 split
          gap: 24,
          alignItems: 'start'
        }}>
          
          {/* LEFT COLUMN: Creation & Playback */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* UPLOAD CARD */}
            <div style={card}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={sectionTitle}>Add Music</h2>
                <p style={sectionDesc}>Upload MP3s to expand your library.</p>
              </div>

              <label style={uploadZone}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#AAA';
                  e.currentTarget.style.background = '#F0F0F0';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5E5';
                  e.currentTarget.style.background = '#FAFAFA';
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>☁️</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Click to upload</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>MP3 or WAV up to 10MB</div>
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
              {uploading && <div style={{ marginTop: 12, fontSize: 12, color: '#000', fontWeight: 500, textAlign: 'center' }}>Uploading track...</div>}
            </div>

            {/* GENERATOR CARD */}
            <div style={card}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={sectionTitle}>Create Mix</h2>
                <p style={sectionDesc}>Describe a vibe, get a perfect playlist.</p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
                <input
                  type="text"
                  placeholder="e.g. Late night coding, Coffee shop jazz..."
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = '#000'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E5E5'}
                />
                <button 
                  onClick={handleGeneratePlaylist} 
                  disabled={loadingPlaylist}
                  style={btnPrimary(loadingPlaylist)}
                  onMouseOver={(e) => !loadingPlaylist && (e.target.style.transform = 'scale(1.02)')}
                  onMouseOut={(e) => !loadingPlaylist && (e.target.style.transform = 'scale(1)')}
                >
                  {loadingPlaylist ? 'Thinking...' : 'Generate'}
                </button>
              </div>

              {/* PLAYER SECTION */}
              {playlist && (
                <div style={{ 
                  background: '#F5F5F7', 
                  borderRadius: 20, 
                  padding: 24,
                  border: '1px solid rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888', marginBottom: 4 }}>Current Vibe</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{playlist.mood}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Now Playing</div>
                      <div style={{ fontSize: 14, fontWeight: 500, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {currentTrack ? currentTrack.title : 'Ready'}
                      </div>
                    </div>
                  </div>

                  {/* Custom Player Controls */}
                  <div style={{ marginBottom: 24 }}>
                    <audio 
                      ref={audioRef} 
                      src={currentSrc} 
                      controls 
                      onEnded={handleNext} 
                      style={{ width: '100%', height: 36, borderRadius: 8 }} 
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                      <button onClick={handlePrev} style={btnSecondary}>Prev</button>
                      <button onClick={handleNext} style={{ ...btnSecondary, background: '#000', color: '#fff', border: 'none' }}>Next Track</button>
                    </div>
                  </div>

                  {/* Tracklist */}
                  <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}>
                    {playlist.tracks.map((item, idx) => {
                      const track = item.track || item.trackId || item;
                      const isActive = idx === currentIndex;
                      return (
                        <div 
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          style={{ 
                            padding: '12px 16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 12,
                            cursor: 'pointer',
                            background: isActive ? '#FAFAFA' : '#fff',
                            borderLeft: isActive ? '3px solid #000' : '3px solid transparent',
                            borderBottom: '1px solid #F0F0F0'
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#000' : '#CCC', width: 20 }}>{idx + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: '#000' }}>{track?.title}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>{track?.artist}</div>
                          </div>
                          {isActive && <div style={{ fontSize: 10, fontWeight: 700, color: '#000' }}>PLAYING</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Library & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* LIBRARY */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={sectionTitle}>Library</h2>
                <span style={{ fontSize: 12, color: '#888' }}>{tracks.length} tracks</span>
              </div>

              <div style={{ 
                maxHeight: 400, 
                overflowY: 'auto', 
                margin: '0 -20px',
                padding: '0 20px',
              }}>
                {tracks.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#999', fontSize: 13 }}>Empty library</div>
                ) : (
                  tracks.map((t) => (
                    <div key={t._id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '12px 0',
                      borderBottom: '1px solid #F5F5F5'
                    }}>
                      <div style={{ overflow: 'hidden', marginRight: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{t.artist}</div>
                      </div>
                      <div 
                        style={{ fontSize: 18, cursor: 'default', opacity: 0.2 }}
                      >
                        🎵
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* STATS */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={sectionTitle}>Top Charts</h2>
                <button 
                  onClick={fetchTopTracks} 
                  disabled={loadingTop}
                  style={{ ...btnSecondary, fontSize: 10, padding: '4px 10px' }}
                >
                  REFRESH
                </button>
              </div>

              {topTracks.length === 0 ? (
                <div style={{ fontSize: 13, color: '#999', fontStyle: 'italic' }}>No data yet. Generate some mixes!</div>
              ) : (
                <div>
                  {topTracks.map((t, i) => (
                    <div key={t._id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: 12,
                      background: i === 0 ? '#FAFAFA' : 'transparent',
                      borderRadius: 12,
                      padding: i === 0 ? 12 : '8px 0'
                    }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: 12, 
                        background: i < 3 ? '#000' : '#F0F0F0', 
                        color: i < 3 ? '#fff' : '#888',
                        fontSize: 11, 
                        fontWeight: 700,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        marginRight: 12
                      }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                        <div style={{ fontSize: 11, color: '#888' }}>{t.usageCount} plays</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
