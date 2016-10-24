/**
 * @fileoverview test scatter chart series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ScatterChartSeries = require('../../src/js/components/series/scatterChartSeries');
var chartConst = require('../../src/js/const');
var renderUtil = require('../../src/js/helpers/renderUtil');

describe('ScatterChartSeries', function() {
    var series;

    beforeEach(function() {
        series = new ScatterChartSeries({
            chartType: 'scatter',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {},
            eventBus: new tui.util.CustomEvents()
        });
    });

    describe('_makeBound()', function() {
        it('x ratio와 시리즈 너비 값으로 left를 계산합니다.', function() {
            var actual;

            series.layout = {
                dimension: {
                    width: 200
                }
            };

            actual = series._makeBound({
                x: 0.4
            });

            expect(actual.left).toBe(80);
        });

        it('y ratio와 시리즈 높이 값으로 top을 계산합니다.', function() {
            var actual;

            series.layout = {
                dimension: {
                    height: 150
                }
            };
            actual = series._makeBound({
                y: 0.5
            });

            expect(actual.top).toBe(75);
        });

        it('radius는 항상 chartConst.SCATTER_RADIUS를 반환합니다.', function() {
            var actual;

            series.layout = {
                dimension: {}
            };
            actual = series._makeBound({});

            expect(actual.radius).toBe(chartConst.SCATTER_RADIUS);
        });
    });
});
