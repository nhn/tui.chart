/**
 * @fileoverview Test for SeriesItem.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import SeriesItem from '../../../src/js/models/data/seriesItem';

describe('Test for SeriesItem', () => {
  let seriesItem;

  beforeEach(() => {
    seriesItem = new SeriesItem({});
  });

  describe('_initValues()', () => {
    it('initialize values of item, when raw value is number', () => {
      seriesItem.formatFunctions = [value => `00${value}`];
      seriesItem._initValues(10);

      expect(seriesItem.value).toBe(10);
      expect(seriesItem.end).toBe(10);
      expect(seriesItem.label).toBe('0010');
      expect(seriesItem.tooltipLabel).toBe('0010');
      expect(seriesItem.endLabel).toBe('0010');
      expect(seriesItem.isRange).toBe(false);
    });
    it('initialize values of item, when raw value is null', () => {
      seriesItem._initValues(null);

      expect(seriesItem.value).toBe(null);
      expect(seriesItem.end).toBe(null);
      expect(seriesItem.start).toBe(null);
      expect(seriesItem.label).toBe('');
      expect(seriesItem.tooltipLabel).toBe('');
      expect(seriesItem.endLabel).toBe('');
      expect(seriesItem.startLabel).toBe(null);
      expect(seriesItem.isRange).toBe(false);
    });
    it('initialize values of item, when raw value is array', () => {
      seriesItem.formatFunctions = [value => `00${value}`];
      seriesItem._initValues([10, 40]);

      expect(seriesItem.value).toBe(40);
      expect(seriesItem.end).toBe(40);
      expect(seriesItem.start).toBe(10);
      expect(seriesItem.label).toBe('0010 ~ 0040');
      expect(seriesItem.tooltipLabel).toBe('0010 ~ 0040');
      expect(seriesItem.endLabel).toBe('0040');
      expect(seriesItem.startLabel).toBe('0010');
      expect(seriesItem.isRange).toBe(true);
    });

    it('if diverging chart, label is plus value', () => {
      seriesItem.isDivergingChart = true;
      seriesItem._initValues(-10);

      expect(seriesItem.value).toBe(-10);
      expect(seriesItem.label).toBe('10');
      expect(seriesItem.tooltipLabel).toBe('10');
    });

    it('Changes to makingTooltip and changes to makingSeries should be distinguished.', () => {
      seriesItem.formatFunctions = [
        (value, chartType, areaType) =>
          areaType === 'makingSeriesLabel' ? `!!${value}` : `00${value}`
      ];
      seriesItem._initValues(10);

      expect(seriesItem.label).toBe('!!10');
      expect(seriesItem.tooltipLabel).toBe('0010');
    });
  });

  describe('_createValues()', () => {
    it('should create arrays sorted in descending order', () => {
      const actual = seriesItem._createValues([3, 1, 2, 10]);
      const expected = [10, 3, 2, 1];

      expect(actual).toEqual(expected);
    });

    it('should sorted in descending order, when inputs are negative', () => {
      const actual = seriesItem._createValues([3, 1, -2, 10]);
      const expected = [10, 3, 1, -2];

      expect(actual).toEqual(expected);
    });
  });

  describe('addRatio()', () => {
    it('should set calculated value ratio to ratio and endRatio', () => {
      seriesItem.value = 40;
      seriesItem.addRatio(100);

      expect(seriesItem.ratio).toBe(0.4);
      expect(seriesItem.endRatio).toBe(0.4);
    });

    it('should calculated start ratio to startRatio', () => {
      seriesItem.hasStart = true;
      seriesItem.start = 20;
      seriesItem.value = 40;
      seriesItem.addRatio(100);

      expect(seriesItem.ratio).toBe(0.4);
      expect(seriesItem.endRatio).toBe(0.4);
      expect(seriesItem.startRatio).toBe(0.2);
    });
  });
});
