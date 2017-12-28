/**
 * @fileoverview test bar chart series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var barSeriesFactory = require('../../../src/js/components/series/barChartSeries');
var SeriesDataModel = require('../../../src/js/models/data/seriesDataModel');
var SeriesGroup = require('../../../src/js/models/data/seriesGroup');
var renderUtil = require('../../../src/js/helpers/renderUtil');
var snippet = require('tui-code-snippet');

describe('BarChartSeries', function() {
    var series, dataProcessor;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor', ['getSeriesDataModel', 'getFirstItemLabel', 'getFormatFunctions']);
        dataProcessor.getFirstItemLabel.and.returnValue('1');
        dataProcessor.getFormatFunctions.and.returnValue([]);
    });

    beforeEach(function() {
        series = new barSeriesFactory.BarChartSeries({
            chartType: 'bar',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11,
                    fontWeight: 'normal'
                }
            },
            options: {},
            dataProcessor: dataProcessor,
            eventBus: new snippet.CustomEvents()
        });
        series.layout = {
            position: {
                top: 10,
                left: 10
            }
        };
    });

    describe('_makeBound()', function() {
        it('baseBound 정보에 startLeft, endLeft, endWidth정보를 더하여 start, end로 구분된 bound 정보를 생성합니다.', function() {
            var width = 40,
                height = 30,
                top = 10,
                startLeft = 10,
                endLeft = 10,
                actual = series._makeBound(width, height, top, startLeft, endLeft),
                expected = {
                    start: {
                        left: 10,
                        top: 10,
                        width: 0,
                        height: 30
                    },
                    end: {
                        left: 10,
                        top: 10,
                        width: 40,
                        height: 30
                    }
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateAdditionalLeft()', function() {
        it('divided 옵션이 있고 value가 0보다 크면 additional yAxis 너비와 OVERLAPPING_WIDTH를 더하여 반환합니다.', function() {
            var value = 10;
            var actual, expected;

            series.dimensionMap = {
                yAxis: {
                    width: 50
                }
            };
            series.options.divided = true;
            actual = series._calculateAdditionalLeft(value);
            expected = 51;

            expect(actual).toEqual(expected);
        });

        it('divided 옵션이 없으면 0을 반환합니다.', function() {
            var value = 10;
            var actual = series._calculateAdditionalLeft(value);
            var expected = 0;

            expect(actual).toEqual(expected);
        });

        it('divided 옵션이 있어도 value가 0보다 작으면 0을 반환합니다.', function() {
            var value = -10;
            var actual, expected;

            series.options.divided = true;
            actual = series._calculateAdditionalLeft(value);
            expected = 0;

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBarChartBound()', function() {
        it('옵션 없는 바 차트의 bound 정보를 생성합니다.', function() {
            var baseData = {
                    baseBarSize: 100,
                    basePosition: 10,
                    barSize: 20,
                    pointInterval: 20,
                    additionalPosition: 0
                },
                iterationData = {
                    baseTop: 10,
                    top: 0,
                    plusLeft: 0
                },
                isStacked = false,
                seriesItem = {
                    value: 10,
                    startRatio: 0,
                    ratioDistance: 0.4
                },
                index = 0,
                actual = series._makeBarChartBound(baseData, iterationData, isStacked, seriesItem, index),
                expected = {
                    start: {
                        top: 20,
                        left: 10,
                        width: 0,
                        height: 20
                    },
                    end: {
                        top: 20,
                        left: 10,
                        width: 40,
                        height: 20
                    }
                };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBounds()', function() {
        it('옵션 없는 바 차트의 bounds 정보를 생성합니다.', function() {
            var seriesDataModel, actual, expected;

            seriesDataModel = new SeriesDataModel();
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            seriesDataModel.groups = [
                new SeriesGroup([{
                    value: 40,
                    startRatio: 0,
                    ratioDistance: 0.4
                }, {
                    value: 60,
                    startRatio: 0,
                    ratioDistance: 0.6
                }])
            ];
            series.layout.dimension = {
                width: 100,
                height: 100
            };
            spyOn(series, '_makeBaseDataForMakingBound').and.returnValue({
                groupSize: 25,
                firstAdditionalPosition: 0,
                baseBarSize: 100,
                basePosition: 10,
                barSize: 20,
                pointInterval: 20,
                additionalPosition: 0
            });

            actual = series._makeBounds();
            expected = [[
                {
                    start: {
                        top: 20,
                        left: 10,
                        width: 0,
                        height: 20
                    },
                    end: {
                        top: 20,
                        left: 10,
                        width: 40,
                        height: 20
                    }
                }, {
                    start: {
                        top: 40,
                        left: 10,
                        width: 0,
                        height: 20
                    },
                    end: {
                        top: 40,
                        left: 10,
                        width: 60,
                        height: 20
                    }
                }
            ]];

            expect(actual).toEqual(expected);
        });
    });

    describe('_calculateTopPositionOfSumLabel()', function() {
        it('alculate top position of sum label', function() {
            var actual = series._calculateTopPositionOfSumLabel({
                    top: 10,
                    height: 30
                }, 20),
                expected = 16;
            expect(actual).toBe(expected);
        });
    });
});
