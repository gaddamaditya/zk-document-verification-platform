#!/usr/bin/env node
/**
 * Automated Authenticity Verification Tests
 *
 * Tests all 5 scenarios for the document authenticity layer:
 *   TEST 1: Original document      → AUTHENTIC
 *   TEST 2: Modified document      → TAMPERED
 *   TEST 3: Wrong issuer key       → UNTRUSTED_ISSUER
 *   TEST 4: Different document     → TAMPERED
 *   TEST 5: Combined with ZKP      → (manual UI test, documented here)
 *
 * Usage:
 *   node issuer/test-authenticity.js
 *
 * Prerequisites:
 *   Run "node issuer/generateKeys.js" first to generate Demo University keys.
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, 'keys');
const TEST_DIR = path.join(__dirname, 'test-artifacts');

// ─── Helpers ────────────────────────────────────────────────────

function hashDocument(filePath) {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

function signHash(hashHex, privateKey) {
    const signature = crypto.sign(null, Buffer.from(hashHex, 'utf-8'), privateKey);
    return signature.toString('base64');
}

function verifySignature(hashHex, signatureBase64, publicKey) {
    try {
        const signatureBuffer = Buffer.from(signatureBase64, 'base64');
        return crypto.verify(null, Buffer.from(hashHex, 'utf-8'), publicKey, signatureBuffer);
    } catch {
        return false;
    }
}

function createCredential(documentPath, privateKey, issuerName) {
    const docHash = hashDocument(documentPath);
    const sig = signHash(docHash, privateKey);
    return {
        documentHash: docHash,
        signature: sig,
        issuer: issuerName,
        issuedAt: new Date().toISOString(),
        algorithm: 'Ed25519-SHA256',
    };
}

/**
 * Simulate the full verification logic (same as authenticityVerifier.js)
 */
function verifyAuthenticity(documentPath, credential, trustedPublicKeys) {
    // Step 1: Compute document hash
    const computedHash = hashDocument(documentPath);

    // Step 2: Integrity check
    if (computedHash !== credential.documentHash) {
        return {
            success: false,
            status: 'TAMPERED',
            issuer: credential.issuer,
            integrity: 'FAILED',
            signature: 'INVALID',
            message: 'The document has been modified after it was issued.',
        };
    }

    // Step 3: Check if issuer is trusted
    const publicKey = trustedPublicKeys[credential.issuer];
    if (!publicKey) {
        return {
            success: false,
            status: 'UNTRUSTED_ISSUER',
            message: 'The document could not be verified against a trusted issuer.',
        };
    }

    // Step 4: Verify signature
    const sigValid = verifySignature(credential.documentHash, credential.signature, publicKey);
    if (!sigValid) {
        return {
            success: false,
            status: 'UNTRUSTED_ISSUER',
            message: 'The document could not be verified against a trusted issuer.',
        };
    }

    // Step 5: AUTHENTIC
    return {
        success: true,
        status: 'AUTHENTIC',
        issuer: credential.issuer,
        integrity: 'VERIFIED',
        signature: 'VALID',
    };
}

// ─── Test Runner ────────────────────────────────────────────────

