import assert from "assert";
import ValidatorLexer from "../lib/ValidatorLexer.js";
import ValidatorLexeme from "../lib/ValidatorLexeme.js";


describe("Validator Lexer", () => {
    describe("Lexemes", () => {
        it("Type Match", () => {
            const validator = new ValidatorLexer("type-match");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.TYPE_MATCH);
        });
        it("Identifier", () => {
            const validator = new ValidatorLexer("Ellipse");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.IDENTIFIER);
            assert.strictEqual(lexeme.text, "Ellipse");
        });
        it("Number", () => {
            const validator = new ValidatorLexer("10");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.NUMBER);
            assert.strictEqual(lexeme.text, "10");
        });
        it("Left Paren", () => {
            const validator = new ValidatorLexer("(");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.LPAREN);
            assert.strictEqual(lexeme.text, "(");
        });
        it("Right Paren", () => {
            const validator = new ValidatorLexer(")");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.RPAREN);
            assert.strictEqual(lexeme.text, ")");
        });
        it("Left Curly Brace", () => {
            const validator = new ValidatorLexer("{");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.LCURLY);
            assert.strictEqual(lexeme.text, "{");
        });
        it("Right Curly Brace", () => {
            const validator = new ValidatorLexer("}");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.RCURLY);
            assert.strictEqual(lexeme.text, "}");
        });
        it("Left Square Bracket", () => {
            const validator = new ValidatorLexer("[");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.LBRACKET);
            assert.strictEqual(lexeme.text, "[");
        });
        it("Right Square Bracket", () => {
            const validator = new ValidatorLexer("]");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.RBRACKET);
            assert.strictEqual(lexeme.text, "]");
        });
        it("Comma", () => {
            const validator = new ValidatorLexer(",");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.COMMA);
            assert.strictEqual(lexeme.text, ",");
        });
        it("Colon", () => {
            const validator = new ValidatorLexer(":");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.COLON);
            assert.strictEqual(lexeme.text, ":");
        });
        it("Semicolon", () => {
            const validator = new ValidatorLexer(";");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.SEMICOLON);
            assert.strictEqual(lexeme.text, ";");
        });
        it("Equal", () => {
            const validator = new ValidatorLexer("=");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.EQUAL);
            assert.strictEqual(lexeme.text, "=");
        });
    });
    it("Lex Sample", () => {
        const validator = new ValidatorLexer(`Ellipse = {
    center: Point2D(x, y) {
        type-match center {
            Point2D
            [x:number, y:number]
        }
        group {
            type-match centerX, cx {
                x:number
            }
            type-match centerY, cy {
                y:number
            }
        }
    }
    radii: Vector2D(rx, ry) {
        type-match radii {
            Vector2D
            [rx:number, ry:number]
        }
        group {
            type-match radiusX, rx {
                rx:number
            }
            type-match radiusY, ry {
                rx:number
            }
        }
    }
}`);

        let lexeme = validator.getNextLexeme();

        while (lexeme.type !== ValidatorLexeme.EOD) {
            console.log(lexeme);
            lexeme = validator.getNextLexeme();
        }
    });
});
