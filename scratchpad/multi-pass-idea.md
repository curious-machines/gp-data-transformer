# Goal

- End up with a rectangle with two points: topLeft, bottomRight
- Data can come in as separate x/y values
- Data can come in as x/y and w/h
- Data can come in as topLeft and bottomRight

# Idea

Maybe allow for multiple passes over the data. The second to last pass would guarantee a distinct set of properties. Since these properties would be mutually exclusive, the final calculations could involve multiple fields

# Attempts

{ x: 10, y: 20, w: 30, h: 40 } =>
  { p1x: x, p1y: y, p2x: x + w, p2y: y + h } =>
  { topLeft: Point2D(p1x, p1y), bottomRight: Point2D(p2x, p2y) }

{ topLeft: Point2D(10, 20), bottomRight: Point2D(40, 60) } =>
  { p1x: topLeft.x, p1y: topLeft.y, p2x: bottomRight.x, p2y: bottomRight.y } =>
  { topLeft: Point2D(p1x, p1y), bottomRight: Point2D(p2x, p2y) }

## 2nd to last structure

type Rectangle2 = {
    p1x {
        x: number
        { x: number, _: number }
        [ x: number, _: number ]
    }
    p1y {
        y: number
        { _: number, y: number }
        [ _: number, y: number ]
    }
    p2x {
        w: number ?
        width: number ?
        { x: number, _: number }
        [ x: number, _: number ]
    }
    p2y {
        h: number ?
        height: number ?
        { _: number, y: number }
        [ _: number, y: number ]
    }
}

## Last structure

We know the incoming object is of type Rectangle2, so we can access those properties directly

type RectangleFinal = {
    topLeft <= Point2D(p1x, p1y)
    bottomRight <= Point2D(p2x, p2y)
}

# Reference

type Rectangle = {
    topLeft <= Point2D(x, y) {
        topLeft: { x: number, y: number }
        topLeft: [ number as x, number as y ]
        group {
            x: number
            y: number
        }
    }
    bottomRight <= Point2D(x, y) {
        bottomRight: { x: number, y: number }
        bottomRight: [ number as x, number as y ]
        group {
            width: number
            height: number
        }
    }
}

