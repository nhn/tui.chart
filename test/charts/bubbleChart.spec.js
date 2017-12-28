/**
 * @fileoverview Test for BubbleChart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var BubbleChart = require('../../src/js/charts/bubbleChart');

describe('Test for BubbleChart', function() {
    var bubbleChart, componentManager, dataProcessor, boundsModel, scaleDataModel;

    beforeEach(function() {
        bubbleChart = BubbleChart.prototype;
        componentManager = jasmine.createSpyObj('componentManager', ['register']);
        dataProcessor = jasmine.createSpyObj('dataProcessor', ['addDataRatiosForCoordinateType', 'isCoordinateType']);
        boundsModel = jasmine.createSpyObj('boundsModel', ['getDimension', 'getMinimumPixelStepForAxis',
            'registerBaseDimension', 'registerAxesData']);
        scaleDataModel = jasmine.createSpyObj('seriesDataModel', ['getScaleMap']);

        bubbleChart.componentManager = componentManager;
        bubbleChart.dataProcessor = dataProcessor;
        bubbleChart.boundsModel = boundsModel;
        bubbleChart.scaleDataModel = scaleDataModel;
        bubbleChart.chartType = 'bubble';
    });

    describe('addDataRatios()', function() {
        it('add data ratio, when bubble chart', function() {
            var limitMap = 'limit map';

            dataProcessor.isCoordinateType.and.returnValue(true);
            bubbleChart.options = {};
            bubbleChart.addDataRatios(limitMap);

            expect(dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith('bubble', limitMap, true);
        });
    });
});
