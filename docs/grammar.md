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
  | numberDescription
  | objectDescription
  | stringDescription
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

identifiers
  : identifiers stringOrIdentifier
  | stringOrIdentifier
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
  : stringOrIdentifier
  | stringOrIdentifier ( )
  | stringOrIdentifier ( parameterList )
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
  | NUMBER_TYPE
  | float
  | OBJECT_TYPE
  | objectPattern
  | STRING_TYPE
  | string
  | IDENTIFIER
  ;

arrayPattern
  : [ ]
  | [ elements ]
  ;

elements
  : elements , namedElement
  | namedElement
  ;

namedElement
  : element
  | element AS IDENTIFIER
  ;

element
  : typePattern
  | typePattern ; range
  | ( elements )
  | ( elements ) ; range
  ;

range
  : integer .. integer
  | .. integer
  | integer ..
  | integer
  ;

objectPattern
  : { }
  | { properties }
  ;

properties
  : properties , namedProperty
  | namedProperty
  ;

namedProperty
  : property
  | property AS IDENTIFIER
  ;

property
  : IDENTIFIER : typePattern
  ;

```
