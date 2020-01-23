/**
 * @fileoverview Test for BubbleChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import BubbleChart from '../../src/js/charts/bubbleChart';

describe('Test for BubbleChart', () => {
  let bubbleChart;
  let dataProcessor;

  beforeEach(() => {
    bubbleChart = BubbleChart.prototype;
    const componentManager = jasmine.createSpyObj('componentManager', ['register']);
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'addDataRatiosForCoordinateType',
      'isCoordinateType'
    ]);
    const boundsModel = jasmine.createSpyObj('boundsModel', [
      'getDimension',
      'getMinimumPixelStepForAxis',
      'registerBaseDimension',
      'registerAxesData'
    ]);
    const scaleDataModel = jasmine.createSpyObj('seriesDataModel', ['getScaleMap']);

    bubbleChart.componentManager = componentManager;
    bubbleChart.dataProcessor = dataProcessor;
    bubbleChart.boundsModel = boundsModel;
    bubbleChart.scaleDataModel = scaleDataModel;
    bubbleChart.chartType = 'bubble';
  });

  describe('addDataRatios()', () => {
    it('add data ratio, when bubble chart', () => {
      const limitMap = 'limit map';

      dataProcessor.isCoordinateType.and.returnValue(true);
      bubbleChart.options = {};
      bubbleChart.addDataRatios(limitMap);

      expect(dataProcessor.addDataRatiosForCoordinateType).toHaveBeenCalledWith(
        'bubble',
        limitMap,
        true
      );
    });
  });
});
