#!/usr/bin/env node -r esm

import fs from "fs";
import path from "path";
import util from "util";
import Normalizer from "../lib/Normalizer.js";

function prettify(obj) {
    const options = { depth: Infinity, colors: true };

    return util.inspect(obj, options);
}

function testValidation(structure) {
    const result = normalizer.normalize(structure, "Ellipse");
    const status = result !== undefined ? "  valid" : "invalid";

    if (result !== undefined) {
        console.log(`${status}: ${prettify(structure)} => ${prettify(result)}`);
    }
    else {
        console.log(`${status}: ${prettify(structure)}`);
    }

    // console.log();
}

const filePath = path.join(__dirname, "ellipse.norm");
const source = fs.readFileSync(filePath, "utf-8");
const normalizer = new Normalizer();

normalizer.addDefinitionsFromSource(source);
normalizer.typeCreators.Point2D = (type, args) => { return {x: args[0], y: args[1]} };
normalizer.typeCreators.Vector2D = (type, args) => { return {u: args[0], v: args[1]} };

// console.log(prettify(normalizer.types));

// should succeed
testValidation({cx: 10, cy: 20, rx: 30, ry: 40});
testValidation({centerX: 10, centerY: 20, radiusX: 30, radiusY: 40});
testValidation({cx: 10, cy: 20, radiusX: 30, radiusY: 40});
testValidation({centerX: 10, centerY: 20, rx: 30, ry: 40});

// should succeed, but failing
testValidation({center: {x: 10, y: 20}, rx: 30, ry: 40});
testValidation({center: {x: 10, y: 20}, radii: {x: 30, y: 40}});
testValidation({center: [10, 20], rx: 30, ry: 40});
testValidation({center: [10, 20], radii: [30, 40]});

// succeeding, but not sure if should fail because cx,cy/center
testValidation({cx: 10, cy: 20, center: [10, 20], rx: 30, ry: 40});

// should fail
testValidation({});
testValidation({cx: 10});
testValidation({cx: 10, cy: 20});
testValidation({cX: 10, cy: 20, rx: 30, ry: 40});
