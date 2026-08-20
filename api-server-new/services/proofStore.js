const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const STORE_DIR = path.join(__dirname, '..', 'proof-store');

if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
}

// ─── Dual Storage: In-Memory Cache + Disk File Storage ─────────────────────
// Keeps proof records in RAM for instant cross-device lookups during server runtime,
// while persisting to local disk files for longevity.
const memoryStore = new Map();

function generateProofId() {
    let id;
    let filePath;
    do {
        const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
        id = `ZK-${hex}`;
        filePath = path.join(STORE_DIR, `${id}.json`);
    } while (memoryStore.has(id) || fs.existsSync(filePath));
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

    // 1. Save in RAM cache
    memoryStore.set(proofId, record);

    // 2. Save on disk
    try {
        const filePath = path.join(STORE_DIR, `${proofId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
    } catch (fsErr) {
        console.warn(`[ProofStore] Warning: Disk write failed for ${proofId}:`, fsErr.message);
    }

    console.log(`[ProofStore] Saved proof record ${proofId}`);
    return record;
}

function getProofRecord(proofId) {
    if (!proofId || typeof proofId !== 'string') return null;

    // Sanitize proofId to prevent directory traversal
    const safeId = proofId.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '');
    if (!safeId) return null;

    // 1. Check in-memory store
    let record = memoryStore.get(safeId);

    // 2. Fall back to disk read if not in memory
    if (!record) {
        const filePath = path.join(STORE_DIR, `${safeId}.json`);
        if (fs.existsSync(filePath)) {
            try {
                const raw = fs.readFileSync(filePath, 'utf-8');
                record = JSON.parse(raw);
                // Hydrate memory cache
                memoryStore.set(safeId, record);
            } catch (err) {
                console.error(`[ProofStore] Error reading disk record ${safeId}:`, err);
                return null;
            }
        }
    }

    if (!record) {
        return null;
    }

    // Expiration check
    const now = new Date();
    const expiresAt = new Date(record.expiresAt);

    if (now > expiresAt) {
        console.log(`[ProofStore] Proof ${safeId} is expired`);
        return { expired: true, proofId: safeId };
    }

    return { success: true, ...record };
}

module.exports = {
    saveProofRecord,
    getProofRecord,
};
