/**
 * @fileoverview Test for scaleLabelFormatter.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import scaleLabelFormatter from '../../../src/js/models/scaleData/scaleLabelFormatter.js';
import chartConst from '../../../src/js/const';

describe('Test for scaleLabelFormatter', () => {
  describe('_getFormatFunctions()', () => {
    it('get format functions, when is percent stacked chart', () => {
      const chartType = 'bar';
      const stackType = 'percent';

      scaleLabelFormatter.chartType = chartConst.CHART_TYPE_BAR;
      scaleLabelFormatter.stackType = chartConst.PERCENT_STACK_TYPE;
      const actual = scaleLabelFormatter._getFormatFunctions(chartType, stackType);
      const expected = '10%';

      expect(actual[0](10)).toBe(expected);
    });

    it('get format functions, when is not percent stacked chart', () => {
      const chartType = chartConst.CHART_TYPE_LINE;
      const stackType = '';
      const formatFunctions = 'formatFunctions';

      const actual = scaleLabelFormatter._getFormatFunctions(chartType, stackType, formatFunctions);

      expect(actual).toBe('formatFunctions');
    });
  });

  describe('_createScaleValues()', () => {
    it('create scale values, when is diverging chart', () => {
      const scaleData = {
        limit: {
          min: -50,
          max: 50
        },
        step: 25
      };
      const chartType = chartConst.CHART_TYPE_BAR;
      const diverging = true;
      const actual = scaleLabelFormatter._createScaleValues(scaleData, chartType, diverging);
      const expected = [50, 25, 0, 25, 50];

      expect(actual).toEqual(expected);
    });

    it('create scale values, when is not diverging chart', () => {
      const scaleData = {
        limit: {
          min: -50,
          max: 50
        },
        step: 25
      };
      const chartType = chartConst.CHART_TYPE_LINE;
      const diverging = false;
      const actual = scaleLabelFormatter._createScaleValues(scaleData, chartType, diverging);
      const expected = [-50, -25, 0, 25, 50];

      expect(actual).toEqual(expected);
    });
  });

  describe('createFormattedLabels()', () => {
    it('create formatted scale values, when axis type is datetime', () => {
      const scaleData = {};
      const typeMap = {};
      const options = {
        type: chartConst.AXIS_TYPE_DATETIME,
        dateFormat: 'YYYY.MM'
      };

      spyOn(scaleLabelFormatter, '_createScaleValues').and.returnValue([
        new Date('01/01/2016'),
        new Date('04/01/2016'),
        new Date('08/01/2016')
      ]);

      const actual = scaleLabelFormatter.createFormattedLabels(scaleData, typeMap, options);

      expect(actual).toEqual(['2016.01', '2016.04', '2016.08']);
    });

    it('create formatted scale values, when axis type is not datetime', () => {
      const scaleData = {};
      const typeMap = {
        chartType: chartConst.CHART_TYPE_LINE
      };
      const options = {};
      const formatFunctions = [value => `formatted:${value}`];

      spyOn(scaleLabelFormatter, '_createScaleValues').and.returnValue([10, 20, 30]);

      const actual = scaleLabelFormatter.createFormattedLabels(
        scaleData,
        typeMap,
        options,
        formatFunctions
      );

      expect(actual).toEqual(['formatted:10', 'formatted:20', 'formatted:30']);
    });
  });
});
