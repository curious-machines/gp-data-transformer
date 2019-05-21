export function Point2D(x, y) {
    return {x, y};
}

export function Vector2D(x, y) {
    return {x, y};
}

export function ListOfPoints(ps) {
    const result = [];

    for (let i = 0; i < ps.length; i += 2) {
        const x = ps[i];
        const y = ps[i + 1];

        result.push(Point2D(x, y));
    }

    return result;
}
