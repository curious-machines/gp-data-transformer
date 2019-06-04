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
                '~boolean',
                '~true',
                '~false',
                '~number',
                '~10',
                '~string',
                '~"hello"',
                '~{}',
                '~[]',
                '~null',
                '~undefined'
            ];

            assertTests(tests);
        });
        describe("Array Patterns", () => {
            const tests = [
                '~[ ]',
                '~[ boolean ]',
                '~[ true ]',
                '~[ false ]',
                '~[ number ]',
                '~[ 10 ]',
                '~[ string ]',
                '~[ "test" ]',
                '~[ null ]',
                '~[ undefined ]',
                '~[ {} ]',
                '~[ [] ]',
                '~[ number, string ]',
                '~[ number;5..10 ]',
                '~[ number;5.. ]',
                '~[ number;..10 ]',
                '~[ number;5 ]',
                '~[ (number, string) ]',
                '~[ (number, string);5 ]',
                '~[ (number;5, string;3) ]',
                '~[ (number;5, string;3);10 ]',
                '~[ number as x ]',
                '~[ number as x, number as y ]',
                '~[ number;5 as x ]',
                '~[ (number;5 as x, string;3 as y);10 as pairs ]'
            ];

            assertTests(tests);
        });
        describe("Object Patterns", () => {
            const tests = [
                '~{ cx: boolean }',
                '~{ cx: true }',
                '~{ cx: false }',
                '~{ cx: number }',
                '~{ cx: 10 }',
                '~{ cx: string }',
                '~{ cx: "hello" }',
                '~{ cx: [ number ] }',
                '~{ cx: { x: number } }',
                '~{ cx: Point }'
            ];

            assertTests(tests);
        });
    });
    describe("Generators", () => {
        describe("Array Generators", () => {
            const tests = [
                '[]',
                '[ 1 ]',
                '[ 1, [] ]',
                '[ 1, true ]',
                '[ 1, null ]',
                '[ 1, undefined ]',
                '[ 1, 2 ]',
                '[ 1, "" ]'
            ];

            assertTests(tests);
        });
        describe("Object Generators", () => {
            const tests = [
                '{ cx }',
                '{ cx: x, cy }',
                '{ cx, cy }',
                '{ cx: x, cy: y }',
                '{ cx: {} }',
                '{ cx: { a: 1 } }',
                '{ cx: { a: 1, b: [] } }',
                '{ cx: { a: 1, b: true } }',
                '{ cx: { a: 1, b: null } }',
                '{ cx: { a: 1, b: undefined } }',
                '{ cx: { a: 1, b: 2 } }',
                '{ cx: { a: 1, b: "" } }'
            ];

            assertTests(tests);
        });
    });
});
