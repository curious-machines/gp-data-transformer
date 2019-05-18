```bnf
program
  : typeDeclarations
  ;
typeDeclarations
  : typeDeclarations typeDeclaration
  | typeDeclaration
  ;
typeDeclaration
  : TYPE stringOrIdentifier = typeDescription
  ;
typeDescription
  : anyDescription
  | arrayDescription
  | booleanDescription
  | enumerationDescription
  | nullDescription
  | numberDescription
  | objectDescription
  | stringDescription
  | undefinedDescription
  ;
anyDescription
  : ANY_TYPE
  ;
arrayDescription
  : ARRAY_TYPE
  | [ ]
  ;
booleanDescription
  : BOOLEAN_TYPE
  | TRUE
  | FALSE
  ;
enumerationDescription
  : ENUMERATION { }
  | ENUMERATION { identifiers }
  ;
nullDescription
  : NULL_TYPE
  ;
numberDescription
  : NUMBER_TYPE
  | float
  ;
objectDescription
  : OBJECT_TYPE
  | { }
  | { canonicalProperties }
  ;
stringDescription
  : STRING_TYPE
  | string
  ;
undefinedDescription
  : UNDEFINED_TYPE
  ;
identifiers
  : identifiers stringOrIdentifier
  | stringOrIdentifier
  ;
boolean
  : TRUE
  | FALSE
  ;
string
  : STRING
  ;
integer
  : NUMBER
  ;
float
  : NUMBER
  ;
stringOrIdentifier
  : IDENTIFIER
  | STRING
  ;
canonicalProperties
  : canonicalProperties canonicalProperty
  | canonicalProperty
  ;
canonicalProperty
  : stringOrIdentifier
  | stringOrIdentifier groupBlock
  | stringOrIdentifier : typePattern
  | stringOrIdentifier <= expression
  | stringOrIdentifier <= expression groupBlock
  ;
groupBlock
  : { }
  | { groups }
  ;
groups
  : groups group
  | group
  ;
group
  : GROUP { patternMatches }
  | stringOrIdentifier : namedTypePattern
  ;
patternMatches
  : patternMatches patternMatch
  | patternMatch
  ;
patternMatch
  : MATCH stringOrIdentifier { }
  | MATCH stringOrIdentifier { typePatterns }
  | stringOrIdentifier : namedTypePattern
  ;
expression
  : IDENTIFIER
  | IDENTIFIER ( )
  | IDENTIFIER ( parameterList )
  | arrayExpression
  | boolean
  | NULL_TYPE
  | float
  | string
  | objectExpression
  | UNDEFINED_TYPE
  ;
arrayExpression
  : [ ]
  | [ expressionElements ]
  ;
expressionElements
  : expressionElements , expressionElement
  | expressionElement
  ;
expressionElement
  : expression
  ;
objectExpression
  : { }
  | { expressionProperties }
  ;
expressionProperties
  : expressionProperties , expressionProperty
  | expressionProperty
  ;
expressionProperty
  : IDENTIFIER : expression
  ;
parameterList
  : parameterList , IDENTIFIER
  | IDENTIFIER
  ;
typePatterns
  : typePatterns namedTypePattern
  | namedTypePattern
  ;
namedTypePattern
  : typePattern
  | typePattern AS IDENTIFIER
  ;
typePattern
  : ANY_TYPE
  | ARRAY_TYPE
  | arrayPattern
  | BOOLEAN_TYPE
  | TRUE
  | FALSE
  | NULL_TYPE
  | NUMBER_TYPE
  | float
  | OBJECT_TYPE
  | objectPattern
  | STRING_TYPE
  | string
  | UNDEFINED_TYPE
  | IDENTIFIER
  ;
arrayPattern
  : [ ]
  | [ patternElements ]
  ;
patternElements
  : patternElements , namedPatternElement
  | namedPatternElement
  ;
namedPatternElement
  : patternElement
  | patternElement AS IDENTIFIER
  ;
patternElement
  : typePattern
  | typePattern ; range
  | ( patternElements )
  | ( patternElements ) ; range
  ;
range
  : integer .. integer
  | .. integer
  | integer ..
  | integer
  ;
objectPattern
  : { }
  | { patternProperties }
  ;
patternProperties
  : patternProperties , namedPatternProperty
  | namedPatternProperty
  ;
namedPatternProperty
  : namedProperty
  | namedProperty AS IDENTIFIER
  ;
namedProperty
  : IDENTIFIER : typePattern
  ;
```