- [Reverse key/values in object](#reverse-keyvalues-in-object)

---

# Reverse key/values in object

Some key features of this example:

- Uses `keys` to extract the keys of an object
- Uses `values` to extract the values of an object
- Uses `zip` to combine the keys and values into an array of pairs
- Uses `map` to convert the pairs into separate objects, with key/values reversed
- Uses `merge` to make one object out of all of the mapped objects
- Uses `pairs` function to replace the `keys`, `values`, and `zip` steps
- Uses `reverse` to reverse each element in the array of pairs
- Uses `fromPairs` to build an object from the list of key/value pairs

## Create an array of keys and values

```bash
echo '{"one": "un", "two": "deux", "three": "trois"}' \
    | dt '[keys($),values($)]' -i
```

```
[ [ 'one', 'two', 'three' ], [ 'un', 'deux', 'trois' ] ]
```

## Zip keys and values

Each element in the resulting array is a 2-element array where the first element is the key and the second element is the value.

```bash
echo '{"one": "un", "two": "deux", "three": "trois"}' \
    | dt 'zip([keys($),values($)])' -i
```

```
[ [ 'one', 'un' ], [ 'two', 'deux' ], [ 'three', 'trois' ] ]
```

## Convert zip elements to objects

Now we convert each element in the zipped array into objects, with key/values reversed

```bash
echo '{"one": "un", "two": "deux", "three": "trois"}' \
    | dt 'map(zip([keys($),values($)]), { $.1, $.0 })' -i
```

```
[ { un: undefined, one: 'un' },
  { deux: undefined, two: 'deux' },
  { trois: undefined, three: 'trois' } ]
```

## Merge objects into one

`map` returns an array but `merge` needs each object to be a separate parameter. We can convert the array to parameters using the spread (...) operator.

```bash
echo '{"one": "un", "two": "deux", "three": "trois"}' \
    | dt 'merge(...map(zip([keys($),values($)]), { $[1]: $[0] }))' -i
```

```
{ un: 'one', deux: 'two', trois: 'three' }
```

## Alternate implementations

Alternately, we can generate the array of key/value pairs using the `pairs` functions.

```bash
echo '{"one": "un", "two": "deux", "three": "trois"}' \
    | dt 'merge(...map(pairs($), { $[1]: $[0] }))' -i
```

```
{ un: 'one', deux: 'two', trois: 'three' }
```

As another alternate, we can use `pairs`, `reverse`, and `fromPairs`.

```bash
echo '{"one": "un", "two": "deux", "three": "trois"}' \
    | dt 'fromPairs(map(pairs($), reverse($)))' -i
```

```
{ un: 'one', deux: 'two', trois: 'three' }
```
