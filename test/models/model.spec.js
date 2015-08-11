/**
 * @fileoverview test base model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Model = require('../../src/js/models/model.js');

describe('test axis model', function() {
    var model;

    beforeEach(function() {
        model = new Model();
    });
    it('getScaleStep', function() {
        var tickCount = 5,
            scale = {min: 20, max: 100},
            step = model.getScaleStep(scale, tickCount);
        expect(step).toEqual(20);
    });

    it('makePixelPositions', function() {
        var positions = model.makePixelPositions(300, 5);
        expect(positions).toEqual([0, 75, 150, 224, 299]);
    });

    it('_formatZeroFill', function() {
        var result = model._formatZeroFill(3, 1);
        expect(result).toEqual('001');

        result = model._formatZeroFill(4, 22);
        expect(result).toEqual('0022');
    });

    it('_formatDecimal', function() {
        var result = model._formatDecimal(2, 1.1111);
        expect(result).toEqual('1.11');

        result = model._formatDecimal(2, 1);
        expect(result).toEqual('1.00');
    });

    it('_formatComma', function() {
        var result = model._formatComma(1000);

        expect(result).toEqual('1,000');

        result = model._formatComma(1000000);
        expect(result).toEqual('1,000,000');
    });

    it('pickMaxLenUnderPoint', function() {
        var point = model.pickMaxLenUnderPoint([1.12, 2.2, 3.33, 4.456]);
        expect(point).toEqual(3);
    });

    it('findFormatFunctions', function() {
        var result = model.findFormatFunctions();
        expect(result).toEqual([]);

        result = model.findFormatFunctions('0.000');
        expect(result[0](1000)).toEqual('1000.000');

        result = model.findFormatFunctions('1,000');
        expect(result[0](1000)).toEqual('1,000');

        result = model.findFormatFunctions('1,000.00');
        expect(result.length).toEqual(2);

        result = model.findFormatFunctions('0001');
        expect(result[0](11)).toEqual('0011');
    });
});