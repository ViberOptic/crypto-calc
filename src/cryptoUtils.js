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

// 3. PLAYFAIR CIPHER (Menghilangkan 'J')
export const playfair = (text, key, isEncrypt) => {
    key = key.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I") + alphabet.replace(/J/g, "");
    let matrix = [...new Set(key)]; // Ambil unik
    
    let processText = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
    if (isEncrypt) {
        let temp = "";
        for (let i = 0; i < processText.length; i += 2) {
            temp += processText[i];
            if (i + 1 < processText.length) {
                if (processText[i] === processText[i + 1]) { temp += "X"; i--; } 
                else { temp += processText[i + 1]; }
            }
        }
        if (temp.length % 2 !== 0) temp += "X";
        processText = temp;
    }

    let result = "";
    for (let i = 0; i < processText.length; i += 2) {
        let a = processText[i], b = processText[i + 1];
        let r1 = Math.floor(matrix.indexOf(a) / 5), c1 = matrix.indexOf(a) % 5;
        let r2 = Math.floor(matrix.indexOf(b) / 5), c2 = matrix.indexOf(b) % 5;

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

// 4. HILL CIPHER (Matriks 2x2. Key format: "a,b,c,d")
export const hill = (text, key, isEncrypt) => {
    let keys = key.split(",").map(Number);
    if (keys.length !== 4) return "Error: Butuh 4 angka dipisah koma (contoh: 3,3,2,5)";
    let [a, b, c, d] = keys;
    let det = mod((a * d) - (b * c), 26);
    let detInv = modInverse(det, 26);
    if (detInv === 1 && det !== 1) return "Error: Determinan matriks tidak coprime dengan 26";

    let matrix = isEncrypt ? [a, b, c, d] : [mod(d * detInv, 26), mod(-b * detInv, 26), mod(-c * detInv, 26), mod(a * detInv, 26)];
    
    let cleanText = text.toUpperCase().replace(/[^A-Z]/g, "");
    if (cleanText.length % 2 !== 0) cleanText += "X";
    
    let result = "";
    for (let i = 0; i < cleanText.length; i += 2) {
        let x = cleanText[i].charCodeAt(0) - 65;
        let y = cleanText[i+1].charCodeAt(0) - 65;
        result += String.fromCharCode(mod(matrix[0]*x + matrix[1]*y, 26) + 65);
        result += String.fromCharCode(mod(matrix[2]*x + matrix[3]*y, 26) + 65);
    }
    return result;
};

// 5. ENIGMA CIPHER (Simulasi Sederhana: 1 Rotor 'I' dan Reflektor 'B')
// Key format: angka posisi awal rotor (0-25)
const ROTOR_I = "EKMFLGDQVZNTOWYHXUSPAIBRCJ";
const REFLECTOR_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT";

export const enigma = (text, key) => { // Enigma simetris untuk enc/dec
    let pos = parseInt(key) || 0;
    let result = "";
    
    for (let char of text.toUpperCase()) {
        if (!alphabet.includes(char)) { result += char; continue; }
        
        // Step rotor
        pos = (pos + 1) % 26;
        
        let c = char.charCodeAt(0) - 65;
        // Forward through rotor
        let forwardChar = ROTOR_I[(c + pos) % 26];
        let forwardIdx = mod(forwardChar.charCodeAt(0) - 65 - pos, 26);
        
        // Reflector
        let reflectedChar = REFLECTOR_B[forwardIdx];
        let reflectedIdx = reflectedChar.charCodeAt(0) - 65;
        
        // Backward through rotor
        let backIdx = mod(reflectedIdx + pos, 26);
        let backChar = String.fromCharCode(backIdx + 65);
        let finalIdx = mod(ROTOR_I.indexOf(backChar) - pos, 26);
        
        result += String.fromCharCode(finalIdx + 65);
    }
    return result;
};