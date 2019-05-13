- [Ellipse](#ellipse)
    - [Text Descriptor](#text-descriptor)
    - [JSON AST](#json-ast)
    - [Examples](#examples)

---

# Ellipse

An ellipse has:

- a center point
- and a radii of x and y vectors

The center point:

- is a Point2D named `center`
- or a 2-element array of numbers named `center`
- or an x coordinate that is a number named `centerX` or `cx`
    - and a y corrdinate that is a number named `centerY` or `cy`

The radii:

- is a Vector2D named `radii`
- or a 2-element array of numbers named `radii`
- or an x radius that is a number named `radiusX` or `rx`
    - and a y radius that is a number named `radiusY` or `ry`

## Text Descriptor

Users of this module will be able to express validations with a syntax like the following:

```
type Ellipse {
    center {
        center: Point2D, [Number;2]
        centerX, centerY: Number
    }
    radii {
        radii: Vector2D, [Number;2]
        radiusX, rx: Number
        radiusY, ry: Number
    }
}
```

## JSON AST

The user could work with the following structure directly, but most likely it will be easier to have the text description above parsed and converted into a structure like so:

```json
{
    "typeName": "Ellipse",
    "properties": [
        {
            "name": "center",
            "descriptions": [
                [
                    { "names": [ "center" ], "types": [ "Point2D", "[Number;2]" ] }
                ],
                [
                    { "names": [ "centerX", "cx" ], "types": [ "Number" ] }
                    { "names": [ "centerY", "cy" ], "types": [ "Number" ] }
                ]
            ]
        },
        {
            "name": "radii",
            "descriptions": [
                [
                    { "names": [ "radii" ], "types": [ "Vector2D", "[Number;2]" ] }
                ],
                [
                    { "names": [ "radiusX", "rx" ], "types": [ "Number" ] }
                    { "names": [ "radiusY", "ry" ], "types": [ "Number" ] }
                ]
            ]
        }
    ]
}
```

## Examples

There are 6 ways to define `center` and 6 ways to define `radii` giving us 36 total permutations. To reduce clutter (and mistakes), I show each property group independently.

> NOTE: To reduce the number of options, we may want to consider an optional positional strictness to the name parameter. For example, if that setting were turned on, then we could require that if `centerX` is used, then we have to use `centerY` and not `cy` since `centerX` and `centerY` are in the same positions in their `names` arrays.

### Center

```javascript
{
    center: new Point2D(10, 20)
}
```

```javascript
{
    center: [10, 20]
}
```

```javascript
{
    centerX: 10,
    centerY: 20
}
```

```javascript
{
    cx: 10,
    cy: 20
}
```

```javascript
{
    centerX: 10,
    cy: 20
}
```

```javascript
{
    cx: 10,
    centerY: 20
}
```

### Radii

```javascript
{
    radii: Vector2D(30, 40)
}
```

```javascript
{
    radii: [30, 40]
}
```

```javascript
{
    radiusX: 30,
    radiusY: 40
}
```

```javascript
{
    rx: 30,
    ry: 40
}
```

```javascript
{
    radiusX: 30,
    ry: 40
}
```

```javascript
{
    rx: 30,
    radiusY: 40
}
```
