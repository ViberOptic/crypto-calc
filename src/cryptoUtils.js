// src/cryptoUtils.js

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Helper: mod negatif ke positif
const mod = (n, m) => ((n % m) + m) % m;

// 1. VIGENERE CIPHER
export const vigenere = (text, key, isEncrypt) => {
    let result = "";
    let j = 0;
    key = key.toUpperCase().replace(/[^A-Z]/g, "") || "KEY";
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i].toUpperCase();
        if (alphabet.includes(char)) {
            let p = char.charCodeAt(0) - 65;
            let k = key[j % key.length].charCodeAt(0) - 65;
            let c = isEncrypt ? mod(p + k, 26) : mod(p - k, 26);
            result += String.fromCharCode(c + 65);
            j++;
        } else {
            result += char; // Biarkan spasi/simbol
        }
    }
    return result;
};

// 2. AFFINE CIPHER (Key format: "a,b" misal "5,8")
const modInverse = (a, m) => {
    for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return 1;
};

export const affine = (text, key, isEncrypt) => {
    let [a, b] = key.split(",").map(Number);
    if (isNaN(a) || isNaN(b)) return "Error: Kunci harus format 'a,b' (contoh: 5,8)";
    if (modInverse(a, 26) === 1 && a !== 1) return "Error: 'a' tidak coprime dengan 26";

    let result = "";
    let aInv = modInverse(a, 26);

    for (let char of text.toUpperCase()) {
        if (alphabet.includes(char)) {
            let x = char.charCodeAt(0) - 65;
            let c = isEncrypt ? mod(a * x + b, 26) : mod(aInv * (x - b), 26);
            result += String.fromCharCode(c + 65);
        } else {
            result += char;
        }
    }
    return result;
};

// 3. PLAYFAIR CIPHER (Menghilangkan 'J' dan menggunakan padding 'Q')
export const playfair = (text, key, isEncrypt) => {
    key = key.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I") + alphabet.replace(/J/g, "");
    let matrix = [...new Set(key)]; // Ambil karakter unik
    
    let processText = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
    
    // Menggunakan padding Q sesuai preferensi uji coba Anda
    let padChar = 'Q'; 
    let altPadChar = 'X'; // Jika huruf aslinya sudah Q, gunakan X
    
    if (isEncrypt) {
        let temp = "";
        for (let i = 0; i < processText.length; i += 2) {
            temp += processText[i];
            if (i + 1 < processText.length) {
                if (processText[i] === processText[i + 1]) { 
                    // Sisipkan Q jika ada huruf ganda
                    temp += (processText[i] === padChar ? altPadChar : padChar); 
                    i--; 
                } 
                else { 
                    temp += processText[i + 1]; 
                }
            }
        }
        // Jika di akhir jumlahnya ganjil, tambahkan Q
        if (temp.length % 2 !== 0) {
            temp += (temp[temp.length - 1] === padChar ? altPadChar : padChar);
        }
        processText = temp;
    } else {
        if (processText.length % 2 !== 0) return "Error: Ciphertext Playfair harus genap.";
    }

    let result = "";
    for (let i = 0; i < processText.length; i += 2) {
        let a = processText[i], b = processText[i + 1];
        let r1 = Math.floor(matrix.indexOf(a) / 5), c1 = matrix.indexOf(a) % 5;
        let r2 = Math.floor(matrix.indexOf(b) / 5), c2 = matrix.indexOf(b) % 5;

        // Aturan matriks Playfair
        if (r1 === r2) {
            result += matrix[r1 * 5 + mod(c1 + (isEncrypt ? 1 : -1), 5)] + matrix[r2 * 5 + mod(c2 + (isEncrypt ? 1 : -1), 5)];
        } else if (c1 === c2) {
            result += matrix[mod(r1 + (isEncrypt ? 1 : -1), 5) * 5 + c1] + matrix[mod(r2 + (isEncrypt ? 1 : -1), 5) * 5 + c2];
        } else {
            result += matrix[r1 * 5 + c2] + matrix[r2 * 5 + c1];
        }
    }
    return result;
};

