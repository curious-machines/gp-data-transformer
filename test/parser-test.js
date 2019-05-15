// import assert from "assert";
import util from "util";
import ValidatorParser from "../lib/ValidatorParser.js";

function prettyPrint(obj) {
    const options = { depth: null, colors: true };

    console.log(util.inspect(obj, options));
}

describe("Parser", () => {
    it("Empty Type", () => {
        const parser = new ValidatorParser();
        const result = parser.parse("Ellipse = {}");

        prettyPrint(result[0]);
    });
    it("Single Property, No Transform", () => {
        const parser = new ValidatorParser();
        const result = parser.parse("Ellipse = { cx: number }");

        prettyPrint(result[0]);
    });
    it("Multiple Properties, No Transforms", () => {
        const parser = new ValidatorParser();
        const result = parser.parse("Circle = { cx: number cy: number radius: number}");

        prettyPrint(result[0]);
    });
    it("Single Property, Transform", () => {
        const parser = new ValidatorParser();
        const source = `
Ellipse = {
    center: Point2D(x, y) {
        type-match center {
            Point2D
        }
    }
}
`;
        const result = parser.parse(source);

        prettyPrint(result[0]);
    });
    it("Single Property, Transforms", () => {
        const parser = new ValidatorParser();
        const source = `
Ellipse = {
    center: Point2D(x, y) {
        type-match center {
            Point2D
            [x:number, y:number]
        }
    }
}
`;
        const result = parser.parse(source);

        prettyPrint(result[0]);
    });
    it("Multiple Properties, Transforms", () => {
        const parser = new ValidatorParser();
        const source = `
Ellipse = {
    center: Point2D(x, y) {
        group {
            type-match cx {
                x:number
            }
            type-match cy {
                y:number
            }
        }
    }
}
`;
        const result = parser.parse(source);

        prettyPrint(result[0]);
    });
});
