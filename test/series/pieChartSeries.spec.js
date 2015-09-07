/**
 * @fileoverview test pie chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var PieChartSeries = require('../../src/js/series/pieChartSeries.js');

describe('PieChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new PieChartSeries({
            chartType: 'pie',
            data: {
                values: [],
                formatttedValues: []
            },
            options: {}
        });
    });

    describe('_makePercentValues()', function() {
        it('pie차트의 percent타입 value를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: [[20, 30, 50]]
            });
            expect(result).toEqual([[0.2, 0.3, 0.5]]);
        });
    });

    describe('_makeCircleBounds()', function() {
        it('pie차트의 circle bounds정보를 생성합니다.(cx: center x, cy: center y, r: radius)', function () {
            var result = series._makeCircleBounds({
                width: 400,
                height: 300
            });

            expect(result).toEqual({
                cx: 200,
                cy: 150,
                r: 120
            });
        });
    });
});
