/**
 * @fileoverview test bubble chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChartSeries = require('../../src/js/series/bubbleChartSeries'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('BubbleChartSeries', function() {
    var series, dataProcessor, seriesDataModel, boundsMaker;

    beforeAll(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['hasCategories', 'getCategories', 'getSeriesDataModel']);
        seriesDataModel = jasmine.createSpyObj('seriesDataModel', ['isXCountGreaterThanYCount'])
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension']);
    });

    beforeEach(function() {
        series = new BubbleChartSeries({
            chartType: 'bubble',
            theme: {
                label: {
                    fontFamily: 'Verdana',
                    fontSize: 11
                }
            },
            options: {},
            dataProcessor: dataProcessor,
            boundsMaker: boundsMaker
        });
    });

    describe('_calculateStep()', function() {
        it('카테고리가 있고 x값 개수가 y값 개수보다 많을 경우에는 시리즈 높이를 카테고리 수로 나누어 반환합니다.', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(true);
            seriesDataModel.isXCountGreaterThanYCount.and.returnValue(true);
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            boundsMaker.getDimension.and.returnValue({
                height: 270
            });

            actual = series._calculateStep();
            expected = 90;

            expect(actual).toBe(expected);
        });

        it('카테고리가 있고 x값 개수가 y값 개수보다 작거나 같을 경우에는 시리즈 너비를 카테고리 수로 나누어 반환합니다.', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(true);
            seriesDataModel.isXCountGreaterThanYCount.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            boundsMaker.getDimension.and.returnValue({
                width: 210
            });

            actual = series._calculateStep();
            expected = 70;

            expect(actual).toBe(expected);
        });
    });

    describe('_makeBound()', function() {
        it('x ratio(ratioMap.x)값이 있는 경우에는 x ratio와 시리즈 너비 값으로 left를 계산합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 200
            });
            actual = series._makeBound({
                x: 0.4
            });
            expected = 80;

            expect(actual.left).toBe(expected);
        });

        it('x ratio(ratioMap.x)값이 없는 경우에는 positionByStep값으로 left를 계산합니다.', function() {
            var positionByStep = 40,
                actual, expected;

            boundsMaker.getDimension.and.returnValue({});
            actual = series._makeBound({}, positionByStep);
            expected = 40;

            expect(actual.left).toBe(expected);
        });

        it('y ratio(ratioMap.y)값이 있는 경우에는 y ratio와 시리즈 높이 값으로 top을 계산합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 150
            });
            actual = series._makeBound({
                y: 0.5
            });
            expected = 75;

            expect(actual.top).toBe(expected);
        });

        it('y ratio(ratioMap.y)값이 없는 경우에는 positionByStep값과 시리즈 높이 값으로 top을 계산합니다.', function() {
            var positionByStep = 40,
                actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 150
            });
            actual = series._makeBound({}, positionByStep);
            expected = 110;

            expect(actual.top).toBe(expected);
        });
    });
});
