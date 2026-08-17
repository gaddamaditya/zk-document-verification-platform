const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORE_DIR = path.join(__dirname, '..', 'proof-store');

if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
}

function generateProofId() {
    let id;
    let filePath;
    do {
        const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
        id = `ZK-${hex}`;
        filePath = path.join(STORE_DIR, `${id}.json`);
    } while (fs.existsSync(filePath));
    return id;
}

function saveProofRecord({ claims, documentType, proof, publicSignals, ttlHours = 168 }) {
    const proofId = generateProofId();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + ttlHours * 60 * 60 * 1000);

    const record = {
        proofId,
        claims: Array.isArray(claims) ? claims : [],
        documentType: documentType || 'DOCUMENT',
        proof,
        publicSignals,
        createdAt: createdAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
    };

    const filePath = path.join(STORE_DIR, `${proofId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2));

    console.log(`[ProofStore] Saved proof record ${proofId}`);
    return record;
}

function getProofRecord(proofId) {
    if (!proofId || typeof proofId !== 'string') return null;

    // Sanitize proofId to prevent directory traversal
    const safeId = proofId.replace(/[^A-Z0-9\-]/g, '');
    const filePath = path.join(STORE_DIR, `${safeId}.json`);

    if (!fs.existsSync(filePath)) {
        return null;
    }

    try {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const record = JSON.parse(raw);

        // Expiration check
        const now = new Date();
        const expiresAt = new Date(record.expiresAt);

        if (now > expiresAt) {
            console.log(`[ProofStore] Proof ${safeId} is expired`);
            return { expired: true, proofId: safeId };
        }

        return { success: true, ...record };
    } catch (err) {
        console.error(`[ProofStore] Error reading record ${safeId}:`, err);
        return null;
    }
}

module.exports = {
    saveProofRecord,
    getProofRecord,
};
