// import e from "estree-builder";
/* eslint-disable-next-line no-undef */
const e = require("estree-builder");

const $ = e.identifier("$");
const FAILURE_VALUE = e.identifier("FAILURE_VALUE");
const emptyObject = e.object({});

/**
 * Create a function that returns an empty object if a test is true
 *
 * @param {Object} testNode
 * @param {string | null} assignTo
 * @returns {Object}
 */
function testFunction(testNode, assignTo) {
    const successValue = assignTo === null || assignTo === undefined
        ? emptyObject
        : e("object-raw", [e("object-property", e.string(assignTo), $)]);
    const returnNode = e.return(e.ternary(testNode, FAILURE_VALUE, successValue));

    return e.function(["$"], [returnNode], "main");
}

/**
 * Create a function that tests equality of two items
 *
 * @param {Object} left
 * @param {Object} right
 * @param {string | null} assignTo
 * @returns {Object}
 */
function testInequalityFunction(left, right, assignTo) {
    return testFunction(e("!==", left, right), assignTo);
}

/**
 * Create a function that tests its input value's type
 *
 * @param {string} typeName
 * @param {string | null} assignTo
 * @returns {Object}
 */
function testType(typeName, assignTo) {
    return testInequalityFunction(e.typeof($), e.string(typeName), assignTo);
}

/**
 * Create a function that tests that its input is a specific value
 *
 * @param {Object} valueNode
 * @param {string | null} assignTo
 * @returns {*}
 */
function testValue(valueNode, assignTo) {
    return testInequalityFunction($, valueNode, assignTo);
}

/**
 * CodeGenerator class
 */
export default class CodeGenerator {
    constructor() {
        this.body = [];
    }

    append(node) {
        this.body.push(node);
    }

    generateProgram(program) {
        if (program.type !== "program") {
            throw new TypeError(`Top-level node must be a program: ${program.type}`);
        }

        this.body = [];

        for (const statement of program.statements) {
            this.generate(statement);
        }

        return {type: "Program", body: this.body};
    }

    generate(node) {
        switch (node.type) {
            case "assignment":
                this.generateAssignment(node);
                break;

            case "def":
                this.generateDef(node);
                break;

            case "sequence":
                this.append(this.generateSequence(node));
                break;

            case "pattern":
                this.generatePattern(node);
                break;

            default: {
                const returnValue = this.generateExpression(node);
                this.append(e.function([$], [e.return(returnValue)], "main"));
                break;
            }
        }
    }

    generateAssignment(assign) {
        const sequence = assign.value;

        if (sequence.type === "sequence") {
            if (sequence.steps.length === 1) {
                const step = sequence.steps[0];

                this.append(
                    e.let(
                        assign.name, this.generateExpression(step)
                    )
                );
            }
        }
        else {
            throw new TypeError(`Expected sequence as assignment value: ${sequence.type}`);
        }
    }

    generateDef(def) {
        this.append(e.const(def.name, this.generateExpression(def.value)));
    }

    generateSequence(seq) {
        const funcs = [];
        const calls = [];
        let count = 1;

        for (const step of seq.steps) {
            if (step.type === "pattern") {
                this.generatePattern(step);
            }
            else {
                const expr = this.generateExpression(step);
                const name = `a${count}`;

                funcs.push(e.function(["$"], [e.return(expr)], name));
                calls.push(e.statement(e("=", $, e.call(e.identifier(name), [$]))));

                count += 1;
            }
        }

        // TODO: return FAILURE upon intermediate FAILURE value
        const body = funcs.concat(calls);

        body.push(e.return($));

        return e.function(["$"], body, "main");
    }

