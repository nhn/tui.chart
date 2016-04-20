/**
 * @fileoverview test bubbleChart.js
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChart = require('../../src/js/charts/bubbleChart'),
    axisDataMaker = require('../../src/js/helpers/axisDataMaker');

describe('BubbleChart', function() {
    var bubbleChart, sereisDataModel;

    beforeEach(function() {
        bubbleChart = BubbleChart.prototype;
        bubbleChart.dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getCategories', 'hasCategories', 'getSeriesDataModel', 'getValues', 'addDataRatiosForCoordinateType']);
        sereisDataModel = jasmine.createSpyObj('seriesDataModel', ['isXCountGreaterThanYCount']);
    });

    describe('_makeAxisScaleMakerMap()', function() {
        it('_createAxisScaleMaker()의 반환값으로 scaleMakerMap의 xAxis와 yAxis에 설정합니다.', function() {
            bubbleChart.dataProcessor.hasCategories.and.returnValue(false);
            bubbleChart.dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
            spyOn(bubbleChart, '_createAxisScaleMaker').and.returnValue('instance of axisScaleMaker');
            bubbleChart.options = {
                xAxis: {
                    min: 0,
                    max: 80
                },
                yAxis: {
                    min: 20,
                    max: 90
                }
            };

            bubbleChart._makeAxisScaleMakerMap();

            expect(bubbleChart._createAxisScaleMaker).toHaveBeenCalledWith({
                min: 0,
                max: 80
            }, 'x');
            expect(bubbleChart._createAxisScaleMaker).toHaveBeenCalledWith({
                min: 20,
                max: 90
            }, 'y');
        });

        it('카테고리가 없다면 xAxis와 yAxis 모두에 설정하여 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.hasCategories.and.returnValue(false);
            bubbleChart.dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
            spyOn(bubbleChart, '_createAxisScaleMaker').and.returnValue('instance of axisScaleMaker');
            bubbleChart.options = {
                xAxis: {
                    min: 0,
                    max: 80
                },
                yAxis: {
                    min: 20,
                    max: 90
                }
            };

            actual = bubbleChart._makeAxisScaleMakerMap();
            expected = {
                xAxis: 'instance of axisScaleMaker',
                yAxis: 'instance of axisScaleMaker'
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 x값의 개수가 y값의 개수보다 많다면 xAxis만 설정하여 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.hasCategories.and.returnValue(true);
            sereisDataModel.isXCountGreaterThanYCount.and.returnValue(true);
            bubbleChart.dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
            spyOn(bubbleChart, '_createAxisScaleMaker').and.returnValue('instance of axisScaleMaker');
            bubbleChart.options = {
                xAxis: {
                    min: 0,
                    max: 80
                },
                yAxis: {
                    min: 20,
                    max: 90
                }
            };

            actual = bubbleChart._makeAxisScaleMakerMap();
            expected = {
                xAxis: 'instance of axisScaleMaker'
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 x값의 개수가 y값의 개수보다 작거나 같다면 yAxis만 설정하여 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.hasCategories.and.returnValue(true);
            sereisDataModel.isXCountGreaterThanYCount.and.returnValue(false);
            bubbleChart.dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
            spyOn(bubbleChart, '_createAxisScaleMaker').and.returnValue('instance of axisScaleMaker');
            bubbleChart.options = {
                xAxis: {
                    min: 0,
                    max: 80
                },
                yAxis: {
                    min: 20,
                    max: 90
                }
            };

            actual = bubbleChart._makeAxisScaleMakerMap();
            expected = {
                yAxis: 'instance of axisScaleMaker'
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxesData()', function() {
        it('카테고리가 없고 axisScaleMap의 xAxis, yAxis모두 axisScaleMaker를 갖고 있다면 반환하는 xAxis와 yAxis의 axisData는 모두 값 타입 입니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue([]);
            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(bubbleChart, '_getAxisScaleMakerMap').and.returnValue({
                xAxis: 'instance of axisScaleMaker',
                yAxis: 'instance of axisScaleMaker'
            })
            actual = bubbleChart._makeAxesData();
            expected = {
                xAxis: 'value type',
                yAxis: 'value type'
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 axisScaleMap의 xAxis만 axisScaleMaker를 갖고 있다면 반환하는 xAxis는 값 타입이고 yAxis는 라벨 타입 입니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue({
                isLabel: true
            });
            spyOn(bubbleChart, '_getAxisScaleMakerMap').and.returnValue({
                xAxis: 'instance of axisScaleMaker'
            });
            actual = bubbleChart._makeAxesData();
            expected = {
                xAxis: 'value type',
                yAxis: {
                    isLabel: true,
                    isVertical: true
                }
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 yAxis만 axisScaleMaker를 갖고 있다면 반환하는 xAxis는 라벨 타입이고 yAxis는 값 타입 입니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue('label type');
            spyOn(bubbleChart, '_getAxisScaleMakerMap').and.returnValue({
                yAxis: 'instance of axisScaleMaker'
            });
            actual = bubbleChart._makeAxesData();
            expected = {
                xAxis: 'label type',
                yAxis: 'value type'
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_addDataRatios()', function() {
        it('axisScaleMap의 xAxis가 axisScaleMaker를 갖고 있다면 limit을 구해 limitMap.x에 설정한뒤 dataProcessor.addDataRatiosForCoordinateType에 전달합니다', function() {
            var axisScaleMaker = jasmine.createSpyObj('axisScaleMaker', ['getLimit']);

            axisScaleMaker.getLimit.and.returnValue('calculated limit by x values');
            spyOn(bubbleChart, '_getAxisScaleMakerMap').and.returnValue({
                xAxis: axisScaleMaker
            });
            bubbleChart._addDataRatios();

            expect(bubbleChart.dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith({
                x: 'calculated limit by x values'
            });
        });

        it('axisScaleMap의 yAxis가 axisScaleMaker를 갖고 있다면 limit을 구해 limitMap.y에 설정한뒤 dataProcessor.addDataRatiosForCoordinateType에 전달합니다', function() {
            var axisScaleMaker = jasmine.createSpyObj('axisScaleMaker', ['getLimit']);

            axisScaleMaker.getLimit.and.returnValue('calculated limit by y values');
            spyOn(bubbleChart, '_getAxisScaleMakerMap').and.returnValue({
                yAxis: axisScaleMaker
            });
            bubbleChart._addDataRatios();

            expect(bubbleChart.dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith({
                y: 'calculated limit by y values'
            });
        });
    });
});
