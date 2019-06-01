import util from "util";
import Generator from "../lib/CodeGenerator.js";
import Parser from "../lib/Parser.js";
const acorn = require("acorn");
import { generate } from "astring";

const generator = new Generator();

function prettify(obj) {
	const options = {depth: Infinity, colors: true};

	return util.inspect(obj, options);
}

// const dtSource = "=~ boolean";
const dtSource = "let a = 10; =~ boolean";
console.log(dtSource);

const dtAst = Parser.parse(dtSource);
console.log("---");
console.log(prettify(dtAst));

for (const node of dtAst) {
	generator.generate(node);
}
// console.log(generator.source);

const jsAst = acorn.parse(generator.source);
console.log(prettify(jsAst));

console.log("---");
console.log(generate(jsAst));
