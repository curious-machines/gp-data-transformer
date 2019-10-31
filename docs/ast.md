## Node

```
interface Node {
    type: string;
}
```

## Programs

```
interface Program <: Node {
    type: "program";
    statements: [Assignment | Def | Sequence];
}
```

```
type Program {
    type: "program",
    statements: [ (Assignment | Def | Sequence)* ]
}
```

## Assignment

```
interface Assignment <: Node {
    type: "assignment";
    name: string;
    value: Sequence;
}

interface Def <: Node {
    type: "def";
    name: string;
    value: Sequence;
}
```

## Sequences

```
interface Sequence <: Node {
    type: "sequence";
    steps: [Pattern | Expression];
}
```

## Patterns

```
interace Pattern <: Node {
    type: "pattern";
    assignTo: string | null;
}

interface AnyTypePattern <: Pattern {
    patternType: "any";
    value: null;
}

interface ArrayTypePattern <: Pattern {
    patternType: "array";
    value: null;
}

interface BooleanTypePattern <: Pattern {
    patternType: "boolean";
    value: Boolean?;
}

interface NullTypePattern <: Pattern {
    patternType: "null";
    value: null;
}

interface NumberTypePattern <: Pattern {
    patternType: "number";
    value: number | null;
}

interface ObjectTypePattern <: Pattern {
    patternType: "object";
    value: null;
}

interface StringTypePattern <: Pattern {
    patternType: "string";
    value: string | null;
}

interface UndefinedTypePattern <: Pattern {
    patternType: "undefined";
    value: null;
}

interface ArrayPattern <: Pattern {
    patternType: "array-pattern";
    value: Array<Element, ElementGroup>;
}

interface Element <: Node {
    type: "element";
    pattern: Pattern;
    range: Range;
}

interface ElementGroup <: Node {
    type: "element-group";
    elements: [Element | ElementGroup];
    range: Range;
}

interface Range <: Node {
    type: "range";
    start: number;
    stop: number;
}

interface ObjectPattern <: Pattern {
    patternType: "object-pattern";
    properties: [Property];
}

interface Property <: Node {
    type: "property";
    name: string;
    value: Pattern;
}
```

## Expressions

```
interface Expression <: Node {
}

interface Map <: Node {
    type: "map";
    value: [ Expression, Sequence ];
}

interface Patterns <: Node {
    type: "patterns";
    patterns: [ Patterns ];
}

interface Sequences <: Node {
    type: "sequences";
    sequences: [ Sequence ];
}
```

### Boolean expressions

```
interface BinaryExpression <: Expression {
    type: BinaryOperator;
    left: Expression;
    right: Expression;
}

enum BinaryOperator {
      "and" | "or" | "<" | "<=" | "==" | "!=" | ">=" | ">" 
    | "+" | "-" | "*" | "/" | "mod" | "pow"
}
```

## Call Expression

```
interface CallExpression <: Expression {
    type: "invoke";
    name: string;
    args: [ Expression | SpreadExpression ]
}

interface SpreadExpression <: Expression {
    type: "spread";
    expression: Expression;
}
```

## Unary Expression

```
interface NotExpression <: Expression {
    type: "not";
    value: Expression;
}
```

## Member Expressions

```
interface GetPropertyExpression <: Expression {
    type: "get-property";
    left: Expression;
    right: Identifier;
}

interface GetIndexExpression <: Expression {
    type: "get-index";
    left: Expression;
    right: number
}
```

## Primary Expressions

```
interface Boolean <: Expression {
    type: "boolean";
    value: boolean;
}

interface Null <: Expression {
    type: "null";
    value: null;
}

interface Number <: Expression {
    type: "number";
    value: number;
}

interface String <: Expression {
    type: "string";
    value: string;
}

interface Undefined <: Expression {
    type: "undefined";
    value: null;
}

interface Identifier <: Expression {
    type: "get-value";
    name: string;
}

interface GetStructure <: Expression {
    type: "get-structure";
}
```

## Compound Expressions

```
interface ArrayExpression <: Expression {
    type: "array";
    elements: [ Expression | Assignement ];
}

interface ObjectExpression <: Expression {
    type: "object";
    elements: [ Property | Assignment ];
}

interface Property <: Node {
    type: "property";
    name: string;
    value: Sequence
}
```
