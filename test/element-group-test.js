import assert from "assert";
import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";


function evaluate(source, structure) {
    const transformer = new Transformer();

    return transformer.execute(source, structure);
}

describe("Element Group", () => {
    describe("Named Groups", () => {
        it("zero arrays from group - no match", () => {
            const script = "~[(number, string); 1..3 as g] |> g";
            const data = [];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("zero arrays from group", () => {
            const script = "~[(number, string); 0..3 as g] |> g";
            const data = [];
            const expected = [];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("one array from group", () => {
            const script = "~[(number, string); 0..3 as g] |> g";
            const data = [10, "hello"];
            const expected = [[10, "hello"]];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("one array from group without repeats", () => {
            const script = "~[(number, string) as g] |> g";
            const data = [10, "hello"];
            const expected = [10, "hello"];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("two arrays from group", () => {
            const script = "~[(number, string); 0..3 as g] |> g";
            const data = [10, "hello", 20, "world"];
            const expected = [[10, "hello"], [20, "world"]];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("three arrays from group", () => {
            const script = "~[(number, string); 0..3 as g] |> g";
            const data = [10, "hello", 20, "world", 30, "!"];
            const expected = [[10, "hello"], [20, "world"], [30, "!"]];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("four arrays from group", () => {
            const script = "~[(number, string); 1..3 as g] |> g";
            const data = [10, "hello", 20, "world", 30, "!", 40, "return"];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
    });
    describe("Named Group Elements", () => {
        it("zero element arrays from group elements - no match", () => {
            const script = '~[(number as x, string as y); 1..3] |> {"x", "y"}';
            const data = [];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("zero element arrays from group elements", () => {
            const script = '~[(number as x, string as y); 0..3] |> {"x", "y"}';
            const data = [];
            const expected = {x: [], y: []};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("one element arrays from group elements", () => {
            const script = '~[(number as x, string as y); 0..3] |> {"x", "y"}';
            const data = [10, "hello"];
            const expected = {x: [10], y: ["hello"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("two element arrays from group elements", () => {
            const script = '~[(number as x, string as y); 0..3] |> {"x", "y"}';
            const data = [10, "hello", 20, "world"];
            const expected = {x: [10, 20], y: ["hello", "world"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("three element arrays from group elements", () => {
            const script = '~[(number as x, string as y); 0..3] |> {"x", "y"}';
            const data = [10, "hello", 20, "world", 30, "!"];
            const expected = {x: [10, 20, 30], y: ["hello", "world", "!"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("four element arrays from group elements", () => {
            const script = '~[(number as x, string as y); 0..3] |> {"x", "y"}';
            const data = [10, "hello", 20, "world", 30, "!", 40, "return"];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("elements repeat in group element that repeats", () => {
            const script = '~[(number;3 as x, string; 3 as y); 0..3] |> {"x", "y"}';
            const data = [10, 20, 30, "hello", "world", "!", 40, 50, 60, "a", "b", "c"];
            const expected = {x: [[10, 20, 30], [40, 50, 60]], y: [["hello", "world", "!"], ["a", "b", "c"]]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("1 - elements repeat in group element", () => {
            const script = '~[(number;3 as x, string; 3 as y)] |> {"x", "y"}';
            const data = [10, 20, 30, "hello", "world", "!"];
            const expected = {x: [10, 20, 30], y: ["hello", "world", "!"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
    });
    describe("Generated Tests", () => {
        const tests = [
            { script: '~[ number as n3 ]', data: [10], result: { n3: 10 } },
            { script: '~[ number ; 2 as n3 ]', data: [10, 20], result: { n3: [ 10, 20 ] } },
            { script: '~[ (number; 2, number; 2) as n3 ]', data: [10, 20, 30, 40], result: { n3: [ 10, 20, 30, 40 ] } },
            { script: '~[ (number; 2, number; 2) ; 2 as n3 ]', data: [10, 20, 30, 40, 50, 60, 70, 80], result: { n3: [ [ 10, 20, 30, 40 ], [ 50, 60, 70, 80 ] ] } },
            { script: '~[ (number as n1, number as n2) ]', data: [10, 20], result: { n1: 10, n2: 20 } },
            { script: '~[ (number as n1, number as n2) ; 2 ]', data: [10, 20, 30, 40], result: { n1: [ 10, 30 ], n2: [ 20, 40 ] } },
            { script: '~[ (number as n1, number as n2) as n3 ]', data: [10, 20], result: { n1: 10, n2: 20, n3: [ 10, 20 ] } },
            { script: '~[ (number as n1, number as n2) ; 2 as n3 ]', data: [10, 20, 30, 40], result: { n1: [ 10, 30 ], n2: [ 20, 40 ], n3: [ [ 10, 20 ], [ 30, 40 ] ] } },
            { script: '~[ (number; 2 as n1, number; 2 as n2) ]', data: [10, 20, 30, 40], result: { n1: [ 10, 20 ], n2: [ 30, 40 ] } },
            { script: '~[ (number; 2 as n1, number; 2 as n2) ; 2 ]', data: [10, 20, 30, 40, 50, 60, 70, 80], result: { n1: [ [ 10, 20 ], [ 50, 60 ] ], n2: [ [ 30, 40 ], [ 70, 80 ] ] } },
            { script: '~[ (number; 2 as n1, number; 2 as n2) as n3 ]', data: [10, 20, 30, 40], result: { n1: [ 10, 20 ], n2: [ 30, 40 ], n3: [ 10, 20, 30, 40 ] } },
            { script: '~[ (number; 2 as n1, number; 2 as n2) ; 2 as n3 ]', data: [10, 20, 30, 40, 50, 60, 70, 80], result: { n1: [ [ 10, 20 ], [ 50, 60 ] ], n2: [ [ 30, 40 ], [ 70, 80 ] ], n3: [ [ 10, 20, 30, 40 ], [ 50, 60, 70, 80 ] ] } }
        ];

        for (const t of tests) {
            it(t.script, () => {
                const result = evaluate(t.script, t.data);

                assert.deepStrictEqual(JSON.stringify(result), JSON.stringify(t.result));
            });
        }
    });
});
