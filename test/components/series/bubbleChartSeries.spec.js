/**
 * @fileoverview test bubble chart series
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var bubbleSeriesFactory = require('../../../src/js/components/series/bubbleChartSeries');

describe('BubbleChartSeries', function() {
    var series, dataProcessor, seriesDataModel;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['hasCategories', 'getCategoryCount', 'isXCountGreaterThanYCount', 'getSeriesDataModel']);
        seriesDataModel = jasmine.createSpyObj('seriesDataModel', ['isXCountGreaterThanYCount']);
    });

    beforeEach(function() {
        series = new bubbleSeriesFactory.BubbleChartSeries({
            chartType: 'bubble',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
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

    describe('_calculateStep()', function() {
        it('should calculate step of chart having categories and number of x values are larger than y values, by dividing series.height to number of categories.', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(true);
            dataProcessor.isXCountGreaterThanYCount.and.returnValue(true);
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            dataProcessor.getCategoryCount.and.returnValue(3);
            series.layout.dimension = {
                height: 270
            };

            actual = series._calculateStep();
            expected = 90;

            expect(actual).toBe(expected);
        });

        it('should calculate step of chart having categories and number of x values are less or same to y values, by dividing series.width to categories', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(true);
            dataProcessor.isXCountGreaterThanYCount.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            dataProcessor.getCategoryCount.and.returnValue(3);
            series.layout.dimension = {
                width: 210
            };

            actual = series._calculateStep();
            expected = 70;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeBound()', function() {
        it('should calculate left using x ratio and series.width if there is x ratio(ratioMap.x).', function() {
            var actual, expected;

            series.layout.dimension = {
                width: 200
            };

            actual = series._makeBound({
                x: 0.4
            });
            expected = 90;

            expect(actual.left).toBe(expected);
        });

        it('should calculate left using positinoByStep if there is not x ratio(ratioMap.x).', function() {
            var positionByStep = 40,
                actual, expected;

            series.layout.dimension = {};
            actual = series._makeBound({}, positionByStep);
            expected = 50;

            expect(actual.left).toBe(expected);
        });

        it('should calculate top using y ratio and series.height if y ratio(ratioMap.y) is exists.', function() {
            var actual, expected;

            series.layout.dimension = {
                height: 150
            };
            actual = series._makeBound({
                y: 0.5
            });
            expected = 85;

            expect(actual.top).toBe(expected);
        });

        it('should calculate top using positionByStep, if y ratio(ratioMap.y) is not exist', function() {
            var positionByStep = 40,
                actual, expected;

            series.layout.dimension = {
                height: 150
            };
            actual = series._makeBound({}, positionByStep);
            expected = 120;

            expect(actual.top).toBe(expected);
        });
    });
});
