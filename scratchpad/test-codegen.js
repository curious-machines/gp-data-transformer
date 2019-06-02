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
	// "let a = true",
	// "let a = false",
	// "let a = 10",
	// "let a = \"hello\"",
	// "let a = null",
	// "let a = undefined",
	// "=~ any",
	// "=~ any as a",
	// "=~ array as a",
	// "=~ boolean as b",
	// "=~ true as t",
	// "=~ false as f",
	// "=~ number as n",
	// "=~ object as o",
	// "=~ 10.5 as n",
	// "=~ string as s",
	// "=~ \"hello\" as s",
	// "true",
	// "false",
	// "null",
	// "10",
	// "\"hello\"",
	// "undefined",
	// "[]",
	// "[1, 2, 3]",
	// "{}",
	// '{"a": 10, "b": true, "c": false, "d": null, "e": "hello", "f": undefined, "g": [], "h": {}}',
	// '{"a": { "b": { "c": [{"d": true}, {"d": false}] } } }',
	// '$.a',
	// 'A.b',
	// '$[0]',
	// '$.0',
	// '$.a[0].b',
	// 'true and false',
	// 'true or false',
	// 'not true',
	// "1 + 2",
	// "3 - 4",
	// "5 * 6",
	// "7 / 8",
	// "9 mod 2",
	// "2 pow 8",
	// "(2 + 3) * 5",
	// "3 < 5",
	// "3 <= 5",
	// "3 == 5",
	// "3 != 5",
	// "3 >= 5",
	// "3 > 5",
	'{"a": $.a } |> $.a'
];

tests.forEach(source => {
	console.log("===");
	console.log(source);

	const dtAst = Parser.parse(source);
	console.log("---");
	console.log(prettify(dtAst));

	const dtJsAst = generator.generateProgram({ type: 'program', statements: dtAst });
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
