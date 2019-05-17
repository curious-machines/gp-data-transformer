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
            [ "[ elements ]", "$$ = { type: 'pattern', patternType: 'array-pattern', value: $2 };" ]
        ],
        elements: [
            [ "elements , namedElement", nextInList2 ],
            [ "namedElement", firstInList ]
        ],
        namedElement: [
            [ "element", "$1.assignTo = null; $$ = $1;" ],
            [ "element AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
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
        ],

        // object pattern
        objectPattern: [
            [ "{ }", "$$ = { type: 'pattern', patternType: 'object', value: null };" ],
            [ "{ properties }", "$$ = { type: 'pattern', patternType: 'object-pattern', value: $2 };" ]
        ],
        properties: [
            [ "properties , namedProperty", nextInList2 ],
            [ "namedProperty", firstInList ]
        ],
        namedProperty: [
            [ "property", "$1.assignTo = $1.name; $$ = $1;" ],
            [ "property AS IDENTIFIER", "$1.assignTo = $3; $$ = $1;" ]
        ],
        property: [
            [ "IDENTIFIER : typePattern", "$$ = { type: 'property', name: $1, pattern: $3 };" ]
        ]
    }
};

export default grammar;
