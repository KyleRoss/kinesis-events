# kinesis-events
[![npm](https://img.shields.io/npm/v/kinesis-events.svg?style=for-the-badge)](https://www.npmjs.com/package/kinesis-events) [![npm](https://img.shields.io/npm/dt/kinesis-events.svg?style=for-the-badge)](https://www.npmjs.com/package/kinesis-events) [![David](https://img.shields.io/david/KyleRoss/kinesis-events.svg?style=for-the-badge)](https://david-dm.org/KyleRoss/kinesis-events) [![Travis](https://img.shields.io/travis/KyleRoss/kinesis-events/master.svg?style=for-the-badge)](https://travis-ci.org/KyleRoss/kinesis-events) [![license](https://img.shields.io/github/license/KyleRoss/kinesis-events.svg?style=for-the-badge)](https://github.com/KyleRoss/kinesis-events/blob/master/LICENSE) [![Beerpay](https://img.shields.io/beerpay/KyleRoss/kinesis-events.svg?style=for-the-badge)](https://beerpay.io/KyleRoss/kinesis-events)

AWS Kinesis event parser and handler for Lambda consumers. Ability to parse kinesis events with error handling and JSON support. Supports Node 6.10+ on AWS Lambda.

---

## Install
```bash
npm install kinesis-events --save
```

## Usage
### Synchronous API
```js
const kinesisEvents = require('kinesis-events');

// Lambda function handler
exports.handler = function(event, context, callback) {
    // Force fail on record parsing error (optional)
    kinesisEvents.on('parseError', function(err) {
        console.error(err);
        console.log(err.payload);
        
        process.exit(1);
    });
    
    // Parse the records
    let { records } = kinesisEvents.parse(event);
    
    records.forEach(function(record) {
        //... iterate through the parsed records
    });
};
```

---

## API Documentation

### Public Methods
#### KinesisEvents() _Class_
The exported class for `kinesis-events`. By default, the module exports an instance of this class. `KinesisEvents` extends [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter).

```js
// kinesisEvents is an instance of the KinesisEvents class
const kinesisEvents = require('kinesis-events');
```

#### parse(records[, json = true])
Parses records from Kinesis event synchronously and returns an array of parsed records. You may pass in `event` or `event.Records` as `records` to this function. This function will parse all records before returning the results object.

| Parameter | Required? | Type    | Description                                                            | Default |
|-----------|-----------|---------|------------------------------------------------------------------------|---------|
| `records` | Yes       | Array   | The events sent in to the Lambda function (`event` or `event.Records`) | --      |
| `json`    | No        | Boolean | Enable or disable JSON parsing of records                              | `true`  |

**Example:**
```js
exports.handler = function(event, context, callback) {
    let { records, failed, total } = kinesisEvents.parse(event.Records);
    
    // Iterate over parsed records
    records.forEach(function(record) {
        // do something with each record
    });
};
```
###### Returns: _Object_
> Returns an object with `records` (array of parsed records), `failed` (array of [error objects](#errors)), and `total` (count of total records passed in).


### Events
#### parseError
Event in which is triggered when a parsing error occurs. The callback is called with `error`. This is mostly used in order to capture errors along with having the ability to stop/crash the process in the event there was an error (so AWS can retry the consumer for those records).

**Example:**
```js
kinesisEvents.on('parseError', function(error) {
    console.error(error);
});
```

### Errors
Errors returned from `kinesis-events` will be a standard `Error` object with additional properties:

#### error.payload
**Type:** Mixed

The data payload in which failed to be parsed.

### Private API
The following methods are not meant to be called directly in a normal implementation, but are documented here in case they need to be used in advanced cases.

#### _decode(data)
Decodes the provided event (`data`) into its original form safely. Since the events are base64 encoded when they are provided to the Lambda function, this decodes them into its original format.

**Returns:** _String|Error_ The decoded string or [Error](#errors) if it failed.

#### _toJSON(data)
Safely converts a string to JSON.

**Returns:** _Mixed|Error_ The parsed JSON (object, array, etc.) or [Error](#errors) if it failed.

#### _error(error, msg, data)
Manipulates `error` with provided `msg` and adds custom properties defined in [Errors](#errors).

**Returns:** _Error_ The error object

---

## Contributing
Feel free to submit a pull request if you find any issues or want to integrate a new feature. Keep in mind, this module should be lightweight and advanced functionality should be published to NPM as a wrapper around this module. The code should work without any special flags in Node 6.10.

## License
MIT License. See [License](https://github.com/KyleRoss/kinesis-events/blob/master/LICENSE) in the repository.
