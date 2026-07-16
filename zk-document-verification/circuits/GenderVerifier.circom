pragma circom 2.1.6;

template GenderVerifier() {

    // Private Input
    signal input gender;

    // Public Input
    signal input requiredGender;

    gender === requiredGender;
}

component main {public [requiredGender]} = GenderVerifier();