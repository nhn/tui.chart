/**
 * @fileoverview test bubbleChart.js
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChart = require('../../src/js/charts/bubbleChart'),
    axisDataMaker = require('../../src/js/helpers/axisDataMaker');

describe('BubbleChart', function() {
    var bubbleChart;

    beforeEach(function() {
        bubbleChart = BubbleChart.prototype;
        bubbleChart.dataProcessor = jasmine.createSpyObj('dataProcessor', ['getCategories', 'getValues', 'addDataRatiosForCoordinateType']);
    });

    describe('_makeExistyMapForScaleMakerOfAxes()', function() {
        it('카테고리가 없다면 xAxis, yAxis 모두 true가 설정된 객체를 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue([]);
            actual = bubbleChart._makeExistyMapForScaleMakerOfAxes();
            expected = {
                xAxis: true,
                yAxis: true
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 x값의 갯수가 y값의 갯수보다 많을 경우 xAxis=true, yAxis=false가 설정된 객체를 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            bubbleChart.dataProcessor.getValues.and.callFake(function(chartType, valueType) {
                if (valueType === 'x') {
                    return [1, 2, 3];
                } else if (valueType === 'y') {
                    return [];
                }
            })
            actual = bubbleChart._makeExistyMapForScaleMakerOfAxes();
            expected = {
                xAxis: true,
                yAxis: false
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 x값의 갯수가 y값의 갯수보다 적거나 경우 xAxis=fase, yAxis=true가 설정된 객체를 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            bubbleChart.dataProcessor.getValues.and.callFake(function(chartType, valueType) {
                if (valueType === 'x') {
                    return [];
                } else if (valueType === 'y') {
                    return [1, 2, 3];
                }
            })
            actual = bubbleChart._makeExistyMapForScaleMakerOfAxes();
            expected = {
                xAxis: false,
                yAxis: true
            };

            expect(actual).toEqual(expected);
        });

        it('카테고리가 있고 x값의 갯수가 y값의 갯수와 같을 경우 xAxis=fase, yAxis=true가 설정된 객체를 반환합니다.', function() {
            var actual, expected;

            bubbleChart.dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            bubbleChart.dataProcessor.getValues.and.callFake(function(chartType, valueType) {
                if (valueType === 'x') {
                    return [2, 3, 4];
                } else if (valueType === 'y') {
                    return [1, 2, 3];
                }
            })
            actual = bubbleChart._makeExistyMapForScaleMakerOfAxes();
            expected = {
                xAxis: false,
                yAxis: true
            };

            expect(actual).toEqual(expected);
        });
    });

    describe('_makeAxisScaleMakerMap()', function() {
        it('xAxis가 AxisScaleMaker를 가져도 된다면(existyMap.xAxis=true) _createAxisScaleMaker()의 반환값을 scaleMakerMap.xAxis에 설정합니다.', function() {
            var actual, expected;

            spyOn(bubbleChart, '_makeExistyMapForScaleMakerOfAxes').and.returnValue({
                xAxis: true
            });
            spyOn(bubbleChart, '_createAxisScaleMaker').and.returnValue('instance of axisScaleMaker for xAxis');
            bubbleChart.options = {
                xAxis: {}
            };

            actual = bubbleChart._makeAxisScaleMakerMap();
            expected = {
                xAxis: 'instance of axisScaleMaker for xAxis'
            };

            expect(actual).toEqual(expected);
        });

        it('yAxis가 AxisScaleMaker를 가져도 된다면(existyMap.yAxis=true) _createAxisScaleMaker()의 반환값을 scaleMakerMap.yAxis에 설정합니다.', function() {
            var actual, expected;

            spyOn(bubbleChart, '_makeExistyMapForScaleMakerOfAxes').and.returnValue({
                yAxis: true
            });
            spyOn(bubbleChart, '_createAxisScaleMaker').and.returnValue('instance of axisScaleMaker for yAxis');
            bubbleChart.options = {
                yAxis: {}
            };

            actual = bubbleChart._makeAxisScaleMakerMap();
            expected = {
                yAxis: 'instance of axisScaleMaker for yAxis'
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
