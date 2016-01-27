/**
 * @fileoverview test for MapChartLegend
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var MapChartLegend = require('../../src/js/legends/mapChartLegend'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('test MapChartLegend', function() {
    var legend, boundsMaker;

    beforeAll(function() {
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
    });

    beforeEach(function() {
        legend = new MapChartLegend({
            theme: {},
            boundsMaker: boundsMaker
        });
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    describe('_makeTickHtml()', function() {
        it('tick html을 생성합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 200
            });
            legend.axesData = {
                labels: [0, 50, 100, 150, 200],
                tickCount: 5
            };
            actual = legend._makeTickHtml();
            expected = '<div class="tui-chart-map-legend-tick" style="top:0px"></div>' +
                '<div class="tui-chart-map-legend-tick-label" style="top:-9px">0</div>' +
                '<div class="tui-chart-map-legend-tick" style="top:50px"></div>' +
                '<div class="tui-chart-map-legend-tick-label" style="top:41px">50</div>' +
                '<div class="tui-chart-map-legend-tick" style="top:100px"></div>' +
                '<div class="tui-chart-map-legend-tick-label" style="top:91px">100</div>' +
                '<div class="tui-chart-map-legend-tick" style="top:150px"></div>' +
                '<div class="tui-chart-map-legend-tick-label" style="top:141px">150</div>' +
                '<div class="tui-chart-map-legend-tick" style="top:200px"></div>' +
                '<div class="tui-chart-map-legend-tick-label" style="top:191px">200</div>';

            expect(actual).toBe(expected);
        });
    });
});
