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
    - [Any Pattern](#any-patterns)
    - [Identity Pattern](#identity-pattern)
- [Generators](#generators)
    - [User-defined Generators](#user-defined-generators)
- [Types](#types)
    - [Primitive Types](#primitive-types)
    - [Array Types](#array-types)
    - [Object Types](#object-types)
    - [Enumerations](#enumerations)
    - [Assignments](#assignments)
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

```
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
# reports failure but that's because dt treats undefined as a result as failure.
# This actually succeeded

dt -e '_ <= _' 'true'
# returns true

dt -e '_ <= _' '[1, 2, 3]'
# returns [1, 2, 3]
```

## Compound Patterns

Compound patterns define:

- arrays and the patterns of their elements
- objects and the patterns of their properties

# Generators

Generators are used to create new data structures. You can create any of the following types:

- arrays
- boolean
- null
- floats
- strings
- objects

## User-defined Generators

The data-transform language is purposely limited. Due to its limited nature, there will be times when you'll be unable to generate a structure simply because the language doesn't give you constructs to manipulate and massage the data as you need. At other times, you may need to create specfic instances of classes. User-defined generators allow you cover these cases.

A user-defined generator is registered with a transformer instance. Whenever that name is encountered in a generator, your registered function will be invoked with any parameters specified in the script. The return value of your function becomes the return value of the generator at that point.

## Simple Operators

There is a very limited set of operations that can be performed on data inside of a generator:

- addition with numbers only
- subtraction with numbers only
- multiplication with numbers only
- division with nuumbers only
- a single level of property lookup

This list will be expanded over time.

## Current Object Generator

Sometimes you don't need to re-arrange your captured values. You can use the `_` symbol in a generator position and this will return the dictionary of captures as the generator value.

# Types

Transforms, pattern matchers, and generators can be run by themselves, but this limits you to single transformations. In order define the shape of your data, you need to define a type. Types allow you to perform multiple transformations and collect those results into arrays and objects.

## Primitive Types

Sometimes it is useful to define aliases of types. For example, your data may be more meaningful referring to `true` and `false` as `yes` and `no`. Alternately, you have my specific string constants that you wish to define or even magic numbers. Primitive type definitions allow for these. The list of primitive types is the same as the list of primitive pattern matchers because they are one and the same.

## Array Types

An array type consists of zero or more transform elements. Each transform element is a transform whose results become the resulting array's value at that position within the array.

## Object Types

An object type consists of zero or more transform properties. Each property has a name and its value with be the result of the transform attached to that propery.

## Enumerations

## Assignments

Sometimes it makes sense to save the results of a transform to reduce the amount of processing that is occurring or even just to simplify your logic. Although assignments are not types, they can only live within array types and object types. These consist of a name and a transform. You may have zero or more assignments and they must all be defined before the content of the compound type. Array elements and object properties may refer to the return value in their generators.

# Grammar

For those of you who are curious, the grammar has been extracted into a file for easy viewing:

- [Grammar](grammar.md)
