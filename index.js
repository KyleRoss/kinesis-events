"use strict";
const EventEmitter = require('events');

class KinesisEvents extends EventEmitter {
    /**
     * Constructor for KinesisEvents
     * @return {KinesisEvents} Instance of KinesisEvents
     */
    constructor() {
        super();
        /**
         * The number of failed parsed records
         * @type {Number}
         */
        this.failed = 0;
        /**
         * Access to the uninstantiated KinesisEvents class
         * @type {Class}
         */
        this.KinesisEvents = KinesisEvents;
    }
    
    /**
     * Parses records from Kinesis and returns a filtered array
     * @public
     * @param  {Array}   records Event data (records) to parse
     * @param  {Boolean} json    Enable/disable JSON parsing for each event (default `true`)
     * @return {Array}           The parsed events
     */
    parse(records, json = true) {
        return records.map(record => {
            let rec = this._decode(record.kinesis.data);
            if(!json || !rec || rec._isError) return rec;
            
            return this._toJSON(rec);
        }).filter(rec => !!rec || !rec._isError);
    }
    
    }
    
    /**
     * Converts string to JSON safely
     * @param  {String} data String to parse to JSON
     * @return {Mixed}       The parsed JSON or Error if failed
     */
    _toJSON(data) {
        try {
            let json = JSON.parse(data);
            return json;
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
        
        this.failed += 1;
        this.emit('error', error);
        
        return error;
    }
}

module.exports = new KinesisEvents();
