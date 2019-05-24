# Guide

- [Transformations](#transformations)
    - [Identify Transform](#identify-transform)
- [Pattern Matchers](#pattern-matchers)
    - [Primitive Patterns](#primitive-patterns)
        - [Array Type Pattern](#array-type-pattern)
        - [Boolean Patterns](#boolean-patterns)
        - [Number Patterns](#number-patterns)
        - [Object Type Pattern](#object-type-pattern)
        - [String Patterns](#string-patterns)
        - [Special Values](#special-values)
    - [Compound Patterns](#compound-patterns)
        - [Array Patterns](#array-patterns)
        - [Object Patterns](#object-patterns)
    - [Captures](#captures)
- [Generators](#generators)
    - [Array Generators](#array-generators)
    - [Object Generators](#object-generators)
    - [User-defined Generators](#user-defined-generators)
- [Types](#types)
    - [Primitive Types](#primitive-types)
    - [Array Types](#array-types)
    - [Object Types](#object-types)
    - [Enumerations](#enumerations)
    - [Assignments](#assignments)
- [Naming Patterns, Generators, and Transforms](#naming-patterns-generators-and-transforms)
- [Operators and Built-in Functions](#operators-and-built-in-functions)
    - [Repetition Operator](#repetition-operator)
- [Grammar](#grammar)

---

This guide will give a quick overview of the structure and purpose of the data-transform scripting language.

# Transformations

The heart of a data-transform script is the transform. This construct consists of two parts:

- A list of one or more pattern matchers
- A generator

The general syntax for a transformation is

```
generator <= pattern
```

Data flows from the right to the left. Even though there is no syntax for it, the following would describe the overall flow:

```
result <= generator <= pattern <= data
```

- We begin with some data on the right.
- The data flows into the pattern matcher which extracts key elements from the data. These key elements are named and become the result of the pattern.
- The generator receives a dictionary of captured items created by the pattern matcher. It constructs a new data structure, using a mixture of static content and captured values.
- The structure output by the generator becomes the resulting value of the transform

## Identify Transform

The simplest transform is one that does nothing at all to its input. This is referred to as the identity transform and it expressed with the following syntax:

```
_
```

The `_` character is a special symbol that represents identity; transform identity in this case. This indicates that we wish do nothing to the incoming data. The data is passed through untouched. This might be useful for debugging purposes as a means of determining what is being input into your transform, but you're unlikely to use construct.

Note that earlier I said that a transform has this form: `generator <= pattern`. It turns out that `_` is syntactic sugar for `_ <= _`. Both of those expressions do that exact same thing; return the input data untouched.

Since data flows from right-to-left in our transform expression, pattern matchers (sometimes referred to as patterns by itself) are a good place to start when understanding what a transform does. We'll cover those next.

# Pattern Matchers

The purpose of a pattern matcher is to compare its pattern to the data coming into it. If the structure the pattern describes matches the incoming data, then the pattern succeeds. If the pattern does not match, it reports failure. What happens with failure depends on where the pattern is being executed, as will be discussed in later sections of this guide.

## Primitive Patterns

The simplest patterns are the primitive patterns. These match entire classes of values or specific values of primitives. The next sections step through each of the available primitive patterns.

### Array Type Pattern

The `array` pattern 

```bash
dt -e '_ <= array' '[1, 2, 3]'
# returns {}

dt -e '_ <= array' '{"a": 10}'
# fails
```

Now the first result may be a little surprising. It turns out that a pattern returns a dictionary of the content it captured. We haven't discussed captures, but that first expression captures nothing, so the return value is an empty object (which I'm loosely referring to as a dictionary). If we want the actual array, then we need to capture it and refer to that capture in our generator:

```bash
dt -e 'a <= array' '[1, 2, 3] as a'
# returns [1, 2, 3]
```

If you're curious how we might match specific array structures, that will be covered in [Compound Patterns]](#compound-patterns).

### Boolean Patterns

Like the `array` pattern, we can match any boolean value using `boolean`

```bash
dt -e '_ <= boolean' 'true'
# returns {}

dt -e '_ <= boolean' 'false'
# returns {}

dt -e '_ <= boolean' '[true]'
# fails
```

In cases where you want to match a specific boolean value, you can use `true` and `false` directly

```bash
dt -e '_ <= true' 'true'
# returns {}

dt -e '_ <= true' 'false'
# fails

dt -e '_ <= true' 'true'
# returns {}

dt -e '_ <= true' '[true]'
# fails
```

### Number Patterns

We can match any number with `number` or specific numbers by using the number itself as the pattern.

```bash
dt -e '_ <= number' '10'
# returns {}

dt -e '_ <= number' 'true'
# fails

dt -e '_ <= 3.14' '3.14'
# returns {}

dt -e '_ <= 3.14' '"pi"'
# fails
```

### Object Type Pattern

If we want to know if a given piece of data is an object, we can use the `object` pattern. Note that this test will return true when matching against Javascript objects and arrays because they each can have properties. Also note that Javascript will return "object" when using `typeof` on `null`. This pattern will fail against `null`.

```bash
dt -e '_ <= object' '{"a": true}'
# returns {}

dt -e '_ <= object' '[true]'
# returns {}

dt -e '_ <= object' 'null'
# fails

dt -e '_ <= object' '10'
# fails
```

### String Patterns

We can match any string with `string` or a specific string by using the string itself.

```bash
dt -e '_ <= string' '"test"'
# returns {}

dt -e '_ <= string' 'true'
# fails

dt -e '_ <= "name"' '"name"'
# returns {}

dt -e '_ <= "name"' '"last"'
# fails
```

### Special Values

It is possible to match `null` using the `null` pattern and to match `undefined` using the `undefined` pattern.

```bash
dt -e '_ <= null' 'null'
# returns {}

dt -e '_ <= null' 'undefined'
# fails

dt -e '_ <= undefined' 'undefined'
# returns {}

dt -e '_ <= undefined' 'null'
# fails
```

Sometimes you don't care about the type of the data you are matching. In these cases you can use `any` to match anything.

```bash
dt -e '_ <= any' 'null'
# returns {}

dt -e '_ <= any' 'undefined'
# returns {}

dt -e '_ <= any' 'true'
# returns {}

dt -e '_ <= any' '[1, 2, 3]'
# returns {}

dt -e '_ <= any' '{"a": true}'
# returns {}
```

We've already touched on the identity transform. In it's slightly longer form, `_ <= _`, we see that there is a `_` pattern. This is the identity pattern.

Unlike other patterns, this will pass through its input untouched. This means on success, we will not see `{}`. We will see the actual input data. This can be useful when you only wish to manipulate and re-arrange the incomging data, which is the roll of the generator.

Note that like `any` this pattern will always succeed.

```bash
dt -e '_ <= _' '{"a": 10, "b": true}'
# returns {}

dt -e '_ <= _' 'undefined'
# reports undefined

dt -e '_ <= _' 'true'
# returns true

dt -e '_ <= _' '[1, 2, 3]'
# returns [1, 2, 3]
```

## Compound Patterns

### Array Patterns

An array pattern is simply a comma-delimited list of other patterns (can be primitive our more compound patterns) surrounded by square brackets.

```bash
dt -e '_ <= []' '[]'
# returns {}

dt -e '_ <= []' '[1]'
# fails

dt -e '_ <= [number]' '[1]'
# returns {}

dt -e '_ <= [number]' '[1, 2]'
# fails
```

One thing you may notice is that the number of patterns and the number of items in the current object need to be the same. You may not always know the exact number, but you may know a range of acceptable values. You can use the repetition operator to indicate these ranges:

```bash
dt -e '_ <= [number; 1..2]' '[]'
# fails

dt -e '_ <= [number; 1..2]' '[1]'
# returns {}

dt -e '_ <= [number; 1..2]' '[1, 2]'
# returns {}

dt -e '_ <= [number; 1..2]' '[1, 2, 3]'
# fails
```

Any element pattern can have it's own repetition

```bash
dt -e '_ <= [number; 1..2, string; 1..2]' '[10, "hello"]'
# returns {}

dt -e '_ <= [number; 1..2, string; 1..2]' '[10, 20, "hello"]'
# returns {}

dt -e '_ <= [number; 1..2, string; 1..2]' '[10, 20, "hello", "world"]'
# returns {}

dt -e '_ <= [number; 1..2, string; 1..2]' '[10, 20, 30, "hello", "world"]'
# fails

dt -e '_ <= [number; 1..2, string; 1..2]' '[10, 20, "hello", "world", "!"]'
# fails
```

If you have a repeating sequence of types, you can group elements using parenthese

```bash
dt -e '_ <= [(number, string); 1..2]' '[]'
# fails

dt -e '_ <= [(number, string); 1..2]' '[10, "hello"]'
# returns {}

dt -e '_ <= [(number, string); 1..2]' '[10, "hello", 20, "world"]'
# returns {}

dt -e '_ <= [(number, string); 1..2]' '[10, "hello", 20, "world", 30, "!"]'
# fails
```

### Object Patterns

An object pattern is a comma-delimited list of key/value pairs. The key is a property name and the value is a pattern (can be primitive our more compound patterns) surrounded by curly braces.

```bash
dt -e '_ <= {}' '{}'
# returns {}

dt -e '_ <= {}' '{"a": true}'
# returns {}

dt -e '_ <= {a: boolean}' '{"a": true}'
# returns {}

dt -e '_ <= {a: number}' '{"a": true}'
# fails

dt -e '_ <= {a: boolean}' '{"a": 10}'
# fails

dt -e '_ <= {a: boolean}' '{"a": true, "b": 10}'
# returns {}
```

The last example may be a little surprising. This shows that an object pattern is only concerned with what it is looking for, `a` in this case. If the current object has other properties, that won't change the result of the match.

> Honestly, I'm a little on the fence about this. Everywhere else in the language, matches are strict, but they're not here. That seems inconsistent. Perhaps there could be a way to indicate strict matching versus the current loose matching. It seems like both could be useful.

## Captures

In the [Array Type Pattern](#array-type-pattern) section, we showed a way to return the input data when using the identity pattern. This used a mechanism referred to as capturing.

When a pattern successfully matches the current object, it returns a dictionary. You most likely noticed that all of our pattern matches returned `{}`. This is the empty dictionary. We use captures to place items into that dictionary, to give our generators access to the data that was captured.

```bash
dt -e 'a <= [number as a, number]' '[1, 2]'
# returns 1

dt -e 'a <= {first: number as a}' '{"first": 10, "second": 20}'
# returns 10

dt -e 'a <= [number, number] as a' '[1, 2]'
# returns [1, 2]

dt -e 'a <= {first: number} as a' '{"first": 10, "second": 20}'
# returns { first: 10, second: 20 }
```

Notice that we can extract specific elements of an array, specific property values of an object, or entire structures. Although its not shown here, we can capture as many items as we wish as long as each capture name is unique. You will get warnings if you accidentally capture the same name more than once. Capturing is what make generators work, which we'll talk about next.

### Captures in Arrays

Arrays give all sorts of options for capturing and building intermediate structures for your generators.

```bash
dt -e '_ <= [ number as n3 ]' '[10]'
# returns { n3: 10 }

dt -e '_ <= [ number; 2 as n3 ]' '[10,20]'
# returns { n3: [ 10, 20 ] }

dt -e '_ <= [ (number; 2, number; 2) as n3 ]' '[10,20,30,40]'
# returns { n3: [ 10, 20, 30, 40 ] }

dt -e '_ <= [ (number; 2, number; 2); 2 as n3 ]' '[10,20,30,40,50,60,70,80]'
# returns { n3: [ [ 10, 20, 30, 40 ], [ 50, 60, 70, 80 ] ] }

dt -e '_ <= [ (number as n1, number as n2) ]' '[10,20]'
# returns { n1: 10, n2: 20 }

dt -e '_ <= [ (number as n1, number as n2); 2 ]' '[10,20,30,40]'
# returns { n1: [ 10, 30 ], n2: [ 20, 40 ] }

dt -e '_ <= [ (number as n1, number as n2) as n3 ]' '[10,20]'
# returns { n1: 10, n2: 20, n3: [ 10, 20 ] }

dt -e '_ <= [ (number as n1, number as n2); 2 as n3 ]' '[10,20,30,40]'
# returns { n1: [ 10, 30 ],
#   n2: [ 20, 40 ],
#   n3: [ [ 10, 20 ], [ 30, 40 ] ] }

dt -e '_ <= [ (number; 2 as n1, number; 2 as n2) ]' '[10,20,30,40]'
# returns { n1: [ 10, 20 ], n2: [ 30, 40 ] }

dt -e '_ <= [ (number; 2 as n1, number; 2 as n2); 2 ]' '[10,20,30,40,50,60,70,80]'
# returns { n1: [ [ 10, 20 ], [ 50, 60 ] ],
#   n2: [ [ 30, 40 ], [ 70, 80 ] ] }

dt -e '_ <= [ (number; 2 as n1, number; 2 as n2) as n3 ]' '[10,20,30,40]'
# returns { n1: [ 10, 20 ], n2: [ 30, 40 ], n3: [ 10, 20, 30, 40 ] }

dt -e '_ <= [ (number; 2 as n1, number; 2 as n2); 2 as n3 ]' '[10,20,30,40,50,60,70,80]'
# returns { n1: [ [ 10, 20 ], [ 50, 60 ] ],
#   n2: [ [ 30, 40 ], [ 70, 80 ] ],
#   n3: [ [ 10, 20, 30, 40 ], [ 50, 60, 70, 80 ] ] }
```

# Generators

## Primitive Generators

Primitive generators ignore their input and simply return themselves:

```bash
dt -e 'true <= _' '{}'
# returns true

dt -e 'false <= _' '10'
# returns false

dt -e '6.28 <= _' '{}'
# returns 6.28

dt -e '"test" <= _' 'undefined'
# returns "test"

dt -e 'null <= _' 'true'
# returns null

dt -e 'undefined <= _' '[]'
# returns `undefined`

dt -e '_ <= _' '{"a": 1, "b": true}'
# returns null
```

## Array Generators

You can construct array structures using an array generator. Simply surround a comma-delimited list of generator expression in square brackets.

```bash
dt -e '[] <= _' '10'
# returns []

dt -e '[1, 2, 3] <= _' '10'
# returns [1, 2, 3]
```

You may notice that we are generating new arrays, but all of the content is static. A more interesting transform would use values from the pattern match. This is where captures come into play.

```bash
dt -e '[first, third] <= [number as first, number, number as third]' '[10, 20, 30]'
# returns [10, 30]

dt -e '[first, third] <= { a: number as first, b: number, c: number as third }' '{"a": 10, "b": 20, "c": 30}'
# returns [10, 30]
```

These are our first full transforms. As you can see, we label matched data in a pattern (capture) and then we can reference the name of that capture in our generator (`first` and `third` in these examples).

## Object Generators

You can construct object structures using an object generator. You wrap a list of comma-delimited properties in curly braces. The properties consist of a name and a value, where the name is the property name you wish to create and the value is another generator.

```bash
dt -e '{a: 10, b: 20} <= _' '{"a": 10}'
# returns { a: 10, b: 20 }

dt -e '{a: 10, b: 20} <= _' 'null'
# returns { a: 10, b: 20 }
```

Like our array generator examples, things get more interesting when we use patterns with captures.

```bash
dt -e '{first: first, third: third} <= [number as first, number, number as third]' '[10, 20, 30]'
# returns { first: 10, third: 30 }

dt -e '{a: first, b: third} <= { a: number as first, b: number, c: number as third }' '{"a": 10, "b": 20, "c": 30}'
# returns { a: 10, b: 30 }
```

If your property name and the capture you wish to use are the same, you can list the name by itself without the value.

```bash
dt -e '{first, third} <= [number as first, number, number as third]' '[10, 20, 30]'
# returns { first: 10, third: 30 }
```

## User-defined Generators

The data-transform language is purposely limited. There will be times when you'll be unable to generate a structure simply because the language doesn't give you constructs to manipulate and massage the data as you need. At other times, you may need to create specfic instances of classes or perform actions outside the pervue of this scripting language. User-defined generators allow you cover these cases.

First, you'll need to define a module that exports functions you wish to have available in your script. We'll use the following and name it MyGen.js.

```javascript
export function MyGen(x, y) {
    return { x, y, s: x + y, d: x - y };
}
```

Next, we let `dt` know to load this module and now any generators that use `MyGen` will end up calling this code.

```bash
dt -r MyGen.js -e 'MyGen(x, y) <= { center: { cx: number as x, cy: number as y } }' '{"center": {"cx": 10, "cy": 20}}'
# returns { x: 10, y: 20, s: 30, d: -10 }
```

## Simple Operators

There is a very limited set of operations that can be performed on data inside of a generator:

- addition with numbers only
- subtraction with numbers only
- multiplication with numbers only
- division with nuumbers only
- a single level of property lookup

This list will be expanded over time.

# Types

Transforms, pattern matchers, and generators can be run by themselves, but this limits you to single transformations. In order define the shape of your data, you likely need to define a type. Types allow you to perform multiple transformations and collect those results into arrays and objects. They also extend the semantics of how patterns and transforms are used.

## Primitive Types

Sometimes it is useful to define aliases of types. For example, your data may be more meaningful referring to `true` and `false` as `yes` and `no`. Alternately, you have my specific string constants that you wish to define or even magic numbers. Primitive type definitions allow for these. The list of primitive types is the same as the list of primitive pattern matchers because they are one and the same.

## Array Types

An array type consists of zero or more transform elements. Each element is a transform whose results become the resulting array's value at that position within the array.

## Object Types

An object type consists of zero or more transform properties. Each property has a name and its value with be the result of the transform attached to that propery. The simplest object type would return an empty object.

```
type Simple = {}
```

We can expand on this simple example, by adding a property.

```
type OneProperty = {
    range: {a, b} <= [number as a, number as b]
}
```

Notice that the property's value is a transform. The result of the transform will be stored in the `range` property.

Sometimes your data can come in many forms. Object type properties allow us to provide a list of patterns. (Actually, we can use this construct anywhere transforms are valid.) Each pattern is tried in turn and the first one that is successful sets passes its captures to the generator.

```
type OneProperty = {
    range:
        {a, b} <=
                [number as a, number as b]
            |   {start: number as a, end: number as b}
}
```

Each transform is separated by the `|` operator and you may have as many transforms as you need.

Sometimes you need to perform different calculations in your generator based on the data you match.

```
type OneProperty = {
    range:
        {a, b} <=
                [number as a, number as b]
            |   {start: number as a, end: number as b};
        {a, a + len} <=
                [number as a, number as len]
            |   {start: number as a, length: number as len};
}
```

This shows that we can list transforms separated by ';'. Each transform will be tried in turn. The first one to succeed becomes the value of the property.

> NOTE: Currently there is no analysis of scripts. This means that if you return different types in each of your transforms, the interpreter won't complain.

## Enumerations

Enumerations are a list of string values. These can be used to test that a string value is within its list.

## Assignments

Sometimes it makes sense to save the results of a transform to reduce the amount of processing that is occurring or even just to simplify your logic. Although assignments are not types, they can only live within array types and object types. These consist of a name and a transform. You may have zero or more assignments and they must all be defined before the content of the compound type. Array elements and object properties may refer to the return value in their generators.

```
type Radii =
    // the generator could also be _, but I like being explicit
    radii =
        { rx, ry } <=
                { radii: { x: number as rx, y: number as ry } }
            |   { radii: [ number as rx, number as ry ] }
            |   { rx: number as rx, ry: number as ry }
            |   { radiusX: number as rx, radiusY: number as ry };

    rx: radii.rx,
    ry: radii.ry
```

An assignment is a name followed by '=' followed by a transform. More than one assignment can be defined and each must be separated by commas. Assignments must be defined before elements in an array type and before properties in an object type. The last assignment must be followed by a semicolon to mark the end of assignment definition. Elements and properties values may reference the name of the assignement to extract their values.

# Naming Patterns, Generators, and Transforms

If you find yourself needing to re-use a transform, a generator, or a pattern, you can store these items in the interpreter and access them later by name.

```
pattern Point = { x: number as x, y: number as y }
generator Point = Point2D(x, y)
transform Point = generator Point <= pattern Point
```

# Operators and Built-in Functions

## Repetition Operator

The repetition operator was introduced in the section on [Array Patterns](#array-patterns). We showed only one version of that operator. It turns out there are more options available. Below is a list of all syntactical versions of the reptition operator.

- Exactly n: ```;n```
- n or more: ```;n..```
- 0 to m: ```;..m```
- n to m: ```;n..m```

## Spread operator

```javascript
function Sum(...nums) {
    return nums.reduce((accum, num) => {
        return accum + num;
    }, 0);
}
```

```
Sum(...values) <= [number; 0..] as values
```

## Map

```
map(coords, Point2D(x, y) <= [number as x, number as y]) <= [(number, number); 0.. as coords]
```

# Grammar

For those of you who are curious, the grammar has been extracted into a file for easy viewing:

- [Grammar](grammar.md)
