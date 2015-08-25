/**
 * @fileoverview test pie chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var PieChartSeries = require('../../src/js/series/pieChartSeries.js');

describe('test PieChartSeries', function() {
    var data = {
            values: [[20, 30, 50]],
            formattedValues: [[20, 30, 50]]
        },
        series;

    beforeEach(function() {
        series = new PieChartSeries({
            chartType: 'pie',
            data: data,
            options: {}
        });
    });

    it('_makePercentValues()', function() {
        var result = series._makePercentValues({
            values: [[20, 30, 50]]
        });
        expect(result).toEqual([[0.2, 0.3, 0.5]]);
    });

    it('_makeCircleBounds()', function() {
        var result = series._makeCircleBounds({
            width: 400,
            height: 300
        });

        expect(result).toEqual({
            cx: 200,
            cy: 150,
            r: 120
        });
    })
});