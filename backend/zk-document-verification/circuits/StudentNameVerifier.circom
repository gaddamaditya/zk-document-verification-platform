pragma circom 2.1.6;

template StudentNameVerifier() {

    // Private input (OCR extracted student name)
    signal input actualStudentName[16];

    // Public input (User claimed student name)
    signal input claimedStudentName[16];

    for (var i = 0; i < 16; i++) {
        actualStudentName[i] === claimedStudentName[i];
    }
}

component main {public [claimedStudentName]} = StudentNameVerifier();
