# kld-data-transformer

- [Installation](#installation)
- [Importing](#importing)
- [Usage](#usage)
- [Command Line](#command-line)
- [Links and Related Projects](#links-and-related-projects)

---

kld-data-transformer defines a DSL (Domain Specific Language) used to transform acyclic Javascript data into other formats. Incoming data can be pattern matched, capturing key elements in the data, and then transformed into new structures, using the captured data or more. This is currently being used in [kld-intersections](https://github.com/thelonious/kld-intersections) to allow users to describe geometric shapes in a wide variety of formats.

Note that I'm using Jison as the DSL's parser. It does not give friendly errors and I apologize for that. Future versions of this library are likely to use another parsing infrastructure.

# Installation

```npm install kld-data-transformer```

# Importing

The following sections indicate how you can import the code for use in various environments.

## Node

```javascript
const {Transformer} = require("kld-data-transformer");
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

We begin by defining a transformation file, which we'll save the text below as `ellipse.dt`:

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

This script begins by describing the final shape of data we wish to have. In this case, our final data will be an object with two properties: center and radii. Center will be the result of calling a user-defined function named Point2D passing in two values: x and y. Likewise, radii will be a Vector2D using values rx and ry. The x and y values for center are captured from one of four pattern matches; the first of which succeeds determines the captured values for x and y.

Now to use this script, we write a little Javascript:

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

The above code creates a new transform, adds user-defined functions for Point2D and Vector2D. this attempts to transform a series of objects, printing out the result of the transformation. Since the purpose of the this example is to normalize our incoming data, all results looks like this:

```JSON
{ "center": { "x": 10, "y": 20 }, "radii": { "u": 30, "v": 40 } }
```

For a more in-depth description of the data-transform format, be sure to have a look at a ![the Guide](docs/guide.md).

# Command Line

You can transform data from the command-line as well:

```bash
transform -d my-definitions-script.dt -j my-data-file.json -e 'type MyType'
```

If your normalization file needs to load type creators into the normalizer, you can use the following:

```bash
transform -d my-definitions-script.dt -r my-normalization-module.js -j my-data-file.json -e 'type MyType'
```

If your data is an array of objects to test, you can add the `-a` option to test each element separately:

```bash
transform -d my-definitions-script.dt -r my-normalization-module.js -j my-data-file.json -a -e 'type MyType'
```

All exported names in the module will be added as type creators, using their exported names.

# Links and Related Projects

- WIP: [Guide](https://github.com/thelonious/kld-data-normalizer/blob/master/docs/guide.md)
- [kld-intersections](https://github.com/thelonious/kld-intersections)