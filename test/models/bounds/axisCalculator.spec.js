/**
 * @fileoverview Test for axisCalculator.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import axisCalculator from '../../../src/js/models/bounds/axisCalculator';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('Test for axisCalculator', () => {
  beforeAll(() => {
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  describe('calculateXAxisHeight()', () => {
    it('calculate height for x axis', () => {
      const actual = axisCalculator.calculateXAxisHeight({ title: 'Axis Title' }, {});

      expect(actual).toBe(52);
    });

    it('labelMargin option should increase the x-axis height.', () => {
      const actual = axisCalculator.calculateXAxisHeight(
        { title: 'Axis Title', labelMargin: 30 },
        {}
      );
      expect(actual).toBe(82);
    });

    it('showlabel option is false, it should be reflected in the width of the label width', () => {
      const actual = axisCalculator.calculateXAxisHeight(
        { title: 'Axis Title', showLabel: false },
        {}
      );
      expect(actual).toBe(32);
    });
  });

  describe('calculateYAxisWidth()', () => {
    it('calculate width for y axis', () => {
      const actual = axisCalculator.calculateYAxisWidth(
        ['label1', 'label12'],
        {
          title: 'Axis Title'
        },
        {},
        []
      );

      expect(actual).toBe(67);
    });

    it('calculate width for y axis, when isCenter option is true', () => {
      const actual = axisCalculator.calculateYAxisWidth(
        ['label1', 'label12'],
        {
          title: 'Axis Title',
          isCenter: true
        },
        {},
        []
      );

      expect(actual).toBe(84);
    });

    it('labelMargin option should increase the y-axis width.', () => {
      const actual = axisCalculator.calculateYAxisWidth(
        ['label1', 'label12'],
        {
          title: 'Axis Title',
          labelMargin: 30
        },
        {},
        []
      );

      expect(actual).toBe(97);
    });

    it('showlabel option is false, it should be reflected in the width of the label width', () => {
      const actual = axisCalculator.calculateYAxisWidth(
        ['label1', 'label12'],
        {
          title: 'Axis Title',
          showLabel: false
        },
        {},
        []
      );

      expect(actual).toBe(17);
    });

    it('When an option has a category, it must be reflected in the category label of the option when calculating the maxwidth.', () => {
      spyOn(renderUtil, 'getRenderedLabelsMaxWidth');
      axisCalculator.calculateYAxisWidth(
        ['label1', 'label12'],
        {
          title: 'Axis Title',
          categories: ['label3', 'label4'],
          showLabel: true
        },
        {},
        []
      );

      const [actual] = renderUtil.getRenderedLabelsMaxWidth.calls.mostRecent().args;

      expect(actual).toEqual(['label3', 'label4']);
    });

    it('has maxWidth when the width of label is longer than maxWidth option value.', () => {
      const actual = axisCalculator.calculateYAxisWidth(
        ['tooooooooLongLabel', 'label'],
        {
          maxWidth: 10
        },
        {},
        []
      );

      expect(actual).toBe(27);
    });
  });
});
