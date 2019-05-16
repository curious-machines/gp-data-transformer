/* eslint-disable array-bracket-spacing */
import fs from "fs";
import {Parser} from "jison";

const firstInList = "$$ = [ $1 ];";
const nextInList = "$1.push($2); $$ = $1";
const nextInList2 = "$1.push($3); $$ = $1";

const canonicalPropertyShortcut = `$$ = {
    type: "canonical-property",
    name: $1,
    groups: [
        {
            type: "group",
            matches: [ { type: "match", name: $1, patterns: [ $3 ] } ]
        }
    ],
    returnValue: null
};`;
const canonicalPropertyShortcut2 = `$$ = {
    type: "canonical-property",
    name: $1,
    groups: [
        {
            type: "group",
            matches: [ { type: "match", name: $3, patterns: [ $5 ] } ]
        }
    ],
    returnValue: null
};`;
const matchShortcut = "$$ = { type: \"match\", name: $1, patterns: [ $3 ] }";

const grammar = {
    lex: {
        rules: [
            ["\\s+", "/* skip whitespace */"],

            // keywords
            ["boolean", "return 'BOOLEAN_TYPE'"],
            ["false", "return 'FALSE'"],
            ["from", "return 'FROM'"],
            ["group", "return 'GROUP'"],
            ["match", "return 'MATCH'"],
            ["number", "return 'NUMBER_TYPE'"],
            ["string", "return 'STRING_TYPE'"],
            ["true", "return 'TRUE'"],
            ["type", "return 'TYPE'"],

            // operators
            ["\\(", "return '('"],
            ["\\)", "return ')'"],
            ["{", "return '{'"],
            ["}", "return '}'"],
            ["\\[", "return '['"],
            ["\\]", "return ']'"],
            [",", "return ','"],
            [":", "return ':'"],
            [";", "return ';'"],
            ["=", "return '='"],
            ["<=", "return '<='"],
            ["\\.\\.", "return '..'"],

            // generalized types
            ["[a-zA-Z_-][a-zA-Z0-9_-]*", "return 'IDENTIFIER'"],
            ["0|[1-9]\\d*", "return 'NUMBER'"],
            ["\"[^\"\\r\\n]*\"", "return 'STRING'"]
        ]
    },

    bnf: {
        program: [
            [ "typeDeclarations", "return $1;" ]
        ],
        typeDeclarations: [
            [ "typeDeclarations typeDeclaration", nextInList ],
            [ "typeDeclaration", firstInList ],
        ],
        typeDeclaration: [
            [ "TYPE IDENTIFIER = typeDescription", "$$ = { type: 'type-declaration', name: $2, declaration: $4 };" ]
        ],
        typeDescription: [
            "booleanDescription",
            "numberDescription",
            "stringDescription",
            "objectDescription",
            "arrayDescription",
            "userType",
        ],
        booleanDescription: [
            [ "BOOLEAN_TYPE", "$$ = { type: 'boolean', value: null };" ],
            [ "TRUE", "$$ = { type: 'boolean-instance', value: true };" ],
            [ "FALSE", "$$ = { type: 'boolean-instance', value: false };" ]
        ],
        numberDescription: [
            [ "NUMBER_TYPE", "$$ = { type: 'number', value: null };" ],
            [ "number", "$$ = { type: 'number-instance', value: $1 };" ]
        ],
        stringDescription: [
            [ "STRING_TYPE", "$$ = { type: 'string' };" ],
            [ "string", "$$ = { type: 'string-instance', value: $1};" ]
        ],
        objectDescription: [
            [ "{ }", "$$ = { type: 'object-description', canonicalProperties: [] };" ],
            [ "{ canonicalProperties }", "$$ = { type: 'object-description', canonicalProperties: $2 };" ]
        ],
        arrayDescription: [
            [ "[ ]", "$$ = { type: 'array-description', value: [] };" ]
        ],
        userType: [
            [ "IDENTIFIER", "$$ = { type: 'user-type', value: $1};" ]
        ],

        // helpers
        string: [
            [ "STRING", "$$ = $1.substring(1,  $1.length - 1);" ]
        ],
        number: [
            [ "NUMBER", "$$ = parseInt($1);" ]
        ],

        // object content
        canonicalProperties: [
            [ "canonicalProperties canonicalProperty", nextInList ],
            [ "canonicalProperty", firstInList ]
        ],
        canonicalProperty: [
            [ "IDENTIFIER", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: null };" ],
            [ "IDENTIFIER { }", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: null };" ],
            [ "IDENTIFIER { groups }", "$$ = { type: 'canonical-property', name: $1, groups: $3, returnValue: null };" ],
            [ "IDENTIFIER { IDENTIFIER : typePattern }", canonicalPropertyShortcut2 ],
            [ "IDENTIFIER : typePattern", canonicalPropertyShortcut ],
            [ "IDENTIFIER <= expression { }", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: $3 };" ]
        ],
        groups: [
            [ "groups group", nextInList ],
            [ "group", firstInList ]
        ],
        group: [
            [ "GROUP { }", "$$ = { type: 'group', matches: [] };" ],
            [ "GROUP { matches }", "$$ = { type: 'group', matches: $3 };" ]
        ],
        matches: [
            [ "matches match", nextInList ],
            [ "match", firstInList ]
        ],
        match: [
            [ "MATCH IDENTIFIER { }", "$$ = { type: 'match', name: $2, patterns: [] };" ],
            [ "MATCH IDENTIFIER { typePatterns }", "$$ = { type: 'match', name: $2, patterns: $4 };" ],
            [ "IDENTIFIER : typePattern", matchShortcut ]
        ],
        expression: [
            [ "IDENTIFIER", "$$ = { type: 'expression', expression: { type: 'get-value', name: $1 } };" ],
            [ "IDENTIFIER ( )", "$$ = { type: 'expression', expression: { type: 'invoke', name: $1, args: [] } };" ],
            [ "IDENTIFIER ( parameterList )", "$$ = { type: 'expression', expression: { type: 'invoke', name: $1, args: $3 } };" ]
        ],
        parameterList: [
            [ "parameterList , IDENTIFIER", nextInList2 ],
            [ "IDENTIFIER", firstInList ]
        ],


        // patterns
        typePatterns: [
            [ "typePatterns typePattern", nextInList ],
            [ "typePattern", firstInList ]
        ],
        typePattern: [
            [ "BOOLEAN_TYPE", "$$ = { type: 'pattern', value: 'boolean' };" ],
            [ "TRUE", "$$ = { type: 'pattern', value: true };" ],
            [ "FALSE", "$$ = { type: 'pattern', value: false };" ],
            [ "NUMBER_TYPE", "$$ = { type: 'pattern', value: 'number' };" ],
            [ "NUMBER", "$$ = { type: 'pattern', value: $1 };" ],
            [ "STRING_TYPE", "$$ = { type: 'pattern', value: 'string' };" ],
            [ "string", "$$ = { type: 'pattern', value: $1 };" ],
            [ "IDENTIFIER", "$$ = { type: 'pattern', value: $1 };" ],
            [ "arrayPattern", "$$ = { type: 'pattern', value: $1 };" ]
        ],

        // array pattern
        arrayPattern: [
            [ "[ ]", "$$ = { type: 'array-description', value: [] };" ],
            [ "[ elements ]", "$$ = { type: 'array-description', elements: $2 };" ]
        ],
        elements: [
            [ "elements , namedElement", nextInList2 ],
            [ "namedElement", firstInList ]
        ],
        namedElement: [
            [ "element", "$1.name = null; $$ = $1;" ],
            [ "IDENTIFIER : element", "$3.name = $1; $$ = $3;" ]
        ],
        element: [
            [ "typePattern", "$$ = { type: 'element', pattern: $1, range: { type: 'range', start: 1, stop: 1 } };" ],
            [ "typePattern ; range", "$$ = { type: 'element', pattern: $1, range: $3 };" ],
            [ "( elements )", "$$ = { type: 'element-group', elements: $2, range: { type: 'range', start: 1, stop: 1 } };" ],
            [ "( elements ) ; range", "$$ = { type: 'element-group', elements: $2, range: $5 };" ]
        ],
        range: [
            [ "number .. number", "$$ = { type: 'range', start: $1, stop: $3 };" ],
            [ ".. number", "$$ = { type: 'range', start: 0, stop: $2 };" ],
            [ "number ..", "$$ = { type: 'range', start: $1, stop: Infinity };" ],
            [ "number", "$$ = { type: 'range', start: $1, stop: $1 };" ]
        ]
    }
};

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

const parser = new Parser(grammar);

// you parser directly from memory
export default parser;

// printGrammar();

// generate source, ready to be written to disk
// fs.writeFileSync("generated_parser.js", parser.generate());


