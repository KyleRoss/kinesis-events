"use strict";
const { ParseError } = require('./errors');

/**
 * A set of parsed records with additional functionality.
 */
class RecordSet {
    constructor() {
        /**
         * The records within this record set.
         * @type {Array}
         */
        this.records = [];
        /**
         * List of failed records (ParseError).
         * @type {ParseError[]}
         */
        this.failed = [];
    }
    
    /**
     * The total number of parsed records in the record set.
     * @type {Number}
     * @readonly
     */
    get length() {
        return this.records.length;
    }
    
    /**
     * Boolean flag if this record set has failed records.
     * @type {Boolean}
     * @readonly
     */
    get hasErrors() {
        return !!this.failed.length;
    }
    
    /**
     * Adds a record to the record set.
     * @ignore
     * @param {*} record The record to add to the set.
     * @returns {RecordSet} The instance of RecordSet.
     */
    add(record) {
        if(record instanceof ParseError) {
            this.failed.push(record);
        } else {
            this.records.push(record);
        }
        
        return this;
    }
}

module.exports = RecordSet;
