# kld-data-transformer

- [Installation](#installation)
- [Importing](#importing)
- [Usage](#usage)
- [Command Line](#command-line)
- [Links and Related Projects](#links-and-related-projects)

---

This is a module used to perform queries, validation, and transformations on acyclic data, for example, but not limited to, JSON data. It can be used with custom types and supports hooks to type check and to create those custom types if the library itself does not suffice.

Please note that this is a very early version of the module. This is mostly a personal experiment that I'll be using in another project. I would not recommend using it in production, although I will be. It is likely the API and the DSL will change; however, I would expect things mostly to grow as opposed to being radically changed, at this point. If you have issues, please report them. If you have suggestions, please pass those along as well.

Note that I'm using Jison as the DSL's parser. It does not give friendly errors and I apologize for that. Future versions of this library are likely to use another parsing infrastructure.

# Installation

```npm install kld-data-transformer```

# Importing

The following sections indicate how you can import the code for use in various environments.

## Node

```javascript
import {Transformer} = require("kld-data-transformer");
```

## Browsers

```html
<script src="./node_modules/kld-data-transformer/dist/index-umd.js"></script>
<script>
  var Transformer = KldDataTransformer.Transformer;
</script>
```

## Modern Browsers (ESM)

```javascript
import {Transformer} from './node_modules/kld-data-transformer/dist/index-esm.js';
```

## Bundlers

```javascript
import {Transformer} from "kld-data-transformer";
```

# Usage

Define a normalization file. We'll save it as `ellipse.norm`. This DSL in this file describes the shape of your data and how to transform it into the format you prefer. Of course, you don't have to transform your data. These files can be used for querying and validation as well.

```javascript
type Ellipse = {
    center:
        Point2D(x, y) <=
                { center: { x: number, y: number } }
            |   { center: [ number as x, number as y ] }
            |   { cx: number as x, cy: number as y }
            |   { centerX: number as x, centerY: number as y },
    radii:
        Vector2D(rx, ry) <=
                { radii: { x: number as rx, y: number as ry } }
            |   { radii: [ number as rx, number as ry ] }
            |   { rx: number, ry: number }
            |   { radiusX: number as rx, radiusY: number as ry }
}
```

Now build a script to transform your data

```javascript
import fs from "fs";
import util from "util";
import Transformer from "kld-data-normalizer";

const transformer = new Transformer();
transformer.addDefinitionsFromSource(fs.readFileSync("./ellipse.norm", "utf-8"));
transformer.typeCreators.Point2D = (x, y) => { return {x, y} };
transformer.typeCreators.Vector2D = (u, v) => { return {u, v} };

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
    const result = transformer.transform(sample);

    console.log(`${util.inspect(sample)} => ${util.inspect(result)}`);
})
```

Each one of these structures is described in the `norm` file. They will be transformed to match the top-level definition of the Ellipse type. All results look like the following:

```JSON
{ "center": { "x": 10, "y": 20 }, "radii": { "u": 30, "v": 40 } }
```

Note that if a validation/transformation fails, `undefined` will be returned. Future versions of the library will give better diagnostic information so you can determine where the failure has occurred.

You may notice that the `norm` file references `Point2D` and `Vector2D`. Since these types are not defined in the `norm` file, these are considered external types which will need to be handler by user code. We register `typeCreators` in our example, using matching names. Those functions are passed the name of the type (in case you want to use the same handle for multiple types) and an array of arguments. The value returned will become the property's value upon successful validation and transformation. Note that if you would like to register a handler for all external types, you can use `*` as the type name.

Note that this is only a taste of what is possible. The tutorial is a work in progress, but it should give you some ideas of other constructs you can use within the language.

# Command Line

You can transform data from the command-line as well:

```bash
transform -n my-normalization-file.norm -j my-data-file.json -e 'type MyType'
```

If your normalization file needs to load type creators onto the normalizer, you can use the following:

```bash
transform -n my-normalization-file.norm -r my-normalization-module.js -j my-data-file.json -e 'type MyType'
```

All exported names in the module will be added ad type creators, using their exported names.

# Links and Related Projects

- WIP: [Guide](https://github.com/thelonious/kld-data-normalizer/blob/master/docs/guide.md)
