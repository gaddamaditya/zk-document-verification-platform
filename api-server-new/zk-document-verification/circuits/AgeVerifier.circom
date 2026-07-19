pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeVerifier() {

    // Private Input
    signal input birthYear;

    // Public Input
    signal input currentYear;

    signal age;

    age <== currentYear - birthYear;

    component checkAge = GreaterEqThan(8);

    checkAge.in[0] <== age;
    checkAge.in[1] <== 18;

    checkAge.out === 1;
}

component main {public [birthYear, currentYear]} = AgeVerifier();