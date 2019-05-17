# kld-data-normalizer

- [Installation](#installation)
- [Importing](#importing)
- [Usage](#usage)
- [Links and Related Projects](#links-and-related-projects)

---

This is a module used to perform queries, validation, and transformations on acyclic data, for example, but not limited to, JSON data. It can be used with custom types and supports hooks to type check and to create those custom types if the library itself does not suffice.

Please note that this is a very early version of the module. This is mostly a personal experiment that I'll be using in another project. I would not recommend using it in production, although I will be. It is likely the API and the DSL will change; however, I would expect things mostly to grow as opposed to being radically changed, at this point. If you have issues, please report them. If you have suggestions, please pass those along as well.

Note that I'm using Jison as the DSL's parser. It does not give friendly errors and I apologize for that. Future versions of this library are likely to use another parsing infrastructure.

# Installation

```npm install kld-data-normalizer```

# Importing

The following sections indicate how you can import the code for use in various environments.

## Node

```javascript
import Normalizer = require("kld-data-normalizer");
```

## Browsers

```html
<script src="./node_modules/kld-data-normalizer/dist/index-umd.js"></script>
<script>
  var Normalizer = KldDataNormalizer.Normalizer;
</script>
```

## Modern Browsers (ESM)

```javascript
import Normalizer from './node_modules/kld-data-normalizer/dist/index-esm.js';
```

## Bundlers

```javascript
import Normalizer from "kld-data-normalizer";
```

# Usage

Define a normalization file. We'll save it as `ellipse.norm`. This DSL in this file describes the shape of your data and how to transform it into the format you prefer. Of course, you don't have to transform your data. These files can be used for querying and validation as well.

```javascript
type Ellipse = {
    center <= Point2D(x, y) {
        center: { x: number, y: number }
        center: [ number as x, number as y ]
        group {
            cx: number as x
            cy: number as y
        }
        group {
            centerX: number as x
            centerY: number as y
        }
    }
    radii <= Vector2D(u, v) {
        radii: { x: number as u, y: number as v }
        radii: [ number as u, number as v ]
        group {
            rx: number as u
            ry: number as v
        }
        group {
            radiusX: number as u
            radiusY: number as v
        }
    }
}
```

Now build a script to normalize your data

```javascript
import fs from "fs";
import util from "util";
import Normalizer from "kld-data-normalizer";

const source = fs.readFileSync("./ellipse.norm", "utf-8");
const normalizer = new Normalizer();

normalizer.addDefinitionsFromSource(source);
normalizer.typeCreators.Point2D = (type, args) => { return {x: args[0], y: args[1]} };
normalizer.typeCreators.Vector2D = (type, args) => { return {u: args[0], v: args[1]} };

const samples = [
    {cx: 10, cy: 20, rx: 30, ry: 40},
    {centerX: 10, centerY: 20, radiusX: 30, radiusY: 40},
    {cx: 10, cy: 20, radiusX: 30, radiusY: 40},
    {centerX: 10, centerY: 20, rx: 30, ry: 40},
    {center: {x: 10, y: 20}, rx: 30, ry: 40},
    {center: {x: 10, y: 20}, radii: {x: 30, y: 40}},
    {center: [10, 20], rx: 30, ry: 40},
    {center: [10, 20], radii: [30, 40]}
];

samples.forEach(sample => {
    const result = normalizer.normalize(sample);

    console.log(`${util.inspect(sample)} => ${util.inspect(result)}`);
})
```

Each one of these structures is described in the `norm` file. They will be transformed to match the top-level definition of the Ellipse type. All results look like the following:

```JSON
{ "center": { "x": 10, "y": 20 }, "radii": { "u": 30, "v": 40 } }
```

Note that if a validation/transformation fails, `undefined` will be returned. Future versions of the library will give better diagnostic information so you can determine where the failure has occurred.

You may notice that the `norm` file references `Point2D` and `Vector2D`. Since these types are not defined in the `norm` file, these are considered external types which will need to be handler by user code. We register `typeCreators` in our example, using matching names. Those functions are passed the name of the type (in case you want to use the same handle for multiple types) and an array of arguments. The value returned will become the property's value upon successful validation and transformation. Note that if you would like to register a handler for all external types, you can use `*` as the type name.

# Links and Related Projects

- WIP: [Tutorial](https://github.com/thelonious/kld-data-normalizer/blob/master/docs/tutorial.md)
