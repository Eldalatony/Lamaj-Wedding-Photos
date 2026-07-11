import React, { useState } from 'react';
import { addMessage } from '../supabaseClient';

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAF6EE',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Georgia', serif",
  },
  card: {
    backgroundColor: '#FFFDF9',
    padding: '40px 25px',
    borderRadius: '15px',
    border: '3px double #182855',
    boxShadow: '0 15px 35px rgba(24,40,85,0.2)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  title: {
    color: '#182855',
    fontSize: '24px',
    marginBottom: '20px',
    fontFamily: "'Great Vibes', cursive, serif",
  },
  textarea: {
    width: '100%',
    height: '150px',
    padding: '15px',
    borderRadius: '10px',
    border: '1px solid #182855',
    fontSize: '16px',
    marginBottom: '20px',
    boxSizing: 'border-box',
    resize: 'none',
    backgroundColor: '#FAF6EE',
  },
  button: {
    backgroundColor: '#FFD000',
    color: '#182855',
    padding: '12px 24px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid #182855',
    width: '100%',
    marginBottom: '10px',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#182855',
    padding: '10px 24px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: '2px solid #182855',
    textDecoration: 'none',
    display: 'inline-block',
    width: '100%',
    boxSizing: 'border-box'
  },
  status: {
    marginTop: '10px',
    color: '#182855',
    fontWeight: 'bold',
  }
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
      setText(''); // نفضي المربع
    } catch (error) {
      console.error(error);
      setStatus('Failed to send, try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Leave a Note for Loujan & Leon</h2>
        <textarea
          style={styles.textarea}
          placeholder="Write your wishes here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        <button style={styles.button} onClick={handleSubmit} disabled={loading || !text.trim()}>
          {loading ? 'Sending...' : 'Send Message'}
        </button>
        <a href="#" style={styles.backButton}>Back to Home</a>
        {status && <p style={styles.status}>{status}</p>}
      </div>
    </div>
  );
}