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

const tests = [
	"let a = 10",
	"=~ any",
	"=~ array",
	"=~ boolean",
	"=~ true",
	"=~ false",
	"=~ number",
	"=~ object",
	"=~ 10.5",
	"=~ string",
	"=~ \"hello\""
];

tests.forEach(source => {
	console.log("===");
	console.log(source);

	const dtAst = Parser.parse(source);
	// console.log("---");
	// console.log(prettify(dtAst));

	generator.reset();
	generator.generate({ type: 'program', statements: dtAst });

	const dtJsAst = {type: "Program", body: generator.body};
	// console.log("---");
	// console.log(prettify(dtJsAst));

	const dtJs = generate(dtJsAst);
	console.log("---");
	console.log(dtJs);

	// const jsAst = acorn.parse("let a = 10; function main($) { return FAILURE_VALUE }");
	// console.log("---");
	// console.log(prettify(jsAst));
	//
	// console.log("---");
	// console.log(generate(jsAst));
});