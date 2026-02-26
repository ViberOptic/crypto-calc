import React, { useState, useEffect } from 'react';
import { vigenere, affine, playfair, hill, enigma } from './cryptoUtils';
import FileCrypto from './FileCrypto';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [cipher, setCipher] = useState('vigenere');
  const [result, setResult] = useState('');

  // Sinkronisasi dengan script index.html
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return true; // Default Dark Mode
  });

  // Terapkan ke HTML saat tombol toggle ditekan
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleProcess = (isEncrypt) => {
    let output = "";
    if (!text || (!key && cipher !== 'enigma')) {
      setResult("Peringatan: Teks dan Kunci tidak boleh kosong!");
      return;
    }

    switch (cipher) {
      case 'vigenere': output = vigenere(text, key, isEncrypt); break;
      case 'affine': output = affine(text, key, isEncrypt); break;
      case 'playfair': output = playfair(text, key, isEncrypt); break;
      case 'hill': output = hill(text, key, isEncrypt); break;
      case 'enigma': output = enigma(text, key); break;
      default: break;
    }
    setResult(output);
  };

  const getKeyHelper = () => {
    switch(cipher) {
      case 'vigenere': return "Misal: RAHASIA";
      case 'affine': return "Misal: 5,8 (a coprime 26)";
      case 'playfair': return "Misal: MONARCHY";
      case 'hill': return "Misal: 6,24,1,13,16,10,20,17,15 (Matriks 3x3)"; 
      case 'enigma': return "Misal: 0 (Posisi rotor 0-25)";
      default: return "";
    }
  };

  return (
    <div 
      className="app-wrapper" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px', 
        minHeight: '100vh',
        overflowY: 'auto' 
      }}
    >
      {/* Suntikan CSS Global untuk Scrollbar.
        Mengubah seluruh scrollbar (baik halaman maupun textarea) menjadi elegan,
        serta secara khusus menghilangkan kotak putih pada sudut scrollbar (scrollbar-corner).
      */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
        /* Menghilangkan kotak putih menyebalkan di sudut/pojok scrollbar */
        ::-webkit-scrollbar-corner {
          background: transparent;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '700px' }}>
        
        {/* ========================================================== */}
        {/* BAGIAN 1: KALKULATOR TEKS KLASIK */}
        {/* ========================================================== */}
        <div className="calc-card">
          <div className="card-header-wrapper">
            <h2 className="header-title">
              <img src="/logo.png" alt="CryptoCalc Logo" className="icon-pulse app-logo" />
              <span className="title-text">CryptoCalc</span>
            </h2>
            <button 
              className="theme-toggle-btn" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Beralih ke Light Mode" : "Beralih ke Dark Mode"}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
          
          <div className="config-grid">
            <div className="form-group">
              <label htmlFor="cipher-select">Algoritma Kriptografi</label>
              <select 
                id="cipher-select"
                className="input-style"
                value={cipher} 
                onChange={(e) => { setCipher(e.target.value); setResult(''); }}
              >
                <option value="vigenere">Vigenere Cipher</option>
                <option value="affine">Affine Cipher</option>
                <option value="playfair">Playfair Cipher</option>
                <option value="hill">Hill Cipher (Matriks 3x3)</option>
                <option value="enigma">Enigma (Simulasi I-Rotor)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="key-input">Kunci Rahasia (Key)</label>
              <input 
                id="key-input"
                type="text" 
                className="input-style"
                value={key} 
                onChange={(e) => setKey(e.target.value)} 
                placeholder={getKeyHelper()} 
              />
              <span className="helper-text">{getKeyHelper()}</span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="text-input">Teks Input (Plaintext / Ciphertext)</label>
            <textarea 
              id="text-input"
              className="input-style"
              value={text} 
              onChange={(e) => setText(e.target.value)} 
              placeholder="Masukkan pesan yang ingin diproses di sini..."
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
          </div>

          <div className="action-buttons" style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => handleProcess(true)}
              style={{ 
                flex: 1, 
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.4)',
                transition: 'transform 0.2s'
              }}
            >
              🔒 Enkripsi Teks
            </button>
            <button 
              onClick={() => handleProcess(false)}
              style={{ 
                flex: 1, 
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', 
                color: 'white', 
                border: 'none', 
                padding: '14px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.4)',
                transition: 'transform 0.2s'
              }}
            >
              🔓 Dekripsi Teks
            </button>
          </div>

          <div className="result-container" style={{ marginTop: '20px' }}>
            <span className="result-label">Hasil Output:</span>
            <p className="result-output">
              {result || "Keluaran akan muncul di sini..."}
            </p>
          </div>
        </div>

        {/* ========================================================== */}
        {/* BAGIAN 2: PEMROSES FILE MODERN */}
        {/* ========================================================== */}
        <FileCrypto />

        {/* ========================================================== */}
        {/* BAGIAN 3: DATA DEVELOPER */}
        {/* ========================================================== */}
        <div className="calc-card">
          <div className="developer-card" style={{ marginTop: '0', border: 'none', background: 'transparent' }}>
            <div className="dev-header">👨‍💻 Data Developer</div>
            <div className="dev-details">
              <div className="dev-row">
                <span className="dev-label">Nama</span>
                <span className="dev-value">Muhammad Azka Wijasena</span>
              </div>
              <div className="dev-row">
                <span className="dev-label">NIM</span>
                <span className="dev-value">21120123140125</span>
              </div>
              <div className="dev-row">
                <span className="dev-label">Kelas</span>
                <span className="dev-value">Kriptografi - A</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;