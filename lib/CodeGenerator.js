export default class CodeGenerator {
    constructor() {
        this.source = "";
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

            default:
                throw new TypeError(`unknown node type: ${node.type}`);
        }
    }

    generateAssignment(assign) {
        this.source += `
        let ${assign.name} = ${assign.value.steps[0].value};
        `;
    }

    generateSequence(seq) {
        for (const step of seq.steps) {
            this.generate(step);
        }
    }

    generatePattern(pat) {
        switch (pat.patternType) {
            case "boolean":
                this.source += `
function main($) {
    if (typeof $ === "boolean") {
        return {};
    }
    
    return FAILURE_VALUE;
}`;
                break;

            default:
                throw new TypeError(`unknown pattern type: ${pat.patternType}`);
        }
    }
}
