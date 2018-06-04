const assert = require('assert');
const kinesisEvents = require('../');

const fixtures = {
    json: require('./fixtures/json_records.json'),
    invalid: require('./fixtures/invalid_json_records.json'),
    basic: require('./fixtures/records.json')
};

describe ('Exports', () => {
    it('should export an instance of KinesisEvents', () => {
        assert(kinesisEvents.constructor.name === 'KinesisEvents');
    });
    
    it ('should extend EventEmitter', () => {
        assert(Object.getPrototypeOf(kinesisEvents.constructor).name === 'EventEmitter');
        assert(typeof kinesisEvents.on === 'function');
        assert(typeof kinesisEvents.emit === 'function');
    });
});

describe ('Methods', () => {
    describe ('parse()', () => {
        it('should have method parse()', () => {
            assert(typeof kinesisEvents.parse === 'function');
        });
        
        it('should parse records', () => {
            let result = kinesisEvents.parse(fixtures.json);

            assert(typeof result === 'object');
            assert(result.hasOwnProperty('records'));
            assert(Array.isArray(result.records));
            assert(result.hasOwnProperty('failed'));
            assert(Array.isArray(result.failed));
        });
        
        it ('should parse records and return an object', () => {
            let result = kinesisEvents.parse(fixtures.json.Records);
            
            assert(typeof result === 'object');
            assert(result.hasOwnProperty('records'));
            assert(Array.isArray(result.records));
            assert(result.hasOwnProperty('failed'));
            assert(Array.isArray(result.failed));
        });
        
        it('should parse json records', () => {
            let result = kinesisEvents.parse(fixtures.json.Records),
                example = { hello: 'world', number: 10, test: true, obj: { id: 'abc123' }, arr: [1, 2, 3] };

            assert(result.records.length === 5);
            assert(result.failed.length === 0);
            
            result.records.forEach(record => {
                assert.deepStrictEqual(record, example);
            });
        });
        
        it('should parse json with invalid records', () => {
            let example = { hello: 'world', number: 10, test: true, obj: { id: 'abc123' }, arr: [1, 2, 3] },
                result = kinesisEvents.parse(fixtures.invalid.Records);
            
            assert(result.records.length === 4);
            assert(result.failed.length === 1);

            result.records.forEach(record => {
                assert.deepStrictEqual(record, example);
            });
            
            assert(result.failed[0] instanceof Error);
        });
    });
    
    describe('_toJSON()', () => {
        it('should have method _toJSON()', () => {
            assert(typeof kinesisEvents._toJSON === 'function');
        });
        
        it ('should parse valid JSON', () => {
            let json = '{"test":"value"}',
                test = kinesisEvents._toJSON(json);
                
            assert(typeof test === 'object');
            assert(test.hasOwnProperty('test'));
            assert(test.test === 'value');
        });
        
        it('should return error if invalid json', () => {
            let json = 'not valid',
                test = kinesisEvents._toJSON(json);
            
            assert(test instanceof Error);
        });
    });
    
    describe('_decode()', () => {
        it('should have method _decode()', () => {
            assert(typeof kinesisEvents._decode === 'function');
        });
        
        it ('should convert base64 to string', () => {
            let test = kinesisEvents._decode('dGVzdA==');
            
            assert.equal(test, 'test');
        });
    });
    
    describe('_error()', () => {
        it('should have method _error()', () => {
            assert(typeof kinesisEvents._error === 'function');
        });
        
        it ('should generate error with custom properties', () => {
            let err = kinesisEvents._error(new Error('test'), 'Test Error', { test: 'test' });
            
            assert(err instanceof Error);
            assert(err.hasOwnProperty('payload'));
            assert(typeof err.payload === 'object');
            assert(err.hasOwnProperty('_isError'));
            assert(err._isError === true);
        });
        
        it ('should emit an event on error', (done) => {
            kinesisEvents.on('parseError', (err) => {
                assert(err instanceof Error);
                done();
            });
            
            kinesisEvents._error(new Error('test'), 'Test Error', { test: 'test' });
        });
    });
});

