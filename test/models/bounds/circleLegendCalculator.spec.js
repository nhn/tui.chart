/**
 * @fileoverview Test for circleLegendCalculator.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import circleLegendCalculator from '../../../src/js/models/bounds/circleLegendCalculator';
import chartConst from '../../../src/js/const';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('Test for circleLegendCalculator', () => {
  describe('_calculatePixelStep()', () => {
    it('calculate pixel step, when axis data is label type', () => {
      const actual = circleLegendCalculator._calculatePixelStep(
        {
          tickCount: 4,
          isLabelAxis: true
        },
        240
      );

      expect(actual).toBe(30);
    });

    it('when axis data is not label type', () => {
      const actual = circleLegendCalculator._calculatePixelStep(
        {
          tickCount: 4
        },
        240
      );

      expect(actual).toBe(80);
    });
  });

  describe('_calculateRadiusByAxisData()', () => {
    it('calculate radius by axis data', () => {
      const seriesDimension = {
        width: 400,
        height: 240
      };
      const axisDataMap = {
        xAxis: {
          tickCount: 5
        },
        yAxis: {
          tickCount: 4
        }
      };
      const actual = circleLegendCalculator._calculateRadiusByAxisData(
        seriesDimension,
        axisDataMap
      );

      expect(actual).toBe(80);
    });
  });

  describe('_getCircleLegendLabelMaxWidth()', () => {
    it('get max width of label for circle legend', () => {
      const maxLabel = '1,000';
      const fontFamily = 'Verdana';

      spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);

      const actual = circleLegendCalculator._getCircleLegendLabelMaxWidth(maxLabel, fontFamily);

      expect(renderUtil.getRenderedLabelWidth).toHaveBeenCalledWith('1,000', {
        fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
        fontFamily: 'Verdana'
      });
      expect(actual).toBe(50);
    });
  });

  describe('calculateCircleLegendWidth()', () => {
    it('calculate width of circle legend', () => {
      const seriesDimension = {
        width: 400,
        height: 240
      };
      const axisDataMap = {
        xAxis: {
          tickCount: 5,
          isLabelAxis: true
        },
        yAxis: {
          tickCount: 4
        }
      };
      const maxLabel = '1,000';
      const fontFamily = 'Verdana';

      const actual = circleLegendCalculator.calculateCircleLegendWidth(
        seriesDimension,
        axisDataMap,
        maxLabel,
        fontFamily
      );

      expect(actual).toBe(90);
    });
  });

  describe('calculateMaxRadius()', () => {
    it('maxRadius should be calculated normally even without circlelegend.', () => {
      const axisDataMap = {
        xAxis: {
          tickCount: 4
        },
        yAxis: {
          tickCount: 4
        }
      };
      const dimensionMap = {
        circleLegend: {
          width: 0
        },
        series: {
          width: 300,
          height: 300
        }
      };

      expect(circleLegendCalculator.calculateMaxRadius(dimensionMap, axisDataMap)).toBe(100);
    });
  });
});
