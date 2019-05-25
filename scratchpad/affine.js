function Point2D(x, y) {
    return {x, y};
}

function Vector2D(x, y) {
    return {x, y};
}

function ListOfCoords(ps) {
    const result = [];

    for (let i = 0; i < ps.length; i += 2) {
        const x = ps[i];
        const y = ps[i + 1];

        result.push(Point2D(x, y));
    }

    return result;
}

function ListOfPoints(ps) {
    return ps.map(p => new Point2D(p.x, p.y));
}

module.exports = {
    Point2D: Point2D,
    Vector2D: Vector2D,
    ListOfCoords: ListOfCoords,
    ListOfPoints: ListOfPoints
}
