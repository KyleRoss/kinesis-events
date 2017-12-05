# kinesis-events
[![npm](https://img.shields.io/npm/v/kinesis-events.svg?style=flat-square)](https://www.npmjs.com/package/kinesis-events) [![](https://img.shields.io/github/issues-raw/KyleRoss/kinesis-events.svg?style=flat-square)](https://github.com/KyleRoss/kinesis-events/issues) [![npm](https://img.shields.io/npm/dt/kinesis-events.svg?style=flat-square)](https://www.npmjs.com/package/kinesis-events) [![npm](https://img.shields.io/npm/dm/kinesis-events.svg?style=flat-square)](https://www.npmjs.com/package/kinesis-events) [![npm](https://img.shields.io/npm/l/kinesis-events.svg?style=flat-square)](https://www.npmjs.com/package/kinesis-events)

AWS Kinesis event parser and handler for Lambda consumers. Ability to parse events synchronous or asynchronous with error handling and JSON support. Supports Node 6.10+ on AWS Lambda.

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
    kinesisEvents.on('error', function(err) {
        console.error(err);
        console.log(err.payload);
        
        process.exit(1);
    });
    
    // Parse the records
    let records = kinesisEvents.parse(event.Records);
    
    records.forEach(function(record) {
        //... iterate through the parsed records
    });
};
```

### Asynchronous API
```js
const kinesisEvents = require('kinesis-events');

// Lambda function handler
exports.handler = function(event, context, callback) {
    kinesisEvents.parseAsync(event.Records, function(record, next) {
        //... do something with the parsed record
        
        // Call next with an error if you want to stop processing and call the callback
        next();
    }, function(error) {
        if(error) {
            console.error(error);
            // Optionally kill the process if there was an error
            return process.exit(1);
        }
        
        console.log('Completed successfully!');
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
Parses records from Kinesis event synchronously and returns an array of parsed records. You should pass in `event.Records` as `records` to this function. This function will parse all records before returning a new array.

| Parameter | Required? | Type    | Description                                                 | Default |
|-----------|-----------|---------|-------------------------------------------------------------|---------|
| `records` | Yes       | Array   | The events sent in to the Lambda function (`event.Records`) | --      |
| `json`    | No        | Boolean | Enable or disable JSON parsing of records                   | `true`  |

**Example:**
```js
exports.handler = function(event, context, callback) {
    let records = kinesisEvents.parse(event.Records);
    
    records.forEach(function(record) {
        // do something with each record
    });
};
```

**Returns:** _Array_ An array of parsed records.

#### parseAsync(records, iterator, callback[, json = true])
Similar to `parse()`, this function parses records asynchronously and calls the `iterator` function for each one. If a record fails to be parsed, it will immediately stop processing and call the `callback` function with the error. Unlike `parse()`, this method parses records as it iterates through them. Any errors returned will contain the custom properties of [Error](#errors).

| Parameter  | Required? | Type     | Description                                                                                                                  | Default |
|------------|-----------|----------|------------------------------------------------------------------------------------------------------------------------------|---------|
| `records`  | Yes       | Array    | The events sent in to the Lambda function (`event.Records`)                                                                  | --      |
| `iterator` | Yes       | Function | An iterator function that is called for each parsed record. Called with `(record, next)`                                     | --      |
| `callback` | Yes       | Function | A function to call when all records are completed through the iterator or if an error occurs. Called with `(error, records)` | --      |
| `json`     | No        | Boolean  | Enable or disable JSON parsing of records                                                                                    | `true`  |

**Example:**
```js
exports.handler = function(event, context, callback) {
    kinesisEvents.parseAsync(event.Records, function iteratorFunction(record, next) {
        // do something with the record
        
        // if successful, call `next()` otherwise call `next(error)` with an error to stop processing an call the callback function
        next();
    }, function completeCallback(error) {
        if(error) {
            console.error(error);
            // optionally stop the process on an error:
            return process.exit(1);
        }
        
        console.log('processing complete!');
    });
};
```

**Returns:** _Undefined_

### Properties
#### failed _Number_
The number of failed records while processing.

**Example:**
```js
// call parse() or parseAsync()...

console.log(`There were ${kinesisEvents.failed} record(s) that failed to be processed`);
```

#### KinesisEvents _Class_
Access to the uninstantiated KinesisEvents class. Useful to create new instances of KinesisEvents or override/extend the module.

### Events
#### error
Event in which is triggered when a parsing error occurs. The callback is called with `error`. This is mostly use with the synchronous API in order to capture errors along with having the ability to stop/crash the process in the event there was an error (so AWS can retry the consumer for those records).

**Example:**
```js
kinesisEvents.on('error', function(error) {
    console.error(error);
});
```

### Errors
Errors returned from `kinesis-events` will be a standard `Error` object with additional properties:

#### error.payload
**Type:** String

The data payload in which failed to be parsed.

### Private API
The following methods are not meant to be called directly in a normal implementation, but are documented here in case they need to be overridden or used in advanced cases.

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
MIT License

Copyright (c) 2017 Kyle Ross

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
