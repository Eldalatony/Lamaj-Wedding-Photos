import { useState, useEffect } from 'react';
import { listPhotos, getFavorites, addFavorite, removeFavorite, deletePhoto, favKey } from '../supabaseClient';
import { YELLOW, BLUE, CREAM, PAGE_BACKGROUND } from '../theme';

// El-password mawgood fel-.env file
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

const styles = {
  page: { minHeight: '100vh', background: PAGE_BACKGROUND, fontFamily: 'sans-serif', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  title: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(40px, 10vw, 60px)',
    fontWeight: 'normal',
    color: BLUE,
    margin: '0 0 4px 0',
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
  loginCard: {
    backgroundColor: CREAM,
    border: `2px solid ${BLUE}`,
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '340px',
    margin: '80px auto 0',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(37,99,235,0.25)',
  },
  passwordInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    borderRadius: '10px',
    border: `2px solid ${BLUE}`,
    marginBottom: '16px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  loginButton: {
    backgroundColor: YELLOW,
    color: BLUE,
    border: 'none',
    padding: '12px 32px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: CREAM,
    padding: '7px',
    borderRadius: '3px',
    boxShadow: '0 6px 16px rgba(37,99,235,0.25)',
    textAlign: 'center',
  },
  img: { display: 'block', width: '100%', aspectRatio: '1', objectFit: 'cover', backgroundColor: '#e8eefc' },
  actions: { display: 'flex', gap: '8px', marginTop: '8px' },
  favButton: {
    flex: 1,
    border: `2px solid ${YELLOW}`,
    borderRadius: '8px',
    padding: '8px 4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 4px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  empty: { textAlign: 'center', color: BLUE, fontWeight: '600', marginTop: '60px', fontSize: '17px' },
  error: { color: '#e74c3c', fontWeight: '600', marginTop: '10px' },
};

function Admin() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('adminAuthed') === '1');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);

  useEffect(() => {
    if (!authed) return;
    (async () => {
      try {
        const [ph, favs] = await Promise.all([listPhotos(), getFavorites()]);
        setPhotos(ph);
        setFavSet(new Set(favs.map(favKey)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('adminAuthed', '1');
      setAuthed(true);
    } else {
      setLoginError('Wrong password');
    }
  };

  const handleToggleFavorite = async (photo) => {
    const key = favKey(photo);
    setBusyKey(key);
    try {
      if (favSet.has(key)) {
        await removeFavorite(photo);
        setFavSet((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      } else {
        await addFavorite(photo);
        setFavSet((prev) => new Set(prev).add(key));
      }
    } catch (err) {
      console.error(err);
      alert('Action failed, try again.');
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Delete this photo permanently?')) return;
    const key = favKey(photo);
    setBusyKey(key);
    try {
      await deletePhoto(photo);
      setPhotos((prev) => prev.filter((p) => favKey(p) !== key));
    } catch (err) {
      console.error(err);
      alert('Delete failed, try again.');
    } finally {
      setBusyKey(null);
    }
  };

  if (!authed) {
    return (
      <div style={styles.page}>
        <form style={styles.loginCard} onSubmit={handleLogin}>
          <h1 style={{ ...styles.title, fontSize: '44px' }}>Admin</h1>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            style={styles.passwordInput}
          />
          <button type="submit" style={styles.loginButton}>Enter</button>
          {loginError && <p style={styles.error}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin</h1>
        <a href="#" style={styles.backButton}>← Back</a>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading photos...</p>
      ) : photos.length === 0 ? (
        <p style={styles.empty}>No photos yet.</p>
      ) : (
        <div style={styles.grid}>
          {photos.map((photo) => {
            const key = favKey(photo);
            const isFav = favSet.has(key);
            const busy = busyKey === key;
            return (
              <div key={key} style={styles.card}>
                <img src={photo.url} alt="" loading="lazy" style={styles.img} />
                <div style={styles.actions}>
                  <button
                    onClick={() => handleToggleFavorite(photo)}
                    disabled={busy}
                    style={{
                      ...styles.favButton,
                      backgroundColor: isFav ? YELLOW : 'white',
                      color: BLUE,
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {isFav ? 'Favorited' : 'Favorite'}
                  </button>
                  <button
                    onClick={() => handleDelete(photo)}
                    disabled={busy}
                    style={{ ...styles.deleteButton, opacity: busy ? 0.5 : 1 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Admin;
