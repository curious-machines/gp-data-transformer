import assert from "assert";
import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";


function Point2D(x, y) {
    return { x, y };
}

function sum(...nums) {
    return nums.reduce((accum, num) => {
        return accum + num;
    }, 0);
}

function evaluate(source, structure) {
    const transformer = new Transformer();

    transformer.addFunction("Point2D", Point2D);
    transformer.addFunction("sum", sum);

    const result = transformer.execute(source, structure);

    for (const message in transformer.messages) {
        console.log(`${message.type}: ${message.message}`);
    }

    return result;
}

describe("Spread", () => {
    it("Single Spread", () => {
        const script = "=~ [ number; 2 as coords] |> Point2D(...coords)";
        const data = [1, 2];
        const expected = Point2D(1, 2);
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Multiple Spreads", () => {
        const script = "=~ [ [number as x], [number as y] ] |> Point2D(...x, ...y)";
        const data = [[1], [2]];
        const expected = Point2D(1, 2);
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Mapped Spreads", () => {
        const script = "=~ [ (number, number); 0.. as coords ] |> map(coords, Point2D(...$))";
        const data = [1, 2, 3, 4, 5, 6];
        const expected = [Point2D(1, 2), Point2D(3, 4), Point2D(5, 6)];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Sum", () => {
        const script = "=~ [ number; 1.. as firsts, string, number; 1.. as seconds ] |> sum(...firsts, ...seconds)";
        const data = [1, 2, 3, "b", 4, 5, 6];
        const expected = 21;
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
});
