/* eslint-disable array-bracket-spacing */
import fs from "fs";
import {Parser} from "jison";

const firstInList = "$$ = [ $1 ];";
const nextInList = "$1.push($2); $$ = $1";

const canonicalPropertyShortcut = `$$ = {
    type: "canonical-property",
    name: $1,
    groups: [
        {
            type: "group",
            matches: [ { type: "match", name: $1, patterns: [ $3 ] } ]
        }
    ]
};`;
const canonicalPropertyShortcut2 = `$$ = {
    type: "canonical-property",
    name: $1,
    groups: [
        {
            type: "group",
            matches: [ { type: "match", name: $3, patterns: [ $5 ] } ]
        }
    ]
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

            // generalized types
            ["[a-zA-Z_-][a-zA-Z0-9_-]*", "return 'IDENTIFIER'"],
            ["0|[1-9]\\d*", "return 'NUMBER'"],
            ["\"[^\"\\r\\n]*\"", "return 'STRING'"]
        ]
    },

    bnf: {
        typeDeclaration: [
            [ "TYPE IDENTIFIER = typeDescription", "return { type: 'type-declaration', name: $2, declaration: $4 };" ]
        ],
        typeDescription: [
            "booleanDescription",
            "numberDescription",
            "stringDescription",
            "objectDescription",
            "arrayDescription"
        ],
        booleanDescription: [
            [ "BOOLEAN_TYPE", "$$ = { type: 'boolean', value: null };" ],
            [ "TRUE", "$$ = { type: 'boolean-instance', value: true };" ],
            [ "FALSE", "$$ = { type: 'boolean-instance', value: false };" ]
        ],
        numberDescription: [
            [ "NUMBER_TYPE", "$$ = { type: 'number', value: null };" ],
            [ "NUMBER", "$$ = { type: 'number-instance', value: parseInt($1) };" ]
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

        string: [
            [ "STRING", "$$ = $1.substring(1,  $1.length - 1);" ]
        ],

        canonicalProperties: [
            [ "canonicalProperties canonicalProperty", nextInList ],
            [ "canonicalProperty", firstInList ]
        ],
        canonicalProperty: [
            [ "IDENTIFIER", "$$ = { type: 'canonical-property', name: $1, groups: [] };" ],
            [ "IDENTIFIER { }", "$$ = { type: 'canonical-property', name: $1, groups: [] };" ],
            [ "IDENTIFIER { groups }", "$$ = { type: 'canonical-property', name: $1, groups: $3 };" ],
            [ "IDENTIFIER { IDENTIFIER : typePattern }", canonicalPropertyShortcut2 ],
            [ "IDENTIFIER : typePattern", canonicalPropertyShortcut ]
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
            [ "string", "$$ = { type: 'pattern', value: $1 };" ]
        ]
    }
};

const parser = new Parser(grammar);

// you parser directly from memory
export default parser;

// generate source, ready to be written to disk
fs.writeFileSync("generated_parser.js", parser.generate());


