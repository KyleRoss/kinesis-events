"use strict";
const RecordSet = require('./RecordSet');
const { ParseError } = require('./errors');
const parseJson = require('json-parse-better-errors');

/**
 * @typicalname kinesisEvents
 */
class KinesisEvents {
    /**
     * Constructor for KinesisEvents.
     * @constructor
     * @param {Object} [options={}] Options object to control certain features of KinesisEvents.
     * @param {Function} [options.transform(record, index)] Optional transform function to call for each record. See [Transform Function](#transform-function).
     */
    constructor(options) {
        /**
         * Options object for KinesisEvents. Allows overridding options after instantiation.
         * @type {Object}
         * @example 
         * kinesisEvents.options.transform = function(record, index) {
         *     // transform record...
         *     return record;
         * };
         */
        this.options = Object.assign({
            transform: null
        }, options || {});
    }
    
    /**
     * Access to the uninstantiated KinesisEvents class.
     * @ignore
     * @readonly
     */
    get KinesisEvents() {
        return KinesisEvents;
    }
    
    /**
     * Access to the ParseError class.
     * @type {ParseError}
     * @readonly
     */
    get ParseError() {
        return ParseError;
    }
    
    /**
     * Parses records from the incoming Kinesis event.
     * @param  {Array}   records Event data (records) to parse.
     * @param  {Boolean} [json=true] Enable/disable JSON parsing for each event.
     * @return {RecordSet} New instance of RecordSet with the parsed records.
     * 
     * @example 
     * const result = kinesisEvents.parse(event.Records);
     * 
     * result.records.forEach(record => {
     *     // do something with each record...
     * });
     */
    parse(records, json=true) {
        if(records.Records) records = records.Records;
        if(!Array.isArray(records)) records = [records];
        
        const recordSet = new RecordSet();
        
        records.forEach((record, idx) => {
            let rec = this._decode(record.kinesis.data);
            if(!rec) return;
            if(json && !(rec instanceof ParseError)) rec = this._parseJSON(rec);
            
            if(typeof this.options.transform === 'function') {
                rec = this.options.transform.call(this, rec, idx);
            }
            
            if(rec) recordSet.add(rec);
        });
        
        return recordSet;
    }
    
    /**
     * Converts string to JSON safely with better error handling.
     * @private 
     * @param  {String} data String to parse to JSON.
     * @return {*} The parsed JSON or ParseError if failed.
     */
    _parseJSON(data) {
        try {
            return parseJson(data);
        } catch(e) {
            return new ParseError(e, data);
        }
    }
    
    /**
     * Decodes compressed data into its original form safely.
     * @private 
     * @param  {String} data  Data to decode.
     * @return {String|ParseError} The decoded data or error if failed.
     */
    _decode(data) {
        try {
            return Buffer.from(data, 'base64').toString('utf8');
        } catch(e) {
            return new ParseError(e, data);
        }
    }
}

module.exports = KinesisEvents;
