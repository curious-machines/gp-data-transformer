import assert from "assert";
import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";


function Point2D(x, y) {
    return { x, y };
}

function evaluate(source, structure) {
    const transformer = new Transformer();

    transformer.typeCreators.Point2D = Point2D;

    const result = transformer.execute(source, structure);

    for (const message in transformer.messages) {
        console.log(`${message.type}: ${message.message}`);
    }

    return result;
}

describe("Map", () => {
    it("Static Array", () => {
        const script = "map([1, 2, 3], n * n <= number as n) <= _";
        const data = [1, 2, 3];
        const expected = [1, 4, 9];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Data Array", () => {
        const script = "map(d, n * n <= number as n) <= [1, 2, 3] as d";
        const data = [1, 2, 3];
        const expected = [1, 4, 9];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Custom Generator", () => {
        const script = "map(d, Point2D(n, n + 1) <= number as n) <= [1, 2, 3] as d";
        const data = [1, 2, 3];
        const expected = [Point2D(1, 2), Point2D(2, 3), Point2D(3, 4)];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Custom Generator 2", () => {
        const script = "map(d, Point2D(x, y) <= [number as x, number as y]) <= [(number; 2); 0.. as d]";
        const data = [1, 2, 2, 4, 3, 6];
        const expected = [Point2D(1, 2), Point2D(2, 4), Point2D(3, 6)];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Scope test", () => {
        const script = "map(n, n * n <= number as n) <= [number; 0..] as n";
        const data = [1, 2, 3, 4];
        const expected = [1, 4, 9, 16];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Spread test", () => {
        const script = "map(n, n * n <= number as n) <= [number; 0..] as n";
        const data = [1, 2, 3, 4];
        const expected = [1, 4, 9, 16];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
});
