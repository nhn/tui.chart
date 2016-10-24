/**
 * @fileoverview test for HeatmapChartSeries
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var HeatmapChartSeries = require('../../../src/js/components/series/heatmapChartSeries.js');

describe('HeatmapChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new HeatmapChartSeries({
            chartType: 'heatmap',
            theme: {
                heatmap: {}
            },
            eventBus: new tui.util.CustomEvents()
        });
    });

    describe('_makeBound()', function() {
        it('block의 너비 높이와 x, y정보를 이용하여 bound 정보를 생성합니다.', function() {
            var actual;

            series.layout = {
                dimension: {
                    height: 200
                }
            };

            actual = series._makeBound(30, 30, 0, 1);

            expect(actual.end).toEqual({
                left: 10,
                top: 150,
                width: 30,
                height: 30
            });
        });
    });
});
