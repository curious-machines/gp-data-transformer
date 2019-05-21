/**
 *  Transformer.jss
 *
 *  @copyright 2019, Kevin Lindsey
 *  @module Normalizer
 */

// import util from "util";
// import Parser from "./Parser.js";
import Parser from "./GeneratedParser.js";

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
 * Transformer
 */
export default class Transformer {
    /**
     * Create a new empty Transformer. Normalizers can be used to validate and transform data. However, when a new
     * Transformer has been created, it needs to be populated with one or more type descriptions. The easiest way to do
     * this is with the static method fromSource.
     */
    constructor() {
        this.types = {};
        this.transforms = {};
        this.patterns = {};
        this.generators = {};
        // this.typeCheckers = {};
        this.typeCreators = {};
        this.messages = [];
        this.verbose = false;
    }

    /**
     * Create a new instance of a Transformer with its type table initially populated from the specified normalizer
     * source code.
     *
     * @param {string} source
     * @returns {Transformer}
     */
    static fromSource(source) {
        const result = new Transformer();

        result.addDefinitionsFromSource(source);

        return result;
    }

    /**
     * Create a new instance of a Transformer with its type table initially populated from the specified serialization
     * table. This table can be used to cache a parse normalized file and is the output of Parser.parse()
     *
     * @param {Array} table
     * @returns {Transformer}
     */
    static fromTable(table) {
        const result = new Transformer();

        result.addDefinitionsFromTable(table);

        return result;
    }

