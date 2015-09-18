/**
 * @fileoverview test line chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LineChartSeries = require('../../src/js/series/lineChartSeries.js');

describe('test LineChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new LineChartSeries({
            chartType: 'line',
            data: {
                values: [],
                formattedValues: [],
                scale: {min: 0, max: 0}
            },
            options: {}
        });
    });

    describe('_makePositions()', function() {
        it('라인차트의 position 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.25], [0.5]];
            bounds = series._makePositions({
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
    });
});
