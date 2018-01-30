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
        // Rendered width, height is different according to browser
        // Spy these functions so that make same test environment
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
        it('should make bounds having start and end property, by adding startLeft, endLeft, endWidth to baseBound.', function() {
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
        it('should calculate additional left position by adding additional yAxis and OVERLAPPING_WIDTH when divided option and value is more than 0.', function() {
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

        it('should return 0 if divided option is not exist.', function() {
            var value = 10;
            var actual = series._calculateAdditionalLeft(value);
            var expected = 0;

            expect(actual).toEqual(expected);
        });

        it('should return 0, if negative value althoght there is divided option.', function() {
            var value = -10;
            var actual, expected;

            series.options.divided = true;
            actual = series._calculateAdditionalLeft(value);
            expected = 0;

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeBarChartBound()', function() {
        it('should make bar chart bound of emtpy option.', function() {
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
        it('should make bar chart bounds of empty option.', function() {
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
