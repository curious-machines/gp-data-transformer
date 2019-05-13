/**
 *  ValidatorLexeme.js
 *
 *  @copyright 2005,2013 Kevin Lindsey
 *  @module ValidatorLexeme
 */

/**
 *  ValidatorLexeme
 */
export default class ValidatorLexeme {
    /**
     *  @param {number} type
     *  @param {string} text
     *  @param {number} offset
     *  @param {number} line
     *  @param {number} column
     */
    constructor(type, text, offset, line, column) {
        this.type = type;
        this.text = text;
        this.offset = offset;
        this.line = line;
        this.column = column;
    }

    static typeToString(type) {
        return NAMES[type];
    }

    /**
     *  @param {number} type
     *  @returns {boolean}
     */
    isType(type) {
        return this.type === type;
    }
}

/*
 *  token type enumerations
 */
const TYPES = {
    EOD: -1,
    UNDEFINED: 0,
    TYPE: 1,
    IDENTIFIER: 2,
    STRING: 3,
    NUMBER: 4,
    LCURLY: 5,
    RCURLY: 6,
    LBRACKET: 7,
    RBRACKET: 8,
    COMMA: 9,
    COLON: 10,
    SEMICOLON: 11
};
const NAMES = {};

/* eslint-disable-next-line guard-for-in */
for (const typeName in TYPES) {
    const value = TYPES[typeName];

    ValidatorLexeme[typeName] = value;
    NAMES[value] = typeName;
}
