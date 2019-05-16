import assert from "assert";
import util from "util";
import Normalizer from "../lib/Normalizer.js";

const FAILURE_VALUE = undefined;

function prettify(obj) {
    const options = {depth: Infinity};

    return util.inspect(obj, options);
}

function assertNormalizations(typeName, source, tests, debug = false) {
    const normalizer = new Normalizer();

    normalizer.addValidationsFromSource(source);

    if (debug) {
        console.log(prettify(normalizer.types));
    }

    for (const test of tests) {
        const {structure, expected} = test;

        it(`input: ${prettify(structure)}, expected: ${prettify(expected)}`, () => {
            const result = normalizer.normalize(structure, typeName);

            assert.deepStrictEqual(result, expected);
        });
    }
}

describe("Normalizer", () => {
    describe("Array Types", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = array`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: []},
            {structure: [1, 2, 3], expected: [1, 2, 3]},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Boolean Values", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = true`;
        const tests = [
            {structure: true, expected: true},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Boolean Type", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = boolean`;
        const tests = [
            {structure: true, expected: true},
            {structure: false, expected: false},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Enumeration Values", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = enumeration { one two "and three" }`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: "one", expected: "one"},
            {structure: "two", expected: "two"},
            {structure: "and three", expected: "and three"},
            {structure: "four", expected: FAILURE_VALUE},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Number Values", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = 10`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: 10},
            {structure: 11, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Number Type", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = number`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: 10},
            {structure: 11, expected: 11},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Object Property Existence", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = { cx cy }`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE},
            {structure: {cx: 10, cy: 20}, expected: {cx: 10, cy: 20}},
            {structure: {cx: 10}, expected: FAILURE_VALUE},
            {structure: {cy: 10}, expected: FAILURE_VALUE},
            {structure: {cx: 10, cy: 10, radius: 5}, expected: {cx: 10, cy: 10}}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Object Property Type", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = { cx: number cy: number }`;
        const tests = [
            {structure: {cx: 10, cy: 20}, expected: {cx: 10, cy: 20}},
            {structure: {cx: 10, cy: "20"}, expected: FAILURE_VALUE},
            {structure: {cx: "10", cy: 20}, expected: FAILURE_VALUE},
            {structure: {cx: "10", cy: "20"}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("Object Type", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = object`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: [], expected: []},
            {structure: {}, expected: {}},
            {structure: {cx: 10, cy: 20}, expected: {cx: 10, cy: 20}}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("String Values", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = "TEST"`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: FAILURE_VALUE},
            {structure: "TEST", expected: "TEST"},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
    describe("String Type", () => {
        const typeName = "MyType";
        const source = `type ${typeName} = string`;
        const tests = [
            {structure: true, expected: FAILURE_VALUE},
            {structure: false, expected: FAILURE_VALUE},
            {structure: 10, expected: FAILURE_VALUE},
            {structure: "", expected: ""},
            {structure: "TEST", expected: "TEST"},
            {structure: [], expected: FAILURE_VALUE},
            {structure: {}, expected: FAILURE_VALUE}
        ];

        assertNormalizations(typeName, source, tests);
    });
});
