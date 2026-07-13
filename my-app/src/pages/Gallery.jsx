import { useState, useEffect } from 'react';
import { listPhotos, favKey } from '../supabaseClient';
import { BLUE, CREAM, PAGE_BACKGROUND } from '../theme';

const styles = {
  page: { minHeight: '100vh', background: PAGE_BACKGROUND, fontFamily: 'sans-serif', padding: '20px', paddingTop: '60px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(40px, 10vw, 60px)',
    fontWeight: 'normal',
    color: BLUE,
    margin: '0 0 18px 0',
  },
  backButton: {
    display: 'inline-block',
    backgroundColor: BLUE,
    color: 'white',
    padding: '10px 24px',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: 'bold',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(37,99,235,0.35)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  polaroid: {
    position: 'relative',
    backgroundColor: CREAM,
    padding: '9px 9px 28px 9px',
    borderRadius: '3px',
    boxShadow: '0 6px 16px rgba(37,99,235,0.25)',
    cursor: 'pointer',
  },
  img: { display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', backgroundColor: '#e8eefc' },
  empty: { textAlign: 'center', color: BLUE, fontWeight: '600', marginTop: '60px', fontSize: '17px' },
  lightbox: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.88)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    cursor: 'zoom-out',
  },
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '4px',
    boxShadow: '0 10px 50px rgba(0,0,0,0.6)',
  },
  lightboxClose: {
    position: 'fixed',
    top: '16px',
    right: '20px',
    zIndex: 101,
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    fontSize: '22px',
    fontWeight: 'bold',
    cursor: 'pointer',
    lineHeight: 1,
  },
};

function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setPhotos(await listPhotos());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!fullscreenPhoto) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setFullscreenPhoto(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreenPhoto]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Loujan &amp; Leon</h1>
        <a href="#" style={styles.backButton}>← Back</a>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading memories...</p>
      ) : photos.length === 0 ? (
        <p style={styles.empty}>No photos yet — be the first to share a memory!</p>
      ) : (
        <div style={styles.grid}>
          {photos.map((photo) => (
            <div key={favKey(photo)} style={styles.polaroid} onClick={() => setFullscreenPhoto(photo)}>
              <img src={photo.url} alt="" loading="lazy" style={styles.img} />
            </div>
          ))}
        </div>
      )}

      {fullscreenPhoto && (
        <div style={styles.lightbox} onClick={() => setFullscreenPhoto(null)}>
          <button style={styles.lightboxClose} onClick={() => setFullscreenPhoto(null)}>×</button>
          <img src={fullscreenPhoto.url} alt="" style={styles.lightboxImg} />
        </div>
      )}
    </div>
  );
}

export default Gallery;
