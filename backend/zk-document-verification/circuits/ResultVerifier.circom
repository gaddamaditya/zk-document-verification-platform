pragma circom 2.1.6;

template ResultVerifier() {

    // Private input
    signal input result;

    // Public input
    signal input requiredResult;

    // Verify both are equal
    result === requiredResult;
}

component main {public [requiredResult]} = ResultVerifier();