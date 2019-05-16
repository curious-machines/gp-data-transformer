/* eslint-disable array-bracket-spacing */
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
            ["array", "return 'ARRAY_TYPE'"],
            ["boolean", "return 'BOOLEAN_TYPE'"],
            ["enumeration", "return 'ENUMERATION'"],
            ["false", "return 'FALSE'"],
            ["from", "return 'FROM'"],
            ["group", "return 'GROUP'"],
            ["match", "return 'MATCH'"],
            ["number", "return 'NUMBER_TYPE'"],
            ["object", "return 'OBJECT_TYPE'"],
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
            ["[-+]?(0|[1-9]\\d*)(\\.\\d+)?", "return 'NUMBER'"],
            ["\"[^\"\\r\\n]*\"", "return 'STRING'"]
        ]
    },

    bnf: {
        program: [
            [ "typeDeclarations", "return $1;" ]
        ],
        typeDeclarations: [
            [ "typeDeclarations typeDeclaration", nextInList ],
            [ "typeDeclaration", firstInList ]
        ],
        typeDeclaration: [
            [ "TYPE stringOrIdentifier = typeDescription", "$$ = { type: 'type-declaration', name: $2, declaration: $4 };" ]
        ],

        // type descriptions
        typeDescription: [
            "arrayDescription",
            "booleanDescription",
            "enumerationDescription",
            "numberDescription",
            "objectDescription",
            "stringDescription"
        ],
        arrayDescription: [
            [ "ARRAY_TYPE", "$$ = { type: 'array', value: null };" ],
            [ "[ ]", "$$ = { type: 'array-instance', value: [] };" ]
        ],
        booleanDescription: [
            [ "BOOLEAN_TYPE", "$$ = { type: 'boolean', value: null };" ],
            [ "TRUE", "$$ = { type: 'boolean-instance', value: true };" ],
            [ "FALSE", "$$ = { type: 'boolean-instance', value: false };" ]
        ],
        enumerationDescription: [
            [ "ENUMERATION { }", "$$ = { type: 'enumeration', value: [] };" ],
            [ "ENUMERATION { identifiers }", "$$ = { type: 'enumeration', value: $3 };" ]
        ],
        numberDescription: [
            [ "NUMBER_TYPE", "$$ = { type: 'number', value: null };" ],
            [ "float", "$$ = { type: 'number-instance', value: $1 };" ]
        ],
        objectDescription: [
            [ "OBJECT_TYPE", "$$ = { type: 'object', value: null };" ],
            [ "{ }", "$$ = { type: 'object-instance', value: {} };" ],
            [ "{ canonicalProperties }", "$$ = { type: 'object-instance', value: $2 };" ]
        ],
        stringDescription: [
            [ "STRING_TYPE", "$$ = { type: 'string', value: null };" ],
            [ "string", "$$ = { type: 'string-instance', value: $1};" ]
        ],

        identifiers: [
            [ "identifiers stringOrIdentifier", nextInList ],
            [ "stringOrIdentifier", firstInList ]
        ],

        // helpers
        string: [
            [ "STRING", "$$ = $1.substring(1,  $1.length - 1);" ]
        ],
        integer: [
            [ "NUMBER", "$$ = parseInt($1);" ]
        ],
        float: [
            [ "NUMBER", "$$ = parseFloat($1);" ]
        ],
        stringOrIdentifier: [
            [ "IDENTIFIER", "$$ = $1" ],
            [ "STRING", "$$ = $1.substring(1,  $1.length - 1);" ]
        ],

        // object content
        canonicalProperties: [
            [ "canonicalProperties canonicalProperty", nextInList ],
            [ "canonicalProperty", firstInList ]
        ],
        canonicalProperty: [
            [ "stringOrIdentifier", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: null };" ],
            [ "stringOrIdentifier { }", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: null };" ],
            [ "stringOrIdentifier { groups }", "$$ = { type: 'canonical-property', name: $1, groups: $3, returnValue: null };" ],
            [ "stringOrIdentifier { stringOrIdentifier : typePattern }", canonicalPropertyShortcut2 ],
            [ "stringOrIdentifier : typePattern", canonicalPropertyShortcut ],
            [ "stringOrIdentifier <= expression { }", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: $3 };" ]
        ],
        groups: [
            [ "groups group", nextInList ],
            [ "group", firstInList ]
        ],
        group: [
            // groups are required to have at least one type match
            [ "GROUP { patternMatches }", "$$ = { type: 'group', matches: $3 };" ]
        ],
        patternMatches: [
            [ "patternMatches patternMatch", nextInList ],
            [ "patternMatch", firstInList ]
        ],
        patternMatch: [
            [ "MATCH stringOrIdentifier { }", "$$ = { type: 'match', name: $2, patterns: [] };" ],
            [ "MATCH stringOrIdentifier { typePatterns }", "$$ = { type: 'match', name: $2, patterns: $4 };" ],
            [ "stringOrIdentifier : typePattern", matchShortcut ]
        ],
        expression: [
            [ "stringOrIdentifier", "$$ = { type: 'expression', expression: { type: 'get-value', name: $1 } };" ],
            [ "stringOrIdentifier ( )", "$$ = { type: 'expression', expression: { type: 'invoke', name: $1, args: [] } };" ],
            [ "stringOrIdentifier ( parameterList )", "$$ = { type: 'expression', expression: { type: 'invoke', name: $1, args: $3 } };" ]
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
            [ "ARRAY_TYPE", "$$ = { type: 'pattern', value: 'array' };" ],
            [ "arrayPattern", "$$ = { type: 'pattern', value: $1 };" ],
            [ "BOOLEAN_TYPE", "$$ = { type: 'pattern', value: 'boolean' };" ],
            [ "TRUE", "$$ = { type: 'pattern', value: true };" ],
            [ "FALSE", "$$ = { type: 'pattern', value: false };" ],
            [ "NUMBER_TYPE", "$$ = { type: 'pattern', value: 'number' };" ],
            [ "NUMBER", "$$ = { type: 'pattern', value: $1 };" ],
            [ "OBJECT_TYPE", "$$ = { type: 'pattern', value: 'object' };" ],
            [ "STRING_TYPE", "$$ = { type: 'pattern', value: 'string' };" ],
            [ "string", "$$ = { type: 'pattern', value: $1 };" ],

            // this matches user-defined types and external types
            [ "IDENTIFIER", "$$ = { type: 'pattern', value: $1 };" ]
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
            [ "integer .. integer", "$$ = { type: 'range', start: $1, stop: $3 };" ],
            [ ".. integer", "$$ = { type: 'range', start: 0, stop: $2 };" ],
            [ "integer ..", "$$ = { type: 'range', start: $1, stop: Infinity };" ],
            [ "integer", "$$ = { type: 'range', start: $1, stop: $1 };" ]
        ]
    }
};

// function printGrammar() {
//     for (const rule in grammar.bnf) {
//         const alternations = grammar.bnf[rule];
//         let first = true;
//
//         console.log(rule);
//
//         for (const alternate of alternations) {
//             const production = Array.isArray(alternate)
//                 ? alternate[0]
//                 : alternate;
//
//             if (first) {
//                 console.log(`  : ${production}`);
//                 first = false;
//             }
//             else {
//                 console.log(`  | ${production}`);
//             }
//         }
//
//         console.log("  ;");
//         console.log();
//     }
// }

const parser = new Parser(grammar);

// you parser directly from memory
export default parser;

// printGrammar();

// generate source, ready to be written to disk
// fs.writeFileSync("generated_parser.js", parser.generate());


