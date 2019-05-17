/**
 *  Normalizer.js
 *
 *  @copyright 2019, Kevin Lindsey
 *  @module Validator
 */

import util from "util";
import Parser from "./Parser.js";

const FAILURE_VALUE = undefined;

export default class Normalizer {
    constructor() {
        this.types = {};
        this.typeCheckers = {
            array: (value, type) => Array.isArray(value),
            boolean: (value, type) => typeof value === "boolean",
            number: (value, type) => typeof value === "number",
            object: (value, type) => typeof value === "object",
            string: (value, type) => typeof value === "string"
        };
        this.typeCreators = {};
    }

    addValidationsFromSource(source) {
        const table = Parser.parse(source);

        this.addValidations(table);
    }

    addValidations(table) {
        table.forEach(typeDescription => {
            this.types[typeDescription.name] = typeDescription;
        });
    }

    normalize(structure, asType) {
        if (asType in this.types === false) {
            // Should this throw instead?
            return FAILURE_VALUE;
        }

        const typeDescriptor = this.types[asType];
        const typeDeclaration = typeDescriptor.declaration;

        switch (typeDeclaration.type) {
            case "any":
                return structure;

            case "array":
                return Array.isArray(structure) ? structure : FAILURE_VALUE;

            case "boolean":
                return typeof structure === "boolean" ? structure : FAILURE_VALUE;

            case "boolean-instance":
                if (typeof structure === "boolean" && structure === typeDeclaration.value) {
                    return structure;
                }

                return FAILURE_VALUE;

            case "enumeration":
                if (typeof structure === "string") {
                    if (typeDeclaration.value.includes(structure)) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "number":
                return typeof structure === "number" ? structure : FAILURE_VALUE;

            case "number-instance":
                if (typeof structure === "number" && structure === typeDeclaration.value) {
                    return structure;
                }

                return FAILURE_VALUE;

            case "object":
                return typeof structure === "object" ? structure : FAILURE_VALUE;

            case "object-instance": {
                if (typeof structure !== "object") {
                    return FAILURE_VALUE;
                }

                const result = {};

                for (const canonicalProperty of typeDeclaration.value) {
                    const value = this.normalizeCanonicalProperty(canonicalProperty, structure);

                    if (value === FAILURE_VALUE) {
                        return FAILURE_VALUE;
                    }

                    // console.log(util.inspect(value));

                    if (canonicalProperty.returnValue !== null) {
                        const expressionResult = this.createResult(canonicalProperty.returnValue.expression, value);

                        result[canonicalProperty.name] = expressionResult;
                    }
                    else {
                        result[canonicalProperty.name] = value[canonicalProperty.name];
                    }
                }

                return result;
            }

            case "string":
                return typeof structure === "string" ? structure : FAILURE_VALUE;

            case "string-instance":
                if (typeof structure === "string" && structure === typeDeclaration.value) {
                    return structure;
                }

                return FAILURE_VALUE;

            default:
                return FAILURE_VALUE;
        }
    }

    normalizeCanonicalProperty(canonicalProperty, structure) {
        const {name: propertyName, groups} = canonicalProperty;

        // when we have no groups, we only need to check that the canonical property name exists
        if (groups.length === 0) {
            if (propertyName in structure) {
                const symbolTable = {};

                symbolTable[propertyName] = structure[propertyName];

                return symbolTable;
            }

            return FAILURE_VALUE;
        }

        let result = FAILURE_VALUE;

        // try to find a group that succeeds
        for (const group of groups) {
            const value = this.normalizeGroup(group, structure);

            if (value !== FAILURE_VALUE) {
                result = value;
                break;
            }
        }

        return result;
    }

    normalizeGroup(group, structure) {
        const {matches} = group;
        const symbolTable = {};

        // Something went wrong. Groups have to have one more matches
        if (matches.length === 0) {
            const groupText = JSON.stringify(group);

            throw new TypeError(`Groups are required to have at least one match, but this one had none:\n${groupText}`);
        }

        // all matchers in this group have to succeed
        for (const match of matches) {
            const value = this.normalizeMatch(match, structure);

            if (value === FAILURE_VALUE) {
                return FAILURE_VALUE;
            }

            /* eslint-disable-next-line guard-for-in */
            for (const key in value) {
                if (key in symbolTable) {
                    console.error(`Overwriting '${key}' in symbol table`);
                }

                symbolTable[key] = value[key];
            }
        }

        return symbolTable;
    }

    normalizeMatch(match, structure) {
        const {name, patterns} = match;
        const symbolTable = {};

        if (name in structure) {
            // try to find a pattern that succeeds
            for (const pattern of patterns) {
                // console.log(util.inspect(pattern, { depth: Infinity }));

                const value = this.normalizePattern(pattern, structure[name]);

                if (value === FAILURE_VALUE) {
                    continue;
                }

                if ("assignTo" in pattern && pattern.assignTo !== null) {
                    symbolTable[pattern.assignTo] = value;
                }
                else {
                    symbolTable[name] = value;
                }

                return symbolTable;
            }
        }

        return FAILURE_VALUE;
    }

    normalizePattern(pattern, structure) {
        switch (pattern.patternType) {
            case "any":
                return structure;

            case "array":
                return Array.isArray(structure) ? structure : FAILURE_VALUE;

            case "array-pattern":
                return FAILURE_VALUE;

            case "boolean":
                if (typeof structure === "boolean") {
                    if (pattern.value === null || pattern.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "number":
                if (typeof structure === "number") {
                    if (pattern.value === null || pattern.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "object":
                if (typeof structure === "object") {
                    return structure;
                }

                return FAILURE_VALUE;

            case "object-pattern":
                return FAILURE_VALUE;

            case "string":
                if (typeof structure === "string") {
                    if (pattern.value === null || pattern.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            default:
                throw new TypeError(`unrecognized pattern type: '${pattern.type}'`);
        }
    }

    createResult(expression, symbolTable) {
        switch (expression.type) {
            case "get-value":
                return symbolTable[expression.name];
            case "invoke": {
                const args = expression.args.map(arg => symbolTable[arg]);

                return this.createType(expression.name, args);
            }
            default:
                throw new TypeError(`unsupported expression type: '${expression.type}'`);
        }
    }

    typeCheck(value, type) {
        if (type in this.types) {
            return this.normalize(value, type);
        }
        else if (type in this.typeCheckers) {
            return this.typeCheckers[type](value, type);
        }
        else if ("*" in this.typeCheckers) {
            return this.typeCheckers["*"](value, type);
        }

        return false;
    }

    createType(type, args) {
        if (type in this.typeCreators) {
            return this.typeCreators[type](type, args);
        }
        else if ("*" in this.typeCreators) {
            return this.typeCreators["*"](type, args);
        }

        return null;
    }
}
