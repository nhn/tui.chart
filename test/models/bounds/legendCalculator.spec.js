/**
 * @fileoverview Test for legendCalculator.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import legendCalculator from '../../../src/js/models/bounds/legendCalculator';
import chartConst from '../../../src/js/const';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('Test for legendCalculator', () => {
  beforeAll(() => {
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  describe('_calculateLegendsWidth()', () => {
    it('calculate sum of legends width', () => {
      const actual = legendCalculator._calculateLegendsWidth(
        ['legend1', 'legend2'],
        {},
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );

      expect(actual).toEqual([130, 130]);
    });
  });

  describe('_divideLegendLabels()', () => {
    it('divide legend labels', () => {
      const actual = legendCalculator._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 2);
      const expected = [
        ['ABC1', 'ABC2'],
        ['ABC3', 'ABC4']
      ];

      expect(actual).toEqual(expected);
    });

    it('Should return an array detached with maxRows.', () => {
      const actual = legendCalculator._divideLegendLabels(
        ['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'],
        2
      );
      const expected = [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']];

      expect(actual).toEqual(expected);
    });

    it('if maxRows is equal to the number of labels, retuns original labels', () => {
      const actual = legendCalculator._divideLegendLabels(['ABC1', 'ABC2', 'ABC3', 'ABC4'], 4);
      const expected = [['ABC1', 'ABC2', 'ABC3', 'ABC4']];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeDividedLabelsAndMaxLineWidth()', () => {
    it('make divided labels and max line width.', () => {
      /**
       * 251: chart length = max line width + 1
       * division loop ending condition: chart length > max line width
       */
      const actual = legendCalculator._makeDividedLabelsAndMaxLineWidth(
        ['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'],
        261,
        {},
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );

      const expected = {
        labels: [['ABC1', 'ABC2'], ['ABC3', 'ABC4'], ['ABC5']],
        maxLineWidth: 250 /* max line width */
      };

      expect(actual).toEqual(expected);
    });

    it('make divided labels and max line width, when chart width less than label width', () => {
      const actual = legendCalculator._makeDividedLabelsAndMaxLineWidth(
        ['ABC1', 'ABC2', 'ABC3', 'ABC4', 'ABC5'],
        130,
        {},
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );

      const expected = {
        labels: [['ABC1'], ['ABC2'], ['ABC3'], ['ABC4'], ['ABC5']],
        maxLineWidth: 120 /* width of a legend item */
      };

      expect(actual).toEqual(expected);
    });

    it('Width of a label should not exceed the width of the chart.', () => {
      const actual = legendCalculator._makeDividedLabelsAndMaxLineWidth(
        ['ABC1'],
        110,
        {},
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );

      expect(actual.maxLineWidth).toBe(110);
    });
  });

  describe('_calculateHorizontalLegendHeight()', () => {
    it('calculate horizontal height for legend', () => {
      const actual = legendCalculator._calculateHorizontalLegendHeight([
        ['ABC1', 'ABC2'],
        ['ABC3', 'ABC4'],
        ['ABC5']
      ]);
      const expected = 98;

      expect(actual).toBe(expected);
    });
  });

  describe('_makeHorizontalDimension()', () => {
    it('calculate horizontal dimension', () => {
      const actual = legendCalculator._makeHorizontalDimension(
        {},
        ['label1', 'label12'],
        300,
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );
      const expected = {
        width: 250,
        height: 40
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeVerticalDimension()', () => {
    it('calculate vertical dimension', () => {
      const actual = legendCalculator._makeVerticalDimension(
        {},
        ['label1', 'label12'],
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );
      const expected = 140;

      expect(actual.width).toBe(expected);
    });
  });

  describe('calculate()', () => {
    it('if visible options is false, returns 0', () => {
      const options = {
        visible: false
      };
      const actual = legendCalculator.calculate(options);

      expect(actual.width).toBe(0);
    });

    it('calculate dimension for legend, when horizontal type', () => {
      const options = {
        visible: true,
        align: chartConst.LEGEND_ALIGN_TOP
      };
      const labelTheme = {};
      const legendLabels = ['label1', 'label12'];
      const chartWidth = 200;
      const actual = legendCalculator.calculate(options, labelTheme, legendLabels, chartWidth);
      const expected = legendCalculator._makeHorizontalDimension(
        labelTheme,
        legendLabels,
        chartWidth,
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );

      expect(actual).toEqual(expected);
    });

    it('calculate dimension for legend, when vertical type', () => {
      const options = {
        visible: true,
        align: chartConst.LEGEND_ALIGN_LEFT
      };
      const labelTheme = {};
      const legendLabels = ['label1', 'label12'];

      const actual = legendCalculator.calculate(options, labelTheme, legendLabels);
      const expected = legendCalculator._makeVerticalDimension(
        labelTheme,
        legendLabels,
        chartConst.LEGEND_CHECKBOX_SIZE + chartConst.LEGEND_LABEL_LEFT_PADDING
      );

      expect(actual).toEqual(expected);
    });
  });
});
