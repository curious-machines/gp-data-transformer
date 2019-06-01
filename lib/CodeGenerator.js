import e from "estree-builder";
import { generate } from "astring";

const $ = e.identifier("$");
const FAILURE_VALUE = e.identifier("FAILURE_VALUE");
const returnFailure = e.return(FAILURE_VALUE);


function testType(typeName) {
    const exprNode = e("===", e.typeof($), e.string(typeName));
    const returnNode = e.return(e.object({}));
    const ifNode = e.if(exprNode, returnNode);

    return e.function(["$"], [ifNode, returnFailure], "main");
}

export default class CodeGenerator {
    constructor() {
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
        this.body.push(e.let(assign.name, e.number(assign.value.steps[0].value)));
    }

    generateSequence(seq) {
        for (const step of seq.steps) {
            this.generate(step);
        }
    }

    generatePattern(pat) {
        switch (pat.patternType) {
            case "boolean":
            case "number":
                this.body.push(testType(pat.patternType));
                break;

            default:
                throw new TypeError(`unknown pattern type: ${pat.patternType}`);
        }
    }
}
