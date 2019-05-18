/**
 *  Normalizer.js
 *
 *  @copyright 2019, Kevin Lindsey
 *  @module Normalizer
 */

// import Parser from "./Parser.js";
import Parser from "./NormalizerParser.js";

const FAILURE_VALUE = undefined;

/**
 * Determine if object is something that can have properties
 *
 * @param {*} obj
 * @returns {boolean}
 */
function isObject(obj) {
    return obj !== null && typeof obj === "object";
}

/**
 * Normalizer
 */
export default class Normalizer {
    /**
     * Create a new empty Normalizer. Normalizers can be used to validate and transform data. However, when a new
     * Normalizer has been created, it needs to be populated with one or more type descriptions. The easiest way to do
     * this is with the static method fromSource.
     */
    constructor() {
        this.types = {};
        this.typeCheckers = {
            array: (value, type) => Array.isArray(value),
            boolean: (value, type) => typeof value === "boolean",
            number: (value, type) => typeof value === "number",
            object: (value, type) => isObject(value),
            string: (value, type) => typeof value === "string"
        };
        this.typeCreators = {};
    }

    /**
     * Create a new instance of a Normalizer with its type table initially populated from the specified normalizer
     * source code.
     *
     * @param {string} source
     * @returns {Normalizer}
     */
    static fromSource(source) {
        const result = new Normalizer();

        result.addDefinitionsFromSource(source);

        return result;
    }

    /**
     * Create a new instance of a Normalizer with its type table initially populated from the specified serialization
     * table. This table can be used to cache a parse normalized file and is the output of Parser.parse()
     *
     * @param {Array} table
     * @returns {Normalizer}
     */
    static fromTable(table) {
        const result = new Normalizer();

        result.addDefinitionsFromTable(table);

        return result;
    }

    /**
     * Add all type definitions from the specified normalization source code to this Normalizer instance. This will
     * amend the current types with those specified in the code. Note that any type that has been redefined in the
     * source code will replace any pre-existing version of that type.
     *
     * @param {string} source
     */
    addDefinitionsFromSource(source) {
        const table = Parser.parse(source);

        this.addDefinitionsFromTable(table);
    }

    /**
     * Add all type definitions from the specified serialization table to this Normalizer instance. This will amend the
     * current types with those specified in the table. Note that any type that has been redefined in the table will
     * replace any pre-existing version of that type.
     *
     * @param {Array} table
     */
    addDefinitionsFromTable(table) {
        table.forEach(typeDescription => {
            this.types[typeDescription.name] = typeDescription;
        });
    }

