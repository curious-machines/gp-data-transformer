```bnf
typeDeclaration
  : TYPE IDENTIFIER = typeDescription
  ;

typeDescription
  : booleanDescription
  | numberDescription
  | stringDescription
  | objectDescription
  | arrayDescription
  | userType
  ;

booleanDescription
  : BOOLEAN_TYPE
  | TRUE
  | FALSE
  ;

numberDescription
  : NUMBER_TYPE
  | number
  ;

stringDescription
  : STRING_TYPE
  | string
  ;

objectDescription
  : { }
  | { canonicalProperties }
  ;

arrayDescription
  : [ ]
  | [ elements ]
  ;

userType
  : IDENTIFIER
  ;

string
  : STRING
  ;

number
  : NUMBER
  ;

canonicalProperties
  : canonicalProperties canonicalProperty
  | canonicalProperty
  ;

canonicalProperty
  : IDENTIFIER
  | IDENTIFIER { }
  | IDENTIFIER { groups }
  | IDENTIFIER { IDENTIFIER : typePattern }
  | IDENTIFIER : typePattern
  | IDENTIFIER <= expression { }
  ;

groups
  : groups group
  | group
  ;

group
  : GROUP { }
  | GROUP { matches }
  ;

matches
  : matches match
  | match
  ;

match
  : MATCH IDENTIFIER { }
  | MATCH IDENTIFIER { typePatterns }
  | IDENTIFIER : typePattern
  ;

typePatterns
  : typePatterns typePattern
  | typePattern
  ;

typePattern
  : BOOLEAN_TYPE
  | TRUE
  | FALSE
  | NUMBER_TYPE
  | NUMBER
  | STRING_TYPE
  | string
  | IDENTIFIER
  | arrayDescription
  ;

expression
  : IDENTIFIER
  | IDENTIFIER ( )
  | IDENTIFIER ( parameterList )
  ;

parameterList
  : parameterList , IDENTIFIER
  | IDENTIFIER
  ;

elements
  : elements , namedElement
  | namedElement
  ;

namedElement
  : element
  | IDENTIFIER : element
  ;

element
  : typePattern
  | typePattern ; range
  | ( elements )
  | ( elements ) ; range
  ;

range
  : number .. number
  | .. number
  | number ..
  | number
  ;
```