function runTests() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  Document Authenticity Verification — Test Suite');
    console.log('  Research Prototype — Simulated Trusted Issuer');
    console.log('═══════════════════════════════════════════════════\n');

    // ── Setup: Generate test keys ───────────────────────────────
    const privateKeyPath = path.join(KEYS_DIR, 'private-key.pem');
    const publicKeyPath = path.join(KEYS_DIR, 'public-key.pem');

    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
        console.log('  ⚠ Keys not found. Generating test keys...\n');
        const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });
        if (!fs.existsSync(KEYS_DIR)) fs.mkdirSync(KEYS_DIR, { recursive: true });
        fs.writeFileSync(privateKeyPath, privateKey);
        fs.writeFileSync(publicKeyPath, publicKey);
        console.log('  ✓ Test keys generated.\n');
    }

    const demoPrivateKey = crypto.createPrivateKey(fs.readFileSync(privateKeyPath, 'utf-8'));
    const demoPublicKey = crypto.createPublicKey(fs.readFileSync(publicKeyPath, 'utf-8'));

    const trustedPublicKeys = {
        'Demo University': demoPublicKey,
    };

    // ── Setup: Create test documents ────────────────────────────
    if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });

    // Original test document (simulated marksheet content)
    const originalContent = Buffer.from(
        'DEMO UNIVERSITY - ACADEMIC TRANSCRIPT\n' +
        'Student Name: Aditya Gaddam\n' +
        'Roll Number: 2021CS1234\n' +
        'CGPA: 8.7\n' +
        'Result: PASS\n' +
        'Date: 2025-06-15\n' +
        'This is a simulated document for testing purposes.\n'
    );
    const originalPath = path.join(TEST_DIR, 'original_marksheet.txt');
    fs.writeFileSync(originalPath, originalContent);

    // Modified document (CGPA changed)
    const modifiedContent = Buffer.from(
        'DEMO UNIVERSITY - ACADEMIC TRANSCRIPT\n' +
        'Student Name: Aditya Gaddam\n' +
        'Roll Number: 2021CS1234\n' +
        'CGPA: 9.7\n' +
        'Result: PASS\n' +
        'Date: 2025-06-15\n' +
        'This is a simulated document for testing purposes.\n'
    );
    const modifiedPath = path.join(TEST_DIR, 'modified_marksheet.txt');
    fs.writeFileSync(modifiedPath, modifiedContent);

    // Different document entirely
    const differentContent = Buffer.from(
        'SOME OTHER UNIVERSITY\n' +
        'Student Name: John Doe\n' +
        'CGPA: 6.0\n'
    );
    const differentPath = path.join(TEST_DIR, 'different_document.txt');
    fs.writeFileSync(differentPath, differentContent);

    // Sign the original document with Demo University's private key
    const originalCredential = createCredential(originalPath, demoPrivateKey, 'Demo University');
    const credentialPath = path.join(TEST_DIR, 'original_marksheet.credential.json');
    fs.writeFileSync(credentialPath, JSON.stringify(originalCredential, null, 2));

    let passed = 0;
    let failed = 0;

    // ── TEST 1: Original Document → AUTHENTIC ───────────────────
    console.log('  ─────────────────────────────────────────────');
    console.log('  TEST 1: Original Document → AUTHENTIC');
    console.log('  ─────────────────────────────────────────────');

    const result1 = verifyAuthenticity(originalPath, originalCredential, trustedPublicKeys);
    if (result1.status === 'AUTHENTIC') {
        console.log(`  ✅ PASS — Status: ${result1.status}`);
        console.log(`       Issuer:    ${result1.issuer}`);
        console.log(`       Integrity: ${result1.integrity}`);
        console.log(`       Signature: ${result1.signature}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL — Expected AUTHENTIC, got ${result1.status}`);
        failed++;
    }
    console.log('');

    // ── TEST 2: Modified Document → TAMPERED ────────────────────
    console.log('  ─────────────────────────────────────────────');
    console.log('  TEST 2: Modified Document (CGPA 8.7→9.7) → TAMPERED');
    console.log('  ─────────────────────────────────────────────');

    const result2 = verifyAuthenticity(modifiedPath, originalCredential, trustedPublicKeys);
    if (result2.status === 'TAMPERED') {
        console.log(`  ✅ PASS — Status: ${result2.status}`);
        console.log(`       Integrity: ${result2.integrity}`);
        console.log(`       Message:   ${result2.message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL — Expected TAMPERED, got ${result2.status}`);
        failed++;
    }
    console.log('');

    // ── TEST 3: Wrong Issuer → UNTRUSTED_ISSUER ─────────────────
    console.log('  ─────────────────────────────────────────────');
    console.log('  TEST 3: Wrong Issuer ("Fake University") → UNTRUSTED_ISSUER');
    console.log('  ─────────────────────────────────────────────');

    // Generate a separate key pair for the fake issuer
    const { privateKey: fakePrivate } = crypto.generateKeyPairSync('ed25519', {
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    const fakePrivateKey = crypto.createPrivateKey(fakePrivate);
    const fakeCredential = createCredential(originalPath, fakePrivateKey, 'Fake University');

    const result3 = verifyAuthenticity(originalPath, fakeCredential, trustedPublicKeys);
    if (result3.status === 'UNTRUSTED_ISSUER') {
        console.log(`  ✅ PASS — Status: ${result3.status}`);
        console.log(`       Message:   ${result3.message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL — Expected UNTRUSTED_ISSUER, got ${result3.status}`);
        failed++;
    }
    console.log('');

    // ── TEST 4: Different Document with Original Credential → TAMPERED
    console.log('  ─────────────────────────────────────────────');
    console.log('  TEST 4: Different Document + Original Credential → TAMPERED');
    console.log('  ─────────────────────────────────────────────');

    const result4 = verifyAuthenticity(differentPath, originalCredential, trustedPublicKeys);
    if (result4.status === 'TAMPERED') {
        console.log(`  ✅ PASS — Status: ${result4.status}`);
        console.log(`       Integrity: ${result4.integrity}`);
        console.log(`       Message:   ${result4.message}`);
        passed++;
    } else {
        console.log(`  ❌ FAIL — Expected TAMPERED, got ${result4.status}`);
        failed++;
    }
    console.log('');

    // ── TEST 5: Edge case — credential signed by trusted issuer name but with wrong key
    console.log('  ─────────────────────────────────────────────');
    console.log('  TEST 5: Trusted Issuer Name but Wrong Key → UNTRUSTED_ISSUER');
    console.log('  ─────────────────────────────────────────────');

    // Same name "Demo University" but signed with a completely different key
    const spoofedCredential = createCredential(originalPath, fakePrivateKey, 'Demo University');

    const result5 = verifyAuthenticity(originalPath, spoofedCredential, trustedPublicKeys);
    if (result5.status === 'UNTRUSTED_ISSUER') {
        console.log(`  ✅ PASS — Status: ${result5.status}`);
        console.log(`       Spoofing the issuer name without the correct key is detected.`);
        passed++;
    } else {
        console.log(`  ❌ FAIL — Expected UNTRUSTED_ISSUER, got ${result5.status}`);
        failed++;
    }
    console.log('');

    // ── Summary ─────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
    console.log('═══════════════════════════════════════════════════');

    if (failed > 0) {
        console.log('\n  ❌ SOME TESTS FAILED');
        process.exit(1);
    } else {
        console.log('\n  ✅ ALL TESTS PASSED');
        console.log('');
        console.log('  NOTE: TEST 5 (Original + ZKP combined) requires');
        console.log('  manual verification through the UI workflow.');
    }

    // ── Cleanup ─────────────────────────────────────────────────
    // Leave test artifacts for manual inspection
    console.log(`\n  Test artifacts saved in: ${TEST_DIR}`);
    console.log('  • original_marksheet.txt');
    console.log('  • original_marksheet.credential.json');
    console.log('  • modified_marksheet.txt');
    console.log('  • different_document.txt');
    console.log('');
}

runTests();
