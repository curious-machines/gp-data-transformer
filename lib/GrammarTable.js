const passThrough = "$$ = $1";

const firstInList = "$$ = [ $1 ];";
const nextInList = "$1.push($2); $$ = $1";
const nextInList2 = "$1.push($3); $$ = $1";


const grammar = {
    lex: {
        rules: [
            // whitespace
            ["\\s+", "/* skip whitespace */"],
            ["//.*", "/* skip comment */"],

            // keywords
            ["any",       "return 'ANY_TYPE'"],
            ["array",     "return 'ARRAY_TYPE'"],
            ["as",        "return 'AS'"],
            ["boolean",   "return 'BOOLEAN_TYPE'"],
            ["enum",      "return 'ENUMERATION'"],
            ["false",     "return 'FALSE'"],
            ["generator", "return 'GENERATOR'"],
            ["null",      "return 'NULL_TYPE'"],
            ["number",    "return 'NUMBER_TYPE'"],
            ["object",    "return 'OBJECT_TYPE'"],
            ["pattern",   "return 'PATTERN'"],
            ["string",    "return 'STRING_TYPE'"],
            ["transform", "return 'TRANSFORM'"],
            ["true",      "return 'TRUE'"],
            ["type",      "return 'TYPE'"],
            ["undefined", "return 'UNDEFINED_TYPE'"],

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
            ["\\.\\.", "return '..'"],
            ["\\.",    "return '.'"],
            ["_",      "return '_'"],

            // generalized types
            ["[a-zA-Z_][a-zA-Z0-9_]*",       "return 'IDENTIFIER'"],
            ["[-+]?(0|[1-9]\\d*)(\\.\\d+)?", "return 'NUMBER'"],
            ["\"[^\"\\r\\n]*\"",             "return 'STRING'"]
        ]
    },

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
            [ "GENERATOR IDENTIFIER = generator",      "$$ = { type: 'generator-assignment', name: $2, value: $4 };" ],
            [ "PATTERN IDENTIFIER = namedTypePattern", "$$ = { type: 'pattern-assignment',   name: $2, value: $4 };" ],
            [ "TRANSFORM IDENTIFIER = transform",      "$$ = { type: 'transform-assignment', name: $2, value: $4 };" ],
            [ "TYPE IDENTIFIER = typeDefinition",      "$$ = { type: 'type-assignment',      name: $2, value: $4 };" ]
        ],

        // transforms
        transform: [
            [ "generator <= _",            "$$ = { type: 'transform', patterns: null, returnValue: $1   };" ],
            [ "generator",                 "$$ = { type: 'transform', patterns: null, returnValue: $1   };" ],
            [ "generator <= typePatterns", "$$ = { type: 'transform', patterns: $3,   returnValue: $1   };" ],
            [ "_ <= typePatterns",         "$$ = { type: 'transform', patterns: $3,   returnValue: null };" ],

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
            [ "IDENTIFIER : transform", "$$ = { type: 'type-property', name: $1, value: $3 };" ],
            [ "IDENTIFIER", "$$ = { type: 'type-property', name: $1, value: null };" ],
        ],
        assignments: [
            [ "assignments , assignment", nextInList2 ],
            [ "assignment", firstInList ]
        ],
        assignment: [
            [ "IDENTIFIER = transform", "$$ = { type: 'assignment', name: $1, value: $3 };"]
        ],

        // generators
        namedGenerator: [
            [ "generator", "$1.assignTo = null; $$ = $1;" ],
            [ "generator AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        generator: [
            [ "IDENTIFIER",                   "$$ = { type: 'generator', expression: { type: 'get-value', name: $1 } };" ],
            [ "IDENTIFIER ( )",               "$$ = { type: 'generator', expression: { type: 'invoke', name: $1, args: [] } };" ],
            [ "IDENTIFIER ( parameterList )", "$$ = { type: 'generator', expression: { type: 'invoke', name: $1, args: $3 } };" ],
            [ "arrayExpression",              "$$ = { type: 'generator', expression: $1 };" ],
            [ "boolean",                      "$$ = { type: 'generator', expression: { type: 'boolean', value: $1 } };" ],
            [ "NULL_TYPE",                    "$$ = { type: 'generator', expression: { type: 'boolean', value: null } };" ],
            [ "float",                        "$$ = { type: 'generator', expression: { type: 'number', value: $1 } };" ],
            [ "string",                       "$$ = { type: 'generator', expression: { type: 'string', value: $1 } };" ],
            [ "objectExpression",             "$$ = { type: 'generator', expression: $1 };" ],
            [ "UNDEFINED_TYPE",               "$$ = { type: 'generator', expression: { type: 'string', value: undefined } };" ],

            // NOTE: this is just for testing. This needs to be generalized for all generators that return object-like things
            [ "IDENTIFIER . IDENTIFIER", "$$ = { type: 'generator', expression: { type: 'get-property', left: { type: 'get-value', name: $1 }, right: $3 } };" ]
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
            [ "generator", passThrough ]
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
            [ "IDENTIFIER : generator", "$3.name = $1; $$ = $3;" ],
            [ "IDENTIFIER", "$$ = { type: 'generator', name: $1, expression: { type: 'get-value', name: $1 } };" ]
        ],
        parameterList: [
            [ "parameterList , IDENTIFIER", nextInList2 ],
            [ "IDENTIFIER", firstInList ]
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
            [ "ANY_TYPE",       "$$ = { type: 'pattern', patternType: 'any',       value: null  };" ],
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
