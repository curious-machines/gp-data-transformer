#!/usr/bin/env node -r esm

import {default as Transformer, FAILURE_VALUE} from "../lib/Transformer";

function evaluate(source, structure) {
    const transformer = new Transformer();
    const result = transformer.execute(source, structure);

    // for (const message in transformer.messages) {
    //     console.log(`${message.type}: ${message.message}`);
    // }

    return result;
}

const tests = [
    { script: '_ <= [ number as n3 ]', data: [10] },
    { script: '_ <= [ number ; 2 as n3 ]', data: [10, 20] },
    { script: '_ <= [ (number; 2, number; 2) as n3 ]', data: [10, 20, 30, 40] },
    { script: '_ <= [ (number; 2, number; 2) ; 2 as n3 ]', data: [10, 20, 30, 40, 50, 60, 70, 80] },
    { script: '_ <= [ (number as n1, number as n2) ]', data: [10, 20] },
    { script: '_ <= [ (number as n1, number as n2) ; 2 ]', data: [10, 20, 30, 40] },
    { script: '_ <= [ (number as n1, number as n2) as n3 ]', data: [10, 20] },
    { script: '_ <= [ (number as n1, number as n2) ; 2 as n3 ]', data: [10, 20, 30, 40] },
    { script: '_ <= [ (number; 2 as n1, number; 2 as n2) ]', data: [10, 20, 30, 40] },
    { script: '_ <= [ (number; 2 as n1, number; 2 as n2) ; 2 ]', data: [10, 20, 30, 40, 50, 60, 70, 80] },
    { script: '_ <= [ (number; 2 as n1, number; 2 as n2) as n3 ]', data: [10, 20, 30, 40] },
    { script: '_ <= [ (number; 2 as n1, number; 2 as n2) ; 2 as n3 ]', data: [10, 20, 30, 40, 50, 60, 70, 80] }
];

for (const test of tests) {
    const result = evaluate(test.script, test.data);

    console.log(test.script);
    console.log(result);
    console.log();
}

// const inside = [
//     {text: "number", factor: 1},
//     {text: "(number; 2, number; 2)", factor: 4},
//     {text: "(number as n1, number as n2)", factor: 2},
//     {text: "(number; 2 as n1, number; 2 as n2)", factor: 4}
// ];
// const outside = [
//     {text: "", factor: 1},
//     {text: "; 2", factor: 2},
//     {text: "as n3", factor: 1},
//     {text: "; 2 as n3", factor: 2}
// ];
//
// for (let i = 0; i < inside.length; i++) {
//     const inner = inside[i];
//
//     for (let j = 0; j < outside.length; j++) {
//         const outer = outside[j];
//
//         const result = [inner.text, outer.text].join(" ").trim();
//         const count = inner.factor * outer.factor;
//         const numbers = [];
//
//         for (let k = 0; k < count; k++) {
//             numbers.push(String(k * 10 + 10));
//         }
//
//         if (/n[1-3]/.exec(result)) {
//             console.log(`{ script: '_ <= [ ${result} ]', data: [${numbers.join(", ")}] },`);
//         }
//     }
// }
