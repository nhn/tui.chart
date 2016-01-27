/**
 * @fileoverview test column chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ColumnChartSeries = require('../../src/js/series/columnChartSeries.js'),
    renderUtil = require('../../src/js/helpers/renderUtil.js');

describe('ColumnChartSeries', function() {
    var series, dataProcessor;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getFirstFormattedValue', 'getFormatFunctions']);
        dataProcessor.getFirstFormattedValue.and.returnValue('1');
        dataProcessor.getFormatFunctions.and.returnValue([]);
    });

    beforeEach(function() {
        series = new ColumnChartSeries({
            chartType: 'column',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {},
            dataProcessor: dataProcessor
        });
        spyOn(series, '_getPercentValues');
    });

    describe('_makeStartEndTops()', function() {
        it('value가 0보다 작을 경우에는 startTop을 endTop과 동일한 값으로 반환합니다.', function() {
            var endTop = 30,
                endHeight = 20,
                value = -10,
                actual = series._makeStartEndTops(endTop, endHeight, value),
                expected = 30;
            expect(actual.startTop).toBe(expected);
        });

        it('value가 0보다 크거나 같을 경우에는 startTop은 endTop과 동일한 값으로 생성하고, endTop은 endHeight를 뺀 값을 생성합니다.', function() {
            var endTop = 30,
                endHeight = 20,
                value = 10,
                actual = series._makeStartEndTops(endTop, endHeight, value),
                expectedStartTop = 30,
                expectedEndTop = 10;

            expect(actual.startTop).toBe(expectedStartTop);
            expect(actual.endTop).toBe(expectedEndTop);
        });
    });

    describe('_makeColumnChartBound()', function() {
        it('baseBound 정보에 startTop, endTop, endHeight정보를 더하여 start, end로 구분된 bound 정보를 생성합니다.', function() {
            var actual = series._makeColumnChartBound({
                    baseBound: {
                        left: 10,
                        width: 40
                    },
                    startTop: 10,
                    endTop: 20,
                    endHeight: 30
                }),
                expected = {
                    start: {
                        left: 10,
                        top: 10,
                        width: 40,
                        height: 0
                    },
                    end: {
                        left: 10,
                        top: 20,
                        width: 40,
                        height: 30
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalColumnChartBound()', function() {
        it('normal column chart bar 하나의 bound정보를 생성합니다.', function() {
            var actual = series._makeNormalColumnChartBound({
                    distance: {
                        toMax: 200
                    },
                    dimension: {
                        width: 400,
                        height: 200
                    },
                    step: 40,
                    barSize: 30
                }, 0.3, 10, 0),
                expected = {
                    start: {
                        left: 20,
                        top: 210,
                        width: 30,
                        height: 0
                    },
                    end: {
                        left: 20,
                        top: 150,
                        width: 30,
                        height: 60
                    }
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeNormalColumnChartBounds()', function() {
        it('percentValues 배열과 동일한 배열 형태로 bounds 정보를 생성합니다.', function () {
            var actual;

            series._getPercentValues.and.returnValue([[0.25], [0.5]]);
            series.data = {
                limit: {
                    min: 0,
                    max: 100
                }
            };
            actual = series._makeNormalColumnChartBounds({
                width: 200,
                height: 400
            });

            expect(actual.length).toBe(2);
            expect(actual[0].length).toBe(1);
            expect(!!actual[0][0].start).toBe(true);
            expect(!!actual[0][0].end).toBe(true);
        });

        it('값에 음수, 양수 모두가 포함되어 있을 경우 bounds 정보는 0점 기준으로 위아래로 설정됩니다.', function () {
            var result;

            series._getPercentValues.and.returnValue([[-0.25], [0.5]]);
            series.data = {
                limit: {
                    min: -40,
                    max: 60
                }
            };
            result = series._makeNormalColumnChartBounds({
                width: 200,
                height: 400
            }, 1);

            // 0점의 위치가 top 240임
            // 음수의 경우 height만 변화됨
            expect(result[0][0].start.top).toBe(250);
            expect(result[0][0].start.height).toBe(0);
            expect(result[0][0].end.top).toBe(250);
            expect(result[0][0].end.height).toBe(100);

            // 양수의 경우는 top, height 값이 같이 변함
            expect(result[1][0].start.top).toBe(250);
            expect(result[1][0].start.height).toBe(0);
            expect(result[1][0].end.top).toBe(50);
            expect(result[1][0].end.height).toBe(200);
        });
    });

    describe('_makeStackedColumnChartBounds()', function() {
        it('stacked 옵션이 있는 Column차트의 bounds 정보는 end.top이 end.height 만큼씩 감소합니다.', function () {
            var bounds;

            series._getPercentValues.and.returnValue([[0.2, 0.3, 0.5]]);
            series.data = {
                limit: {
                    min: 0,
                    max: 100
                }
            };
            bounds = series._makeStackedColumnChartBounds({
                width: 100,
                height: 400
            }, 1);
            expect(bounds[0][0].end.top).toBe(330);
            expect(bounds[0][0].end.height).toBe(80);

            expect(bounds[0][1].end.top).toBe(210);
            expect(bounds[0][1].end.height).toBe(120);

            expect(bounds[0][2].end.top).toBe(10);
            expect(bounds[0][2].end.height).toBe(200);
        });
    });

    describe('_makeBounds()', function() {
        it('stacked 옵션이 없으면 _makeNormalColumnChartBounds()가 수행됩니다.', function () {
            var actual, expected;

            series._getPercentValues.and.returnValue([[0.25], [0.5]]);
            series.data = {
                limit: {
                    min: 0,
                    max: 100
                }
            };
            actual = series._makeBounds({
                width: 200,
                height: 400
            });
            expected = series._makeNormalColumnChartBounds({
                width: 200,
                height: 400
            });
            expect(actual).toEqual(expected);
        });

        it('stacked 옵션이 있으면 _makeStackedColumnChartBounds()가 수행됩니다.', function () {
            var actual, expected;

            series._getPercentValues.and.returnValue([[0.2, 0.3, 0.5]]);
            series.data = {
                limit: {
                    min: 0,
                    max: 100
                }
            };
            series.options.stacked = 'normal';
            actual = series._makeBounds({
                width: 100,
                height: 400
            }, 1);
            expected = series._makeStackedColumnChartBounds({
                width: 100,
                height: 400
            }, 1);
            expect(actual).toEqual(expected);
        });
    });

    describe('_makeSeriesRenderingPosition()', function() {
        it('series label의 렌더링 포지션을 구합니다.', function() {
            var actual = series.makeSeriesRenderingPosition({
                    value: 10,
                    bound: {
                        left: 10,
                        top: 30,
                        width: 40,
                        height: 20
                    },
                    formattedValue: '10',
                    labelHeight: 20
                }),
                expected = {
                    left: 10,
                    top: 5
                };
            expect(actual).toEqual(expected);
        });

        it('value가 음수일 경우의 series label 렌더링 포지션을 구합니다.', function() {
            var actual = series.makeSeriesRenderingPosition({
                    value: -10,
                    bound: {
                        left: 10,
                        top: 30,
                        width: 40,
                        height: 20
                    },
                    formattedValue: '-10',
                    labelHeight: 20
                }),
                expected = {
                    left: 10,
                    top: 55
                };
            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateSumLabelLeftPosition()', function() {
        it('합계 레이블의 left position값을 계산합니다.', function() {
            var actual = series._calculateSumLabelLeftPosition({
                    left: 10,
                    width: 30
                }, 20),
                expected = 6;
            expect(actual).toBe(expected);
        });
    });

    describe('_makePlusSumLabelHtml()', function() {
        it('양수합계 레이블 html을 생성합니다.', function() {
            var values = [10, 20, 30],
                bound = {
                    left: 10,
                    top: 30,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                actual = series._makePlusSumLabelHtml(values, bound, labelHeight),
                expected = '<div class="tui-chart-series-label" style="left:11px;top:5px;font-family:Verdana;font-size:11px" data-group-index="-1" data-index="-1">60</div>';
            expect(actual).toBe(expected);
        });
    });

    describe('_makeMinusSumLabelHtml()', function() {
        it('음수합계 레이블 html을 생성합니다.', function() {
            var values = [-10, -20, -30],
                bound = {
                    left: 10,
                    top: 30,
                    width: 40,
                    height: 20
                },
                labelHeight = 20,
                actual = series._makeMinusSumLabelHtml(values, bound, labelHeight),
                expected = '<div class="tui-chart-series-label" style="left:11px;top:55px;font-family:Verdana;font-size:11px" data-group-index="-1" data-index="-1">-60</div>';

            expect(actual).toBe(expected);
        });
    });
});
