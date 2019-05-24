/**
 * Predicate to determine if an item is an object
 *
 * @param {*} item
 * @returns {boolean}
 */
function isObject(item) {
    return item !== null && typeof item === "object"
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
    /* eslint-disable-next-line no-shadow */
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

/**
 * Return a list of keys from an object
 *
 * @param {Object} item
 * @returns {string[]}
 */
export function keys(item) {
    /* eslint-disable-next-line compat/compat */
    return isObject(item) ? Object.keys(item) : [];
}

/**
 * Return a list of values from an object
 *
 * @param {Object} item
 * @returns {any[]}
 */
export function values(item) {
    /* eslint-disable-next-line compat/compat */
    return isObject(item) ? Object.values(item) : [];
}
