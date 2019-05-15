#!/usr/bin/env node -r esm

import fs from "fs";
import ValidatorParser from "../lib/ValidatorParser.js";

function testValidation(structure) {
    const result = validator.validate(structure, "Ellipse");
    const status = result ? "  valid" : "invalid";

    console.log(`${status}: ${JSON.stringify(structure)}`);
}

const source = fs.readFileSync("./test.normalizer", "utf-8");
const parser = new ValidatorParser();
const validatorTable = parser.parse(source);

console.log(validatorTable);
