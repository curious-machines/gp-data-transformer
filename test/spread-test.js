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

describe("Spread", () => {
    it("Single Spread", () => {
        const script = "Point2D(...coords) <= [ number; 2 ] as coords";
        const data = [1, 2];
        const expected = Point2D(1, 2);
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Multiple Spreads", () => {
        const script = "Point2D(...x, ...y) <= [ [number] as x, [number] as y ] as coords";
        const data = [[1], [2]];
        const expected = Point2D(1, 2);
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
    it("Mapped Spreads", () => {
        const script = "map(coords, Point2D(...coord) <= array as coord) <= [ (number, number); 0.. as coords ]";
        const data = [1, 2, 3, 4, 5, 6];
        const expected = [Point2D(1, 2), Point2D(3, 4), Point2D(5, 6)];
        const result = evaluate(script, data);

        assert.deepStrictEqual(result, expected);
    });
});
