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
     */
    constructor(type, text) {
        this.type = type;
        this.text = text;
    }

    /**
     *  @param {number} type
     *  @returns {boolean}
     */
    typeis(type) {
        return this.type === type;
    }
}

/*
 *  token type enumerations
 */
ValidatorLexeme.EOD = -1;
ValidatorLexeme.UNDEFINED = 0;
ValidatorLexeme.TYPE = 1;
ValidatorLexeme.IDENTIFIER = 2;
ValidatorLexeme.STRING = 3;
ValidatorLexeme.NUMBER = 4;
ValidatorLexeme.LCURLY = 5;
ValidatorLexeme.RCURLY = 6;
ValidatorLexeme.LBRACKET = 7;
ValidatorLexeme.RBRACKET = 8;
ValidatorLexeme.COMMA = 9;
ValidatorLexeme.COLON = 10;
ValidatorLexeme.SEMICOLON = 11;
