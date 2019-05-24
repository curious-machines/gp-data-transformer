// General functions

/**
 * Return the type name of the specified item
 *
 * @param {*} item
 * @returns {string}
 */
export function typeName(item) {
    switch (item) {
        case null:
            return "null";
        case undefined:
            return "undefined";
        default:
            if (Array.isArray(item)) {
                return "array";
            }

            return typeof item;
    }
}

// Array related functions

/**
 * Combine multiple arrays into a single array
 *
 * @param {Array<Array>} lists
 * @param {*} [missing=undefined]
 * @returns {Array}
 */
export function zip(lists, missing = undefined) {
    const result = [];

    if (Array.isArray(lists) && lists.length > 0 && lists.every(l => Array.isArray(l))) {
        const maxLength = Math.max(...lists.map(l => l.length));

        for (let i = 0; i < maxLength; i++) {
            const part = [];

            for (const list of lists) {
                part.push(i < list.length ? list[i] : missing);
            }

            result.push(part);
        }
    }


    return result;
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

// Object related functions

/**
 * Predicate to determine if an item is an object
 *
 * @param {*} item
 * @returns {boolean}
 */
function isObject(item) {
    return item !== null && typeof item === "object";
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
