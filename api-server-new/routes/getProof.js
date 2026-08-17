const express = require('express');
const { getProofRecord } = require('../services/proofStore');

const router = express.Router();

// GET /api/proof/:proofId
router.get('/:proofId', (req, res) => {
    try {
        const { proofId } = req.params;
        const result = getProofRecord(proofId);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'NOT_FOUND',
                message: 'Proof record not found.',
            });
        }

        if (result.expired) {
            return res.status(410).json({
                success: false,
                expired: true,
                error: 'PROOF EXPIRED',
                message: 'This proof link has expired.',
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('[GetProof] Error:', error);
        return res.status(500).json({
            success: false,
            error: 'SERVER_ERROR',
            message: error.message,
        });
    }
});

module.exports = router;
