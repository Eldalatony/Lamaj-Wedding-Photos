import { useEffect, useState } from 'react';
import { fetchMessages } from '../supabaseClient';
import { BLUE, CREAM, PAGE_BACKGROUND } from '../theme';

const styles = {
  page: {
    minHeight: '100vh',
    background: PAGE_BACKGROUND,
    fontFamily: 'sans-serif',
    padding: '20px',
    paddingTop: '60px',
  },
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  noteCard: {
    position: 'relative',
    backgroundColor: CREAM,
    padding: '20px',
    borderRadius: '10px',
    border: `2px solid ${BLUE}`,
    boxShadow: '0 6px 16px rgba(37,99,235,0.25)',
  },
  noteText: {
    color: BLUE,
    fontSize: '16px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  pin: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '20px',
  },
  empty: { textAlign: 'center', color: BLUE, fontWeight: '600', marginTop: '60px', fontSize: '17px' },
};

export default function ViewMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setMessages(await fetchMessages());
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Guestbook Notes</h1>
        <a href="#" style={styles.backButton}>← Back to Home</a>
      </div>

      {loading ? (
        <p style={styles.empty}>Loading notes...</p>
      ) : messages.length === 0 ? (
        <p style={styles.empty}>No notes yet — be the first to leave one!</p>
      ) : (
        <div style={styles.grid}>
          {messages.map((msg, idx) => (
            <div key={idx} style={styles.noteCard}>
              <div style={styles.pin}>📌</div>
              <p style={styles.noteText}>{msg.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
