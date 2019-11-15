"use strict";

/**
 * Custom error that is generated when there is a parsing error.
 * @extends {Error}
 */
class ParseError extends Error {
    constructor(error, payload) {
        super(error.message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        
        /**
         * The original data that caused the error.
         * @type {String}
         */
        this.payload = payload;
    }
}

module.exports = {
    ParseError
};
