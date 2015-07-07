/**
 * @fileoverview test series model
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var SeriesModel = require('../../src/js/models/series-model.js');

describe('test series model', function() {
    var values = [
            [20],
            [40],
            [80],
            [120]
        ],
        colors = ['blue'],
        lastColors =  ['red', 'ornage', 'yellow', 'green'],
        scale = {min: 0, max: 160 };

    describe('test method', function() {
        var seriesModel;

        beforeEach(function() {
            seriesModel = new SeriesModel();
        });

        it('makePercentValues', function() {
            var percentValues = seriesModel.makePercentValues(values, scale);
            expect(percentValues).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('makePixelValues', function() {
            var percentValues = seriesModel.makePercentValues(values, scale),
                pixelValues = seriesModel.makePixelValues(percentValues, 400);
            expect(pixelValues).toEqual([[50], [100], [200], [300]]);
        });

        it('setData', function() {
            seriesModel.setData({
                values: values,
                colors: colors,
                scale: scale
            });

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.colors).toEqual(colors);
            expect(seriesModel.percentValues).toEqual([[0.125], [0.25], [0.5], [0.75]]);
            expect(seriesModel.lastColors).toEqual([]);

            seriesModel.setData({
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
                seriesModel = new SeriesModel(data);

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.percentValues).toEqual([[0.125], [0.25], [0.5], [0.75]]);
            expect(seriesModel.colors).toEqual(colors);
        });
    });
});
