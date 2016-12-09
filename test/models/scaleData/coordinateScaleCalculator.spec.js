/**
 * @fileoverview Calculate coordinateType scale data
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var csc = require('../../../src/js/models/scaleData/coordinateScaleCalculator');

fdescribe('coordinateScaleCalculator', function() {
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
                max: 720,
                offsetSize: 720
            });

            expect(scale.limit.min).toEqual(0);
            expect(scale.limit.max).toEqual(750);
            expect(scale.step).toEqual(50);
            expect(scale.stepCount).toEqual(10);
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

    describe('negative values', function() {
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
});
