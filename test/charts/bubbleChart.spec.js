/**
 * @fileoverview Test for BubbleChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChart = require('../../src/js/charts/bubbleChart');
var axisDataMaker = require('../../src/js/models/scaleData/axisDataMaker');
var CircleLegend = require('../../src/js/legends/circleLegend');

describe('Test for BubbleChart', function() {
    var bubbleChart, componentManager, dataProcessor, boundsModel, scaleDataModel, sereisDataModel;

    beforeEach(function() {
        bubbleChart = BubbleChart.prototype;
        componentManager = jasmine.createSpyObj('componentManager', ['register']);
        dataProcessor = jasmine.createSpyObj('dataProcessor',['addDataRatiosForCoordinateType', 'isCoordinateType']);
        boundsModel = jasmine.createSpyObj('boundsModel', ['getDimension', 'getMinimumPixelStepForAxis',
                'registerBaseDimension', 'registerAxesData']);
        scaleDataModel = jasmine.createSpyObj('seriesDataModel', ['getScaleMap']);
        sereisDataModel = jasmine.createSpyObj('seriesDataModel', ['isXCountGreaterThanYCount']);

        bubbleChart.componentManager = componentManager;
        bubbleChart.dataProcessor = dataProcessor;
        bubbleChart.boundsModel = boundsModel;
        bubbleChart.scaleDataModel = scaleDataModel;
        bubbleChart.chartType = 'bubble';
    });

    describe('_addComponents()', function() {
        it('circleLegend.visible 옵션이 true이면 componentManager.register를 호출하여 circleLegend 컴포넌트를 생성합니다.', function() {
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

    describe('_addDataRatios()', function() {
        it('add data ratio, when bubble chart', function() {
            var limitMap = 'limit map';

            dataProcessor.isCoordinateType.and.returnValue(true);
            bubbleChart.options = {};
            bubbleChart._addDataRatios(limitMap);

            expect(dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith('bubble', limitMap, true);
        });
    });
});
