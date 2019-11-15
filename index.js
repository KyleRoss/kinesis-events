"use strict";
/**
 * @module kinesis-events
 */

const KinesisEvents = require('./lib/KinesisEvents');

/**
 * Instance of the [KinesisEvents](#kinesisevents) class which is exported when calling `require('kinesis-events')`.
 * For more advanced usage, you may create a new instance of KinesisEvents (see example below).
 * @type KinesisEvents
 * @kind KinesisEvents Instance
 * @alias module:kinesis-events
 * 
 * @example 
 * const kinesisEvents = require('kinesis-events');
 * 
 * // Advanced usage
 * const { KinesisEvents } = require('kinesis-events');
 * const kinesisEvents = new KinesisEvents({
 *     // options...
 * });
 */
const kinesisEvents = new KinesisEvents();
module.exports = kinesisEvents;
