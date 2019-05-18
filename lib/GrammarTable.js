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

const matchShortcut = "$$ = { type: \"match\", name: $1, patterns: [ $3 ] }";

const grammar = {
    lex: {
        rules: [
            ["\\s+", "/* skip whitespace */"],
            ["//.*", "/* skip comment */"],

            // keywords
            ["any", "return 'ANY_TYPE'"],
            ["array", "return 'ARRAY_TYPE'"],
            ["as", "return 'AS'"],
            ["boolean", "return 'BOOLEAN_TYPE'"],
            ["enumeration", "return 'ENUMERATION'"],
            ["false", "return 'FALSE'"],
            ["group", "return 'GROUP'"],
            ["match", "return 'MATCH'"],
            ["null", "return 'NULL_TYPE'"],
            ["number", "return 'NUMBER_TYPE'"],
            ["object", "return 'OBJECT_TYPE'"],
            ["string", "return 'STRING_TYPE'"],
            ["true", "return 'TRUE'"],
            ["type", "return 'TYPE'"],
            ["undefined", "return 'UNDEFINED_TYPE'"],

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
            "anyDescription",
            "arrayDescription",
            "booleanDescription",
            "enumerationDescription",
            "nullDescription",
            "numberDescription",
            "objectDescription",
            "stringDescription",
            "undefinedDescription"
        ],
        anyDescription: [
            [ "ANY_TYPE", "$$ = { type: 'any', value: null };" ]
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
        nullDescription: [
            [ "NULL_TYPE", "$$ = { type: 'null', value: null };" ]
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
        undefinedDescription: [
            [ "UNDEFINED_TYPE", "$$ = { type: 'undefined', value: null };" ]
        ],

        identifiers: [
            [ "identifiers stringOrIdentifier", nextInList ],
            [ "stringOrIdentifier", firstInList ]
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
            [ "stringOrIdentifier groupBlock", "$$ = { type: 'canonical-property', name: $1, groups: $2, returnValue: null };" ],
            [ "stringOrIdentifier : typePattern", canonicalPropertyShortcut ],
            [ "stringOrIdentifier <= expression", "$$ = { type: 'canonical-property', name: $1, groups: [], returnValue: $3 };" ],
            [ "stringOrIdentifier <= expression groupBlock", "$$ = { type: 'canonical-property', name: $1, groups: $4, returnValue: $3 };" ]
        ],
        groupBlock: [
            [ "{ }", "$$ = [];" ],
            [ "{ groups }", "$$ = $2;" ]
        ],
        groups: [
            [ "groups group", nextInList ],
            [ "group", firstInList ]
        ],
        group: [
            // groups are required to have at least one type match
            [ "GROUP { patternMatches }", "$$ = { type: 'group', matches: $3 };" ],
            [ "stringOrIdentifier : namedTypePattern", "$$ = { type: 'group', matches: [ { type: 'match', name: $1, patterns: [ $3 ] } ] };" ]
        ],
        patternMatches: [
            [ "patternMatches patternMatch", nextInList ],
            [ "patternMatch", firstInList ]
        ],
        patternMatch: [
            [ "MATCH stringOrIdentifier { }", "$$ = { type: 'match', name: $2, patterns: [] };" ],
            [ "MATCH stringOrIdentifier { typePatterns }", "$$ = { type: 'match', name: $2, patterns: $4 };" ],
            [ "stringOrIdentifier : namedTypePattern", matchShortcut ]
        ],
        expression: [
            // NOTE: this may need to be divided into groups that require a groupBlock and those that don't
            [ "IDENTIFIER", "$$ = { type: 'expression', expression: { type: 'get-value', name: $1 } };" ],
            [ "IDENTIFIER ( )", "$$ = { type: 'expression', expression: { type: 'invoke', name: $1, args: [] } };" ],
            [ "IDENTIFIER ( parameterList )", "$$ = { type: 'expression', expression: { type: 'invoke', name: $1, args: $3 } };" ],
            [ "arrayExpression", "$$ = { type: 'expression', expression: $1 };" ],
            [ "boolean", "$$ = { type: 'expression', expression: { type: 'boolean', value: $1 } };" ],
            [ "NULL_TYPE", "$$ = { type: 'expression', expression: { type: 'boolean', value: null } };" ],
            [ "float", "$$ = { type: 'expression', expression: { type: 'number', value: $1 } };" ],
            [ "string", "$$ = { type: 'expression', expression: { type: 'string', value: $1 } };" ],
            [ "objectExpression", "$$ = { type: 'expression', expression: $1 };" ],
            [ "UNDEFINED_TYPE", "$$ = { type: 'expression', expression: { type: 'string', value: undefined } };" ]
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
            [ "expression", "$$ = $1" ]
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
            [ "IDENTIFIER : expression", "$3.name = $1; $$ = $3;" ],
            [ "IDENTIFIER", "$$ = { type: 'expression', name: $1, expression: { type: 'get-value', name: $1 } };" ]
        ],
        parameterList: [
            [ "parameterList , IDENTIFIER", nextInList2 ],
            [ "IDENTIFIER", firstInList ]
        ],


        // patterns
        typePatterns: [
            [ "typePatterns namedTypePattern", nextInList ],
            [ "namedTypePattern", firstInList ]
        ],
        namedTypePattern: [
            [ "typePattern", "$1.assignTo = null; $$ = $1;" ],
            [ "typePattern AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        typePattern: [
            [ "ANY_TYPE", "$$ = { type: 'pattern', patternType: 'any', value: null };" ],
            [ "ARRAY_TYPE", "$$ = { type: 'pattern', patternType: 'array', value: null };" ],
            [ "arrayPattern", "$$ = $1;" ],
            [ "BOOLEAN_TYPE", "$$ = { type: 'pattern', patternType: 'boolean', value: null };" ],
            [ "TRUE", "$$ = { type: 'pattern', patternType: 'boolean', value: true };" ],
            [ "FALSE", "$$ = { type: 'pattern', patternType: 'boolean', value: false };" ],
            [ "NULL_TYPE", "$$ = { type: 'pattern', patternType: 'null', value: null };" ],
            [ "NUMBER_TYPE", "$$ = { type: 'pattern', patternType: 'number', value: null };" ],
            [ "float", "$$ = { type: 'pattern', patternType: 'number', value: $1 };" ],
            [ "OBJECT_TYPE", "$$ = { type: 'pattern', patternType: 'object', value: null };" ],
            [ "objectPattern", "$$ = $1;" ],
            [ "STRING_TYPE", "$$ = { type: 'pattern', patternType: 'string', value: null };" ],
            [ "string", "$$ = { type: 'pattern', patternType: 'string', value: $1 };" ],
            [ "UNDEFINED_TYPE", "$$ = { type: 'pattern', patternType: 'undefined', value: null };" ],

            // this matches user-defined types and external types
            [ "IDENTIFIER", "$$ = { type: 'pattern', value: $1 };" ]
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
            [ "namedProperty", "$1.assignTo = $1.name; $$ = $1;" ],
            [ "namedProperty AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        namedProperty: [
            [ "IDENTIFIER : typePattern", "$$ = { type: 'property', name: $1, pattern: $3 };" ]
        ]
    }
};

export default grammar;
