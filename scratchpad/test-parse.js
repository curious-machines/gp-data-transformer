#!/usr/bin/env node -r esm

import util from "util";
import Parser from "../lib/Parser.js";

function testParser(source) {
    try {
        const result = Parser.parse(source);
        const prettyPrint = util.inspect(result, { depth: Infinity });

        console.log(source);
        console.log(prettyPrint);
        // console.log(JSON.stringify(result, null, 2));
        console.log();

        return true;
    }
    catch(e) {
        console.log(source);
        console.log(e);
        console.log();

        return false;
    }
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

    // object descriptions
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
    'type Ellipse = { cx: number }',

    // array descriptions
    'type Points = { points: [ number ] }',
    'type Points = { points: [ number, string ] }',
    'type Points = { points: [ number;5..10 ] }',
    'type Points = { points: [ number;5.. ] }',
    'type Points = { points: [ number;..10 ] }',
    'type Points = { points: [ number;5 ] }',
    'type Points = { points: [ (number, string) ] }',
    'type Points = { points: [ (number, string);5 ] }',
    'type Points = { points: [ (number;5, string;3) ] }',
    'type Points = { points: [ (number;5, string;3);10 ] }',
    'type Points = { points: [ x: number ] }',
    'type Points = { points: [ x: number, y: number ] }',
    'type Points = { points: [ x: number;5 ] }',
    'type Points = { points: [ pairs: (x: number; 5, y: string; 3); 10 ] }',

    // array as type
    'type Points = { cx { points: [number, number] } }',
    'type Points = { cx <= x { } }',
    'type Points = { cx <= Point() { } }',
    'type Points = { cx <= Point(x, y) { } }'
];

const results = testValidations.map(source => {
    return { source, result: testParser(source) };
});
const failures = results.filter(result => result.result === false);

if (failures.length == 0) {
    console.log("All good");
}
else {
    console.log("The following failed");
    failures.forEach(failure => console.log(failure.source));
}