// 4. HILL CIPHER (Matriks 3x3. Key format: "k00,k01,k02,k10,k11,k12,k20,k21,k22")
export const hill = (text, key, isEncrypt) => {
    let keys = key.split(",").map(Number);
    // Sekarang butuh 9 angka untuk matriks 3x3
    if (keys.length !== 9) return "Error: Butuh 9 angka dipisah koma untuk matriks 3x3 (contoh: 6,24,1,13,16,10,20,17,15)";
    
    let [k00, k01, k02, k10, k11, k12, k20, k21, k22] = keys;
    
    // 1. Hitung determinan matriks 3x3
    let det = k00 * (k11 * k22 - k12 * k21) - 
              k01 * (k10 * k22 - k12 * k20) + 
              k02 * (k10 * k21 - k11 * k20);
    det = mod(det, 26);
    
    // 2. Hitung Invers Modulo dari determinan
    let detInv = modInverse(det, 26);
    if (detInv === 1 && det !== 1) return "Error: Determinan matriks tidak coprime dengan 26";
    
    // 3. Susun matriks Enkripsi atau Dekripsi (Invers matriks 3x3)
    let matrix = [];
    if (isEncrypt) {
        matrix = [
            [k00, k01, k02],
            [k10, k11, k12],
            [k20, k21, k22]
        ];
    } else {
        // Matriks Dekripsi (Adjoin dikali detInv modulo 26)
        matrix = [
            [
                mod((k11 * k22 - k12 * k21) * detInv, 26), 
                mod(-(k01 * k22 - k02 * k21) * detInv, 26), 
                mod((k01 * k12 - k02 * k11) * detInv, 26)
            ],
            [
                mod(-(k10 * k22 - k12 * k20) * detInv, 26), 
                mod((k00 * k22 - k02 * k20) * detInv, 26), 
                mod(-(k00 * k12 - k02 * k10) * detInv, 26)
            ],
            [
                mod((k10 * k21 - k11 * k20) * detInv, 26), 
                mod(-(k00 * k21 - k01 * k20) * detInv, 26), 
                mod((k00 * k11 - k01 * k10) * detInv, 26)
            ]
        ];
    }
    
    // Bersihkan teks dan pastikan panjangnya kelipatan 3 (padding dengan X)
    let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
    while (cleanText.length % 3 !== 0) cleanText += "X";
    
    // 4. Proses Enkripsi/Dekripsi dengan perkalian matriks 3x3
    let result = "";
    for (let i = 0; i < cleanText.length; i += 3) {
        let p1 = cleanText[i].charCodeAt(0) - 65;
        let p2 = cleanText[i+1].charCodeAt(0) - 65;
        let p3 = cleanText[i+2].charCodeAt(0) - 65;
        
        result += String.fromCharCode(mod(matrix[0][0]*p1 + matrix[0][1]*p2 + matrix[0][2]*p3, 26) + 65);
        result += String.fromCharCode(mod(matrix[1][0]*p1 + matrix[1][1]*p2 + matrix[1][2]*p3, 26) + 65);
        result += String.fromCharCode(mod(matrix[2][0]*p1 + matrix[2][1]*p2 + matrix[2][2]*p3, 26) + 65);
    }
    return result;
};

// 5. ENIGMA CIPHER (Simulasi Sederhana: 1 Rotor 'I' dan Reflektor 'B')
const ROTOR_I = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

export const enigma = (text, key) => { 
    let pos = parseInt(key) || 0;
    let result = "";
    
    for (let char of text.toUpperCase()) {
        if (!alphabet.includes(char)) { result += char; continue; }
        
        pos = (pos + 1) % 26;
        let c = char.charCodeAt(0) - 65;
        
        let forwardChar = ROTOR_I[(c + pos) % 26];
        let forwardIdx = mod(forwardChar.charCodeAt(0) - 65 - pos, 26);
        
        let reflectedChar = REFLECTOR_B[forwardIdx];
        let reflectedIdx = reflectedChar.charCodeAt(0) - 65;
        
        let backIdx = mod(reflectedIdx + pos, 26);
        let backChar = String.fromCharCode(backIdx + 65);
        let finalIdx = mod(ROTOR_I.indexOf(backChar) - pos, 26);
        
        result += String.fromCharCode(finalIdx + 65);
    }
    return result;
};