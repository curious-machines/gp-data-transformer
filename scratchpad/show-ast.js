#!/usr/bin/env node

const acorn = require("acorn");
const util = require("util");

const source = `function main($) {
    function a1($) {
        return {
            "a": $["a"]
        };
    }
    function a2($) {
        return $["a"];
    }
    $ = a1($);
    $ = a2($);
    return $;
}`;
const ast = acorn.parse(source);

console.log(util.inspect(ast, {depth: Infinity, colors: true}));
