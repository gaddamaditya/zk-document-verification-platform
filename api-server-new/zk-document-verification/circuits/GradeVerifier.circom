pragma circom 2.1.6;

template GradeVerifier() {

    // Private Input
    signal input grade;

    // Public Input
    signal input requiredGrade;

    grade === requiredGrade;
}

component main {public [requiredGrade]} = GradeVerifier();