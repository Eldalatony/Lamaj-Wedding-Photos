import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fff5f5', fontFamily: 'sans-serif', padding: '20px', textAlign: 'center' },
  card: { backgroundColor: '#ffffff', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' },
  title: { color: '#d63031', marginBottom: '10px', fontSize: '28px', fontWeight: 'bold' },
  subtitle: { color: '#636e72', marginBottom: '30px', fontSize: '15px', lineHeight: '1.5' },
  uploadButton: { backgroundColor: '#d63031', color: 'white', padding: '16px 32px', borderRadius: '50px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(214,48,49,0.3)', display: 'inline-block' },
  statusText: { marginTop: '25px', fontSize: '16px', color: '#2d3436', fontWeight: '500' }
};

function App() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');

  const handleCameraUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      setStatus('Uploading your memory... 📸');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

      // Hna m2flenha capital exact zay el-Supabase dashboard 3andak!
      const { data, error } = await supabase.storage
        .from('wedding-photos')
        .upload(fileName, file);

      if (error) throw error;

      setStatus('Uploaded Successfully! 🎉 Thank you!');
    } catch (error) {
      console.error(error);
      setStatus('Upload failed, please try again. ❌');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Wedding Album 💍</h1>
        <p style={styles.subtitle}>Capture a beautiful memory live and share it directly with the bride and groom!</p>

        <label style={{ ...styles.uploadButton, opacity: uploading ? 0.6 : 1 }}>
          {uploading ? 'Uploading...' : '📸 Take a Photo'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>

        {status && <p style={styles.statusText}>{status}</p>}
      </div>
    </div>
  );
}

export default App;