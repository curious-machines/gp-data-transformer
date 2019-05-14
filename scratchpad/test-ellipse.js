#!/usr/bin/env node -r esm

import fs from "fs";
import ValidatorParser from "../lib/ValidatorParser.js";
import Validator from "../lib/Validator.js";

function testValidation(structure) {
    const result = validator.validate(structure, "Ellipse");
    const status = result ? "  valid" : "invalid";

    console.log(`${status}: ${JSON.stringify(structure)}`);
}

const source = fs.readFileSync("./test.validator", "utf-8");
const parser = new ValidatorParser();
const validatorTable = parser.parse(source);
const validator = new Validator(validatorTable);

// success
testValidation({cx: 10, cy: 20, rx: 30, ry: 40});
testValidation({centerX: 10, centerY: 20, radiusX: 30, radiusY: 40});
testValidation({cx: 10, cy: 20, radiusX: 30, radiusY: 40});
testValidation({centerX: 10, centerY: 20, rx: 30, ry: 40});
testValidation({center: [10, 20], rx: 30, ry: 40});
testValidation({center: [10, 20], radii: [30, 40]});

// not sure
testValidation({cx: 10, cy: 20, centerX: [10, 20], rx: 30, ry: 40});

// failure
testValidation({});
testValidation({cx: 10});
testValidation({cx: 10, cy: 20});
testValidation({cX: 10, cy: 20, rx: 30, ry: 40});
