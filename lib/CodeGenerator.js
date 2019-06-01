import e from "estree-builder";

const $ = e.identifier("$");
const FAILURE_VALUE = e.identifier("FAILURE_VALUE");
const returnFailure = e.return(FAILURE_VALUE);

/**
 * Create a function that returns an empty object if a test is true
 *
 * @param {Object} testNode
 * @returns {Object}
 */
function testFunction(testNode) {
    const returnNode = e.return(e.object({}));
    const ifNode = e.if(testNode, returnNode);

    return e.function(["$"], [ifNode, returnFailure], "main");
}

/**
 * Create a function that tests equality of two items
 *
 * @param {Object} left
 * @param {Object} right
 * @returns {Object}
 */
function testEqualityFunction(left, right) {
    return testFunction(e("===", left, right));
}

/**
 * Create a function that tests its input value's type
 *
 * @param {string} typeName
 * @returns {Object}
 */
function testType(typeName) {
    return testEqualityFunction(e.typeof($), e.string(typeName));
}

/**
 * Create a function that tests that its input is a specific value
 *
 * @param valueNode
 * @returns {*}
 */
function testValue(valueNode) {
    return testEqualityFunction($, valueNode);
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

    reset() {
        this.body = [];
    }

    generate(node) {
        switch (node.type) {
            case "assignment":
                this.generateAssignment(node);
                break;

            case "sequence":
                this.generateSequence(node);
                break;

            case "pattern":
                this.generatePattern(node);
                break;

            case "program":
                for (const statement of node.statements) {
                    this.generate(statement);
                }
                break;

            default:
                throw new TypeError(`unknown node type: ${node.type}`);
        }
    }

    generateAssignment(assign) {
        this.append(e.let(assign.name, e.number(assign.value.steps[0].value)));
    }

    generateSequence(seq) {
        for (const step of seq.steps) {
            this.generate(step);
        }
    }

    generatePattern(pat) {
        switch (pat.patternType) {
            case "any": {
                const returnNode = e.return(e.object({}));

                this.append(e.function(["$"], [returnNode], "main"));
                break;
            }

            case "boolean":
                if (pat.value === null) {
                    this.append(testType(pat.patternType));
                }
                else if (pat.value === true) {
                    this.append(testValue(e.true()));
                }
                else {
                    this.append(testValue(e.false()));
                }
                break;

            case "number":
                if (pat.value === null) {
                    this.append(testType(pat.patternType));
                }
                else {
                    this.append(testValue(e.number(pat.value)));
                }
                break;

            case "string":
                if (pat.value === null) {
                    this.append(testType(pat.patternType));
                }
                else {
                    this.append(testValue(e.string(pat.value)));
                }
                break;

            case "null":
                this.append(testValue(e.null()));
                break;

            case "undefined":
                this.append(testValue(e.undefined()));
                break;

            default:
                throw new TypeError(`unknown pattern type: ${pat.patternType}`);
        }
    }
}
