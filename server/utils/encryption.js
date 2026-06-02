const crypto = require('crypto');

// A 256-bit (32 bytes) key for AES-256-CBC
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a_very_secret_32_chars_key_123456';
const IV_LENGTH = 16; // AES block size is 16 bytes

function encrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error("Encryption error:", err);
        return text;
    }
}

function decrypt(text) {
    if (!text) return text;
    try {
        const textParts = text.split(':');
        if (textParts.length < 2) return text; // Not encrypted
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (err) {
        // Return original if decryption fails (e.g. fallback for plain text data)
        return text;
    }
}

// Deterministic encryption for fields used in unique indexes
function deterministicEncrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.createHash('md5').update(text).digest(); // Exactly 16 bytes
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(text, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (err) {
        console.error("Deterministic encryption error:", err);
        return text;
    }
}

module.exports = {
    encrypt,
    decrypt,
    deterministicEncrypt
};
