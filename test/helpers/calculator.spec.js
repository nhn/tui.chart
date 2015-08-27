/**
 * @fileoverview test calculator
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../src/js/helpers/calculator.js');

describe('test calculator', function() {
    it('calculateScale(10, 100, 5)', function() {
        var scale = calculator.calculateScale(10, 100);
        expect(scale.max).toEqual(104.5);
        expect(scale.min).toEqual(0);
    });

    it('calculateScale(20, 100, 5)', function() {
        var scale = calculator.calculateScale(20, 100);
        expect(scale.max).toEqual(104);
        expect(scale.min).toEqual(16);
    });

    it('calculateScale(10, 100, 5)', function() {
        var scale = calculator.calculateScale(-100, -20);
        expect(scale.max).toEqual(-16);
        expect(scale.min).toEqual(-100);
    });

    it('normalizeAxisNumber(0.1)', function() {
        var result = calculator.normalizeAxisNumber(0.1);
        expect(result).toEqual(0.2);
    });

    it('normalizeAxisNumber(0.2)', function() {
        var result = calculator.normalizeAxisNumber(0.2);
        expect(result).toEqual(0.5);
    });

    it('normalizeAxisNumber(0.5)', function() {
        var result = calculator.normalizeAxisNumber(0.5);
        expect(result).toEqual(1);
    });

    it('normalizeAxisNumber(1)', function() {
        var result = calculator.normalizeAxisNumber(1);
        expect(result).toEqual(2);
    });

    it('normalizeAxisNumber(2)', function() {
        var result = calculator.normalizeAxisNumber(2);
        expect(result).toEqual(5);
    });

    it('normalizeAxisNumber(5)', function() {
        var result = calculator.normalizeAxisNumber(5);
        expect(result).toEqual(10);
    });

    it('normalizeAxisNumber(24)', function() {
        var result = calculator.normalizeAxisNumber(24);
        expect(result).toEqual(30);
    });

    it('normalizeAxisNumber(1004)', function() {
        var result = calculator.normalizeAxisNumber(1004);
        expect(result).toEqual(1010);
    });

    it('makePixelPositions(300, 5)', function() {
        var positions = calculator.makePixelPositions(300, 5);
        expect(positions).toEqual([0, 75, 150, 224, 299]);
    });

    it('makePixelPositions(400, 6)', function() {
        var positions = calculator.makePixelPositions(400, 6);
        expect(positions).toEqual([0, 80, 160, 239, 319, 399]);
    });

    it('makeLabelsFromScale()', function() {
        var tickCount = 5,
            scale = {min: 20, max: 100},
            step = calculator.getScaleStep(scale, tickCount),
            result = calculator.makeLabelsFromScale(scale, step);
        expect(result).toEqual([20, 40, 60, 80, 100]);
    });

    it('getScaleStep', function() {
        var tickCount = 5,
            scale = {min: 20, max: 100},
            step = calculator.getScaleStep(scale, tickCount);
        expect(step).toEqual(20);
    });

    it('arrayPivot', function() {
        var result = calculator.arrayPivot([
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]);

        expect(result).toEqual([
            [1, 4, 7],
            [2, 5, 8],
            [3, 6, 9]
        ]);
    });
});
