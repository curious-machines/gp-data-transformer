import assert from "assert";
import Validator from "../lib/Validator.js";


describe("Validator", () => {
    it("tests", () => {
        const validator = new Validator();

        assert.strictEqual(validator, validator);
    });
});
