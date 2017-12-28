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
        it('카테고리가 있고 x값 개수가 y값 개수보다 많을 경우에는 시리즈 높이를 카테고리 수로 나누어 반환합니다.', function() {
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

        it('카테고리가 있고 x값 개수가 y값 개수보다 작거나 같을 경우에는 시리즈 너비를 카테고리 수로 나누어 반환합니다.', function() {
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
        it('x ratio(ratioMap.x)값이 있는 경우에는 x ratio와 시리즈 너비 값으로 left를 계산합니다.', function() {
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

        it('x ratio(ratioMap.x)값이 없는 경우에는 positionByStep값으로 left를 계산합니다.', function() {
            var positionByStep = 40,
                actual, expected;

            series.layout.dimension = {};
            actual = series._makeBound({}, positionByStep);
            expected = 50;

            expect(actual.left).toBe(expected);
        });

        it('y ratio(ratioMap.y)값이 있는 경우에는 y ratio와 시리즈 높이 값으로 top을 계산합니다.', function() {
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

        it('y ratio(ratioMap.y)값이 없는 경우에는 positionByStep값과 시리즈 높이 값으로 top을 계산합니다.', function() {
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
