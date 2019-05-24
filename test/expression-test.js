import assert from "assert";
import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";

function zero() {
    return 0;
}

function evaluate(source, structure) {
    const transformer = new Transformer();

    transformer.addFunction("zero", zero);

    return transformer.execute(source, structure);
}

describe("Expressions", () => {
    describe("Primary Expression", () => {
        describe("Primitives", () => {
            const tests = [true, false, null, 0, 0.5, "test"];

            tests.forEach(expected => {
                const source = JSON.stringify(expected);

                it(source, () => {
                    const result = evaluate(source);

                    assert.deepStrictEqual(result, expected);
                });
            });

            it("undefined", () => {
                const result = evaluate('undefined');

                assert(result === undefined);
            });

            it("identifier", () => {
                const result = evaluate('a <= _', { a: "test" });
                const expected = "test";

                assert.deepStrictEqual(result, expected);
            });
        });
        describe("Arrays", () => {
            it("Empty Array", () => {
                const source = '[]';
                const expected = [];
                const result = evaluate(source);

                assert.deepStrictEqual(result, expected);
            });
            it("One Element", () => {
                const source = '[10]';
                const expected = [10];
                const result = evaluate(source);

                assert.deepStrictEqual(result, expected);
            });
        });
        describe("Objects", () => {
            it("Empty Object", () => {
                const source = '{}';
                const expected = {};
                const result = evaluate(source);

                assert.deepStrictEqual(result, expected);
            });
            it("One Property", () => {
                const source = '{a: 10}';
                const expected = {a: 10};
                const result = evaluate(source);

                assert.deepStrictEqual(result, expected);
            });
        });
    });
    describe("Member Expression", () => {
        it("get property", () => {
            const result = evaluate('a.b <= _', { a: { b: 10000 } });
            const expected = 10000;

            assert.deepStrictEqual(result, expected);
        });
        it("get properties", () => {
            const result = evaluate('a.b.c <= _', { a: { b: { c: 10000 } } });
            const expected = 10000;

            assert.deepStrictEqual(result, expected);
        });
        it("get index", () => {
            const result = evaluate('a.0 <= _', { a: [ 10000 ] });
            const expected = 10000;

            assert.deepStrictEqual(result, expected);
        });
        it("get property, get index", () => {
            const result = evaluate('a.b.0 <= _', { a: { b: [ 10000 ] } });
            const expected = 10000;

            assert.deepStrictEqual(result, expected);
        });
        it("get index, get property", () => {
            const result = evaluate('a.0.b <= _', { a: [{ b: 10000 }] });
            const expected = 10000;

            assert.deepStrictEqual(result, expected);
        });
        it("invoke without arguments", () => {
            const result = evaluate('zero()');
            const expected = 0;

            assert.deepStrictEqual(result, expected);
        });
        it("invoke with arguments", () => {
            const result = evaluate('keys({a: 10, b: "twenty"})');
            const expected = ["a", "b"];

            assert.deepStrictEqual(result, expected);
        });
    });
});
