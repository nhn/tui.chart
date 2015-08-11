/**
 * @fileoverview test series model
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var SeriesModel = require('../../src/js/models/seriesModel.js');

describe('test series model', function() {
    var groupValues = [[20], [40], [80], [120]],
        groupValues2 = [
            [20, 80], [40, 60], [60, 40], [80, 20]
        ],
        scale = {min: 0, max: 160};

    describe('test method', function() {
        var seriesModel;

        beforeEach(function() {
            seriesModel = new SeriesModel();
        });

        it('_makeNormalPercentValues', function() {
            var result = seriesModel._makeNormalPercentValues({
                values: groupValues,
                scale: scale
            });
            expect(result).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('_makeNormalStackedPercentValues', function() {
            var result = seriesModel._makeNormalStackedPercentValues({
                values: groupValues2,
                scale: scale
            });
            expect(result).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);
        });

        it('_makePercentStackedPercentValues', function() {
            var result = seriesModel._makePercentStackedPercentValues({
                values: groupValues2,
                scale: scale
            });
            expect(result).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });

        it('_makePercentValues', function() {
            var result = seriesModel._makePercentValues({
                values: groupValues,
                scale: scale
            });
            expect(result).toEqual([[0.125], [0.25], [0.5], [0.75]]);

            result = seriesModel._makePercentValues({
                values: groupValues2,
                scale: scale
            }, 'normal');
            expect(result).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);

            result = seriesModel._makePercentValues({
                values: groupValues2,
                scale: scale
            }, 'percent');
            expect(result).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });

        it('_makeNormalBarBounds', function() {
            var bounds;
            seriesModel.percentValues = [[0.2, 0.4, 0.1]];
            bounds = seriesModel._makeNormalBarBounds({
                width: 400,
                height: 200
            }, 1);
            expect(bounds).toEqual([
                [{
                    top: 26,
                    left: -1,
                    width: 80,
                    height: 50
                },
                {
                    top: 76,
                    left: -1,
                    width: 160,
                    height: 50
                },
                {
                    top: 126,
                    left: -1,
                    width: 40,
                    height: 50
                }]
            ]);
        });

        it('_makeStackedBarBounds', function() {
            var bounds;
            seriesModel.percentValues = [[0.2, 0.3, 0.5]];
            bounds = seriesModel._makeStackedBarBounds({
                width: 400,
                height: 100
            }, 1);
            expect(bounds).toEqual([
                [{
                    top: 26,
                    left: -1,
                    width: 80,
                    height: 50
                },
                {
                    top: 26,
                    left: 79,
                    width: 120,
                    height: 50
                },
                {
                    top: 26,
                    left: 199,
                    width: 200,
                    height: 50
                }]
            ]);
        });

        it('_makeNormalColumnBounds', function() {
            var bounds;
            seriesModel.percentValues = [[0.25], [0.5]];
            bounds = seriesModel._makeNormalColumnBounds({
                width: 200,
                height: 400
            });
            expect(bounds).toEqual([
                [{
                    top: 301,
                    left: 25,
                    width: 50,
                    height: 100
                }],
                [{
                    top: 201,
                    left: 125,
                    width: 50,
                    height: 200
                }]
            ]);
        });

        it('_makeStackedColumnBounds', function() {
            var bounds;
            seriesModel.percentValues = [[0.2, 0.3, 0.5]];
            bounds = seriesModel._makeStackedColumnBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds).toEqual([
                [{
                    top: 320,
                    left: 25,
                    width: 50,
                    height: 80
                },
                {
                    top: 200,
                    left: 25,
                    width: 50,
                    height: 120
                },
                {
                    top: 0,
                    left: 25,
                    width: 50,
                    height: 200
                }]
            ]);
        });

        it('makeLinePositions', function() {
            var bounds;
            seriesModel.percentValues = [[0.25], [0.5]];
            bounds = seriesModel.makeLinePositions({
                width: 200,
                height: 400
            });
            expect(bounds).toEqual([
                [{
                    top: 300,
                    left: 100
                }],
                [{
                    top: 200,
                    left: 100
                }]
            ]);
        });

        it('_setData', function() {
            seriesModel._setData({
                values: groupValues,
                formatValues: groupValues,
                scale: scale
            });
console.log(seriesModel);
            expect(seriesModel.markers).toEqual(groupValues);
            expect(seriesModel.percentValues).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });
    });

    describe('test construct', function() {
        it('init', function() {
            var data = {
                    values: groupValues,
                    formatValues: groupValues,
                    scale: scale
                },
                seriesModel = new SeriesModel(data),
                pixelValues;

            expect(seriesModel.markers).toEqual(groupValues);
            expect(seriesModel.percentValues).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });
    });
});
