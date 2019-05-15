#!/usr/bin/env node -r esm

import fs from "fs";
import util from "util";
import Parser from "../lib/Parser.js";

function testParser(source) {
    const result = Parser.parse(source);
    const prettyPrint = util.inspect(result, { depth: Infinity });

    console.log(source);
    console.log(prettyPrint);
    console.log();
}

const testValidations = [
    'type Ellipse = true',
    'type Ellipse = false',
    'type Ellipse = boolean',
    'type Ellipse = "hello"',
    'type Ellipse = string',
    'type Ellipse = 10',
    'type Ellipse = number',
    'type Ellipse = {}',
    'type Ellipse = []',
    'type Ellipse = { cx }',
    'type Ellipse = { cx cy }',
    'type Ellipse = { cx { group { match cx { boolean } } } }',
    'type Ellipse = { cx { group { match cx { true } } } }',
    'type Ellipse = { cx { group { match cx { false } } } }',
    'type Ellipse = { cx { group { match cx { 10 } } } }',
    'type Ellipse = { cx { group { match cx { string } } } }',
    'type Ellipse = { cx { group { match cx { "first name" } } } }',
    'type Ellipse = { cx { group { match cx { string number } } } }',
    'type Ellipse = { cx { group { match cx { number } match cy { number } } } }',
    // initial with matching shortcuts. I use cy in match to make it clear that can be changed
    'type Ellipse = { cx { group { match cy { number } } } }',
    'type Ellipse = { cx { group { cy: number } } }',
    'type Ellipse = { cx { cy: number } }',
    'type Ellipse = { cx: number }'
];

for (const source of testValidations) {
    testParser(source);
}
