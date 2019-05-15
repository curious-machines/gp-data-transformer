// import assert from "assert";
import util from "util";
import ValidatorParser from "../lib/ValidatorParser.js";
import Validator from "../lib/Validator.js";

function prettyPrint(obj) {
    const options = { depth: null, colors: true };

    console.log(util.inspect(obj, options));
}

function typeChecker(value, type) {
    switch (type) {
        case "Point2D":
            return "x" in value && "y" in value;
        default:
            return false;
    }
}

function typeCreator(type, args) {
    switch (type) {
        case "Point2D":
            return {x: args[0], y: args[1]};
        default:
            console.log("unknown type: " + type);
            return null;
    }
}

describe("Validator", () => {
    it("Empty Validation", () => {
        const parser = new ValidatorParser();
        const validatorTable = parser.parse("Ellipse = {}");

        // prettyPrint(validatorTable);

        const validator = new Validator(validatorTable);
        const structure = {};
        const result = validator.validate(structure, "Ellipse");

        prettyPrint(result);
    });
    it("Single Property, No Transform", () => {
        const parser = new ValidatorParser();
        const validatorTable = parser.parse("Ellipse = { cx: number }");

        // prettyPrint(validatorTable);

        const validator = new Validator(validatorTable);

        validator.typeCheckers["*"] = typeChecker;

        const structure = {cx: 10};
        const result = validator.validate(structure, "Ellipse");

        prettyPrint(result);
    });
    it("Multiple Properties, No Transforms", () => {
        const parser = new ValidatorParser();
        const validatorTable = parser.parse("Ellipse = { cx: number cy: number }");

        // prettyPrint(validatorTable);

        const validator = new Validator(validatorTable);

        validator.typeCheckers["*"] = typeChecker;

        const structure = {cx: 10, cy: 20};
        const result = validator.validate(structure, "Ellipse");

        prettyPrint(result);
    });
    it("Multiple Properties, Transforms", () => {
        const parser = new ValidatorParser();
        const source = `
Ellipse = {
    center: Point2D(x, y) {
        group {
            type-match centerX {
                x:number
            }
            type-match centerY {
                y:number
            }
        }
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
        const validatorTable = parser.parse(source);

        prettyPrint(validatorTable);

        const validator = new Validator(validatorTable);

        validator.typeCheckers["*"] = typeChecker;
        validator.typeCreators["*"] = typeCreator;

        const structure = {cx: 10, cy: 20};
        const result = validator.validate(structure, "Ellipse");

        prettyPrint(structure);
        prettyPrint(result);
    });
});
