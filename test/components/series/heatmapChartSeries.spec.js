/**
 * @fileoverview test for HeatmapChartSeries
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var heatmapSeriesFactory = require('../../../src/js/components/series/heatmapChartSeries.js');

describe('HeatmapChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new heatmapSeriesFactory.HeatmapChartSeries({
            chartType: 'heatmap',
            theme: {
            },
            eventBus: new snippet.CustomEvents()
        });
    });

    describe('_makeBound()', function() {
        it('block의 너비 높이와 x, y정보를 이용하여 bound 정보를 생성합니다.', function() {
            var actual;

            series.layout = {
                dimension: {
                    height: 200
                },
                position: {
                    top: 0,
                    left: 0
                }
            };

            actual = series._makeBound(30, 30, 0, 1);

            expect(actual.end).toEqual({
                left: 0,
                top: 140,
                width: 30,
                height: 30
            });
        });
    });
});
