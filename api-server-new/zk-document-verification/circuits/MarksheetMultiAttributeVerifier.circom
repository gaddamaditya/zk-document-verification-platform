pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";

template MarksheetMultiAttributeVerifier() {

    // ===========================
    // PRIVATE INPUTS
    // ===========================

    signal input actualStudentName[16];
    signal input actualGender;
    signal input actualResult;
    signal input actualGrade;
    signal input actualGrandTotal;
    signal input actualCGPA;

    // ===========================
    // PUBLIC INPUTS
    // ===========================

    signal input claimedStudentName[16];
    signal input claimedGender;
    signal input claimedResult;
    signal input claimedGrade;
    signal input claimedGrandTotal;
    signal input claimedCGPA;

    // Selector/enable signals (1 = verify, 0 = skip)
    signal input verifyStudentName;
    signal input verifyGender;
    signal input verifyResult;
    signal input verifyGrade;
    signal input verifyGrandTotal;
    signal input verifyCGPA;

    // ===========================
    // 1. STUDENT NAME VERIFICATION
    // ===========================
    for (var i = 0; i < 16; i++) {
        (actualStudentName[i] - claimedStudentName[i]) * verifyStudentName === 0;
    }

    // ===========================
    // 2. GENDER VERIFICATION
    // ===========================
    (actualGender - claimedGender) * verifyGender === 0;

    // ===========================
    // 3. RESULT VERIFICATION (1 = PASS, 0 = FAIL)
    // ===========================
    (actualResult - claimedResult) * verifyResult === 0;

    // ===========================
    // 4. GRADE VERIFICATION
    // ===========================
    (actualGrade - claimedGrade) * verifyGrade === 0;

    // ===========================
    // 5. GRAND TOTAL VERIFICATION (actual >= claimed)
    // ===========================
    component totalCheck = GreaterEqThan(16);
    totalCheck.in[0] <== actualGrandTotal;
    totalCheck.in[1] <== claimedGrandTotal;

    (1 - totalCheck.out) * verifyGrandTotal === 0;

    // ===========================
    // 6. CGPA VERIFICATION (actual >= claimed)
    // ===========================
    component cgpaCheck = GreaterEqThan(16);
    cgpaCheck.in[0] <== actualCGPA;
    cgpaCheck.in[1] <== claimedCGPA;

    (1 - cgpaCheck.out) * verifyCGPA === 0;
}

component main {public [claimedStudentName, claimedGender, claimedResult, claimedGrade, claimedGrandTotal, claimedCGPA, verifyStudentName, verifyGender, verifyResult, verifyGrade, verifyGrandTotal, verifyCGPA]} = MarksheetMultiAttributeVerifier();
