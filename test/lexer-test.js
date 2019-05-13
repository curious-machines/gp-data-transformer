import assert from "assert";
import ValidatorLexer from "../lib/ValidatorLexer.js";
import ValidatorLexeme from "../lib/ValidatorLexeme.js";


describe("Validator Lexer", () => {
    describe("Lexemes", () => {
        it("Type", () => {
            const validator = new ValidatorLexer("type");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.TYPE);
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
        it("SEMICOLON", () => {
            const validator = new ValidatorLexer(";");
            const lexeme = validator.getNextLexeme();

            assert.strictEqual(lexeme.type, ValidatorLexeme.SEMICOLON);
            assert.strictEqual(lexeme.text, ";");
        });
    });
    it("Lex Sample", () => {
        const validator = new ValidatorLexer(`type Ellipse {
    center {
        center: Point2D, [Number;2]
        centerX, centerY: Number
    }
    radii {
        radii: Vector2D, [Number;2]
        radiusX, rx: Number
        radiusY, ry: Number
    }
}`);

        let lexeme = validator.getNextLexeme();

        while (lexeme.type !== ValidatorLexeme.EOD) {
            console.log(lexeme);
            lexeme = validator.getNextLexeme();
        }
    });
});
