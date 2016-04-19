/**
 * @fileoverview test bubble chart series
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChartSeries = require('../../src/js/series/bubbleChartSeries'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('BarChartSeries', function() {
    var series, dataProcessor, seriesDataModel, boundsMaker;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

        dataProcessor = jasmine.createSpyObj('dataProcessor', ['hasCategories', 'getCategories', 'getSeriesDataModel']);
        seriesDataModel = jasmine.createSpyObj('seriesDataModel', ['isGreaterXCountThanYCount'])
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
        it('카테고리가 있고 x값 개수가 y값 개수보다 많을 경우에는 시리즈 넓이를 카테고리 수로 나누어 반환합니다.', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(true);
            seriesDataModel.isGreaterXCountThanYCount.and.returnValue(true);
            dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            boundsMaker.getDimension.and.returnValue({
                height: 270
            });

            actual = series._calculateStep();
            expected = 90;

            expect(actual).toBe(expected);
        });

        it('카테고리가 있고 x값 개수가 y값 개수보다 작거나 같을 경우에는 시리즈 높이를 카테고리 수로 나누어 반환합니다.', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(true);
            seriesDataModel.isGreaterXCountThanYCount.and.returnValue(false);
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

    describe('_makePosition()', function() {
        it('x ratio(ratioMap.x)값이 있는 경우에는 x ratio와 시리즈 너비 값으로 left를 계산합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                width: 200
            });
            actual = series._makePosition(0, {
                ratioMap: {
                    x: 0.4
                }
            });
            expected = 90;

            expect(actual.left).toBe(expected);
        });

        it('x ratio(ratioMap.x)값이 없는 경우에는 positionByStep값으로 left를 계산합니다.', function() {
            var positionByStep = 40,
                actual, expected;

            boundsMaker.getDimension.and.returnValue({});
            actual = series._makePosition(positionByStep, {
                ratioMap: {}
            });
            expected = 50;

            expect(actual.left).toBe(expected);
        });

        it('y ratio(ratioMap.y)값이 있는 경우에는 y ratio와 시리즈 높이 값으로 top을 계산합니다.', function() {
            var actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 150
            });
            actual = series._makePosition(0, {
                ratioMap: {
                    y: 0.5
                }
            });
            expected = 85;

            expect(actual.top).toBe(expected);
        });

        it('y ratio(ratioMap.y)값이 없는 경우에는 positionByStep값과 시리즈 높이 값으로 top을 계산합니다.', function() {
            var positionByStep = 40,
                actual, expected;

            boundsMaker.getDimension.and.returnValue({
                height: 150
            });
            actual = series._makePosition(positionByStep, {
                ratioMap: {}
            });
            expected = 120;

            expect(actual.top).toBe(expected);
        });
    });
});
