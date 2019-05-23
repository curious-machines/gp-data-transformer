import assert from "assert";
import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";


function evaluate(source, structure) {
    const transformer = new Transformer();

    return transformer.execute(source, structure);
}

describe("Element Group", () => {
    describe("Named Groups", () => {
        it("zero arrays from group - no match", () => {
            const script = "g <= [(number, string); 1..3 as g]";
            const data = [];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("zero arrays from group", () => {
            const script = "g <= [(number, string); 0..3 as g]";
            const data = [];
            const expected = [];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("one array from group", () => {
            const script = "g <= [(number, string); 0..3 as g]";
            const data = [10, "hello"];
            const expected = [[10, "hello"]];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("two arrays from group", () => {
            const script = "g <= [(number, string); 0..3 as g]";
            const data = [10, "hello", 20, "world"];
            const expected = [[10, "hello"], [20, "world"]];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("three arrays from group", () => {
            const script = "g <= [(number, string); 0..3 as g]";
            const data = [10, "hello", 20, "world", 30, "!"];
            const expected = [[10, "hello"], [20, "world"], [30, "!"]];
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("four arrays from group", () => {
            const script = "g <= [(number, string); 1..3 as g]";
            const data = [10, "hello", 20, "world", 30, "!", 40, "return"];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
    });
    describe("Named Group Elements", () => {
        it("zero element arrays from group elements - no match", () => {
            const script = "{x, y} <= [(number as x, string as y); 1..3]";
            const data = [];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("zero element arrays from group elements", () => {
            const script = "{x, y} <= [(number as x, string as y); 0..3]";
            const data = [];
            const expected = {x: [], y: []};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("one element arrays from group elements", () => {
            const script = "{x, y} <= [(number as x, string as y); 0..3]";
            const data = [10, "hello"];
            const expected = {x: [10], y: ["hello"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("two element arrays from group elements", () => {
            const script = "{x, y} <= [(number as x, string as y); 0..3]";
            const data = [10, "hello", 20, "world"];
            const expected = {x: [10, 20], y: ["hello", "world"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("three element arrays from group elements", () => {
            const script = "{x, y} <= [(number as x, string as y); 0..3]";
            const data = [10, "hello", 20, "world", 30, "!"];
            const expected = {x: [10, 20, 30], y: ["hello", "world", "!"]};
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
        it("four element arrays from group elements", () => {
            const script = "{x, y} <= [(number as x, string as y); 0..3]";
            const data = [10, "hello", 20, "world", 30, "!", 40, "return"];
            const expected = FAILURE_VALUE;
            const result = evaluate(script, data);

            assert.deepStrictEqual(result, expected);
        });
    });
});
