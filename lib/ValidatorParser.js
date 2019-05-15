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
                case ValidatorLexeme.IDENTIFIER:
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
            `  ${this.lexeme}`,
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

    isNotType(type) {
        return this.lexeme.type !== ValidatorLexeme.EOD && this.lexeme.type !== type;
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

    // TypeDescription
    //     :   IDENTIFIER EQUAL ObjectDescription
    //     ;
    parseTypeDeclaration() {
        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        // process '='
        this.assertAndAdvance(ValidatorLexeme.EQUAL);

        const objectDescription = this.parseObjectDescription();

        return {
            name,
            objectDescription
        };
    }

    // ObjectDescription
    //     :   LCURLY RCURLY
    //     |   LCURLY PropertyList RCURLY
    //     ;
    // PropertyList
    //     :   Property
    //     |   PropertyList Property
    //     ;
    parseObjectDescription() {
        // advance over '{'
        this.assertAndAdvance(ValidatorLexeme.LCURLY);

        // parse property groups
        const properties = [];

        while (this.isNotType(ValidatorLexeme.RCURLY)) {
            // parse property
            const property = this.parseProperty();

            properties.push(property);
        }

        // advance over '}'
        this.assertAndAdvance(ValidatorLexeme.RCURLY);

        return properties;
    }

    // Property
    //     :   IDENTIFIER COLON Constructor
    //     :   IDENTIFIER COLON Constructor LCURLY TransformGroups RCURLY
    //     ;
    // TransformAlternations
    //     :   TransformGroup
    //     |   TransformAlternations TransformGroup
    //     ;
    parseProperty() {
        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        // process ':'
        this.assertAndAdvance(ValidatorLexeme.COLON);

        // parse instantiation
        const instantiation = this.parseInstantiation();

        // parse optional transform groups
        const transformGroups = [];

        if (this.isType(ValidatorLexeme.LCURLY)) {
            // process '{'
            this.advance();

            while (this.isNotType(ValidatorLexeme.RCURLY)) {
                transformGroups.push(this.parseTransformGroup());
            }

            // process '}'
            this.assertAndAdvance(ValidatorLexeme.RCURLY);
        }

        return {
            name,
            instantiation,
            transformGroups
        };
    }

    // Instantiation
    //     :   IDENTIFIER
    //     |   IDENTIFIER LPAREN RPAREN
    //     |   IDENTIFIER LPAREN ParameterList RPAREN
    //     ;
    // ParameterList
    //     :   IDENTIFIER
    //     |   ParameterList COMMA IDENTIFIER
    //     ;
    parseInstantiation() {
        const args = [];

        const processParameter = () => {
            if (this.isType(ValidatorLexeme.IDENTIFIER)) {
                args.push(this.lexeme.text);
                this.advance();
            }
        };

        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        if (this.isType(ValidatorLexeme.LPAREN)) {
            // process '('
            this.advance();

            // process args
            processParameter();

            while (this.isType(ValidatorLexeme.COMMA)) {
                // process ','
                this.advance();

                processParameter();
            }

            // process ')'
            this.assertAndAdvance(ValidatorLexeme.RPAREN);

            return {
                name,
                mode: "instantation",
                args
            };
        }

        return {
            name,
            mode: "type-reference"
        };
    }

    // TransformGroup
    //     :   TypeMatch
    //     |   Group
    //     ;
    // TypeMatch
    //     :   TYPE_MATCH IDENTIFIER LCURLY Matches RCURLY
    //     ;
    // Group
    //     :   GROUP LCURLY Matches RCURLY
    //     ;
    parseTransformGroup() {
        const groups = [];

        switch (this.lexeme.type) {
            case ValidatorLexeme.TYPE_MATCH:
                groups.push(this.parseTypeMatch());
                break;
            case ValidatorLexeme.GROUP:
                // process group
                this.advance(ValidatorLexeme.GROUP);

                // process '{'
                this.assertAndAdvance(ValidatorLexeme.LCURLY);

                while (this.isNotType(ValidatorLexeme.RCURLY)) {
                    groups.push(this.parseTypeMatch());
                }

                // process '}'
                this.assertAndAdvance(ValidatorLexeme.RCURLY);
                break;
            default:
                this.error("Expected 'type-match' or 'group' keyword");
        }

        return groups;
    }

    // TypeMatch
    //     :   TYPE_MATCH IDENTIFIER LCURLY Matches RCURLY
    //     ;
    parseTypeMatch() {
        // process TYPE_MATCH
        this.assertAndAdvance(ValidatorLexeme.TYPE_MATCH);

        // get name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        // process '{'
        this.assertAndAdvance(ValidatorLexeme.LCURLY);

        const matches = [];

        while (this.isNotType(ValidatorLexeme.RCURLY)) {
            matches.push(this.parseMatch());
        }

        // process '}'
        this.assertAndAdvance(ValidatorLexeme.RCURLY);

        return {
            name,
            matches
        };
    }

    // Match
    //     :   IDENTIFIER
    //     |   IDENTIFIER COLON IDENTIFIER
    //     |   ArrayMatch
    //     |   ObjectMatch
    //     ;
    parseMatch() {
        switch (this.lexeme.type) {
            case ValidatorLexeme.IDENTIFIER: {
                // process type (or assignment)
                let type = this.lexeme.text;
                this.advance();

                if (this.isType(ValidatorLexeme.COLON)) {
                    // process ':'
                    this.advance();

                    const assignment = type;
                    this.assertType(ValidatorLexeme.IDENTIFIER);
                    type = this.lexeme.text;
                    this.advance();

                    return {
                        assignment,
                        type
                    }
                }

                return {
                    type
                };
            }
            case ValidatorLexeme.LCURLY:
                return this.parseObjectMatch();
            case ValidatorLexeme.LBRACKET:
                return this.parseArrayMatch();
            default:
                this.error("Unrecognized match expression");
        }
    }

    // ObjectMatch
    //     :   LCURLY RCURLY
    //     |   LCURLY Types RBRACKET
    //     ;
    parseObjectMatch() {
        // process '{'
        this.assertAndAdvance(ValidatorLexeme.LCURLY);

        const types = [];

        while (this.isNotType(ValidatorLexeme.RCURLY)) {
            types.push(this.parseKeyValue());
        }

        // process '}'
        this.assertAndAdvance(ValidatorLexeme.RCURLY);

        return {
            type: "object-match",
            types
        };
    }

    // KeyValue
    //     :   IDENTIFIER COLON IDENTIFIER
    //     |   IDENTIFIER COLON IDENTIFIER FROM IDENTIFIER
    parseKeyValue() {
        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        // process ':'
        this.assertAndAdvance(ValidatorLexeme.COLON);

        // process type
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const type = this.lexeme.text;
        this.advance();

        // process optional reference
        let reference = name;

        if (this.isType(ValidatorLexeme.FROM)) {
            this.advance();

            // process name
            this.assertType(ValidatorLexeme.IDENTIFIER);
            reference = this.lexeme.text;
            this.advance();
        }

        return {
            name,
            type,
            reference
        }
    }

    // ArrayMatch
    //     :   LBRACKET RBRACKET
    //     |   LBRACKET Types RBRACKET
    //     ;
    parseArrayMatch() {
        // process '['
        this.assertAndAdvance(ValidatorLexeme.LBRACKET);

        const types = [];

        while (this.isNotType(ValidatorLexeme.RBRACKET)) {
            types.push(this.parseType());

            while (this.isType(ValidatorLexeme.COMMA)) {
                // process ','
                this.advance();

                types.push(this.parseType());
            }
        }

        // process ']'
        this.assertAndAdvance(ValidatorLexeme.RBRACKET);

        return {
            type: "array-match",
            types
        };
    }

    // Type
    //     :   IDENTIFIER
    //     |   IDENTIFIER COLON IDENTIFIER
    //     ;
    parseType() {
        // process name
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const name = this.lexeme.text;
        this.advance();

        // process ':'
        this.assertAndAdvance(ValidatorLexeme.COLON);

        // process type
        this.assertType(ValidatorLexeme.IDENTIFIER);
        const type = this.lexeme.text;
        this.advance();

        return {
            name,
            type
        };
    }
}
