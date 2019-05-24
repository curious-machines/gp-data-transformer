const passThrough = "$$ = $1";

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
            ["generator\\b", "return 'GENERATOR'"],
            ["map\\b",       "return 'MAP'"],
            ["null\\b",      "return 'NULL_TYPE'"],
            ["number\\b",    "return 'NUMBER_TYPE'"],
            ["object\\b",    "return 'OBJECT_TYPE'"],
            ["pattern\\b",   "return 'PATTERN'"],
            ["string\\b",    "return 'STRING_TYPE'"],
            ["transform\\b", "return 'TRANSFORM'"],
            ["true\\b",      "return 'TRUE'"],
            ["type\\b",      "return 'TYPE'"],
            ["undefined\\b", "return 'UNDEFINED_TYPE'"],

            // operators and special symbols
            ["\\(",    "return '('"],
            ["\\)",    "return ')'"],
            ["{",      "return '{'"],
            ["}",      "return '}'"],
            ["\\[",    "return '['"],
            ["\\]",    "return ']'"],
            ["\\|",    "return '|'"],
            [",",      "return ','"],
            [":",      "return ':'"],
            [";",      "return ';'"],
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

            // generalized types
            ["[a-zA-Z_][a-zA-Z0-9_]*",       "return 'IDENTIFIER'"],
            ["[-+]?(0|[1-9]\\d*)(\\.\\d+)?", "return 'NUMBER'"],
            ["\"[^\"\\r\\n]*\"",             "return 'STRING'"]
        ]
    },

    operators: [
        ["left", "+", "-"],
        ["left", "*", "/"]
        // ["left", "^"],
        // ["left", "UMINUS"]
    ],

    bnf: {
        program: [
            [ "statements", "return $1;" ]
        ],

        // statements

        statements: [
            [ "statements statement", nextInList ],
            [ "statement", firstInList ]
        ],
        statement: [
            [ "transform", "$$ = $1;" ],
            [ "GENERATOR IDENTIFIER = expression",     "$$ = { type: 'generator-assignment', name: $2, value: $4 };" ],
            [ "PATTERN IDENTIFIER = namedTypePattern", "$$ = { type: 'pattern-assignment',   name: $2, value: $4 };" ],
            [ "TRANSFORM IDENTIFIER = transform",      "$$ = { type: 'transform-assignment', name: $2, value: $4 };" ],
            [ "TYPE IDENTIFIER = typeDefinition",      "$$ = { type: 'type-assignment',      name: $2, value: $4 };" ]
        ],

        // transforms

        transform: [
            [ "expression",                 `$$ = { type: 'transform', patterns: [${anyPattern}], returnValue: $1   };` ],
            [ "expression <= _",            "$$ = { type: 'transform', patterns: null,            returnValue: $1   };" ],
            [ "expression <= typePatterns", "$$ = { type: 'transform', patterns: $3,              returnValue: $1   };" ],
            [ "_ <= typePatterns",          "$$ = { type: 'transform', patterns: $3,              returnValue: null };" ],
            [ "_ <= _",                     "$$ = { type: 'transform', patterns: null,            returnValue: null };" ],
            [ "_",                          "$$ = { type: 'transform', patterns: null,            returnValue: null };" ],

            [ "GENERATOR IDENTIFIER", "$$ = { type: 'generator-reference', name: $2 };" ],
            [ "TRANSFORM IDENTIFIER", "$$ = { type: 'transform-reference', name: $2 };" ],
            [ "TYPE IDENTIFIER",      "$$ = { type: 'type-reference',      name: $2 };" ]
        ],

        // type definitions

        typeDefinition: [
            [ "ANY_TYPE", "$$ = { type: 'type-definition', definition: 'any', value: null };" ],
            [ "ARRAY_TYPE", "$$ = { type: 'type-definition', definition: 'array', value: null };" ],
            [ "arrayTypeDefinition", "$$ = $1;" ],
            [ "BOOLEAN_TYPE", "$$ = { type: 'type-definition', definition: 'boolean', value: null };" ],
            [ "TRUE", "$$ = { type: 'type-definition', definition: 'boolean', value: true };" ],
            [ "FALSE", "$$ = { type: 'type-definition', definition: 'boolean', value: false };" ],
            [ "ENUMERATION { identifiers }", "$$ = { type: 'type-definition', definition: 'enumeration', value: $3 };" ],
            [ "NULL_TYPE", "$$ = { type: 'type-definition', definition: 'null', value: null };" ],
            [ "NUMBER_TYPE", "$$ = { type: 'type-definition', definition: 'number', value: null };" ],
            [ "float", "$$ = { type: 'type-definition', definition: 'number', value: $1 };" ],
            [ "OBJECT_TYPE", "$$ = { type: 'type-definition', definition: 'object', value: null };" ],
            [ "objectTypeDefinition", "$$ = $1;" ],
            [ "STRING_TYPE","$$  = { type: 'type-definition', definition: 'string', value: null };" ],
            [ "string", "$$ = { type: 'type-definition', definition: 'string', value: $1 };" ],
            [ "UNDEFINED_TYPE", "$$ = { type: 'type-definition', definition: 'undefined', value: null };" ]
        ],
        arrayTypeDefinition: [
            [ "[ ]", "$$ = { type: 'type-definition', definition: 'array', value: [] };" ],
            [ "[ transformElements ]", "$$ = { type: 'type-definition', definition: 'array', value: $2 };" ],
            [ "[ assignments ; transformElements ]", "$$ = { type: 'type-definition', definition: 'array', value: $2.concat($4) };" ]
        ],
        transformElements: [
            [ "transformElements , transform", nextInList2],
            [ "transform", firstInList ]
        ],
        objectTypeDefinition: [
            [ "{ }", "$$ = { type: 'type-definition', definition: 'object', value: [] };" ],
            [ "{ transformProperties }", "$$ = { type: 'type-definition', definition: 'object', value: $2 };" ],
            [ "{ assignments ; transformProperties }", "$$ = { type: 'type-definition', definition: 'object', value: $2.concat($4) };" ]
        ],
        transformProperties: [
            [ "transformProperties , transformProperty", nextInList2 ],
            [ "transformProperty", firstInList ]
        ],
        transformProperty: [
            [ "IDENTIFIER : transforms", "$$ = { type: 'type-property', name: $1, value: $3 };" ],
            [ "IDENTIFIER", "$$ = { type: 'type-property', name: $1, value: null };" ],
        ],
        assignments: [
            [ "assignments , assignment", nextInList2 ],
            [ "assignment", firstInList ]
        ],
        assignment: [
            [ "IDENTIFIER = transform", "$$ = { type: 'assignment', name: $1, value: $3 };"]
        ],
        transforms: [
            [ "transforms ; transform", nextInList2 ],
            [ "transform", firstInList]
        ],

        // expressions

        expression: [
            [ "mathExpression", passThrough ],
            [ "MAP ( expression , transform )", "$$ = { type: 'map', value: [ $3, $5 ] };" ]
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
            [ "memberExpression . integer",    "$$ = { type: 'get-index', left: $1, right: $3 };"]
            // [ "memberExpression [ integer ]",    "$$ = { type: 'get-index', left: $1, right: $3 };"]
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
            // [ "( expression )",   "$$ = $2;" ]
        ],
        arrayExpression: [
            [ "[ ]", "$$ = { type: 'array', value: [] };" ],
            [ "[ expressionElements ]", "$$ = { type: 'array', value: $2 };" ]
        ],
        expressionElements: [
            [ "expressionElements , expression", nextInList2 ],
            [ "expression", firstInList ]
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
            [ "IDENTIFIER", "$$ = { type: 'property', name: $1, value: { type: 'get-value', name: $1 } };" ]
        ],
        argumentList: [
            [ "argumentList , argument", nextInList2 ],
            [ "argument", firstInList ]
        ],
        argument: [
            [ "expression", passThrough ],
            [ "... IDENTIFIER", "$$ = { type: 'spread', name: $2 };" ]
        ],

        // patterns

        typePatterns: [
            [ "typePatterns | namedTypePattern", nextInList2 ],
            [ "namedTypePattern", firstInList ]
        ],
        namedTypePattern: [
            [ "typePattern", "$1.assignTo = null; $$ = $1;" ],
            [ "typePattern AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        typePattern: [
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
            [ "arrayPattern",   "$$ = $1;" ],
            [ "objectPattern",  "$$ = $1;" ],

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
            [ "typePattern", "$$ = { type: 'element', pattern: $1, range: { type: 'range', start: 1, stop: 1 } };" ],
            [ "typePattern ; range", "$$ = { type: 'element', pattern: $1, range: $3 };" ],
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
            [ "IDENTIFIER : typePattern", "$$ = { type: 'property', name: $1, pattern: $3 };" ],
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
