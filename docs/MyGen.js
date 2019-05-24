/**
 * MyGen
 *
 * @param {number} x
 * @param {number} y
 * @returns {Object}
 */
export function MyGen(x, y) {
    return {x, y, s: x + y, d: x - y};
}

/**
 * Partition an array into multiple arrays
 *
 * @param {Array} items
 * @param {number} count
 * @param {number} advance
 * @param {*} [missing=undefined]
 */
export function partition(items, count, advance, missing = undefined) {
    const {length} = items;
    const result = [];

    // default advance to count, if its not defined
    advance = advance === undefined ? count : advance;

    // we can't advance backwards and we always need to advance
    count = Math.max(1, count);
    advance = Math.max(1, advance);

    for (let i = 0; i < length; i += advance) {
        const part = [];
        let index = i;

        for (let j = 0; j < count; j++, index++) {
            part.push(index < length ? items[index] : missing);
        }

        result.push(part);
    }

    return result;
}
