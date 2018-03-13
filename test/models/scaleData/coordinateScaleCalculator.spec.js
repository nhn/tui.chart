/**
 * @fileoverview Calculate coordinateType scale data
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var csc = require('../../../src/js/models/scaleData/coordinateScaleCalculator');

describe('coordinateScaleCalculator', function() {
    describe('positive values', function() {
        it('calculate with tick count', function() {
            var scale = csc({
                min: 0,
                max: 1000,
                offsetSize: 1000,
                stepCount: 10
            });

            expect(scale.limit.min).toEqual(0);
            expect(scale.limit.max).toEqual(1000);
            expect(scale.step).toEqual(100);
            expect(scale.stepCount).toEqual(10);
        });

        it('calculate with default tick pixel size(pixelsPerTick)', function() {
            var scale = csc({
                min: 0,
                max: 880,
                offsetSize: 880
            });

            expect(scale.limit.min).toEqual(0);
            expect(scale.limit.max).toEqual(900);
            expect(scale.step).toEqual(100);
            expect(scale.stepCount).toEqual(9);
        });

        it('get tick value that normalized', function() {
            var scale = csc({
                min: 0,
                max: 12345,
                offsetSize: 1000
            });

            expect(scale.step).toEqual(1000);
        });

        it('get edges that normalized', function() {
            var scale = csc({
                min: 322,
                max: 12345,
                offsetSize: 1000
            });

            expect(scale.limit.min).toEqual(0);
            expect(scale.limit.max).toEqual(13000);
        });
    });

    describe('Negative values', function() {
        var scale;

        beforeEach(function() {
            scale = csc({
                min: -1830,
                max: 12345,
                offsetSize: 1000
            });
        });

        it('min should be -2000', function() {
            expect(scale.limit.min).toEqual(-2000);
        });
    });

    describe('Under decimal point', function() {
        it('edge range 0.120 ~ 0.900, should have step 0.05', function() {
            var scale = csc({
                min: 0.120,
                max: 0.900,
                offsetSize: 1000
            });

            expect(scale.limit.max).toEqual(0.9);
            expect(scale.limit.min).toEqual(0.1);
            expect(scale.step).toEqual(0.05);
        });

        it('edge range 0.0045 ~ 1, should have step 0.05', function() {
            var scale = csc({
                min: 0.0045,
                max: 2,
                offsetSize: 1000
            });

            expect(scale.limit.max).toEqual(2);
            expect(scale.limit.min).toEqual(0);
            expect(scale.step).toEqual(0.2);
        });

        it('edge range 0.01 ~ 0.47, should have min=0, max=0.6, step=0.2', function() {
            var scale = csc({
                min: 0.01,
                max: 0.47,
                offsetSize: 196
            });

            expect(scale.limit.max).toEqual(0.6);
            expect(scale.limit.min).toEqual(0);
            expect(scale.step).toEqual(0.2);
        });
    });
});
