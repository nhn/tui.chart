var transform = require('../index.js').transform;

describe('es3ify', function() {
    it('should quote property keys', function() {
        expect(transform('x = {dynamic: 0, static: 17};'))
                .toEqual('x = {dynamic: 0, "static": 17};');
    });

    it('should quote member properties', function() {
        expect(transform('x.dynamic++; x.static++;'))
                .toEqual('x.dynamic++; x["static"]++;');
    });

    it('should remove trailing commas in arrays', function() {
        expect(transform('[2, 3, 4,]'))
                .toEqual('[2, 3, 4]');
    });

    it('should not remove commas in strings in arrays', function() {
        expect(transform('["2, 3, 4,"]'))
                .toEqual('["2, 3, 4,"]');
    });

    it('should keep comments near a trailing comma', function() {
        expect(transform('[2, 3, 4 /* = 2^2 */,// = 6 - 2\n]'))
                .toEqual('[2, 3, 4 /* = 2^2 */// = 6 - 2\n]');
    });

    it('should remove trailing commas in objects', function() {
        expect(transform('({x: 3, y: 4,})'))
                .toEqual('({x: 3, y: 4})');
    });

    it('should transform everything at once', function() {
        expect(transform('({a:2,\tfor :[2,,3,],}\n.class)'))
                .toEqual('({a:2,\t"for" :[2,,3]}[\n"class"])');
    });
});
