/**
 *  Normalizer.js
 *
 *  @copyright 2019, Kevin Lindsey
 *  @module Normalizer
 */

// import Parser from "./NormalizerParser.js";
import Parser from "./Parser.js";
import util from "util";

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
        this.patterns = {};
        this.transforms = {};
        this.generators = {};
        // this.typeCheckers = {};
        this.typeCreators = {};
        this.messages = [];
        this.verbose = false;
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
     * Add information
     *
     * @param {string} message
     */
    addInfo(message) {
        if (this.verbose) {
            this.messages.push({type: "message", level: "info", message});
        }
    }

    /**
     * Add a warning
     *
     * @param {string} message
     */
    addWarning(message) {
        this.messages.push({type: "message", level: "warning", message});
    }

    /**
     * Add an error
     *
     * @param {string} message
     */
    addError(message) {
        this.messages.push({type: "message", level: "error", message});
    }

    /**
     * Compile and execute the source against the specfied structure
     *
     * @param {string} source
     * @param {*} structure
     */
    run(source, structure) {
        const statements = Parser.parse(source);

        // console.log(util.inspect(statements, {depth: Infinity, color: true}));

        let result;

        for (const statement of statements) {
            switch (statement.type) {
                case "transform-sequence":
                    result = this.runTransforms(statement.transforms, structure);

                    if (result === FAILURE_VALUE) {
                        break;
                    }
                    break;

                case "generator-assignment":
                    this.generators[statement.name] = statement.value;
                    break;

                case "pattern-assignment":
                    this.patterns[statement.name] = statement.value;
                    break;

                case "transform-assignment":
                    this.transforms[statement.name] = statement.value;
                    break;

                default:
                    this.addError(`unknown statement type: ${statement.type}`);
                    return FAILURE_VALUE;
            }
        }

        return result;
    }

    runTransforms(transforms, structure) {
        let currentObject = structure;

        // process transforms in reverse order, passing in the results of one to the next
        // all transforms must succeed
        for (let i = transforms.length - 1; i >= 0; i--) {
            let transform = transforms[i];

            if (transform.type === "transform-reference") {
                if (transform.name in this.transforms) {
                    transform = this.transforms[transform.name];
                }
                else {
                    this.addError(`undefined transform reference: '${transform.name}'`);
                    return FAILURE_VALUE;
                }
            }

            let result = FAILURE_VALUE;

            for (const pattern of transform.patterns) {
                const symbolTable = {};

                result = this.normalizePattern(pattern, currentObject, symbolTable);

                // console.log(`currentObject = ${util.inspect(currentObject)}`);
                // console.log(`transform = ${util.inspect(transform, {depth: Infinity})}`);
                // console.log(`result = ${util.inspect(result)}`);
                // console.log(`symbolTable = ${util.inspect(symbolTable)}`);

                if (result !== FAILURE_VALUE) {
                    // pattern matched, so we can stop
                    if (transform.returnValue !== null) {
                        currentObject = this.createResult(transform.returnValue.expression, symbolTable);
                    }
                    else {
                        currentObject = result;
                    }
                    break;
                }
            }

            if (result === FAILURE_VALUE) {
                this.addError("Unable to match any type patterns");
                return FAILURE_VALUE;
            }
        }

        return currentObject;
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
        const assign = (name, value) => {
            if (name !== null && name !== undefined) {
                if (name in symbolTable) {
                    console.log(`warning: overwriting ${name} in symbol table`);
                }

                symbolTable[name] = value;
            }
        };

        switch (pattern.patternType) {
            case "any":
                assign(pattern.assignTo, structure);
                return structure;

            case "array":
                if (Array.isArray(structure)) {
                    assign(pattern.assignTo, structure);
                    return structure;
                }

                return FAILURE_VALUE;

            case "array-pattern": {
                if (Array.isArray(structure) === false) {
                    return FAILURE_VALUE;
                }

                const result = [];
                let index = 0;

                for (const element of pattern.value) {
                    const {pattern: elementPattern, range: {start, stop}} = element;
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
                        assign(element.assignTo, value);
                        result.push(value);
                    }

                    // advance global index by processed amount
                    index += i;
                }

                if (index === structure.length) {
                    assign(pattern.assignTo, structure);
                    return result;
                }

                return FAILURE_VALUE;
            }

            case "boolean":
                if (typeof structure === "boolean") {
                    if (pattern.value === null || pattern.value === structure) {
                        assign(pattern.assignTo, structure);
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "null":
                if (structure === null) {
                    assign(pattern.assignTo, structure);
                    return structure;
                }

                return FAILURE_VALUE;

            case "number":
                if (typeof structure === "number") {
                    if (pattern.value === null || pattern.value === structure) {
                        assign(pattern.assignTo, structure);
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "object":
                if (isObject(structure)) {
                    assign(pattern.assignTo, structure);
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

                        assign(property.assignTo, value);
                        result[assignTo] = value;
                    }
                    else {
                        return FAILURE_VALUE;
                    }
                }

                assign(pattern.assignTo, structure);
                return result;
            }

            case "reference":
                if (pattern.value in this.patterns) {
                    const referencedPattern = this.patterns[pattern.value];
                    const result = this.normalizePattern(referencedPattern, structure, symbolTable);

                    if (result !== FAILURE_VALUE) {
                        assign(pattern.assignTo, result);
                    }

                    return result;
                }

                return FAILURE_VALUE;

            case "string":
                if (typeof structure === "string") {
                    if (pattern.value === null || pattern.value === structure) {
                        assign(pattern.assignTo, structure);
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "undefined":
                // NOTE: Our current failure value is undefined, so this will be treated as an error. I can change
                // FAILURE_VALUE to be a sigil. I'll just have to be careful to return undefined at the top-most level.
                // I'm leaving this for now as this is probably not going to be used much
                if (structure === undefined) {
                    assign(pattern.assignTo, structure);
                    return structure;
                }

                return FAILURE_VALUE;

            default:
                console.log(`pattern = ${util.inspect(pattern, {depth: Infinity})}`);
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

            case "array":
                return expression.value.map(
                    elementExpression => this.createResult(elementExpression.expression, symbolTable)
                );

            case "boolean":
            case "null":
            case "number":
            case "string":
            case "undefined":
                return expression.value;

            case "object": {
                const result = {};

                for (const propertyExpression of expression.value) {
                    result[propertyExpression.name] = this.createResult(propertyExpression.expression, symbolTable);
                }

                return result;
            }

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
}
