import { useState, useEffect, useMemo, useCallback } from 'react';
import { uploadPhoto, listPhotos, getFavorites, favKey } from './supabaseClient';
import { YELLOW, BLUE, CREAM, PAGE_BACKGROUND } from './theme';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';

const styles = {
  container: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    background: PAGE_BACKGROUND,
    fontFamily: 'sans-serif',
  },
  wall: { position: 'absolute', inset: 0, zIndex: 1 },
  polaroid: {
    position: 'absolute',
    width: '31vw',
    maxWidth: '175px',
    padding: '7px 7px 24px 7px',
    backgroundColor: '#fffdf5',
    borderRadius: '3px',
    boxShadow: '0 10px 25px rgba(37,99,235,0.35)',
  },
  polaroidImg: {
    display: 'block',
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover',
    backgroundColor: '#e8eefc',
  },
  overlay: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  title: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(44px, 12vw, 72px)',
    fontWeight: 'normal',
    lineHeight: 1.15,
    color: BLUE,
    margin: '0 0 8px 0',
  },
  // Frame zay el-invitation: cream arch b-double blue border
  card: {
    pointerEvents: 'auto',
    backgroundColor: CREAM,
    padding: 'clamp(40px, 11vw, 52px) clamp(20px, 6vw, 28px) clamp(28px, 8vw, 38px)',
    borderRadius: '170px 170px 26px 26px',
    border: `2px solid ${BLUE}`,
    boxShadow: `inset 0 0 0 6px ${CREAM}, inset 0 0 0 8px ${BLUE}, 0 18px 50px rgba(37, 99, 235, 0.25)`,
    width: 'min(85vw, 350px)',
  },
  subtitle: { color: BLUE, marginBottom: '24px', fontSize: '14px', lineHeight: '1.6', fontWeight: '600' },
  uploadButton: {
    backgroundColor: YELLOW,
    color: BLUE,
    padding: '16px 32px',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(255,212,0,0.5)',
    display: 'inline-block',
  },
  galleryButton: {
    display: 'inline-block',
    marginTop: '14px',
    backgroundColor: 'white',
    color: BLUE,
    border: `2px solid ${BLUE}`,
    padding: '12px 28px',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  viewAllButton: {
    display: 'inline-block',
    marginTop: '16px',
    backgroundColor: BLUE,
    color: 'white',
    padding: '12px 28px',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 'bold',
    textDecoration: 'none',
    boxShadow: '0 6px 20px rgba(37,99,235,0.4)',
  },
  statusText: { marginTop: '22px', fontSize: '16px', color: BLUE, fontWeight: '600' },
};

// Grid mel-slots metghattya el-shasha kollaha, ma3 jitter w meil 3ashwa2y zay el-polaroids.
// El-frames akbar men el-cells shwayya 3ashan yerkabo fo2 ba3d bel-atraf bas
const COLS = 4;
const ROWS = 7;
function makeSlots() {
  const slots = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      slots.push({
        left: ((c + 0.5) / COLS) * 100 + (Math.random() * 10 - 5),
        top: ((r + 0.5) / ROWS) * 100 + (Math.random() * 6 - 3),
        rot: Math.random() * 28 - 14,
        z: Math.floor(Math.random() * 10),
      });
    }
  }
  return slots;
}

function Home() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [photos, setPhotos] = useState([]);
  const [favSet, setFavSet] = useState(new Set());

  const slots = useMemo(() => makeSlots(), []);

  const refreshPhotos = useCallback(async () => {
    try {
      const [ph, favs] = await Promise.all([listPhotos(), getFavorites()]);
      setPhotos(ph);
      setFavSet(new Set(favs.map(favKey)));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshPhotos();
    })();
  }, [refreshPhotos]);

  // El-frames beto3 el-home yewarru el-favorites bas
  const wallPhotos = useMemo(
    () => photos.filter((p) => favSet.has(favKey(p))),
    [photos, favSet]
  );

  const handleCameraUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;

    let done = 0;

    setUploading(true);
    try {
      for (const [i, file] of files.entries()) {
        setStatus(files.length > 1 ? `Uploading ${i + 1} of ${files.length}...` : 'Uploading your memory...');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

        await uploadPhoto(fileName, file);

        done++;
      }

      setStatus('Uploaded Successfully! Thank you!');
    } catch (error) {
      console.error(error);
      setStatus(done > 0 ? `Uploaded ${done} of ${files.length}, then failed. Please try again.` : 'Upload failed, please try again.');
    } finally {
      if (done > 0) refreshPhotos();
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wall}>
        {slots.map((slot, i) => (
          <div
            key={i}
            style={{
              ...styles.polaroid,
              left: `${slot.left}%`,
              top: `${slot.top}%`,
              zIndex: slot.z,
              transform: `translate(-50%, -50%) rotate(${slot.rot}deg)`,
            }}
          >
            {wallPhotos.length > 0 ? (
              <img src={wallPhotos[i % wallPhotos.length].url} alt="" loading="lazy" style={styles.polaroidImg} />
            ) : (
              <div style={styles.polaroidImg} />
            )}
          </div>
        ))}
      </div>

      <div style={styles.overlay}>
        <div style={styles.card}>
          <h1 style={styles.title}>Loujan &amp; Leon</h1>
          <p style={styles.subtitle}>Capture a beautiful memory live and share it directly with the bride and groom!</p>

          <label style={{ ...styles.uploadButton, opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Uploading...' : 'Take a Photo'}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>

          <br />
          <label style={{ ...styles.galleryButton, opacity: uploading ? 0.6 : 1 }}>
            {uploading ? 'Uploading...' : 'Choose from Gallery'}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleCameraUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>

          <br />
          <a href="#all" style={styles.viewAllButton}>View All Photos</a>

          {status && <p style={styles.statusText}>{status}</p>}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (route === '#all') return <Gallery />;
  if (route === '#admin') return <Admin />;
  return <Home />;
}

export default App;
