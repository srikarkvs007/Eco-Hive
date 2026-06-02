const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simulated secret key for encrypting backups (in production, loaded from credentials manager)
const BACKUP_SECRET_KEY = crypto.createHash('sha256').update(process.env.BACKUP_KEY || 'eco_hive_backup_key_32_bytes_long').digest();
const IV_LENGTH = 16; 

const backupDir = path.join(__dirname, '../backups');

// Ensure backups folder exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// 1. Encrypt Database Data
function encryptData(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', BACKUP_SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// 2. Decrypt Database Data (for Disaster Recovery / Point-In-Time Restoration)
function decryptData(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', BACKUP_SECRET_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function runBackup() {
    console.log("=========================================");
    console.log("🔄 Starting Automated Database Backup Job");
    console.log("=========================================");
    
    // Simulate fetching transactional data from Neon PostgreSQL (CustomerOrders, Payments, logs)
    console.log("1. Fetching active database tables...");
    const mockDbPayload = {
        timestamp: new Date().toISOString(),
        tables: {
            users: [
                { id: "u1", email: "user@eco-hive.com", role: "User", ecoPoints: 120 },
                { id: "a1", email: "admin@eco-hive.com", role: "Admin", regionId: "Region-North" }
            ],
            customerOrders: [
                { id: "o1", userId: "u1", totalAmount: 89.50, status: "Paid", paymentStatus: "Paid" }
            ],
            payments: [
                { id: "p1", orderId: "o1", amount: 89.50, status: "Succeeded" }
            ]
        }
    };

    const rawText = JSON.stringify(mockDbPayload, null, 2);
    console.log("✓ Database snapshot fetched successfully.");

    // Encrypt the backup payload for security at rest
    console.log("2. Encrypting snapshot using AES-256-CBC...");
    const encryptedData = encryptData(rawText);
    
    const fileName = `db_backup_${new Date().toISOString().split('T')[0]}.enc`;
    const filePath = path.join(backupDir, fileName);
    
    fs.writeFileSync(filePath, encryptedData);
    console.log(`✓ Backup saved locally: ${filePath}`);

    // Emulate Cloud Upload stage
    console.log("3. Uploading encrypted backup payload to secure Cloud Storage (AWS S3)...");
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`✓ Upload complete: s3://eco-hive-backups/${fileName}`);

    console.log("\n4. Running recovery validation check...");
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const decryptedPayload = decryptData(fileContent);
    const parsedPayload = JSON.parse(decryptedPayload);
    
    if (parsedPayload.timestamp === mockDbPayload.timestamp) {
        console.log("✓ Restoration verification passed. Backup is healthy!");
    } else {
        throw new Error("Restoration verification failed: Content mismatch.");
    }
    
    console.log("=========================================");
    console.log("🎉 Database Backup Job Finished Successfully");
    console.log("=========================================");
}

runBackup().catch(err => {
    console.error("❌ Backup job failed:", err);
    process.exit(1);
});
