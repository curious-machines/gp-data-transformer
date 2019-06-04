import assert from "assert";
import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";


function Point2D(x, y) {
    return { x, y };
}

function evaluate(source, structure) {
    const transformer = new Transformer();

    transformer.addFunction("Point2D", Point2D);

    const result = transformer.execute(source, structure);

    for (const message in transformer.messages) {
        console.log(`${message.type}: ${message.message}`);
    }

    return result;
}

describe("Map", () => {
    it("Static Array", () => {
        const script = "map([1, 2, 3], $ * $)";
        const data = [1, 2, 3];
        const expected = [1, 4, 9];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Data Array", () => {
        const script = "[1, 2, 3] |> map($, $ * $)";
        const data = [1, 2, 3];
        const expected = [1, 4, 9];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Custom Generator", () => {
        const script = "[1, 2, 3] |> map($, Point2D($, $ + 1))";
        const data = [1, 2, 3];
        const expected = [Point2D(1, 2), Point2D(2, 3), Point2D(3, 4)];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Custom Generator 2", () => {
        const script = "~[(number; 2); 0.. as d] |> map(d, Point2D($[0], $[1]))";
        const data = [1, 2, 2, 4, 3, 6];
        const expected = [Point2D(1, 2), Point2D(2, 4), Point2D(3, 6)];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Scope test", () => {
        const script = "~[number; 0.. as d] |> map(d, $ * $)";
        const data = [1, 2, 3, 4];
        const expected = [1, 4, 9, 16];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
});
