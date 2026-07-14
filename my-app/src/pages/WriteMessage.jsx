import { useState } from 'react';
import { addMessage } from '../supabaseClient';
import { YELLOW, BLUE, CREAM, PAGE_BACKGROUND } from '../theme';

const styles = {
  page: {
    minHeight: '100vh',
    background: PAGE_BACKGROUND,
    fontFamily: 'sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: CREAM,
    border: `2px solid ${BLUE}`,
    borderRadius: '20px',
    padding: '30px 25px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 10px 30px rgba(37,99,235,0.25)',
  },
  title: {
    fontFamily: "'Great Vibes', cursive",
    fontSize: 'clamp(32px, 9vw, 42px)',
    fontWeight: 'normal',
    color: BLUE,
    margin: '0 0 20px 0',
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '15px',
    borderRadius: '10px',
    border: `2px solid ${BLUE}`,
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    resize: 'none',
    backgroundColor: 'white',
    color: '#1f2937',
    outline: 'none',
  },
  sendButton: {
    backgroundColor: YELLOW,
    color: BLUE,
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    marginBottom: '12px',
    boxShadow: '0 6px 20px rgba(255,212,0,0.5)',
  },
  backButton: {
    display: 'inline-block',
    backgroundColor: 'white',
    color: BLUE,
    border: `2px solid ${BLUE}`,
    padding: '10px 24px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  status: { marginTop: '14px', color: BLUE, fontWeight: '600' },
};

export default function WriteMessage() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setStatus('Sending love...');
    try {
      await addMessage(text);
      setStatus('Message sent successfully! 💛');
      setText('');
    } catch (error) {
      console.error(error);
      setStatus('Failed to send, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Leave a Note for Loujan &amp; Leon</h1>
        <textarea
          style={styles.textarea}
          placeholder="Write your wishes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button
          style={{ ...styles.sendButton, opacity: loading || !text.trim() ? 0.6 : 1 }}
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
        <a href="#" style={styles.backButton}>← Back to Home</a>
        {status && <p style={styles.status}>{status}</p>}
      </div>
    </div>
  );
}
