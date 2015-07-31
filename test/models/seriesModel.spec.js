/**
 * @fileoverview test series model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesModel = require('../../src/js/models/seriesModel.js');

describe('test series model', function() {
    var values = [[20], [40], [80], [120]],
        percentValues = [[0.125], [0.25], [0.5], [0.75]],
        scale = {min: 0, max: 160};

    describe('test method', function() {
        var seriesModel;

        beforeEach(function() {
            seriesModel = new SeriesModel();
        });

        it('_makePercentValues', function() {
            var result = seriesModel._makePercentValues(values, scale);
            expect(result).toEqual(percentValues);
        });

        it('_setData', function() {
            seriesModel._setData({
                values: values,
                formatValues: values,
                scale: scale
            });

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.percentValues).toEqual(percentValues);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var data = {
                    values: values,
                    formatValues: values,
                    scale: scale
                },
                seriesModel = new SeriesModel(data),
                pixelValues;

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.percentValues).toEqual(percentValues);
        });
    });
});
