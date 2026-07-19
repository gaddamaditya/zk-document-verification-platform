pragma circom 2.1.6;

template GrandTotalVerifier() {

    // Private Input
    signal input grandTotal;

    // Public Input
    signal input requiredGrandTotal;

    grandTotal === requiredGrandTotal;
}

component main {public [requiredGrandTotal]} = GrandTotalVerifier();