    /**
     * Add all type definitions from the specified normalization source code to this Transformer instance. This will
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
     * Add all type definitions from the specified serialization table to this Transformer instance. This will amend the
     * current types with those specified in the table. Note that any type that has been redefined in the table will
     * replace any pre-existing version of that type.
     *
     * @param {Array} table
     */
    addDefinitionsFromTable(table) {
        table.forEach(description => {
            switch (description.type) {
                case "type-assignment":
                    this.types[description.name] = description.value;
                    break;

                case "transform-assignment":
                    this.transforms[description.name] = description.value;
                    break;

                case "generator-assignment":
                    this.generators[description.name] = description.value;
                    break;

                case "pattern-assignment":
                    this.patterns[description.name] = description.value;
                    break;

                default:
                    // ignore all other top-level statements
            }
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
     * @returns {*}
     */
    execute(source, structure) {
        const statements = Parser.parse(source);

        let result;

        for (const statement of statements) {
            switch (statement.type) {
                case "transform":
                    result = this.executeTransform(statement, structure);

                    if (result === FAILURE_VALUE) {
                        break;
                    }
                    break;

                case "type-reference":
                    if (statement.name in this.types) {
                        const type = this.types[statement.name];
                        const value = this.executeType(type, structure);

                        if (value === FAILURE_VALUE) {
                            this.addError(`type ${statement.name} was unable to transform successfully`);
                            return FAILURE_VALUE;
                        }

                        return value;
                    }

                    this.addError(`type is not defined: ${statement.name}`);
                    return FAILURE_VALUE;

                case "generator-assignment":
                    this.generators[statement.name] = statement.value;
                    break;

                case "pattern-assignment":
                    this.patterns[statement.name] = statement.value;
                    break;

                case "transform-assignment":
                    this.transforms[statement.name] = statement.value;
                    break;

                case "type-assignment":
                    this.types[statement.name] = statement.value;
                    break;

                default:
                    this.addError(`unknown statement type: ${statement.type}`);
                    return FAILURE_VALUE;
            }
        }

        return result;
    }

    executeTransform(transform, structure, symbolTable = {}) {
        let currentObject = structure;

        if (transform.type === "transform-reference") {
            if (transform.name in this.transforms) {
                transform = this.transforms[transform.name];
            }
            else {
                this.addError(`undefined transform reference: '${transform.name}'`);
                return FAILURE_VALUE;
            }
        }

        if (transform.patterns !== null) {
            let result = FAILURE_VALUE;

            for (const pattern of transform.patterns) {
                symbolTable = Object.create(symbolTable);

                result = this.executePattern(pattern, currentObject, symbolTable);

                if (result !== FAILURE_VALUE) {
                    // pattern matched, so we can stop
                    if (transform.returnValue !== null) {
                        currentObject = this.executeGenerator(transform.returnValue.expression, symbolTable);
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
        else {
            // if currentObject is not an object, then it can't be used as a symbol table
            if (isObject(currentObject)) {
                symbolTable = Object.create(Object.assign(symbolTable, currentObject));
            }

            const value = this.executeGenerator(transform.returnValue.expression, symbolTable);

            if (value === FAILURE_VALUE) {
                this.addError("Unable to apply generator to current object");
                return FAILURE_VALUE;
            }

            currentObject = value;
        }

        return currentObject;
    }

    executeType(type, structure) {
        switch (type.definition) {
            case "any":
                return structure;

            case "array":
                return this.executeArrayType(type, structure);

            case "boolean":
                if (typeof structure === "boolean") {
                    if (type.value === null || type.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "enumeration":
                if (typeof structure === "string") {
                    if (type.value.includes(structure)) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "null":
                if (structure === null) {
                    return structure;
                }

                return FAILURE_VALUE;

            case "number":
                if (typeof structure === "number") {
                    if (type.value === null || type.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "object":
                return this.executeObjectType(type, structure);

            case "string":
                if (typeof structure === "string") {
                    if (type.value === null || type.value === structure) {
                        return structure;
                    }
                }

                return FAILURE_VALUE;

            case "undefined":
                if (structure === undefined) {
                    return structure;
                }

                return FAILURE_VALUE;

            default:
                this.addError(`Unrecognized type definition value: '${type.definition}'`);
                return FAILURE_VALUE;
        }
    }

    /*
     * Execute an array type definition
     *
     * @param {object} type
     * @param {*} structure
     * @returns {*}
     */
    executeArrayType(type, structure) {
        if (type.value === null) {
            if (Array.isArray(structure)) {
                return structure;
            }

            return FAILURE_VALUE;
        }

        const result = [];
        const symbolTable = {};

        for (const element of type.value) {
            switch (element.type) {
                case "transform": {
                    const elementValue = this.executeTransform(element, structure, symbolTable);

                    if (elementValue === FAILURE_VALUE) {
                        return FAILURE_VALUE;
                    }

                    result.push(elementValue);
                    break;
                }

                case "assignment":
                    if (this.executeAssignment(element, structure, symbolTable) === FAILURE_VALUE) {
                        return FAILURE_VALUE;
                    }
                    break;

                default:
                    this.addError(`Unknown element of array type: '${element.type}'`);
                    return FAILURE_VALUE;
            }
        }

        return result;
    }

    /*
     * Execute an object type definition
     *
     * @param {object} type
     * @param {*} structure
     * @returns {*}
     */
    executeObjectType(type, structure) {
        if (type.value === null) {
            if (isObject(structure)) {
                return structure;
            }

            return FAILURE_VALUE;
        }

        const result = {};
        const symbolTable = {};

        for (const property of type.value) {
            switch (property.type) {
                case "type-property": {
                    let propertyValue = FAILURE_VALUE;

                    if (property.value === null) {
                        if (isObject(structure) && property.name in structure) {
                            propertyValue = structure[property.name];
                        }
                    }
                    else {
                        propertyValue = this.executeTransform(property.value, structure, symbolTable);
                    }

                    if (propertyValue === FAILURE_VALUE) {
                        return FAILURE_VALUE;
                    }

                    result[property.name] = propertyValue;
                    break;
                }

                case "assignment":
                    if (this.executeAssignment(property, structure, symbolTable) === FAILURE_VALUE) {
                        return FAILURE_VALUE;
                    }
                    break;

                default:
                    this.addError(`Unknown element of object type: '${property.type}'`);
                    return FAILURE_VALUE;
            }
        }

        return result;
    }

    /*
     * execute an assignment
     *
     * @param {object} assignment
     * @param {*} structure
     * @param {object} symbolTable
     * @returns {*}
     */
    executeAssignment(assignment, structure, symbolTable) {
        const value = this.executeTransform(assignment.value, structure, symbolTable);

        if (value === FAILURE_VALUE) {
            return FAILURE_VALUE;
        }

        symbolTable[assignment.name] = value;

        return value;
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
    executePattern(pattern, structure, symbolTable) {
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
                            ? this.executePattern(elementPattern, structure[index + i], symbolTable)
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
                        const value = this.executePattern(propertyPattern, structure[name], symbolTable);

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
                    const result = this.executePattern(referencedPattern, structure, symbolTable);

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
    executeGenerator(expression, symbolTable) {
        switch (expression.type) {
            case "get-value":
                return symbolTable[expression.name];

            case "get-property": {
                const object = this.executeGenerator(expression.left, symbolTable);

                return (isObject(object)) ? object[expression.right] : FAILURE_VALUE;
            }

            case "invoke": {
                const args = expression.args.map(arg => symbolTable[arg]);

                return this.createType(expression.name, args);
            }

            case "array":
                return expression.value.map(
                    elementExpression => this.executeGenerator(elementExpression.expression, symbolTable)
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
                    result[propertyExpression.name] = this.executeGenerator(propertyExpression.expression, symbolTable);
                }

                return result;
            }

            default:
                this.addError(`Unrecognized generator expression type: '${expression.type}'`);
                return FAILURE_VALUE;
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

        return FAILURE_VALUE;
    }
}
