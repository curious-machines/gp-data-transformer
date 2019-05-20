import assert from "assert";
import util from "util";
import Normalizer from "../lib/Normalizer.js";

const FAILURE_VALUE = undefined;

function prettify(obj) {
    const options = {depth: Infinity};

    return util.inspect(obj, options);
}

function assertNormalizations(expression, source, tests, debug = false) {
    const normalizer = new Normalizer();

    normalizer.addDefinitionsFromSource(source);
    normalizer.typeCreators.Point = Point;

    if (debug) {
        console.log(prettify(normalizer.types));
    }

    for (const test of tests) {
        const {structure, expected} = test;
        let expectedText = prettify(expected);

        if (expectedText[0] === "{" && expectedText.length > 32) {
            expectedText = "{ ... }";
        }

        it(`input: ${prettify(structure)}, expected: ${expectedText}`, () => {
            const result = normalizer.run(expression, structure);

            if (debug) {
                console.log(prettify(normalizer.messages));
                for (const message of normalizer.messages) {
                    console.log(`${message.type}: ${message.message}`);
                }
            }

            assert.deepStrictEqual(result, expected);
        });
    }
}

function Point(x, y) {
    return {x, y};
}

describe("Normalizer", () => {
    describe("Type Definitions", () => {
        describe("Any Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = any`;
            const tests = [
                {structure: true, expected: true},
                {structure: false, expected: false},
                {structure: 10, expected: 10},
                {structure: "", expected: ""},
                {structure: null, expected: null},
                {structure: undefined, expected: undefined},
                {structure: [1, 2, 3], expected: [1, 2, 3]},
                {structure: {a: 1, b: 2, c: 3}, expected: {a: 1, b: 2, c: 3}}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Array Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = array`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: []},
                {structure: [1, 2, 3], expected: [1, 2, 3]},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Boolean Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = boolean`;
            const tests = [
                {structure: true, expected: true},
                {structure: false, expected: false},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Boolean 'true' Value", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = true`;
            const tests = [
                {structure: true, expected: true},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Boolean 'false' Value", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = false`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: false},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Enumeration Values", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = enumeration { one two "and three" }`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: "one", expected: "one"},
                {structure: "two", expected: "two"},
                {structure: "and three", expected: "and three"},
                {structure: "four", expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Null Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = null`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: 11, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE},
                {structure: null, expected: null},
                {structure: undefined, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Number Values", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = 10`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: 10},
                {structure: 11, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Number Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = number`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: 10},
                {structure: 11, expected: 11},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Object Property Existence", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = { cx, cy }`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE},
                {structure: {cx: 10, cy: 20}, expected: {cx: 10, cy: 20}},
                {structure: {cx: 10}, expected: FAILURE_VALUE},
                {structure: {cy: 10}, expected: FAILURE_VALUE},
                {structure: {cx: 10, cy: 10, radius: 5}, expected: {cx: 10, cy: 10}}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Object Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = object`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: []},
                {structure: {}, expected: {}},
                {structure: {cx: 10, cy: 20}, expected: {cx: 10, cy: 20}}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("String Values", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = "TEST"`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: "TEST", expected: "TEST"},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("String Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = string`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: "", expected: ""},
                {structure: "TEST", expected: "TEST"},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: FAILURE_VALUE},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
        describe("Undefined Type", () => {
            const typeName = "MyType";
            const expression = `type ${typeName}`;
            const source = `type ${typeName} = undefined`;
            const tests = [
                {structure: true, expected: FAILURE_VALUE},
                {structure: false, expected: FAILURE_VALUE},
                {structure: 10, expected: FAILURE_VALUE},
                {structure: 11, expected: FAILURE_VALUE},
                {structure: "", expected: FAILURE_VALUE},
                {structure: null, expected: FAILURE_VALUE},
                {structure: undefined, expected: undefined},
                {structure: [], expected: FAILURE_VALUE},
                {structure: {}, expected: FAILURE_VALUE}
            ];

            assertNormalizations(expression, source, tests);
        });
    });

    // describe("Object Property Type", () => {
    //     const typeName = "MyType";
    //     const expression = `type ${typeName}`;
    //     const source = `type ${typeName} = { cx: number, cy: number }`;
    //     const tests = [
    //         {structure: {cx: 10, cy: 20}, expected: {cx: 10, cy: 20}},
    //         {structure: {cx: 10, cy: "20"}, expected: FAILURE_VALUE},
    //         {structure: {cx: "10", cy: 20}, expected: FAILURE_VALUE},
    //         {structure: {cx: "10", cy: "20"}, expected: FAILURE_VALUE}
    //     ];
    //
    //     assertNormalizations(expression, source, tests);
    // });
    // describe("Type Patterns", () => {
    //     describe("Array Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: array }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: {points: []}},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Boolean Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: boolean }`;
    //         const tests = [
    //             {structure: {points: true}, expected: {points: true}},
    //             {structure: {points: false}, expected: {points: false}},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Boolean 'true' Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: true }`;
    //         const tests = [
    //             {structure: {points: true}, expected: {points: true}},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Boolean 'false' Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: false }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: {points: false}},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Null Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: null }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: {points: null}},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Number Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: number }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: {points: 10}},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Number Value Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: 10 }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: {points: 10}},
    //             {structure: {points: 11}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Object Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: object }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: {points: []}},
    //             {structure: {points: {}}, expected: {points: {}}}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("String Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: string }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: {points: ""}},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             {structure: {points: undefined}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Undefined Type Pattern", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: undefined }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: null}, expected: FAILURE_VALUE},
    //             // The following test fill fail until we fix the FAILURE_VALUE sigil
    //             // {structure: {points: undefined}, expected: {points: undefined}},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    // });
    // describe("Array Patterns", () => {
    //     describe("No Elements", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: [ ] }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: {points: []}},
    //             {structure: {points: [true]}, expected: FAILURE_VALUE},
    //             {structure: {points: [10]}, expected: FAILURE_VALUE},
    //             {structure: {points: [10, 20]}, expected: FAILURE_VALUE},
    //             {structure: {points: [""]}, expected: FAILURE_VALUE},
    //             {structure: {points: [[]]}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Single Element", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: [ number ] }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: [true]}, expected: FAILURE_VALUE},
    //             {structure: {points: [10]}, expected: {points: [10]}},
    //             {structure: {points: [10, 20]}, expected: FAILURE_VALUE},
    //             {structure: {points: [""]}, expected: FAILURE_VALUE},
    //             {structure: {points: [[]]}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Repeated Element", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: [ number;1..3 ] }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: [true]}, expected: FAILURE_VALUE},
    //             {structure: {points: [10]}, expected: {points: [10]}},
    //             {structure: {points: [10, 20]}, expected: {points: [10, 20]}},
    //             {structure: {points: [10, 20, 30]}, expected: {points: [10, 20, 30]}},
    //             {structure: {points: [10, 20, 30, 40]}, expected: FAILURE_VALUE},
    //             {structure: {points: [""]}, expected: FAILURE_VALUE},
    //             {structure: {points: [[]]}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    // });
    // describe("Object Patterns", () => {
    //     describe("Single Property", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { points: { a: boolean } }`;
    //         const tests = [
    //             {structure: {points: true}, expected: FAILURE_VALUE},
    //             {structure: {points: false}, expected: FAILURE_VALUE},
    //             {structure: {points: 10}, expected: FAILURE_VALUE},
    //             {structure: {points: ""}, expected: FAILURE_VALUE},
    //             {structure: {points: []}, expected: FAILURE_VALUE},
    //             {structure: {points: {a: true}}, expected: {points: {a: true}}},
    //             {structure: {points: {a: false}}, expected: {points: {a: false}}},
    //             {structure: {points: {a: 10}}, expected: FAILURE_VALUE},
    //             {structure: {points: {a: ""}}, expected: FAILURE_VALUE},
    //             {structure: {points: {a: []}}, expected: FAILURE_VALUE},
    //             {structure: {points: {a: {}}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    // });
    // describe("Result Expressions", () => {
    //     describe("Get String Value Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { name <= s { nom: string as s } }`;
    //         const tests = [
    //             {structure: {nom: true}, expected: FAILURE_VALUE},
    //             {structure: {nom: false}, expected: FAILURE_VALUE},
    //             {structure: {nom: 10}, expected: FAILURE_VALUE},
    //             {structure: {nom: "Jon"}, expected: {name: "Jon"}},
    //             {structure: {nom: []}, expected: FAILURE_VALUE},
    //             {structure: {nom: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Get Any Value Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { name <= s { nom: any as s } }`;
    //         const tests = [
    //             {structure: {nom: true}, expected: {name: true}},
    //             {structure: {nom: 10}, expected: {name: 10}},
    //             {structure: {nom: "Jon"}, expected: {name: "Jon"}},
    //             {structure: {nom: []}, expected: {name: []}},
    //             {structure: {nom: {}}, expected: {name: {}}}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Invocation Expression", () => {
    //         const typeName = "MyType";
    //         const source = `
    //             type ${typeName} = {
    //                 center <= Point(x,y) {
    //                     group {
    //                         cx: number as x
    //                         cy: number as y
    //                     }
    //                 }
    //             }`;
    //         const tests = [
    //             {structure: {cx: true, cy: true}, expected: FAILURE_VALUE},
    //             {structure: {cx: false, cy: false}, expected: FAILURE_VALUE},
    //             {structure: {cx: 10, cy: 20}, expected: {center: {x: 10, y: 20}}},
    //             {structure: {cx: "One", cy: "Two"}, FAILURE_VALUE},
    //             {structure: {cx: [], cy: []}, expected: FAILURE_VALUE},
    //             {structure: {cx: {}, cy: {}}, expected: FAILURE_VALUE}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Array Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { data <= [ true, null, undefined, 10, "", [], {} ] }`;
    //         const expected = {data: [ true, null, undefined, 10, "", [], {} ]};
    //         const tests = [
    //             {structure: true, expected},
    //             {structure: false, expected},
    //             {structure: null, expected},
    //             {structure: undefined, expected},
    //             {structure: 10, expected},
    //             {structure: "", expected},
    //             {structure: [], expected},
    //             {structure: {}, expected}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Boolean Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { text <= true }`;
    //         const expected = {text: true};
    //         const tests = [
    //             {structure: true, expected},
    //             {structure: false, expected},
    //             {structure: null, expected},
    //             {structure: undefined, expected},
    //             {structure: 10, expected},
    //             {structure: "", expected},
    //             {structure: [], expected},
    //             {structure: {}, expected}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Null Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { value <= null }`;
    //         const expected = {value: null};
    //         const tests = [
    //             {structure: true, expected},
    //             {structure: false, expected},
    //             {structure: null, expected},
    //             {structure: undefined, expected},
    //             {structure: 10, expected},
    //             {structure: "", expected},
    //             {structure: [], expected},
    //             {structure: {}, expected}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Number Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { value <= 15 }`;
    //         const expected = {value: 15};
    //         const tests = [
    //             {structure: true, expected},
    //             {structure: false, expected},
    //             {structure: null, expected},
    //             {structure: undefined, expected},
    //             {structure: 10, expected},
    //             {structure: "", expected},
    //             {structure: [], expected},
    //             {structure: {}, expected}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("Object Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { data <= { a: true, b: null, c: undefined, d: 10, e: "", f: [], g: {} } }`;
    //         const expected = { data: { a: true, b: null, c: undefined, d: 10, e: "", f: [], g: {} } };
    //         const tests = [
    //             {structure: true, expected},
    //             {structure: false, expected},
    //             {structure: null, expected},
    //             {structure: undefined, expected},
    //             {structure: 10, expected},
    //             {structure: "", expected},
    //             {structure: [], expected},
    //             {structure: {}, expected}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    //     describe("String Expression", () => {
    //         const typeName = "MyType";
    //         const source = `type ${typeName} = { text <= "hello" }`;
    //         const expected = {text: "hello"};
    //         const tests = [
    //             {structure: true, expected},
    //             {structure: false, expected},
    //             {structure: null, expected},
    //             {structure: undefined, expected},
    //             {structure: 10, expected},
    //             {structure: "", expected},
    //             {structure: [], expected},
    //             {structure: {}, expected}
    //         ];
    //
    //         assertNormalizations(typeName, source, tests);
    //     });
    // });
});
