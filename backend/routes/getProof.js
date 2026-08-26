const express = require('express');
const { getProofRecord } = require('../services/proofStore');

const router = express.Router();

// GET /api/proof/:proofId
router.get('/:proofId', (req, res) => {
    try {
        const { proofId } = req.params;
        if (!proofId || typeof proofId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'INVALID_REQUEST',
                message: 'Proof ID parameter is required.',
            });
        }

        console.log(`[GetProof] Retrieving proof record for ID: ${proofId}`);
        const result = getProofRecord(proofId);

        if (!result) {
            console.log(`[GetProof] Proof ID not found: ${proofId}`);
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: `Proof record "${proofId}" not found.`,
            });
        }

        if (result.expired) {
            console.log(`[GetProof] Proof ID expired: ${proofId}`);
            return res.status(410).json({
                success: false,
                expired: true,
                status: 'EXPIRED',
                error: 'PROOF_EXPIRED',
                message: 'This proof has expired.',
                proofId: result.proofId,
                expiredAt: result.expiredAt || null,
                createdAt: result.createdAt || null,
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('[GetProof] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: error.message || 'Internal server error while fetching proof.',
        });
    }
});

module.exports = router;
