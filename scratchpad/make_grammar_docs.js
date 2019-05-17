#!/usr/bin/env node -r esm

import grammar from "../lib/GrammarTable";

function printGrammar() {
    for (const rule in grammar.bnf) {
        const alternations = grammar.bnf[rule];
        let first = true;

        console.log(rule);

        for (const alternate of alternations) {
            const production = Array.isArray(alternate)
                ? alternate[0]
                : alternate;

            if (first) {
                console.log(`  : ${production}`);
                first = false;
            }
            else {
                console.log(`  | ${production}`);
            }
        }

        console.log("  ;");
        console.log();
    }
}

console.log("```bnf");
printGrammar();
console.log("```");
