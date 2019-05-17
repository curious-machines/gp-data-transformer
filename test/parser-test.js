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
            'type Ellipse = true',
            'type Ellipse = false',
            'type Ellipse = boolean',
            'type Ellipse = "hello"',
            'type Ellipse = string',
            'type Ellipse = 10',
            'type Ellipse = number',
            'type Ellipse = {}',
            'type Ellipse = []'
        ];

        assertTests(tests);
    });
    describe("Object Descriptions", () => {
        const tests = [
            'type Ellipse = { cx }',
            'type Ellipse = { cx cy }',
            'type Ellipse = { cx { group { match cx { boolean } } } }',
            'type Ellipse = { cx { group { match cx { true } } } }',
            'type Ellipse = { cx { group { match cx { false } } } }',
            'type Ellipse = { cx { group { match cx { 10 } } } }',
            'type Ellipse = { cx { group { match cx { string } } } }',
            'type Ellipse = { cx { group { match cx { "first name" } } } }',
            'type Ellipse = { cx { group { match cx { string number } } } }',
            'type Ellipse = { cx { group { match cx { number } match cy { number } } } }'
        ];

        assertTests(tests);
    });
    describe("Array Descriptions", () => {
        const tests = [
            'type Points = { points: [ number ] }',
            'type Points = { points: [ number, string ] }',
            'type Points = { points: [ number;5..10 ] }',
            'type Points = { points: [ number;5.. ] }',
            'type Points = { points: [ number;..10 ] }',
            'type Points = { points: [ number;5 ] }',
            'type Points = { points: [ (number, string) ] }',
            'type Points = { points: [ (number, string);5 ] }',
            'type Points = { points: [ (number;5, string;3) ] }',
            'type Points = { points: [ (number;5, string;3);10 ] }',
            'type Points = { points: [ number as x ] }',
            'type Points = { points: [ number as x, number as y ] }',
            'type Points = { points: [ number;5 as x ] }',
            'type Points = { points: [ (number;5 as x, string;3 as y);10 as pairs ] }'
        ];

        assertTests(tests);
    });
    describe("Enumeration Descriptions", () => {
        const tests = [
            'type Days = enumeration { }',
            'type Days = enumeration { one two three }',
            'type Days = enumeration { "array" "boolean" "multiple words" }'
        ];

        assertTests(tests);
    });
    describe("Shortcuts", () => {
        const tests = [
            'type Ellipse = { cx { group { match cy { number } } } }',
            'type Ellipse = { cx { group { cy: number } } }',
            'type Ellipse = { cx { cy: number } }',
            'type Ellipse = { cx: number }'
        ];

        assertTests(tests);
    });
    describe("Array Patterns", () => {
        const tests = [
            'type Points = { cx { points: [number, number] } }',
            'type Points = { cx <= x { } }',
            'type Points = { cx <= Point() { } }',
            'type Points = { cx <= Point(x, y) { } }'
        ];

        assertTests(tests);
    });
});
