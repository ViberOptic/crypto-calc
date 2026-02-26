import React, { useState, useRef } from 'react';
import './App.css';

function FileCrypto() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);

  // Mengubah password menjadi CryptoKey menggunakan PBKDF2
  const deriveKey = async (passwordKey, salt, keyUsage) => {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(passwordKey),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      keyUsage
    );
  };

  const handleProcess = async (isEncrypt) => {
    if (!file || !password) {
      alert("Peringatan: File dan Password tidak boleh kosong!");
      return;
    }

    setIsProcessing(true);
    try {
      const fileBuffer = await file.arrayBuffer();
      
      if (isEncrypt) {
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(password, salt, ["encrypt"]);
        
        const encryptedContent = await window.crypto.subtle.encrypt(
          { name: "AES-GCM", iv: iv },
          key,
          fileBuffer
        );

        const encryptedBlob = new Blob([salt, iv, encryptedContent], { type: 'application/octet-stream' });
        downloadFile(encryptedBlob, `encrypted_${file.name}.enc`);
      } else {
        const fileData = new Uint8Array(fileBuffer);
        const salt = fileData.slice(0, 16);
        const iv = fileData.slice(16, 28);
        const ciphertext = fileData.slice(28);

        const key = await deriveKey(password, salt, ["decrypt"]);
        
        const decryptedContent = await window.crypto.subtle.decrypt(
          { name: "AES-GCM", iv: iv },
          key,
          ciphertext
        );

        let originalName = file.name.replace(/^encrypted_/, '').replace(/\.enc$/, '');
        const decryptedBlob = new Blob([decryptedContent]);
        downloadFile(decryptedBlob, `decrypted_${originalName}`);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal memproses file. Pastikan file dan password benar untuk dekripsi.");
    }
    setIsProcessing(false);
  };

  const downloadFile = (blob, fileName) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- Fungsi Handler Drag & Drop ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="calc-card">
      <h3 style={{ textAlign: 'center', marginBottom: '5px' }}>📁 Pemroses File</h3>
      <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#888', marginBottom: '20px' }}>
        Gambar, Video, Audio, DB (AES-GCM 256-bit)
      </p>
      
      {/* Container diubah menjadi flex column agar atas-bawah */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Area 1: Dropzone File */}
        <div className="form-group" style={{ display: 'flex', flexDirection: 'column', margin: 0 }}>
          <label style={{ marginBottom: '8px' }}>Pilih atau Tarik File</label>
          
          {/* Input file asli disembunyikan */}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files.length > 0) setFile(e.target.files[0]);
            }} 
            style={{ display: 'none' }}
          />

          {/* Area Drag and Drop */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleAreaClick}
            style={{
              border: isDragging ? '2px dashed #10b981' : '2px dashed #6366f1',
              backgroundColor: isDragging ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.05)',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px', transition: 'transform 0.2s', transform: isDragging ? 'scale(1.1)' : 'scale(1)' }}>
              {file ? '📄' : '☁️'}
            </div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: file ? '#10b981' : 'inherit' }}>
              {file ? file.name : "Drag & Drop file ke sini"}
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>
              {file ? `Ukuran: ${(file.size / 1024).toFixed(2)} KB` : "atau klik untuk mencari file dari perangkat"}
            </p>
          </div>

          {/* Tombol Hapus File (Muncul kalau ada file) */}
          {file && (
            <button 
              onClick={() => setFile(null)}
              style={{
                alignSelf: 'center',
                background: 'transparent',
                border: '1px solid #ef4444',
                color: '#ef4444',
                padding: '6px 16px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginTop: '12px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.background = '#fef2f2'; }}
              onMouseOut={(e) => { e.target.style.background = 'transparent'; }}
            >
              Hapus / Ganti File
            </button>
          )}
        </div>

        {/* Area 2: Input Password */}
        <div className="form-group" style={{ margin: 0 }}>
          <label htmlFor="file-password">Password / Kunci</label>
          <input 
            id="file-password"
            type="password" 
            className="input-style"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Masukkan password rahasia..." 
            style={{ width: '100%' }} // Memastikan input password terentang penuh
          />
        </div>
      </div>

      {/* Area 3: Tombol Aksi */}
      <div className="action-buttons" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <button 
          onClick={() => handleProcess(true)} 
          disabled={isProcessing}
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
            transition: 'transform 0.2s, opacity 0.2s',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? "Memproses..." : "🔒 Enkripsi File"}
        </button>
        <button 
          onClick={() => handleProcess(false)} 
          disabled={isProcessing}
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
            transition: 'transform 0.2s, opacity 0.2s',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          {isProcessing ? "Memproses..." : "🔓 Dekripsi File"}
        </button>
      </div>
    </div>
  );
}

export default FileCrypto;