const e = require('estree-builder');
const { generate } = require("astring");

const $ = e.identifier('$');
const FAILURE_VALUE = e.identifier('FAILURE_VALUE');
const returnFailure = e.return(FAILURE_VALUE);

const exprNode = e('===', e.typeof($), e.string("boolean"));
const returnNode = e.return(e.object({}));
const ifNode = e.if(exprNode, returnNode);
const f = e.function(["$"], [ifNode, returnFailure], "main");

console.log(generate(f));
