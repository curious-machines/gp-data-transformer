/**
 *  ValidatorLexer.js
 *
 *  @copyright 2019 Kevin Lindsey
 *  @module ValidatorLexer
 */

import ValidatorLexeme from "./ValidatorLexeme.js";

const OPERATOR_MAP = {
    "{": ValidatorLexeme.LCURLY,
    "}": ValidatorLexeme.RCURLY,
    "[": ValidatorLexeme.LBRACKET,
    "]": ValidatorLexeme.RBRACKET,
    ",": ValidatorLexeme.COMMA,
    ":": ValidatorLexeme.COLON,
    ";": ValidatorLexeme.SEMICOLON
};

/**
 * ValidatorLexer
 */
export default class ValidatorLexer {
    /**
     * Create a new Validator lexer
     *
     * @param {string} source=""
     */
    constructor(source = "") {
        this.source = source;
    }

    set source(source) {
        this._source = source;
        this._offset = 0;
        this._line = 0;
        this._column = 0;
    }

    getNextLexeme() {
        let result = null;
        let buffer = this._source;

        const updatePositions = () => {
            this._column += RegExp.$1.length;
            this._offset += RegExp.$1.length;
            buffer = buffer.substr(RegExp.$1.length);
        };

        const setLexeme = type => {
            result = new ValidatorLexeme(type, RegExp.$1, this._offset, this._line, this._column);
            updatePositions();
        }

        while (result === null) {
            if (buffer === null || buffer === "") {
                result = new ValidatorLexeme(ValidatorLexeme.EOD, "");
            }
            else if (buffer.match(/^([ \t]+)/)) {
                // skip whitespace
                updatePositions();
            }
            else if (buffer.match(/^(\r\n?|\n)/)) {
                // skip whitespace, but track line endings
                this._offset += RegExp.$1.length;
                this._column = 0;
                this._line += 1;
                buffer = buffer.substr(RegExp.$1.length);
            }
            else if (buffer.match(/^(type)\b/)) {
                setLexeme(ValidatorLexeme.TYPE);
            }
            else if (buffer.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\b/)) {
                setLexeme(ValidatorLexeme.IDENTIFIER);
            }
            else if (buffer.match(/^(0|[1-9]\d*)/)) {
                setLexeme(ValidatorLexeme.NUMBER);
            }
            else if (buffer.match(/^([{}[\],;:])/)) {
                setLexeme(OPERATOR_MAP[RegExp.$1]);
            }
            else {
                const text = buffer.substring(0, 10);

                throw new TypeError(`Error at offset=${this._offset}, line=${this._line}, column=${this._column + 1}: '${text} ...'`);
            }
        }

        this._source = buffer;

        return result;
    }
}
