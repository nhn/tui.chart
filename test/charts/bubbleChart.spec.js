/**
 * @fileoverview Test for BubbleChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChart = require('../../src/js/charts/bubbleChart');
var axisDataMaker = require('../../src/js/helpers/axisDataMaker');
var CircleLegend = require('../../src/js/legends/circleLegend');

describe('Test for BubbleChart', function() {
    var bubbleChart, componentManager, dataProcessor, boundsMaker, sereisDataModel;

    beforeEach(function() {
        bubbleChart = BubbleChart.prototype;
        componentManager = jasmine.createSpyObj('componentManager', ['register']);
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['getCategories', 'hasCategories', 'getCategories', 'getSeriesDataModel', 'getValues',
                'getFormattedMaxValue', 'addDataRatiosForCoordinateType']);
        boundsMaker = jasmine.createSpyObj('boundsMaker', ['getDimension', 'getMinimumPixelStepForAxis',
                'registerBaseDimension', 'registerAxesData']);
        sereisDataModel = jasmine.createSpyObj('seriesDataModel', ['isXCountGreaterThanYCount']);

        bubbleChart.componentManager = componentManager;
        bubbleChart.dataProcessor = dataProcessor;
        bubbleChart.boundsMaker = boundsMaker;
        bubbleChart.chartType = 'bubble';
    });

    describe('_makeAxisScaleMakerMap()', function() {
        it('_createAxisScaleMaker()의 반환값으로 scaleMakerMap의 xAxis와 yAxis에 설정합니다.', function() {
            dataProcessor.hasCategories.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
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
            }, 'xAxis', 'x');
            expect(bubbleChart._createAxisScaleMaker).toHaveBeenCalledWith({
                min: 20,
                max: 90
            }, 'yAxis', 'y', null, {
                isVertical: true
            });
        });

        it('카테고리가 없다면 xAxis와 yAxis 모두에 설정하여 반환합니다.', function() {
            var actual, expected;

            dataProcessor.hasCategories.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
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

            dataProcessor.hasCategories.and.returnValue(true);
            sereisDataModel.isXCountGreaterThanYCount.and.returnValue(true);
            dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
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

            dataProcessor.hasCategories.and.returnValue(true);
            sereisDataModel.isXCountGreaterThanYCount.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
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

            dataProcessor.getCategories.and.returnValue([]);
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

            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
            spyOn(axisDataMaker, 'makeValueAxisData').and.returnValue('value type');
            spyOn(axisDataMaker, 'makeLabelAxisData').and.returnValue({
                isLabel: true,
                isVertical: true
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

            dataProcessor.getCategories.and.returnValue(['cate1', 'cate2', 'cate3']);
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

    describe('_addComponents()', function() {
        it('circleLegend.visible 옵션이 true이면 componentManager.register를 호출하여 circleLegend 컴포넌트를 생성합니다.', function() {
            dataProcessor.hasCategories.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
            spyOn(bubbleChart, '_addComponentsForAxisType');
            bubbleChart.options = {
                circleLegend: {
                    visible: true
                },
                legend: {}
            };
            bubbleChart.theme = {
                chart: {
                    fontFamily: 'Verdana'
                }
            };

            bubbleChart._addComponents('bubble');

            expect(componentManager.register).toHaveBeenCalledWith('circleLegend', CircleLegend, {
                chartType: 'bubble',
                baseFontFamily: 'Verdana'
            });
        });

        it('circleLegend.visible 옵션이 false이면 componentManager.register를 호출하지 않아, circleLegend 컴포넌트를 생성하지 않습니다.', function() {
            dataProcessor.hasCategories.and.returnValue(false);
            dataProcessor.getSeriesDataModel.and.returnValue(sereisDataModel);
            spyOn(bubbleChart, '_addComponentsForAxisType');
            bubbleChart.options = {
                circleLegend: {
                    visible: false
                }
            };
            bubbleChart._addComponents();

            expect(componentManager.register).not.toHaveBeenCalled();
        });
    });

    describe('_updateLegendAndSeriesWidth()', function() {
        it('_getCircleLegendWidth()의 수행 결과로 boundsMaker의 legend영역 너비를 갱신 합니다.', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 80
            });
            bubbleChart.options.legend = {
                visible: true
            };

            bubbleChart._updateLegendAndSeriesWidth(300, 60);

            expect(boundsMaker.registerBaseDimension).toHaveBeenCalledWith('legend', {
                width: 80
            });
        });

        it('가로형(top, bottom) 범례의 경우에는 boundsMaker의 legend영역 너비를 갱신하지 않습니다.', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 80
            });
            bubbleChart.options = {
                legend: {
                    align: 'top'
                }
            };

            bubbleChart._updateLegendAndSeriesWidth(300, 60);

            expect(boundsMaker.registerBaseDimension).toHaveBeenCalledTimes(1);
            expect(boundsMaker.registerBaseDimension).toHaveBeenCalledWith('series', {
                width: 280
            });
        });

        it('기존 series의 너비에서 CircleLegend와 Legned의 너비차를 빼  boundsMaker의 series영역 너비를 갱신 합니다.', function() {
            boundsMaker.getDimension.and.returnValue({
                width: 80
            });
            bubbleChart._updateLegendAndSeriesWidth(300, 60);

            expect(boundsMaker.registerBaseDimension).toHaveBeenCalledWith('series', {
                width: 280
            });
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

            expect(dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith('bubble', {
                x: 'calculated limit by x values'
            }, true);
        });

        it('axisScaleMap의 yAxis가 axisScaleMaker를 갖고 있다면 limit을 구해 limitMap.y에 설정한뒤 dataProcessor.addDataRatiosForCoordinateType에 전달합니다', function() {
            var axisScaleMaker = jasmine.createSpyObj('axisScaleMaker', ['getLimit']);

            axisScaleMaker.getLimit.and.returnValue('calculated limit by y values');
            spyOn(bubbleChart, '_getAxisScaleMakerMap').and.returnValue({
                yAxis: axisScaleMaker
            });
            bubbleChart._addDataRatios();

            expect(dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith('bubble', {
                y: 'calculated limit by y values'
            }, true);
        });
    });
});
