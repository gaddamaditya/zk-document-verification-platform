pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";

template AadhaarMultiAttributeVerifier() {

    // ===========================
    // PRIVATE INPUTS
    // ===========================

    signal input actualName[16];
    signal input actualDOB[8];
    signal input birthYear;
    signal input actualGender;

    // ===========================
    // PUBLIC INPUTS
    // ===========================

    signal input claimedName[16];
    signal input claimedDOB[8];
    signal input currentYear;
    signal input claimedGender;

    // Selector/enable signals (1 = verify, 0 = skip)
    signal input verifyName;
    signal input verifyDOB;
    signal input verifyAge;
    signal input verifyGender;

    // ===========================
    // 1. NAME VERIFICATION
    // ===========================
    for (var i = 0; i < 16; i++) {
        (actualName[i] - claimedName[i]) * verifyName === 0;
    }

    // ===========================
    // 2. DATE OF BIRTH VERIFICATION
    // ===========================
    for (var i = 0; i < 8; i++) {
        (actualDOB[i] - claimedDOB[i]) * verifyDOB === 0;
    }

    // ===========================
    // 3. AGE VERIFICATION (Age >= 18)
    // ===========================
    signal age;
    age <== currentYear - birthYear;

    component ageCheck = GreaterEqThan(8);
    ageCheck.in[0] <== age;
    ageCheck.in[1] <== 18;

    (1 - ageCheck.out) * verifyAge === 0;

    // ===========================
    // 4. GENDER VERIFICATION
    // ===========================
    (actualGender - claimedGender) * verifyGender === 0;
}

component main {public [claimedName, claimedDOB, currentYear, claimedGender, verifyName, verifyDOB, verifyAge, verifyGender]} = AadhaarMultiAttributeVerifier();
