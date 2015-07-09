/**
 * @fileoverview test series model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var SeriesModel = require('../../src/js/models/seriesModel.js');

describe('test series model', function() {
    var values = [[20], [40], [80], [120]],
        percentValues = [[0.125], [0.25], [0.5], [0.75]],
        colors = ['blue'],
        lastColors =  ['red', 'ornage', 'yellow', 'green'],
        scale = {min: 0, max: 160 };

    describe('test method', function() {
        var seriesModel;

        beforeEach(function() {
            seriesModel = new SeriesModel();
        });

        it('_makePercentValues', function() {
            var percentValues = seriesModel._makePercentValues(values, scale);
            expect(percentValues).toEqual(percentValues);
        });

        it('getPixelValues', function() {
            var pixelValues;

            seriesModel.percentValues = seriesModel._makePercentValues(values, scale);
            pixelValues = seriesModel.getPixelValues(400);

            expect(pixelValues).toEqual([[50], [100], [200], [300]]);
        });

        it('_setData', function() {
            seriesModel._setData({
                values: values,
                colors: colors,
                scale: scale
            });

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.colors).toEqual(colors);
            expect(seriesModel.percentValues).toEqual(percentValues);
            expect(seriesModel.lastColors).toEqual([]);

            seriesModel._setData({
                values: values,
                colors: colors,
                scale: scale,
                lastColors: lastColors
            });
            expect(seriesModel.lastColors).toEqual(lastColors);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var data = {
                    values: values,
                    colors: colors,
                    scale: scale,
                    lastColors: lastColors
                },
                seriesModel = new SeriesModel(data),
                pixelValues;

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.percentValues).toEqual(percentValues);
            expect(seriesModel.colors).toEqual(colors);

            pixelValues = seriesModel.getPixelValues(400);
            expect(pixelValues).toEqual([[50], [100], [200], [300]]);

            pixelValues = seriesModel.getPixelValues(200);
            expect(pixelValues).toEqual([[25], [50], [100], [150]]);
        });
    });
});
