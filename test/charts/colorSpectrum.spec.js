/**
 * @fileoverview Test for ColorSpectrum.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ColorSpectrum = require('../../src/js/charts/colorSpectrum');

describe('Test for ColorSpectrum', function() {
    var colorSpectrum;

    beforeEach(function() {
        colorSpectrum = new ColorSpectrum('#ffffff', '#ff0000');
    });

    describe('_makeDistance()', function() {
        it('should calculate diffs between start and end RGB values', function() {
            var startRGB = [255, 255, 255],
                endRGB = [0, 0, 0],
                actual = colorSpectrum._makeDistances(startRGB, endRGB),
                expected = [-255, -255, -255];

            expect(actual).toEqual(expected);
        });
    });

    describe('getColor()', function() {
        it('should calculate hex color according to ratio', function() {
            var actual, expected;

            colorSpectrum.startRGB = [255, 255, 255];
            colorSpectrum.distances = [-100, -150, -200];

            actual = colorSpectrum.getColor(0.5);
            expected = '#cdb49b';

            expect(actual).toBe(expected);
        });

        it('should return cached data, if color value corresponding to ratio is cached', function() {
            var actual, expected;

            colorSpectrum.colorMap = {
                '0.5': '#0000ff'
            };

            actual = colorSpectrum.getColor(0.5);
            expected = '#0000ff';

            expect(actual).toBe(expected);
        });
    });
});
