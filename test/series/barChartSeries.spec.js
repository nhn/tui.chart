/**
 * @fileoverview test bar chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BarChartSeries = require('../../src/js/series/barChartSeries.js');

describe('test BarChartSeries', function() {
    var data = {
            values: [[20], [40]],
            formattedValues: [[20], [40]],
            scale: {min: 0, max: 160}
        },
        series;

    beforeEach(function() {
        series = new BarChartSeries({
            chartType: 'bar',
            data: data,
            options: {}
        });
    });

    it('_makeNormalBarBounds()', function() {
        var result;
        series.percentValues = [[0.2, 0.4, 0.1]];
        result = series._makeNormalBarBounds({
            width: 400,
            height: 200
        }, 1);
        expect(result).toEqual([
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
        series.percentValues = [[0.2, 0.3, 0.5]];
        bounds = series._makeStackedBarBounds({
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

    it('_makeBounds() normal', function() {
        var result;
        series.percentValues = [[0.2, 0.4, 0.1]];
        result = series._makeBounds({
            width: 400,
            height: 200
        }, 1);
        expect(result).toEqual([
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

    it('_makeBounds() stacked', function() {
        var bounds;
        series.percentValues = [[0.2, 0.3, 0.5]];
        series.options.stacked = 'normal';
        bounds = series._makeBounds({
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
});
