/**
 *  Validator.js
 *
 *  @copyright 2019, Kevin Lindsey
 *  @module Validator
 */

export default class Validator {
    constructor(validation) {
        this.types = {};

        validation.forEach(typeDescription => {
            this.types[typeDescription.typeName] = typeDescription;
        });
    }

    validate(structure, asType) {
        if (asType in this.types) {
            const typeDescriptor = this.types[asType];

            return typeDescriptor.properties.every(property => this.validateProperty(structure, property));
        }
        else {
            throw new TypeError(`Unknown type ${asType}`);
        }
    }

    validateProperty(structure, property) {
        return property.descriptions.some(propertyGroup => this.validatePropertyGroup(structure, propertyGroup));
    }

    validatePropertyGroup(structure, propertyGroup) {
        return propertyGroup.every(property => {
            return property.names.some(propertyName => propertyName in structure);
        });
    }
}