    generateExpression(expr) {
        switch (expr.type) {
            // primitive types

            case "boolean":
                return expr.value ? e.true() : e.false();

            case "null":
                return e.null();

            case "number":
                return e.number(expr.value);

            case "string":
                return e.string(expr.value);

            case "undefined":
                return e.undefined();

                // compound types

            case "array":
                return e.array(
                    expr.value.map(element => this.generateExpression(element))
                );

            case "object":
                return e(
                    "object-raw",
                    expr.value.map(property => {
                        return e(
                            "object-property",
                            this.generateExpression(property.name),
                            // TODO: fix here and in assignment
                            this.generateExpression(property.value.steps[0])
                        );
                    })
                );

                // accessors

            case "get-structure":
                return $;

            case "get-value":
                return e.identifier(expr.name);

            case "get-property":
                switch (typeof expr.right) {
                    case "string":
                        return e(".", this.generateExpression(expr.left), e.string(expr.right));
                    case "number":
                        return e.get(this.generateExpression(expr.left), e.number(expr.right));
                    default:
                        throw new TypeError(`Unrecognized property type: ${expr.right}`);
                }

            case "get-index":
                return e.get(this.generateExpression(expr.left), e.number(expr.right));

                // boolean operators and comparators

            case "and":
                return e("&&", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "or":
                return e("||", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "not":
                return e("!", this.generateExpression(expr.value));

            case "less_than":
                return e("<", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "less_equal":
                return e("<=", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "equal":
                return e("==", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "not_equal":
                return e("!=", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "greater_equal":
                return e(">=", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "greater_than":
                return e(">", this.generateExpression(expr.left), this.generateExpression(expr.right));

                // numerical operators

            case "add":
                return e("+", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "subtract":
                return e("-", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "multiply":
                return e("*", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "divide":
                return e("/", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "modulus":
                return e("%", this.generateExpression(expr.left), this.generateExpression(expr.right));

            case "power":
                return {
                    type: "BinaryExpression",
                    operator: "**",
                    left: this.generateExpression(expr.left),
                    right: this.generateExpression(expr.right)
                };
                // return e("**", this.generateExpression(expr.left), this.generateExpression(expr.right));

                // unrecognized

            default:
                throw new TypeError(`Unsupported expression type: ${expr.type}`);
        }
    }

    generatePattern(pat) {
        switch (pat.patternType) {
            case "any": {
                // return { "a": $ }
                const returnNode = pat.assignTo === null
                    ? e.return(e.object({}))
                    : e.return(e("object-raw", [e("object-property", e.string(pat.assignTo), $)]));

                this.append(e.function(["$"], [returnNode], "main"));
                break;
            }

            case "array":
                this.append(
                    testInequalityFunction(
                        e.call(
                            e(".", e.identifier("Array"), e.identifier("isArray")),
                            [$]
                        ),
                        e.true(),
                        pat.assignTo
                    )
                );
                break;

            case "boolean":
                if (pat.value === null) {
                    this.append(testType(pat.patternType, pat.assignTo));
                }
                else if (pat.value === true) {
                    this.append(testValue(e.true(), pat.assignTo));
                }
                else {
                    this.append(testValue(e.false(), pat.assignTo));
                }
                break;

            case "number":
                if (pat.value === null) {
                    this.append(testType(pat.patternType, pat.assignTo));
                }
                else {
                    this.append(testValue(e.number(pat.value), pat.assignTo));
                }
                break;

            case "null":
                this.append(testValue(e.null(), pat.assignTo));
                break;

            case "object":
                this.append(
                    testInequalityFunction(
                        e.call(
                            e.identifier("isObject"),
                            [$]
                        ),
                        e.true(),
                        pat.assignTo
                    )
                );
                break;

            case "string":
                if (pat.value === null) {
                    this.append(testType(pat.patternType, pat.assignTo));
                }
                else {
                    this.append(testValue(e.string(pat.value), pat.assignTo));
                }
                break;

            case "undefined":
                this.append(testValue(e.undefined(), pat.assignTo));
                break;

            default:
                throw new TypeError(`unknown pattern type: ${pat.patternType}`);
        }
    }
}
