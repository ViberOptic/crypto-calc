import React, { useState } from 'react';
import { vigenere, affine, playfair, hill, enigma } from './cryptoUtils';
import './App.css'; // Import file CSS di sini!

function App() {
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [cipher, setCipher] = useState('vigenere');
  const [result, setResult] = useState('');

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
      case 'hill': return "Misal: 3,3,2,5 (Matriks 2x2)";
      case 'enigma': return "Misal: 0 (Posisi rotor 0-25)";
      default: return "";
    }
  };

  return (
    <div className="app-wrapper">
      <div className="calc-card">
        <h2 className="header-title">
          <span>🛡️</span> CryptoCalc
        </h2>
        
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
              <option value="hill">Hill Cipher (Matriks 2x2)</option>
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
          />
        </div>

        <div className="action-buttons">
          <button className="btn btn-encrypt" onClick={() => handleProcess(true)}>
            🔒 Enkripsi
          </button>
          <button className="btn btn-decrypt" onClick={() => handleProcess(false)}>
            🔓 Dekripsi
          </button>
        </div>

        <div className="result-container">
          <span className="result-label">Hasil Output:</span>
          <p className="result-output">
            {result || "Keluaran akan muncul di sini..."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;