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
	"let a = 10; =~ any",
	"let a = 10; =~ boolean",
	"let a = 10; =~ true",
	"let a = 10; =~ false",
	"let a = 10; =~ number",
	"let a = 10; =~ 10.5",
	"let a = 10; =~ string",
	"let a = 10; =~ \"hello\""
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
