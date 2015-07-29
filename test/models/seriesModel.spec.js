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
        lastItemStyles = [{color: 'red'}, {color: 'orange'}, {color: 'yellow'}, {color: 'green'}],
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
                scale: scale
            });

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.percentValues).toEqual(percentValues);
            expect(seriesModel.lastItemStyles).toEqual([]);

            seriesModel._setData({
                values: values,
                scale: scale,
                lastItemStyles: lastItemStyles
            });
            expect(seriesModel.lastItemStyles).toEqual(lastItemStyles);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var data = {
                    values: values,
                    scale: scale,
                    lastItemStyles: lastItemStyles
                },
                seriesModel = new SeriesModel(data),
                pixelValues;

            expect(seriesModel.markers).toEqual(values);
            expect(seriesModel.percentValues).toEqual(percentValues);
        });
    });
});
