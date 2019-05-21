```bnf
program
  : statements
  ;
statements
  : statements statement
  | statement
  ;
statement
  : transform
  | GENERATOR IDENTIFIER = generator
  | PATTERN IDENTIFIER = namedTypePattern
  | TRANSFORM IDENTIFIER = transform
  | TYPE IDENTIFIER = typeDefinition
  ;
transform
  : generator
  | generator <= _
  | generator <= typePatterns
  | _ <= typePatterns
  | GENERATOR IDENTIFIER
  | TRANSFORM IDENTIFIER
  | TYPE IDENTIFIER
  ;
typeDefinition
  : ANY_TYPE
  | ARRAY_TYPE
  | arrayTypeDefinition
  | BOOLEAN_TYPE
  | TRUE
  | FALSE
  | ENUMERATION { identifiers }
  | NULL_TYPE
  | NUMBER_TYPE
  | float
  | OBJECT_TYPE
  | objectTypeDefinition
  | STRING_TYPE
  | string
  | UNDEFINED_TYPE
  ;
arrayTypeDefinition
  : [ ]
  | [ transformElements ]
  | [ assignments ; transformElements ]
  ;
transformElements
  : transformElements , transform
  | transform
  ;
objectTypeDefinition
  : { }
  | { transformProperties }
  | { assignments ; transformProperties }
  ;
transformProperties
  : transformProperties , transformProperty
  | transformProperty
  ;
transformProperty
  : IDENTIFIER : transform
  | IDENTIFIER
  ;
assignments
  : assignments , assignment
  | assignment
  ;
assignment
  : IDENTIFIER = transform
  ;
namedGenerator
  : generator
  | generator AS IDENTIFIER
  ;
generator
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
  | IDENTIFIER . IDENTIFIER
  | generator + generator
  | generator - generator
  | generator * generator
  | generator / generator
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
  : generator
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
  : IDENTIFIER : generator
  | IDENTIFIER
  ;
parameterList
  : parameterList , generator
  | generator
  ;
typePatterns
  : typePatterns | namedTypePattern
  | namedTypePattern
  ;
namedTypePattern
  : typePattern
  | typePattern AS IDENTIFIER
  ;
typePattern
  : ANY_TYPE
  | ARRAY_TYPE
  | BOOLEAN_TYPE
  | TRUE
  | FALSE
  | NULL_TYPE
  | NUMBER_TYPE
  | float
  | OBJECT_TYPE
  | STRING_TYPE
  | string
  | UNDEFINED_TYPE
  | arrayPattern
  | objectPattern
  | PATTERN IDENTIFIER
  | ENUMERATION IDENTIFIER
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
  | IDENTIFIER
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
identifiers
  : identifiers , stringOrIdentifier
  | stringOrIdentifier
  ;
```