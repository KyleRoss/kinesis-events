# kinesis-events
[![npm](https://img.shields.io/npm/v/kinesis-events.svg?style=for-the-badge)](https://www.npmjs.com/package/kinesis-events) [![npm](https://img.shields.io/npm/dt/kinesis-events.svg?style=for-the-badge)](https://www.npmjs.com/package/kinesis-events) [![David](https://img.shields.io/david/KyleRoss/kinesis-events.svg?style=for-the-badge)](https://david-dm.org/KyleRoss/kinesis-events) [![Travis](https://img.shields.io/travis/KyleRoss/kinesis-events/master.svg?style=for-the-badge)](https://travis-ci.org/KyleRoss/kinesis-events) [![license](https://img.shields.io/github/license/KyleRoss/kinesis-events.svg?style=for-the-badge)](https://github.com/KyleRoss/kinesis-events/blob/master/LICENSE) [![Beerpay](https://img.shields.io/beerpay/KyleRoss/kinesis-events.svg?style=for-the-badge)](https://beerpay.io/KyleRoss/kinesis-events)

AWS Kinesis event parser and handler for Lambda consumers. Ability to parse kinesis events with error handling and JSON support. Supports Node 8.10+ on AWS Lambda.

---

## Install
```bash
npm i --save kinesis-events
```

## Usage
```js
const kinesisEvents = require('kinesis-events');

// Lambda function handler
exports.handler = async event => {
    // Parse the records
    const result = kinesisEvents.parse(event);
    
    // Check for errors (optional)
    if(result.hasErrors) {
        console.error('There are errors while parsing, ending process...');
        process.exit(1);
    }
    
    result.records.forEach(record => {
        //... iterate through the parsed records
    });
};
```

---

# API Documentation
<a name="module_kinesis-events"></a>

## kinesis-events
<a name="exp_module_kinesis-events--kinesisEvents"></a>

### kinesisEvents : [<code>KinesisEvents</code>](#KinesisEvents) ⏏
Instance of the [KinesisEvents](#kinesisevents) class which is exported when calling `require('kinesis-events')`.
For more advanced usage, you may create a new instance of KinesisEvents (see example below).

**Kind**: Exported KinesisEvents Instance  
**Example**  
```js
const kinesisEvents = require('kinesis-events');

// Advanced usage
const { KinesisEvents } = require('kinesis-events');
const kinesisEvents = new KinesisEvents({
    // options...
});
```
<a name="ParseError"></a>

## ParseError ⇐ <code>Error</code>
Custom error that is generated when there is a parsing error.

**Kind**: global class  
**Extends**: <code>Error</code>  
<a name="ParseError+payload"></a>

### parseError.payload : <code>String</code>
The original data that caused the error.

**Kind**: instance property of [<code>ParseError</code>](#ParseError)  
<a name="KinesisEvents"></a>

## KinesisEvents
**Kind**: global class  

* [KinesisEvents](#KinesisEvents)
    * [new KinesisEvents([options])](#new_KinesisEvents_new)
    * [kinesisEvents.options](#KinesisEvents+options) : <code>Object</code>
    * [kinesisEvents.ParseError](#KinesisEvents+ParseError) : [<code>ParseError</code>](#ParseError)
    * [kinesisEvents.parse(records, [json])](#KinesisEvents+parse) ⇒ [<code>RecordSet</code>](#RecordSet)

<a name="new_KinesisEvents_new"></a>

### new KinesisEvents([options])
Constructor for KinesisEvents.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>Object</code> | <code>{}</code> | Options object to control certain features of KinesisEvents. |
| [options.transform(record, index)] | <code>function</code> |  | Optional transform function to call for each record. See [Transform Function](#transform-function). |

<a name="KinesisEvents+options"></a>

### kinesisEvents.options : <code>Object</code>
Options object for KinesisEvents. Allows overridding options after instantiation.

**Kind**: instance property of [<code>KinesisEvents</code>](#KinesisEvents)  
**Example**  
```js
kinesisEvents.options.transform = function(record, index) {
    // transform record...
    return record;
};
```
<a name="KinesisEvents+ParseError"></a>

### kinesisEvents.ParseError : [<code>ParseError</code>](#ParseError)
Access to the ParseError class.

**Kind**: instance property of [<code>KinesisEvents</code>](#KinesisEvents)  
**Read only**: true  
<a name="KinesisEvents+parse"></a>

### kinesisEvents.parse(records, [json]) ⇒ [<code>RecordSet</code>](#RecordSet)
Parses records from the incoming Kinesis event.

**Kind**: instance method of [<code>KinesisEvents</code>](#KinesisEvents)  
**Returns**: [<code>RecordSet</code>](#RecordSet) - New instance of RecordSet with the parsed records.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| records | <code>Array</code> |  | Event data (records) to parse. |
| [json] | <code>Boolean</code> | <code>true</code> | Enable/disable JSON parsing for each event. |

**Example**  
```js
const result = kinesisEvents.parse(event.Records);

result.records.forEach(record => {
    // do something with each record...
});
```
<a name="RecordSet"></a>

## RecordSet
A set of parsed records with additional functionality.

**Kind**: global class  

* [RecordSet](#RecordSet)
    * [recordSet.records](#RecordSet+records) : <code>Array</code>
    * [recordSet.failed](#RecordSet+failed) : [<code>Array.&lt;ParseError&gt;</code>](#ParseError)
    * [recordSet.length](#RecordSet+length) : <code>Number</code>
    * [recordSet.hasErrors](#RecordSet+hasErrors) : <code>Boolean</code>

<a name="RecordSet+records"></a>

### recordSet.records : <code>Array</code>
The records within this record set.

**Kind**: instance property of [<code>RecordSet</code>](#RecordSet)  
<a name="RecordSet+failed"></a>

### recordSet.failed : [<code>Array.&lt;ParseError&gt;</code>](#ParseError)
List of failed records (ParseError).

**Kind**: instance property of [<code>RecordSet</code>](#RecordSet)  
<a name="RecordSet+length"></a>

### recordSet.length : <code>Number</code>
The total number of parsed records in the record set.

**Kind**: instance property of [<code>RecordSet</code>](#RecordSet)  
**Read only**: true  
<a name="RecordSet+hasErrors"></a>

### recordSet.hasErrors : <code>Boolean</code>
Boolean flag if this record set has failed records.

**Kind**: instance property of [<code>RecordSet</code>](#RecordSet)  
**Read only**: true  
## Transform Function
New in v3.0.0, there is now an option to pass in a transform function that will allow you to transform the record before it is added to the RecordSet. This allows custom functionality or business logic to be implemented at a higher level.

The transform function takes 2 arguments, `record` and `index`. The function must return the transformed record in order for it to be added to the RecordSet. If the record is not returned from the function, it will be ignored.

```js
const { KinesisEvents } = require('kinesis-events');
const kinesisEvents = new KinesisEvents({
    transform: (record, index) => {
        if(record.firstName && record.lastName) {
            // example, remove record if data is missing
            return null;
        }
        
        record.someCustomProperty = 'some custom value';
        return record;
    }
});
```

---

## Tests
Tests are written and provided as part of the module. It requires mocha to be installed which is included as a `devDependency`. You may run the tests by calling:

```bash
$ npm run test
```

## License
MIT License. See [License](https://github.com/KyleRoss/kinesis-events/blob/master/LICENSE) in the repository.
