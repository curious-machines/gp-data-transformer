// import assert from "assert";
import ValidatorParser from "../lib/ValidatorParser.js";

describe("Parser", () => {
    it("Parses", () => {
        const parser = new ValidatorParser();
        const result = parser.parse(`type Ellipse {
    center {
        center: Point2D, [Number;2]
        centerX, cx: Number
        centerY, cy: Number
    }
    radii {
        radii: Vector2D, [Number;2]
        radiusX, rx: Number
        radiusY, ry: Number
    }
}`);

        console.log(JSON.stringify(result, null, 2));
    });
});
