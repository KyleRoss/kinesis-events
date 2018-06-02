"use strict";
const EventEmitter = require('events');
const parseJson = require('json-parse-better-errors');

class KinesisEvents extends EventEmitter {
    /**
     * Constructor for KinesisEvents
     * @return {KinesisEvents} Instance of KinesisEvents
     */
    constructor() {
        super();
    }
    
    /**
     * Parses records from Kinesis and returns a filtered array
     * @public
     * @param  {Array}   records Event data (records) to parse
     * @param  {Boolean} json    Enable/disable JSON parsing for each event (default `true`)
     * @return {Array}           The parsed events
     */
    parse(records, json = true) {
        if(records.Records) records = records.Records;
        if(!Array.isArray(records)) records = [records];
        
        let parsed = records.map(record => {
            let rec = this._decode(record.kinesis.data);
            if(!json || !rec) return rec;
            
            return this._toJSON(rec);
        });
        
        return {
            records: parsed.filter(rec => !!rec && !rec._isError),
            failed: parsed.filter(rec => !rec || rec._isError),
            total: records.length
        };
    }
    
    /**
     * Converts string to JSON safely
     * @param  {String} data String to parse to JSON
     * @return {Mixed}       The parsed JSON or Error if failed
     */
    _toJSON(data) {
        try {
            return parseJson(data);
        } catch(e) {
            return this._error(e, 'Unable to JSON parse event data', data);
        }
    }
    
    /**
     * Decodes compressed data into its original form safely
     * @param  {String}       data  Data to decode
     * @return {String|Error}       The decoded data or error if failed
     */
    _decode(data) {
        try {
            let decoded = new Buffer(data, 'base64').toString('utf8');
            return decoded;
        } catch(e) {
            return this._error(e, 'Unable to decode event data', data);
        }
    }
    
    /**
     * Compiles and emits an error
     * @param  {Error}  error Error in which was thrown
     * @param  {String} msg   Custom message to include in the error
     * @param  {Mixed}  data  Data at the point of failure
     * @return {Error}        The compiled error object
     */
    _error(error, msg, data) {
        msg = msg || 'Error parsing kinesis event';
        
        if(!error || typeof error === 'string')
            error = new Error(error || msg);
        
        error.message = `${msg} (${error.message})`;
        error.payload = data;
        error._isError = true;
        
        this.emit('parseError', error);
        
        return error;
    }
}

module.exports = new KinesisEvents();
