const passThrough = "$$ = $1";
const passThrough2 = "$$ = $2";
const passThrough3 = "$$ = $3";

const firstInList = "$$ = [ $1 ];";
const nextInList = "$1.push($2); $$ = $1";
const nextInList2 = "$1.push($3); $$ = $1";
const anyPattern = "{ type: 'pattern', patternType: 'any', value: null }";

const grammar = {
    lex: {
        rules: [
            // whitespace
            ["\\s+", "/* skip whitespace */"],
            ["//.*", "/* skip comment */"],

            // keywords
            ["any\\b",       "return 'ANY_TYPE'"],
            ["array\\b",     "return 'ARRAY_TYPE'"],
            ["as\\b",        "return 'AS'"],
            ["boolean\\b",   "return 'BOOLEAN_TYPE'"],
            ["enum\\b",      "return 'ENUMERATION'"],
            ["false\\b",     "return 'FALSE'"],
            ["let\\b",       "return 'LET'"],
            ["map\\b",       "return 'MAP'"],
            ["null\\b",      "return 'NULL_TYPE'"],
            ["number\\b",    "return 'NUMBER_TYPE'"],
            ["object\\b",    "return 'OBJECT_TYPE'"],
            ["string\\b",    "return 'STRING_TYPE'"],
            ["true\\b",      "return 'TRUE'"],
            ["undefined\\b", "return 'UNDEFINED_TYPE'"],

            // numbers
            ["[-+]?(0|[1-9]\\d*)(\\.\\d+)?", "return 'NUMBER'"],

            // strings
            ["\"[^\"\\r\\n]*\"",             "return 'STRING'"],

            // operators and special symbols
            ["\\(",    "return '('"],
            ["\\)",    "return ')'"],
            ["{",      "return '{'"],
            ["}",      "return '}'"],
            ["\\[",    "return '['"],
            ["\\]",    "return ']'"],
            ["\\|>",   "return '|>'"],
            ["\\|",    "return '|'"],
            [",",      "return ','"],
            [":",      "return ':'"],
            [";",      "return ';'"],
            ["=~",     "return '=~'"],
            ["=",      "return '='"],
            ["<=",     "return '<='"],
            ["\\.{3}", "return '...'"],
            ["\\.{2}", "return '..'"],
            ["\\.",    "return '.'"],
            ["_",      "return '_'"],
            ["\\+",    "return '+'"],
            ["-",      "return '-'"],
            ["\\*",    "return '*'"],
            ["/",      "return '/'"],
            ["\\$",    "return '$'"],

            ["[a-zA-Z_][a-zA-Z0-9_]*",       "return 'IDENTIFIER'"]
        ]
    },

    operators: [
        ["left", "+", "-"],
        ["left", "*", "/"]
    ],

    bnf: {
        program: [
            [ "statements", "return $1;" ]
        ],

        // statements

        statements: [
            [ "statements ; statement", nextInList2 ],
            [ "statement", firstInList ]
        ],
        statement: [
            [ "assignment", passThrough ],
            [ "transformSequence", passThrough ]
        ],

        assignment: [
            [ "LET IDENTIFIER = transformSequence", "$$ = { type: 'assignment', name: $2, value: $4 };" ]
        ],

        // transforms

        transformSequence: [
            [ "steps", "$$ = { type: 'sequence', steps: $1 };" ]
        ],
        steps: [
            [ "steps |> step", nextInList2 ],
            [ "step", firstInList]
        ],
        step: [
            [ "=~ pattern", passThrough2 ],
            [ "expression", passThrough ]
        ],

        // expressions

        expression: [
            [ "mathExpression", passThrough ],
            [ "MAP ( expression , transformSequence )", "$$ = { type: 'map', value: [ $3, $5 ] };" ]
        ],
        mathExpression: [
            [ "callExpression", passThrough ],
            [ "mathExpression + callExpression", "$$ = { type: 'add',      left: $1, right: $3 };" ],
            [ "mathExpression - callExpression", "$$ = { type: 'subtract', left: $1, right: $3 };" ],
            [ "mathExpression * callExpression", "$$ = { type: 'multiply', left: $1, right: $3 };" ],
            [ "mathExpression / callExpression", "$$ = { type: 'divide',   left: $1, right: $3 };" ]
        ],
        callExpression: [
            // TODO: add support for get-property and get-index after invocation
            [ "IDENTIFIER ( )",              "$$ = { type: 'invoke', name: $1, args: [] };" ],
            [ "IDENTIFIER ( argumentList )", "$$ = { type: 'invoke', name: $1, args: $3 };" ],
            [ "memberExpression",            passThrough ]
        ],
        memberExpression: [
            [ "primaryExpression", passThrough ],
            [ "memberExpression . IDENTIFIER", "$$ = { type: 'get-property', left: $1, right: $3 };"],
            [ "memberExpression . integer", "$$ = { type: 'get-index', left: $1, right: $3 };"],
            [ "memberExpression [ integer ]",  "$$ = { type: 'get-index', left: $1, right: $3 };"]
        ],
        primaryExpression: [
            [ "boolean",          "$$ = { type: 'boolean',   value: $1 };" ],
            [ "NULL_TYPE",        "$$ = { type: 'boolean',   value: null };" ],
            [ "float",            "$$ = { type: 'number',    value: $1 };" ],
            [ "string",           "$$ = { type: 'string',    value: $1 };" ],
            [ "UNDEFINED_TYPE",   "$$ = { type: 'undefined', value: undefined };" ],
            [ "IDENTIFIER",       "$$ = { type: 'get-value', name: $1 };" ],
            [ "$",                "$$ = { type: 'get-structure' };" ],
            [ "arrayExpression",  passThrough ],
            [ "objectExpression", passThrough ],
            [ "( expression )",   "$$ = $2;" ]
        ],
        arrayExpression: [
            [ "[ ]", "$$ = { type: 'array', value: [] };" ],
            [ "[ expressionElements ]", "$$ = { type: 'array', value: $2 };" ]
        ],
        expressionElements: [
            [ "expressionElements , expressionElement", nextInList2 ],
            [ "expressionElement", firstInList ]
        ],
        expressionElement: [
            [ "expression", passThrough ],
            [ "assignment", passThrough ]
        ],
        objectExpression: [
            [ "{ }", "$$ = { type: 'object', value: [] };" ],
            [ "{ expressionProperties }", "$$ = { type: 'object', value: $2 };" ]
        ],
        expressionProperties: [
            [ "expressionProperties , expressionProperty", nextInList2 ],
            [ "expressionProperty", firstInList ]
        ],
        expressionProperty: [
            [ "IDENTIFIER : expression", "$$ = { type: 'property', name: $1, value: $3 };" ],
            [ "IDENTIFIER", "$$ = { type: 'property', name: $1, value: { type: 'get-value', name: $1 } };" ],
            [ "assignment", passThrough ]
        ],
        argumentList: [
            [ "argumentList , argument", nextInList2 ],
            [ "argument", firstInList ]
        ],
        argument: [
            [ "expression", passThrough ],
            [ "... IDENTIFIER", "$$ = { type: 'spread', name: $2 };" ],
            [ "... $", "$$ = { type: 'spread', name: null };" ]
        ],

        // patterns

        patterns: [
            [ "patterns | namedPattern", nextInList2 ],
            [ "namedPattern", firstInList ]
        ],
        namedPattern: [
            [ "pattern", "$1.assignTo = null; $$ = $1;" ],
            [ "pattern AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        pattern: [
            [ "ANY_TYPE",       `$$ = ${anyPattern};` ],
            [ "ARRAY_TYPE",     "$$ = { type: 'pattern', patternType: 'array',     value: null  };" ],
            [ "BOOLEAN_TYPE",   "$$ = { type: 'pattern', patternType: 'boolean',   value: null  };" ],
            [ "TRUE",           "$$ = { type: 'pattern', patternType: 'boolean',   value: true  };" ],
            [ "FALSE",          "$$ = { type: 'pattern', patternType: 'boolean',   value: false };" ],
            [ "NULL_TYPE",      "$$ = { type: 'pattern', patternType: 'null',      value: null  };" ],
            [ "NUMBER_TYPE",    "$$ = { type: 'pattern', patternType: 'number',    value: null  };" ],
            [ "float",          "$$ = { type: 'pattern', patternType: 'number',    value: $1    };" ],
            [ "OBJECT_TYPE",    "$$ = { type: 'pattern', patternType: 'object',    value: null  };" ],
            [ "STRING_TYPE",    "$$ = { type: 'pattern', patternType: 'string',    value: null  };" ],
            [ "string",         "$$ = { type: 'pattern', patternType: 'string',    value: $1    };" ],
            [ "UNDEFINED_TYPE", "$$ = { type: 'pattern', patternType: 'undefined', value: null  };" ],

            // compound patterns
            [ "arrayPattern",  "$$ = $1;" ],
            [ "objectPattern", "$$ = $1;" ],

            // references
            [ "PATTERN IDENTIFIER",     "$$ = { type: 'pattern-reference', name: $2 };" ],
            [ "ENUMERATION IDENTIFIER", "$$ = { type: 'enumeration-reference', name: $2 };" ],

            // this matches user-defined types and external types
            [ "IDENTIFIER", "$$ = { type: 'pattern', patternType: 'reference', value: $1 };" ]
        ],

        // array pattern

        arrayPattern: [
            [ "[ ]", "$$ = { type: 'pattern', patternType: 'array-pattern', value: [] };" ],
            [ "[ patternElements ]", "$$ = { type: 'pattern', patternType: 'array-pattern', value: $2 };" ]
        ],
        patternElements: [
            [ "patternElements , namedPatternElement", nextInList2 ],
            [ "namedPatternElement", firstInList ]
        ],
        namedPatternElement: [
            [ "patternElement", "$1.assignTo = null; $$ = $1;" ],
            [ "patternElement AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        patternElement: [
            [ "pattern", "$$ = { type: 'element', pattern: $1, range: { type: 'range', start: 1, stop: 1 } };" ],
            [ "pattern ; range", "$$ = { type: 'element', pattern: $1, range: $3 };" ],
            [ "( patternElements )", "$$ = { type: 'element-group', elements: $2, range: { type: 'range', start: 1, stop: 1 } };" ],
            [ "( patternElements ) ; range", "$$ = { type: 'element-group', elements: $2, range: $5 };" ]
        ],
        range: [
            [ "integer .. integer", "$$ = { type: 'range', start: $1, stop: $3 };" ],
            [ ".. integer", "$$ = { type: 'range', start: 0, stop: $2 };" ],
            [ "integer ..", "$$ = { type: 'range', start: $1, stop: Infinity };" ],
            [ "integer", "$$ = { type: 'range', start: $1, stop: $1 };" ]
        ],

        // object pattern

        objectPattern: [
            [ "{ }", "$$ = { type: 'pattern', patternType: 'object', value: null };" ],
            [ "{ patternProperties }", "$$ = { type: 'pattern', patternType: 'object-pattern', value: $2 };" ]
        ],
        patternProperties: [
            [ "patternProperties , namedPatternProperty", nextInList2 ],
            [ "namedPatternProperty", firstInList ]
        ],
        namedPatternProperty: [
            [ "namedProperty", passThrough ],
            [ "namedProperty AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        namedProperty: [
            [ "IDENTIFIER : pattern", "$$ = { type: 'property', name: $1, pattern: $3 };" ],
            [ "IDENTIFIER", "$$ = { type: 'property', name: $1, pattern: { type: 'pattern', patternType: 'any', value: null } };" ]
        ],

        // helpers

        boolean: [
            [ "TRUE", "$$ = true;" ],
            [ "FALSE", "$$ = false;" ]
        ],
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
            [ "IDENTIFIER", passThrough ],
            [ "STRING", "$$ = $1.substring(1,  $1.length - 1);" ]
        ],
        identifiers: [
            [ "identifiers , stringOrIdentifier", nextInList2 ],
            [ "stringOrIdentifier", firstInList ]
        ]
    }
};

export default grammar;
