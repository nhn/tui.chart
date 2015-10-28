/**
 * @fileoverview test series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('../../src/js/series/series.js'),
    dom = require('../../src/js/helpers/domHandler.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('Series', function() {
    var series;

    beforeEach(function() {
        series = new Series({
            chartType: 'bar',
            tooltipPrefix: 'tooltip-prefix-',
            data: {
                values: [[20], [40]],
                formattedValues: [[20], [40]],
                scale: {min: 0, max: 160}
            },
            bound: {
                dimension: {width: 200, height: 100},
                position: {top: 50, left: 50}
            },
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                },
                colors: ['blue']
            },
            options: {}
        });
    });

    describe('_makePercentValues()', function() {
        it('stacked 옵션이 없는 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: [[20], [40], [80], [120]],
                scale: {min: 0, max: 160}
            });
            expect(result).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('stacked 옵션이 "normal"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: [
                    [20, 80], [40, 60], [60, 40], [80, 20]
                ],
                scale: {min: 0, max: 160}
            }, 'normal');
            expect(result).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);
        });

        it('stacked 옵션이 "percent"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentValues({
                values: [
                    [20, 80], [40, 60], [60, 40], [80, 20]
                ],
                scale: {min: 0, max: 160}
            }, 'percent');
            expect(result).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });
    });

    describe('_makeNormalPercentValues()', function() {
        it('stacked 옵션이 없는 percent타입의 values를 생성합니다.', function () {
            var result = series._makeNormalPercentValues({
                values: [[20], [40], [80], [120]],
                scale: {min: 0, max: 160}
            });
            expect(result).toEqual([[0.125], [0.25], [0.5], [0.75]]);
        });

        it('라인차트가 아니면서 모든 데이터가 음수일 경우에는 percentValues도 음수로 표현됩니다.', function () {
            var result = series._makeNormalPercentValues({
                values: [[-20], [-40], [-80], [-120]],
                scale: {min: 0, max: 160}
            });
            expect(result).toEqual([[-0.125], [-0.25], [-0.5], [-0.75]]);
        });

        it('라인차트이면서 모두 양수일 경우에는 모든 값에서 scale 최소값을 빼고 계산합니다.', function () {
            var result;
            series.chartType = 'line';
            result = series._makeNormalPercentValues({
                values: [[60], [40], [80], [120]],
                scale: {min: 20, max: 180}
            });
            expect(result).toEqual([[0.25], [0.125], [0.375], [0.625]]);
        });
    });

    describe('_makeNormalStackedPercentValues()', function() {
        it('stacked 옵션이 "normal"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makeNormalStackedPercentValues({
                values: [
                    [20, 80], [40, 60], [60, 40], [80, 20]
                ],
                scale: {min: 0, max: 160}
            });
            expect(result).toEqual([[0.125, 0.5], [0.25, 0.375], [0.375, 0.25], [0.5, 0.125]]);
        });
    });

    describe('_makeNormalStackedPercentValues()', function() {
        it('stacked 옵션이 "percent"인 percent타입의 values를 생성합니다.', function () {
            var result = series._makePercentStackedPercentValues({
                values: [
                    [20, 80], [40, 60], [60, 40], [80, 20]
                ],
                scale: {min: 0, max: 160}
            });
            expect(result).toEqual([[0.2, 0.8], [0.4, 0.6], [0.6, 0.4], [0.8, 0.2]]);
        });
    });

    describe('getScaleDistanceFromZeroPoint()', function() {
        it('min, max 사이에 0점이 존재하는 경우에 0점으로 부터 scale min, max까지의 거리를 구합니다.', function() {
            var result = series.getScaleDistanceFromZeroPoint(100, {
                min: -20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 80,
                toMin: 20
            });
        });

        it('min, max 모두 양수인 경우에는 toMax, toMin 모두 0을 반환합니다.', function() {
            var result = series.getScaleDistanceFromZeroPoint(100, {
                min: 20,
                max: 80
            });
            expect(result).toEqual({
                toMax: 0,
                toMin: 0
            });
        });

        it('min, max 모두 음수인 경우에는 toMax, toMin 모두 0을 반환합니다.', function() {
            var result = series.getScaleDistanceFromZeroPoint(100, {
                min: -80,
                max: -20
            });
            expect(result).toEqual({
                toMax: 0,
                toMin: 0
            });
        });
    });

    describe('renderBounds()', function() {
        it('series 영역 너비, 높이, 위치를 렌더링 합니다.', function() {
            var elSeries = dom.create('DIV');
            series._renderPosition(elSeries, {
                    top: 20,
                    left: 20
                }
            );

            if (renderUtil.isIE8()) {
                expect(elSeries.style.top).toBe('18px');
                expect(elSeries.style.left).toBe('9px');
            } else {
                expect(elSeries.style.top).toBe('20px');
                expect(elSeries.style.left).toBe('10px');
            }
        });
    });

    describe('makeSeriesLabelHtml()', function() {
        it('position, value 정보를 받아 series레이블이 표현될 html을 생성합니다.', function() {
            var result = series.makeSeriesLabelHtml({
                left: 10,
                top: 10
            }, 'label1', 0, 0);

            expect(result).toBe('<div class="tui-chart-series-label" style="left:10px;top:10px;font-family:Verdana;font-size:11px" data-group-index="0" data-index="0">label1</div>');
        });
    });

    describe('render()', function() {
        it('width=200, height=100의 series 영역을 렌더링합니다.', function () {
            var elSeries = series.render();

            expect(elSeries.className.indexOf('series-area') > -1).toBe(true);
            expect(elSeries.style.width).toBe('220px');
            expect(elSeries.style.height).toBe('110px');

            if (renderUtil.isIE8()) {
                expect(elSeries.style.top).toBe('48px');
                expect(elSeries.style.left).toBe('39px');
            } else {
                expect(elSeries.style.top).toBe('50px');
                expect(elSeries.style.left).toBe('40px');
            }
        });
    });
});
