import assert from "assert";
import util from "util";
import Parser from "../lib/Parser.js";

function prettify(obj) {
    const options = {depth: Infinity};

    return util.inspect(obj, options);
}

function assertTests(tests, debug = false) {
    for (const test of tests) {
        it(`tests: ${test}`, () => {
            const result = Parser.parse(test);

            if (debug) {
                console.log(prettify(result));
            }
        });
    }
}

describe("Parser", () => {
    describe("Primitive Types", () => {
        const tests = [
            'type MyType = true',
            'type MyType = false',
            'type MyType = boolean',
            'type MyType = "hello"',
            'type MyType = string',
            'type MyType = 10',
            'type MyType = number',
            'type MyType = {}',
            'type MyType = []',
            'type MyType = null',
            'type MyType = undefined'
        ];

        assertTests(tests);
    });
    describe("Object Descriptions", () => {
        const tests = [
            'type MyType = { cx }',
            'type MyType = { cx cy }',
            'type MyType = { cx { group { match cx { boolean } } } }',
            'type MyType = { cx { group { match cx { true } } } }',
            'type MyType = { cx { group { match cx { false } } } }',
            'type MyType = { cx { group { match cx { 10 } } } }',
            'type MyType = { cx { group { match cx { string } } } }',
            'type MyType = { cx { group { match cx { "first name" } } } }',
            'type MyType = { cx { group { match cx { string number } } } }',
            'type MyType = { cx { group { match cx { number } match cy { number } } } }'
        ];

        assertTests(tests);
    });
    describe("Array Descriptions", () => {
        const tests = [
            'type MyType = { points: [ number ] }',
            'type MyType = { points: [ number, string ] }',
            'type MyType = { points: [ number;5..10 ] }',
            'type MyType = { points: [ number;5.. ] }',
            'type MyType = { points: [ number;..10 ] }',
            'type MyType = { points: [ number;5 ] }',
            'type MyType = { points: [ (number, string) ] }',
            'type MyType = { points: [ (number, string);5 ] }',
            'type MyType = { points: [ (number;5, string;3) ] }',
            'type MyType = { points: [ (number;5, string;3);10 ] }',
            'type MyType = { points: [ number as x ] }',
            'type MyType = { points: [ number as x, number as y ] }',
            'type MyType = { points: [ number;5 as x ] }',
            'type MyType = { points: [ (number;5 as x, string;3 as y);10 as pairs ] }'
        ];

        assertTests(tests);
    });
    describe("Enumeration Descriptions", () => {
        const tests = [
            'type MyType = enumeration { }',
            'type MyType = enumeration { one two three }',
            'type MyType = enumeration { "array" "boolean" "multiple words" }'
        ];

        assertTests(tests);
    });
    describe("Shortcuts", () => {
        const tests = [
            'type MyType = { cx { group { match cy { number } } } }',
            'type MyType = { cx { group { cy: number } } }',
            'type MyType = { cx { cy: number } }',
            'type MyType = { cx: number }'
        ];

        assertTests(tests);
    });
    describe("Array Patterns", () => {
        const tests = [
            'type MyType = { cx { points: [number, number] } }',
            'type MyType = { cx <= x { } }',
            'type MyType = { cx <= Point() { } }',
            'type MyType = { cx <= Point(x, y) { } }'
        ];

        assertTests(tests);
    });
    describe("Array Expressions", () => {
        const tests = [
            'type MyType = { cx <= [] }',
            'type MyType = { cx <= [ 1 ] }',
            'type MyType = { cx <= [ 1, [] ] }',
            'type MyType = { cx <= [ 1, true ] }',
            'type MyType = { cx <= [ 1, null ] }',
            'type MyType = { cx <= [ 1, undefined ] }',
            'type MyType = { cx <= [ 1, 2 ] }',
            'type MyType = { cx <= [ 1, "" ] }'
        ];

        assertTests(tests);
    });
    describe("Object Expressions", () => {
        const tests = [
            'type MyType = { cx <= {} }',
            'type MyType = { cx <= { a: 1 } }',
            'type MyType = { cx <= { a: 1, b: [] } }',
            'type MyType = { cx <= { a: 1, b: true } }',
            'type MyType = { cx <= { a: 1, b: null } }',
            'type MyType = { cx <= { a: 1, b: undefined } }',
            'type MyType = { cx <= { a: 1, b: 2 } }',
            'type MyType = { cx <= { a: 1, b: "" } }'
        ];

        assertTests(tests);
    });
});