    /**
     * Query, validate, and/or transform the specified structure according to the specified type description name. If
     * the specified type does not exist in the current type table, then this method will return undefined.
     *
     * @param {*} structure
     * @param {string} asType
     * @returns {*}
     */
    normalize(structure, asType) {
        if (asType in this.types === false) {
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

            case "null":
                return structure === null ? structure : FAILURE_VALUE;

            case "number":
                return typeof structure === "number" ? structure : FAILURE_VALUE;

            case "number-instance":
                if (typeof structure === "number" && structure === typeDeclaration.value) {
                    return structure;
                }

                return FAILURE_VALUE;

            case "object":
                return isObject(structure) ? structure : FAILURE_VALUE;

            case "object-instance": {
                if (isObject(structure) === false) {
                    return FAILURE_VALUE;
                }

                const result = {};

                for (const canonicalProperty of typeDeclaration.value) {
                    const value = this.normalizeCanonicalProperty(canonicalProperty, structure);

                    if (value === FAILURE_VALUE) {
                        return FAILURE_VALUE;
                    }

                    if (canonicalProperty.returnValue !== null) {
                        result[canonicalProperty.name] = this.createResult(canonicalProperty.returnValue.expression, value);
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

            case "undefined":
                return structure === undefined ? structure : FAILURE_VALUE;

            default:
                return FAILURE_VALUE;
        }
    }

    /*
     * Acquire the value of a top-level canonical property from the given structure
     *
     * @param {object} canonicalProperty
     * @param {*} structure
     * @returns {*}
     */
    normalizeCanonicalProperty(canonicalProperty, structure) {
        if (isObject(structure) === false) {
            return FAILURE_VALUE;
        }

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

    /*
     * Acquire the values of all matches in the group from the specified structure
     *
     * @param {object} group
     * @param {*} structure
     * @returns {*}
     */
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

    /*
     * Acquire the value from the specified structure using a list of type pattern matches
     *
     * @param {object} match
     * @param {*} structure
     * @returns {*}
     */
    normalizeMatch(match, structure) {
        const {name, patterns} = match;
        const symbolTable = {};

        if (name in structure) {
            // try to find a pattern that succeeds
            for (const pattern of patterns) {
                // console.log(util.inspect(pattern, { depth: Infinity }));

                const value = this.normalizePattern(pattern, structure[name], symbolTable);

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

    /*
     * Acquire the value of a type pattern from the specified structure. Any named entities will be populated in the
     * specified symbolTable
     *
     * @param {object} pattern
     * @param {*} structure
     * @param {object} symbolTable
     * @returns {*}
     */
    normalizePattern(pattern, structure, symbolTable) {
        switch (pattern.patternType) {
            case "any":
                return structure;

            case "array":
                return Array.isArray(structure) ? structure : FAILURE_VALUE;

            case "array-pattern": {
                if (Array.isArray(structure) === false) {
                    return FAILURE_VALUE;
                }

                const result = [];
                let index = 0;

                for (const element of pattern.value) {
                    const {pattern: elementPattern, range: {start, stop}, assignTo} = element;
                    let i;

                    for (i = 0; i < stop; i++) {
                        const actualIndex = index + i;

                        // treat out-of-bounds like a failure
                        const value = (actualIndex < structure.length)
                            ? this.normalizePattern(elementPattern, structure[index + i], symbolTable)
                            : FAILURE_VALUE;

                        // if we processed enough, continue, else failure
                        if (value === FAILURE_VALUE) {
                            if (i >= start) {
                                break;
                            }

                            return FAILURE_VALUE;
                        }

                        // save result
                        result.push(value);

                        if (assignTo !== null) {
                            if (assignTo in symbolTable) {
                                console.log(`warning: overwriting ${assignTo} in symbol table`);
                            }

                            symbolTable[assignTo] = value;
                        }
                    }

                    // advance global index by processed amount
                    index += i;
                }

                return index === structure.length ? result : FAILURE_VALUE;
            }

            case "boolean":
                if (typeof structure === "boolean") {
                    if (pattern.value === null || pattern.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "null":
                return structure === null ? structure : FAILURE_VALUE;

            case "number":
                if (typeof structure === "number") {
                    if (pattern.value === null || pattern.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "object":
                if (isObject(structure)) {
                    return structure;
                }

                return FAILURE_VALUE;

            case "object-pattern": {
                if (isObject(structure) === false) {
                    return FAILURE_VALUE;
                }

                const result = {};

                for (const property of pattern.value) {
                    const {name, pattern: propertyPattern, assignTo} = property;

                    if (name in structure) {
                        const value = this.normalizePattern(propertyPattern, structure[name], symbolTable);

                        if (value === FAILURE_VALUE) {
                            return FAILURE_VALUE;
                        }

                        result[assignTo] = value;

                        if (assignTo in symbolTable) {
                            console.log(`warning: overwriting ${assignTo} in symbol table`);
                        }
                        symbolTable[assignTo] = value;
                    }
                    else {
                        return FAILURE_VALUE;
                    }
                }

                return result;
            }

            case "string":
                if (typeof structure === "string") {
                    if (pattern.value === null || pattern.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "undefined":
                // NOTE: Our current failure value is undefined, so this will be treated as an error. I can change
                // FAILURE_VALUE to be a sigil. I'll just have to be careful to return undefined at the top-most level.
                // I'm leaving this for now as this is probably not going to be used much
                return structure === undefined ? structure : FAILURE_VALUE;

            default:
                throw new TypeError(`unrecognized pattern type: '${pattern.type}'`);
        }
    }

    /*
     * Execute a method and return its value
     *
     * @param {object} expression
     * @param {object} symbolTable
     * @returns {*}
     */
    createResult(expression, symbolTable) {
        switch (expression.type) {
            case "get-value":
                return symbolTable[expression.name];
            case "invoke": {
                const args = expression.args.map(arg => symbolTable[arg]);

                return this.createType(expression.name, args);
            }
            // TODO: array and object construction. Allow these inside invocations as well
            default:
                throw new TypeError(`unsupported expression type: '${expression.type}'`);
        }
    }

    /*
     * Invoke a user-defined method and return its value
     *
     * @param {string} type
     * @param {Array} args
     * @returns {*}
     */
    createType(type, args) {
        if (type in this.typeCreators) {
            return this.typeCreators[type](...args);
        }
        else if ("*" in this.typeCreators) {
            return this.typeCreators["*"](type, args);
        }

        return null;
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

        return FAILURE_VALUE;
    }
}
