/**
 * @fileoverview Test for calculator.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../../src/js/helpers/calculator.js');

describe('Test for calculator', function() {
    describe('calculateLimit()', function() {
        it('should calculate limit to {min: 0, max: 104.5} using userMin=10, userMax=100.', function() {
            var actual = calculator.calculateLimit(10, 100);
            expect(actual.min).toBe(0);
            expect(actual.max).toBe(104.5);
        });

        it('should calculate limit to {min: 16, max: 104} using userMin=20, userMax=100.', function() {
            var actual = calculator.calculateLimit(20, 100);
            expect(actual.min).toBe(16);
            expect(actual.max).toBe(104);
        });

        it('should calculate limit to {min: -100, max: -16} using userMin=-100, userMax=-20.', function() {
            var actual = calculator.calculateLimit(-100, -20);
            expect(actual.min).toBe(-100);
            expect(actual.max).toBe(-16);
        });
    });

    describe('makePixelPositions()', function() {
        it('make pixel positions, when size is 300 and count is 5', function() {
            var positions = calculator.makeTickPixelPositions(300, 5);
            expect(positions).toEqual([0, 75, 150, 225, 299]);
        });

        it('make pixel positions, when size is 400 and count is 6', function() {
            var positions = calculator.makeTickPixelPositions(400, 6);
            expect(positions).toEqual([0, 80, 160, 240, 320, 399]);
        });
    });

    describe('calculateStepFromLimit()', function() {
        it('should calculate step to 20 if limit.min=20, limit.max=100, tickCount=5', function() {
            var tickCount = 5,
                limit = {min: 20, max: 100},
                step = calculator.calculateStepFromLimit(limit, tickCount);
            expect(step).toBe(20);
        });

        it('should calculate step to 30 if limit.min=10, limit.max=130 tickCount=4.', function() {
            var tickCount = 4,
                limit = {min: 10, max: 130},
                step = calculator.calculateStepFromLimit(limit, tickCount);
            expect(step).toBe(40);
        });
    });

    describe('makeLabelsFromLimit()', function() {
        it('should set labels for min=20, max=100, step=20 to [20, 40, 60, 80, 100].', function() {
            var limit = {min: 20, max: 100},
                step = 20,
                result = calculator.makeLabelsFromLimit(limit, step);
            expect(result).toEqual([20, 40, 60, 80, 100]);
        });

        it('should set labels for min=10, max=130, step=40 to [10, 50, 90, 130].', function() {
            var limit = {min: 10, max: 130},
                step = 40,
                result = calculator.makeLabelsFromLimit(limit, step);
            expect(result).toEqual([10, 50, 90, 130]);
        });
    });

    describe('calculateRatio()', function() {
        it('should set ratito to (input value - subNumber) / divNumber * baseRatio.', function() {
            var actual = calculator.calculateRatio(10, 2, 2, 0.5);
            var expected = 2;

            expect(actual).toEqual(expected);
        });
    });
});
