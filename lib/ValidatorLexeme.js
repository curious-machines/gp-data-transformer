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

    toString() {
        return `type=${ValidatorLexeme.typeToString(this.type)}, text=${this.text}, offset=${this.offset}, line=${this.line + 1}, column=${this.column + 1}`;
    }
}

/*
 *  token type enumerations
 */
const TYPES = [
    "EOD",
    "UNDEFINED",
    "FROM",
    "GROUP",
    "TYPE_MATCH",
    "IDENTIFIER",
    "STRING",
    "NUMBER",
    "LPAREN",
    "RPAREN",
    "LCURLY",
    "RCURLY",
    "LBRACKET",
    "RBRACKET",
    "COMMA",
    "COLON",
    "SEMICOLON",
    "EQUAL"
];
const NAMES = {};

TYPES.forEach((typeName, value) => {
    ValidatorLexeme[typeName] = value - 1;
    NAMES[value - 1] = typeName;
});
