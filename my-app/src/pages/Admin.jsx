import { useState, useEffect, useRef } from 'react';
import { listPhotos, getFavorites, addFavorite, removeFavorite, deletePhoto, favKey } from '../supabaseClient';
import { YELLOW, BLUE, CREAM, PAGE_BACKGROUND } from '../theme';

// El-password mawgood fel-.env file
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// Benrender el-sowar 3ala batches 3ashan el-page teftah bsor3a
const BATCH_SIZE = 60;

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
    // El-browser byeskip el-render lel-cards elly barra el-shasha
    contentVisibility: 'auto',
    containIntrinsicSize: '180px 220px',
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
  toolbar: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '1100px',
    margin: '0 auto 20px auto',
  },
  toolbarButton: {
    backgroundColor: 'white',
    color: BLUE,
    border: `2px solid ${BLUE}`,
    padding: '8px 18px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  toolbarDelete: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: '2px solid #e74c3c',
    padding: '8px 18px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  toolbarInfo: { color: BLUE, fontSize: '14px', fontWeight: 'bold' },
  checkmark: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: BLUE,
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
};

function Admin() {
  const [authed, setAuthed] = useState(sessionStorage.getItem('adminAuthed') === '1');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [favSet, setFavSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkBusy, setBulkBusy] = useState(false);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);

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

  const toggleSelected = (photo) => {
    const key = favKey(photo);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
    setBulkStatus('');
  };

  const selectedPhotos = photos.filter((p) => selected.has(favKey(p)));
  const hasMore = visibleCount < photos.length;

  // Lamma el-sentinel yeban ta7t, benzawwed batch kaman
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => c + BATCH_SIZE);
      },
      { rootMargin: '800px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore]);

  const handleBulkDelete = async () => {
    if (selectedPhotos.length === 0) return;
    if (!window.confirm(`Delete ${selectedPhotos.length} photos permanently?`)) return;

    setBulkBusy(true);
    let failed = 0;
    for (const [i, photo] of selectedPhotos.entries()) {
      setBulkStatus(`Deleting ${i + 1} of ${selectedPhotos.length}...`);
      try {
        await deletePhoto(photo);
        const key = favKey(photo);
        setPhotos((prev) => prev.filter((p) => favKey(p) !== key));
      } catch (err) {
        console.error(err);
        failed++;
      }
    }
    setBulkBusy(false);
    setBulkStatus(failed > 0 ? `Done, but ${failed} failed — try again.` : '');
    if (failed === 0) exitSelectMode();
    else setSelected(new Set());
  };

  // Beynazzel kol sora lewa7daha (el-browser hayes2al marra wa7da 3an multiple downloads)
  const handleBulkDownload = async () => {
    if (selectedPhotos.length === 0) return;

    setBulkBusy(true);
    let failed = 0;
    for (const [i, photo] of selectedPhotos.entries()) {
      setBulkStatus(`Downloading ${i + 1} of ${selectedPhotos.length}...`);
      try {
        const res = await fetch(photo.url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = photo.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        failed++;
      }
    }
    setBulkBusy(false);
    setBulkStatus(failed > 0 ? `Downloaded ${selectedPhotos.length - failed}, ${failed} failed.` : `Downloaded ${selectedPhotos.length} photos.`);
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

      {!loading && photos.length > 0 && (
        <div style={styles.toolbar}>
          {!selectMode ? (
            <button style={styles.toolbarButton} onClick={() => setSelectMode(true)}>Select photos</button>
          ) : (
            <>
              <span style={styles.toolbarInfo}>{selected.size} selected</span>
              <button
                style={styles.toolbarButton}
                disabled={bulkBusy}
                onClick={() =>
                  setSelected(selected.size === photos.length ? new Set() : new Set(photos.map(favKey)))
                }
              >
                {selected.size === photos.length ? 'Clear all' : 'Select all'}
              </button>
              <button
                style={{ ...styles.toolbarButton, opacity: bulkBusy || selected.size === 0 ? 0.5 : 1 }}
                disabled={bulkBusy || selected.size === 0}
                onClick={handleBulkDownload}
              >
                Download
              </button>
              <button
                style={{ ...styles.toolbarDelete, opacity: bulkBusy || selected.size === 0 ? 0.5 : 1 }}
                disabled={bulkBusy || selected.size === 0}
                onClick={handleBulkDelete}
              >
                Delete
              </button>
              <button style={styles.toolbarButton} disabled={bulkBusy} onClick={exitSelectMode}>Cancel</button>
              {bulkStatus && <span style={styles.toolbarInfo}>{bulkStatus}</span>}
            </>
          )}
        </div>
      )}

      {loading ? (
        <p style={styles.empty}>Loading photos...</p>
      ) : photos.length === 0 ? (
        <p style={styles.empty}>No photos yet.</p>
      ) : (
        <>
        <div style={styles.grid}>
          {photos.slice(0, visibleCount).map((photo) => {
            const key = favKey(photo);
            const isFav = favSet.has(key);
            const busy = busyKey === key;
            const isSelected = selected.has(key);
            return (
              <div
                key={key}
                onClick={selectMode && !bulkBusy ? () => toggleSelected(photo) : undefined}
                style={{
                  ...styles.card,
                  position: 'relative',
                  cursor: selectMode ? 'pointer' : 'default',
                  outline: isSelected ? `3px solid ${BLUE}` : 'none',
                }}
              >
                <img src={photo.url} alt="" loading="lazy" style={styles.img} />
                {selectMode && isSelected && <div style={styles.checkmark}>✓</div>}
                {!selectMode && (
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
                )}
              </div>
            );
          })}
        </div>
        {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
        </>
      )}
    </div>
  );
}

export default Admin;
