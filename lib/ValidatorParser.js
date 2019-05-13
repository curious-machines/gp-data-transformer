import ValidatorLexer from "./ValidatorLexer.js";
import ValidatorLexeme from "./ValidatorLexeme.js";

export default class ValidatorParser {
    constructor() {
        this.source = null;
        this.lexer = new ValidatorLexer();
        this.lexeme = null;
    }

    parse(source) {
        const result = [];

        this.source = source;
        this.lexer.source = source;

        // start look-ahead
        this.advance();

        // process until we're done
        while (this.lexeme.type !== ValidatorLexeme.EOD) {
            const startingLexeme = this.lexeme;

            switch (startingLexeme.type) {
                case ValidatorLexeme.TYPE:
                    result.push(this.parseTypeDeclaration());
                    break;
                default:
                    throw new TypeError(`Parser error at ${startingLexeme}`);
            }

            if (this.lexeme === startingLexeme) {
                throw new TypeError(`Parser stalled at ${startingLexeme}`);
            }
        }

        return result;
    }

    error(message) {
        const fullMessage = [
            `An error occurred at line ${this.lexeme.line + 1}, column ${this.lexeme.column + 1}`,
            `  ${message}`
        ].join("\n");

        throw new TypeError(fullMessage);
    }

    // lexeme methods

    advance() {
        if (this.lexeme === null || this.lexeme.type !== ValidatorLexeme.EOD) {
            this.lexeme = this.lexer.getNextLexeme();
        }

        return this.lexeme;
    }

    isType(type) {
        return this.lexeme !== null && this.lexeme.isType(type);
    }

    assertType(type) {
        if (this.isType(type) === false) {
            const expectedType = ValidatorLexeme.typeToString(type);
            const actualType = ValidatorLexeme.typeToString(this.lexeme.type);

            this.error(`Expected type ${expectedType}, but found ${actualType}`);
        }
    }

    assertAndAdvance(type) {
        this.assertType(type);
        this.advance();
    }

    // parsing methods

    parseTypeDeclaration() {
        // advance over 'type'
        this.assertAndAdvance(ValidatorLexeme.TYPE);

        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        // advance over '{'
        this.assertAndAdvance(ValidatorLexeme.LCURLY);

        // parse property groups
        const propertyGroups = [];

        while (this.isType(ValidatorLexeme.IDENTIFIER)) {
            propertyGroups.push(this.parsePropertyGroup());
        }

        // advance over '}'
        this.assertAndAdvance(ValidatorLexeme.RCURLY);

        return {
            typeName: name,
            properties: propertyGroups
        };
    }

    parsePropertyGroup() {
        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const groupName = this.lexeme.text;
        this.advance();

        // process '{'
        this.assertAndAdvance(ValidatorLexeme.LCURLY);

        // parse descriptions
        const descriptions = [];

        while (this.isType(ValidatorLexeme.IDENTIFIER)) {
            descriptions.push(this.parseDescription());
        }

        // process '}'
        this.assertAndAdvance(ValidatorLexeme.RCURLY);

        return {
            name: groupName,
            descriptions
        };
    }

    parseDescription() {
        const names = this.parseIdentifierList();

        // advance over ':'
        this.assertAndAdvance(ValidatorLexeme.COLON);

        const types = this.parseTypeList();

        return {
            names,
            types
        };
    }

    parseIdentifierList() {
        const names = [];

        const processName = () => {
            this.assertType(ValidatorLexeme.IDENTIFIER);
            names.push(this.lexeme.text);
            this.advance();
        };

        // process first name
        processName();

        while (this.isType(ValidatorLexeme.COMMA)) {
            // process ','
            this.advance();

            processName();
        }

        return names;
    }

    parseTypeList() {
        const types = [];

        const processType = () => {
            switch (this.lexeme.type) {
                case ValidatorLexeme.IDENTIFIER:
                    types.push({type: this.lexeme.text});
                    this.advance();
                    break;
                case ValidatorLexeme.LBRACKET:
                    types.push(this.parseArrayType());
                    break;
                default:
                    this.error("Unrecognized type");
            }
        };

        // process first type
        processType();

        while (this.isType(ValidatorLexeme.COMMA)) {
            // process ','
            this.advance();

            processType();
        }

        return types;
    }

    parseArrayType() {
        // process '['
        this.assertAndAdvance(ValidatorLexeme.LBRACKET);

        // process element type
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const elementType = this.lexeme.text;
        this.advance();

        // process optional length specifier
        let length = -1;

        if (this.isType(ValidatorLexeme.SEMICOLON)) {
            // advance over ';'
            this.advance();

            // process array length
            this.assertType(ValidatorLexeme.NUMBER);
            length = parseInt(this.lexeme.text);
            this.advance();
        }

        // process ']'
        this.assertAndAdvance(ValidatorLexeme.RBRACKET);

        return {
            type: "Array",
            elementType,
            length
        };
    }
}
