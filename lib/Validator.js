/**
 *  Validator.js
 *
 *  @copyright 2019, Kevin Lindsey
 *  @module Validator
 */

function log(msg) {
    console.log(msg);
}

export default class Validator {
    constructor(validation) {
        this.types = {};
        this.typeCheckers = {
            number: (value, type) => typeof value === "number"
        };
        this.typeCreators = {};

        validation.forEach(typeDescription => {
            this.types[typeDescription.name] = typeDescription;
        });
    }

    validate(structure, asType) {
        if (asType in this.types) {
            const typeDescriptor = this.types[asType];
            const result = {};

            // compare against
            for (const group of typeDescriptor.objectDescription) {
                const {name, instantiation, transformGroups: groups} = group;

                if (groups.length > 0) {
                    log(`process groups for '${name}'`);

                    for (const g of groups) {
                        const locals = {};
                        let success = true;

                        for (const entry of g) {
                            log(`  test '${entry.name}'`);
                            for (const match of entry.matches) {
                                log(`    test against type '${match.type}'`);

                                if (this.typeCheck(structure[entry.name], match.type)) {
                                    log(`    save '${entry.name}' into '${match.assignment}' local`);
                                    locals[match.assignment] = structure[entry.name];
                                }
                                else {
                                    success = false;
                                    break;
                                }
                            }

                            // if we had a failure in this group, then go to the next one
                            if (!success) {
                                log("    group failed, advancing to next group");
                                break;
                            }
                        }

                        if (success) {
                            log("  successfully matched group");

                            const args = instantiation.args.map(arg => locals[arg]);

                            result[name] = this.createType(instantiation.name, args);
                        }
                    }

                }
                else if (name in structure) {
                    switch (instantiation.mode) {
                        case "type-reference":
                            if (this.typeCheck(structure[name], instantiation.name)) {
                                result[name] = structure[name];
                            }
                            break;
                        default:
                            console.log(`unknown instantiation mode: '${instantiation.mode}'`);
                    }
                }
            }

            return result;
        }

        throw new TypeError(`Unknown type ${asType}`);
    }

    typeCheck(value, type) {
        if (type in this.typeCheckers) {
            return this.typeCheckers[type](value, type);
        }
        else if ("*" in this.typeCheckers) {
            return this.typeCheckers["*"](value, type);
        }

        return false;
    }

    createType(type, args) {
        if (type in this.typeCreators) {
            return this.typeCreators[type](type, args);
        }
        else if ("*" in this.typeCreators) {
            return this.typeCreators["*"](type, args);
        }

        return null;
    }
}
