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
    describe("Patterns", () => {
        describe("Primitive Patterns", () => {
            const tests = [
                'pattern MyType = boolean',
                'pattern MyType = true',
                'pattern MyType = false',
                'pattern MyType = number',
                'pattern MyType = 10',
                'pattern MyType = string',
                'pattern MyType = "hello"',
                'pattern MyType = {}',
                'pattern MyType = []',
                'pattern MyType = null',
                'pattern MyType = undefined'
            ];

            assertTests(tests);
        });
        describe("Array Patterns", () => {
            const tests = [
                'pattern MyType = [ ]',
                'pattern MyType = [ boolean ]',
                'pattern MyType = [ true ]',
                'pattern MyType = [ false ]',
                'pattern MyType = [ number ]',
                'pattern MyType = [ 10 ]',
                'pattern MyType = [ string ]',
                'pattern MyType = [ "test" ]',
                'pattern MyType = [ null ]',
                'pattern MyType = [ undefined ]',
                'pattern MyType = [ {} ]',
                'pattern MyType = [ [] ]',

                'pattern MyType = [ number, string ]',

                'pattern MyType = [ number;5..10 ]',
                'pattern MyType = [ number;5.. ]',
                'pattern MyType = [ number;..10 ]',
                'pattern MyType = [ number;5 ]',

                'pattern MyType = [ (number, string) ]',
                'pattern MyType = [ (number, string);5 ]',
                'pattern MyType = [ (number;5, string;3) ]',
                'pattern MyType = [ (number;5, string;3);10 ]',

                'pattern MyType = [ number as x ]',
                'pattern MyType = [ number as x, number as y ]',
                'pattern MyType = [ number;5 as x ]',
                'pattern MyType = [ (number;5 as x, string;3 as y);10 as pairs ]'
            ];

            assertTests(tests);
        });
        describe("Object Patterns", () => {
            const tests = [
                'pattern MyType = { cx: boolean }',
                'pattern MyType = { cx: true }',
                'pattern MyType = { cx: false }',
                'pattern MyType = { cx: number }',
                'pattern MyType = { cx: 10 }',
                'pattern MyType = { cx: string }',
                'pattern MyType = { cx: "hello" }',
                'pattern MyType = { cx: [ number ] }',
                'pattern MyType = { cx: { x: number } }',
                'pattern MyType = { cx: Point }'
            ];

            assertTests(tests);
        });
    });
    describe("Generators", () => {
        describe("Array Generators", () => {
            const tests = [
                'generator MyType = []',
                'generator MyType = [ 1 ]',
                'generator MyType = [ 1, [] ]',
                'generator MyType = [ 1, true ]',
                'generator MyType = [ 1, null ]',
                'generator MyType = [ 1, undefined ]',
                'generator MyType = [ 1, 2 ]',
                'generator MyType = [ 1, "" ]'
            ];

            assertTests(tests);
        });
        describe("Object Generators", () => {
            const tests = [
                'generator MyType = { cx }',
                'generator MyType = { cx: x, cy }',
                'generator MyType = { cx, cy }',
                'generator MyType = { cx: x, cy: y }',
                'generator MyType = { cx: {} }',
                'generator MyType = { cx: { a: 1 } }',
                'generator MyType = { cx: { a: 1, b: [] } }',
                'generator MyType = { cx: { a: 1, b: true } }',
                'generator MyType = { cx: { a: 1, b: null } }',
                'generator MyType = { cx: { a: 1, b: undefined } }',
                'generator MyType = { cx: { a: 1, b: 2 } }',
                'generator MyType = { cx: { a: 1, b: "" } }'
            ];

            assertTests(tests);
        });
    });
    // describe("Enumeration Descriptions", () => {
    //     const tests = [
    //         'MyType = enumeration { }',
    //         'MyType = enumeration { one two three }',
    //         'MyType = enumeration { "array" "boolean" "multiple words" }'
    //     ];
    //
    //     assertTests(tests);
    // });
});
