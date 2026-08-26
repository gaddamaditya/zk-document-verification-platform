pragma circom 2.1.6;

template NameVerifier() {

    // Private input (OCR extracted name)
    signal input actualName[16];

    // Public input (User claimed name)
    signal input claimedName[16];

    for (var i = 0; i < 16; i++) {
        actualName[i] === claimedName[i];
    }
}

component main {public [claimedName]} = NameVerifier();