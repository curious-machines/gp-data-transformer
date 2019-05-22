# Guide

- [Transformations](#transformations)
- [Pattern Matchers](#pattern-matchers)
    - [Primitive Patterns](#primitive-patterns)
    - [Compound Patterns](#compound-patterns)
    - [Any Pattern](#any-patterns)
    - [Current Object Pattern](#current-object-pattern)
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

# Pattern Matchers

A pattern matcher defines a type that is expected of the current object. If the current object matches the type and pattern described by the matcher, then matcher succeeds; otherwise, it reports failure.

## Primitive Patterns

The simplest patterns are the primitive patterns. This specify classes of primitives or specific primite values. The following primitive patterns are available:

- array which matches any array value
- boolean which matches any boolean value
- true
- false
- null
- number which matches any number value
- any specific number value
- object which matches any object value
- string which matches any string value
- any specific string value
- undefined

## Compound Patterns

Compound patterns define:

- arrays and the patterns of their elements
- objects and the patterns of their properties

## Any Pattern

In some cases, you don't care about specific types. You simply want to know that a value exists, or you wish to use the value regardless of its type. `any` is used for this purpose.

## Current Object Pattern

Sometimes you won't need to match a structure. You simply want to re-arrange what's there. The `_` symbol can be used in a pattern matcher position. It will return whatever object is the current object at the time. Note that if the current object is an object, then your generator can refer to properties on that object as if they had all been captured.

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
