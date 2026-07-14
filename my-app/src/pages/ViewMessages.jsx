import React, { useEffect, useState } from 'react';
import { fetchMessages } from '../supabaseClient';

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAF6EE',
    padding: '40px 20px',
    fontFamily: "'Georgia', serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    color: '#182855',
    fontSize: '32px',
    fontFamily: "'Great Vibes', cursive, serif",
    marginBottom: '15px',
  },
  backButton: {
    backgroundColor: '#182855',
    color: 'white',
    padding: '10px 24px',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  noteCard: {
    backgroundColor: '#FFFDF9',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid #182855',
    boxShadow: '0 4px 10px rgba(24,40,85,0.1)',
    position: 'relative',
  },
  noteText: {
    color: '#182855',
    fontSize: '16px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap', // عشان يعرض المسافات والسطور صح
  },
  pin: {
    position: 'absolute',
    top: '-10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '20px',
  }
};

export default function ViewMessages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await fetchMessages();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    loadMessages();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Guestbook Notes 🍋</h1>
        <a href="#" style={styles.backButton}>Back to Home</a>
      </div>
      
      <div style={styles.grid}>
        {messages.map((msg, idx) => (
          <div key={idx} style={styles.noteCard}>
            <div style={styles.pin}>📌</div>
            <p style={styles.noteText}>{msg.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}