/* eslint-disable no-prototype-builtins */
/* eslint-disable global-require */
"use strict";
const assert = require('assert');
const kinesisEvents = require('../');
const RecordSet = require('../lib/RecordSet');

const fixtures = {
    json: require('./fixtures/json_records.json'),
    invalid: require('./fixtures/invalid_json_records.json'),
    basic: require('./fixtures/records.json')
};

describe('Module', () => {
    it('should export an instance of KinesisEvents', () => {
        assert(kinesisEvents.constructor.name === 'KinesisEvents');
    });
});

describe('KinesisEvents', () => {
    describe('Getters', () => {
        it('should have KinesisEvents getter', () => {
            assert(kinesisEvents.KinesisEvents);
            assert(kinesisEvents.KinesisEvents.constructor);
        });
        
        it('should have ParseError getter', () => {
            assert(kinesisEvents.ParseError);
            assert(kinesisEvents.ParseError.constructor);
        });
    });
    
    describe('parse()', () => {
        it('should have method parse()', () => {
            assert(typeof kinesisEvents.parse === 'function');
        });
        
        it('should parse records', () => {
            let result = kinesisEvents.parse(fixtures.json);
            assert(typeof result === 'object');
        });
        
        it('should parse non-json records', () => {
            let result = kinesisEvents.parse(fixtures.basic, false);
            assert(typeof result === 'object');
        });
        
        it('should return an instance of RecordSet', () => {
            let result = kinesisEvents.parse(fixtures.json);
            assert(result instanceof RecordSet);
        });
        
        it('should parse records and return an object', () => {
            let result = kinesisEvents.parse(fixtures.json.Records);
            assert(typeof result === 'object');
        });
        
        it('should convert non-array to array', () => {
            let result = kinesisEvents.parse(fixtures.json.Records[0]);
            assert(typeof result === 'object');
        });
        
        it('should transform records', () => {
            kinesisEvents.options.transform = (record) => {
                record.test = true;
                return record;
            };
            
            let result = kinesisEvents.parse(fixtures.json.Records);
            
            result.records.forEach(rec => {
                assert(rec.test);
            });
            kinesisEvents.options.transform = null;
        });
        
        it('should skip empty transformed records', () => {
            kinesisEvents.options.transform = () => {
                return null;
            };
            
            let result = kinesisEvents.parse(fixtures.json.Records);
            
            assert(result.records.length === 0);
            kinesisEvents.options.transform = null;
        });
        
        it('should skip invalid records', () => {
            let result = kinesisEvents.parse([{ kinesis: { data: '' } }, ...fixtures.json.Records]);
            assert(typeof result === 'object');
        });
        
        it('should parse json records', () => {
            let result = kinesisEvents.parse(fixtures.json.Records),
                example = {
                    hello: 'world', number: 10, test: true, obj: { id: 'abc123' }, arr: [1, 2, 3] 
                };

            assert(result.records.length === 5);
            assert(result.failed.length === 0);
            
            result.records.forEach(record => {
                assert.deepStrictEqual(record, example);
            });
        });
        
        it('should parse json with invalid records', () => {
            let example = {
                    hello: 'world', number: 10, test: true, obj: { id: 'abc123' }, arr: [1, 2, 3] 
                },
                result = kinesisEvents.parse(fixtures.invalid.Records);
            
            assert(result.records.length === 4);
            assert(result.failed.length === 1);

            result.records.forEach(record => {
                assert.deepStrictEqual(record, example);
            });
            
            assert(result.failed[0] instanceof Error);
        });
    });
    
    describe('_parseJSON()', () => {
        it('should have method _parseJSON()', () => {
            assert(typeof kinesisEvents._parseJSON === 'function');
        });
        
        it('should parse valid JSON', () => {
            let json = '{"test":"value"}',
                test = kinesisEvents._parseJSON(json);
                
            assert(typeof test === 'object');
            assert(test.hasOwnProperty('test'));
            assert(test.test === 'value');
        });
        
        it('should return error if invalid json', () => {
            let json = 'not valid',
                test = kinesisEvents._parseJSON(json);
            
            assert(test instanceof Error);
        });
    });
    
    describe('_decode()', () => {
        it('should have method _decode()', () => {
            assert(typeof kinesisEvents._decode === 'function');
        });
        
        it('should convert base64 to string', () => {
            let test = kinesisEvents._decode('dGVzdA==');
            
            assert.equal(test, 'test');
        });
        
        it('should return error if invalid type', () => {
            let str = 123,
                test = kinesisEvents._decode(str);
            
            assert(test instanceof Error);
        });
    });
});

describe('RecordSet', () => {
    const set = new RecordSet();
    set.add({});
    
    it('should have length getter', () => {
        assert(set.length === 1);
    });
    
    it('should have hasErrors getter', () => {
        assert(set.hasErrors === false);
    });
});
