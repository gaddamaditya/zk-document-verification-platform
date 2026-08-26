pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";

template MultiAttributeVerifier() {

    // ===========================
    // PRIVATE INPUTS
    // ===========================

    signal input actualName[16];
    signal input birthYear;
    signal input gender;

    // ===========================
    // PUBLIC INPUTS
    // ===========================

    signal input claimedName[16];
    signal input currentYear;
    signal input requiredGender;

    // ===========================
    // NAME VERIFICATION
    // ===========================

    for (var i = 0; i < 16; i++) {
        actualName[i] === claimedName[i];
    }

    // ===========================
    // AGE VERIFICATION
    // ===========================

    signal age;

    age <== currentYear - birthYear;

    component ageCheck = GreaterEqThan(8);

    ageCheck.in[0] <== age;
    ageCheck.in[1] <== 18;

    ageCheck.out === 1;

    // ===========================
    // GENDER VERIFICATION
    // ===========================

    gender === requiredGender;
}

component main {public [claimedName, currentYear, requiredGender]} = MultiAttributeVerifier();