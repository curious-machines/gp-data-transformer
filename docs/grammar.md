```bnf
program
  : statements
  | statements ;
  ;

statements
  : statements ; statement
  | statement
  ;

statement
  : assignment
  | sequence
  ;

assignment
  : LET IDENTIFIER = sequence
  | DEF IDENTIFIER = sequence
  ;

sequences
  : sequences , sequence
  | sequence
  ;

sequence
  : steps
  ;

steps
  : steps |> step
  | step
  ;

step
  : =~ namedPattern
  | expression
  ;

expression
  : booleanExpression
  | MAP ( expression , sequence )
  | PATTERNS { patterns }
  | SEQUENCES { sequences }
  ;

booleanExpression
  : relationalExpression
  | relationalExpression AND relationalExpression
  | relationalExpression OR relationalExpression
  ;

relationalExpression
  : mathExpression
  | relationalExpression < mathExpression
  | relationalExpression <= mathExpression
  | relationalExpression == mathExpression
  | relationalExpression != mathExpression
  | relationalExpression >= mathExpression
  | relationalExpression > mathExpression
  ;

mathExpression
  : callExpression
  | mathExpression + callExpression
  | mathExpression - callExpression
  | mathExpression * callExpression
  | mathExpression / callExpression
  | mathExpression MOD callExpression
  | mathExpression POW callExpression
  ;

callExpression
  : IDENTIFIER ( )
  | IDENTIFIER ( argumentList )
  | unaryExpression
  ;

unaryExpression
  : memberExpression
  | NOT unaryExpression
  ;

memberExpression
  : primaryExpression
  | memberExpression . name
  | memberExpression . integer
  | memberExpression [ integer ]
  ;

primaryExpression
  : boolean
  | NULL_TYPE
  | float
  | string
  | UNDEFINED_TYPE
  | IDENTIFIER
  | $
  | arrayExpression
  | objectExpression
  | ( expression )
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
  | assignment
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
  : expression : sequence
  | expression
  | assignment
  ;

argumentList
  : argumentList , argument
  | argument
  ;

argument
  : expression
  | ... expression
  ;

patterns
  : patterns , namedPattern
  | namedPattern
  ;

namedPattern
  : pattern
  | pattern AS IDENTIFIER
  ;

pattern
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
  : pattern
  | pattern ; range
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
  : patternProperty
  | patternProperty AS IDENTIFIER
  ;

patternProperty
  : name : pattern
  | name
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

name
  : IDENTIFIER
  | string
  | AND
  | ANY_TYPE
  | ARRAY_TYPE
  | AS
  | BOOLEAN_TYPE
  | DEF
  | ENUMERATION
  | FALSE
  | LET
  | MAP
  | MOD
  | NOT
  | OR
  | NULL_TYPE
  | NUMBER_TYPE
  | OBJECT_TYPE
  | PATTERNS
  | POW
  | SEQUENCES
  | STRING_TYPE
  | TRUE
  | UNDEFINED_TYPE
  ;

```