const passThrough = "$$ = $1";
const passThrough2 = "$$ = $2";

const firstInList = "$$ = [ $1 ];";
const nextInList = "$1.push($3); $$ = $1";
const anyPattern = "{ type: 'pattern', patternType: 'any', value: null }";

const grammar = {
    lex: {
        rules: [
            // whitespace
            ["\\s+", "/* skip whitespace */"],
            ["//.*", "/* skip comment */"],

            // keywords
            ["and\\b",       "return 'AND'"],
            ["any\\b",       "return 'ANY_TYPE'"],
            ["array\\b",     "return 'ARRAY_TYPE'"],
            ["as\\b",        "return 'AS'"],
            ["boolean\\b",   "return 'BOOLEAN_TYPE'"],
            ["def\\b",       "return 'DEF'"],
            ["enum\\b",      "return 'ENUMERATION'"],
            ["false\\b",     "return 'FALSE'"],
            ["let\\b",       "return 'LET'"],
            ["map\\b",       "return 'MAP'"],
            ["mod\\b",       "return 'MOD'"],
            ["not\\b",       "return 'NOT'"],
            ["or\\b",        "return 'OR'"],
            ["null\\b",      "return 'NULL_TYPE'"],
            ["number\\b",    "return 'NUMBER_TYPE'"],
            ["object\\b",    "return 'OBJECT_TYPE'"],
            ["patterns\\b",  "return 'PATTERNS'"],
            ["pow\\b",       "return 'POW'"],
            ["sequences\\b", "return 'SEQUENCES'"],
            ["string\\b",    "return 'STRING_TYPE'"],
            ["true\\b",      "return 'TRUE'"],
            ["undefined\\b", "return 'UNDEFINED_TYPE'"],

            // numbers
            ["[-+]?(0|[1-9]\\d*)(\\.\\d+)?", "return 'NUMBER'"],

            // strings
            ["\"[^\"\\r\\n]*\"", "return 'STRING'"],

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
            ["<=",     "return '<='"],
            [">=",     "return '>='"],
            ["=~",     "return '=~'"],
            ["==",     "return '=='"],
            ["!=",     "return '!='"],
            ["<",      "return '<'"],
            [">",      "return '>'"],
            ["=",      "return '='"],
            ["\\.{3}", "return '...'"],
            ["\\.{2}", "return '..'"],
            ["\\.",    "return '.'"],
            ["_",      "return '_'"],
            ["\\+",    "return '+'"],
            ["-",      "return '-'"],
            ["\\*",    "return '*'"],
            ["/",      "return '/'"],
            ["\\$",    "return '$'"],

            ["[a-zA-Z_][a-zA-Z0-9_]*", "return 'IDENTIFIER'"]
        ]
    },

    operators: [
        ["left", "AND"],
        ["left", "OR"],
        ["left", "==", "!="],
        ["left", "<", "<=", ">=", ">"],
        ["left", "+", "-"],
        ["left", "*", "/", "MOD", "POW"]
    ],

    bnf: {
        program: [
            [ "statements", "return $1;" ],
            [ "statements ;", "return $1;" ]
        ],

        // statements

        statements: [
            [ "statements ; statement", nextInList ],
            [ "statement", firstInList ]
        ],
        statement: [
            [ "assignment", passThrough ],
            [ "sequence", passThrough ]
        ],

        assignment: [
            [ "LET IDENTIFIER = sequence", "$$ = { type: 'assignment', name: $2, value: $4 };" ],
            [ "DEF IDENTIFIER = sequence", "$$ = { type: 'def', name: $2, value: $4 };" ],
        ],

        // transforms

        sequences: [
            [ "sequences , sequence", nextInList ],
            [ "sequence", firstInList ]
        ],
        sequence: [
            [ "steps", "$$ = { type: 'sequence', steps: $1 };" ]
        ],
        steps: [
            [ "steps |> step", nextInList ],
            [ "step", firstInList]
        ],
        step: [
            [ "=~ namedPattern", passThrough2 ],
            [ "expression", passThrough ]
        ],

        // expressions

        expression: [
            [ "booleanExpression", passThrough ],
            [ "MAP ( expression , sequence )", "$$ = { type: 'map', value: [ $3, $5 ] };" ],
            [ "PATTERNS { patterns }", "$$ = { type: 'patterns', patterns: $3 };" ],
            [ "SEQUENCES { sequences }", "$$ = { type: 'sequences', sequences: $3 };" ]
        ],
        booleanExpression: [
            [ "relationalExpression", passThrough ],
            [ "relationalExpression AND relationalExpression", "$$ = { type: 'and', left: $1, right: $3 };" ],
            [ "relationalExpression OR relationalExpression",  "$$ = { type: 'or',  left: $1, right: $3 };" ]
        ],
        relationalExpression: [
            [ "mathExpression", passThrough ],
            [ "relationalExpression < mathExpression",  "$$ = { type: 'less_than',     left: $1, right: $3 };"],
            [ "relationalExpression <= mathExpression", "$$ = { type: 'less_equal',    left: $1, right: $3 };"],
            [ "relationalExpression == mathExpression", "$$ = { type: 'equal',         left: $1, right: $3 };"],
            [ "relationalExpression != mathExpression", "$$ = { type: 'not_equal',     left: $1, right: $3 };"],
            [ "relationalExpression >= mathExpression", "$$ = { type: 'greater_equal', left: $1, right: $3 };"],
            [ "relationalExpression > mathExpression",  "$$ = { type: 'greater_than',  left: $1, right: $3 };"]
        ],
        mathExpression: [
            [ "callExpression", passThrough ],
            [ "mathExpression + callExpression",   "$$ = { type: 'add',      left: $1, right: $3 };" ],
            [ "mathExpression - callExpression",   "$$ = { type: 'subtract', left: $1, right: $3 };" ],
            [ "mathExpression * callExpression",   "$$ = { type: 'multiply', left: $1, right: $3 };" ],
            [ "mathExpression / callExpression",   "$$ = { type: 'divide',   left: $1, right: $3 };" ],
            [ "mathExpression MOD callExpression", "$$ = { type: 'modulus',  left: $1, right: $3 };" ],
            [ "mathExpression POW callExpression", "$$ = { type: 'power',    left: $1, right: $3 };" ]
        ],
        callExpression: [
            // TODO: add support for get-property and get-index after invocation
            [ "IDENTIFIER ( )",              "$$ = { type: 'invoke', name: $1, args: [] };" ],
            [ "IDENTIFIER ( argumentList )", "$$ = { type: 'invoke', name: $1, args: $3 };" ],
            [ "unaryExpression",             passThrough ]
        ],
        unaryExpression: [
            [ "memberExpression", passThrough ],
            [ "NOT unaryExpression", "$$ = { type: 'not', value: $2 };" ]
        ],
        memberExpression: [
            [ "primaryExpression", passThrough ],
            [ "memberExpression . name", "$$ = { type: 'get-property', left: $1, right: $3 };"],
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
            [ "expressionElements , expressionElement", nextInList ],
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
            [ "expressionProperties , expressionProperty", nextInList ],
            [ "expressionProperty", firstInList ]
        ],
        expressionProperty: [
            [ "expression : sequence", "$$ = { type: 'property', name: $1, value: $3 };" ],
            [ "expression", "$$ = { type: 'property', name: $1, value: null };" ],
            [ "assignment", passThrough ]
        ],
        argumentList: [
            [ "argumentList , argument", nextInList ],
            [ "argument", firstInList ]
        ],
        argument: [
            [ "expression", passThrough ],
            [ "... expression", "$$ = { type: 'spread', expression: $2 };" ]
        ],

        // patterns

        patterns: [
            [ "patterns , namedPattern", nextInList ],
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
            [ "patternElements , namedPatternElement", nextInList ],
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
            [ "patternProperties , namedPatternProperty", nextInList ],
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
        name: [
            [ "IDENTIFIER",     passThrough ],
            [ "string",         passThrough ],
            [ "AND",            passThrough ],
            [ "ANY_TYPE",       passThrough ],
            [ "ARRAY_TYPE",     passThrough ],
            [ "AS",             passThrough ],
            [ "BOOLEAN_TYPE",   passThrough ],
            [ "DEF",            passThrough ],
            [ "ENUMERATION",    passThrough ],
            [ "FALSE",          passThrough ],
            [ "LET",            passThrough ],
            [ "MAP",            passThrough ],
            [ "MOD",            passThrough ],
            [ "NOT",            passThrough ],
            [ "OR",             passThrough ],
            [ "NULL_TYPE",      passThrough ],
            [ "NUMBER_TYPE",    passThrough ],
            [ "OBJECT_TYPE",    passThrough ],
            [ "PATTERNS",       passThrough ],
            [ "POW",            passThrough ],
            [ "SEQUENCES",      passThrough ],
            [ "STRING_TYPE",    passThrough ],
            [ "TRUE",           passThrough ],
            [ "UNDEFINED_TYPE", passThrough ]
        ]
    }
};

export default grammar;
