/**
 * @fileoverview test bubble chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import bubbleSeriesFactory from '../../../src/js/components/series/bubbleChartSeries';

describe('BubbleChartSeries', () => {
  let series, dataProcessor, seriesDataModel;

  beforeAll(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'hasCategories',
      'getCategoryCount',
      'isXCountGreaterThanYCount',
      'getSeriesDataModel'
    ]);
    seriesDataModel = jasmine.createSpyObj('seriesDataModel', ['isXCountGreaterThanYCount']);
  });

  beforeEach(() => {
    series = new bubbleSeriesFactory.BubbleChartSeries({
      chartType: 'bubble',
      theme: {
        label: {
          fontFamily: 'Verdana',
          fontSize: 11
        }
      },
      options: {},
      dataProcessor,
      eventBus: new snippet.CustomEvents()
    });
    series.layout = {
      position: {
        top: 10,
        left: 10
      }
    };
  });

  describe('_calculateStep()', () => {
    it('should calculate step of chart having categories and number of x values are larger than y values, by dividing series.height to number of categories.', () => {
      dataProcessor.hasCategories.and.returnValue(true);
      dataProcessor.isXCountGreaterThanYCount.and.returnValue(true);
      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      dataProcessor.getCategoryCount.and.returnValue(3);
      series.layout.dimension = {
        height: 270
      };

      const actual = series._calculateStep();
      const expected = 90;

      expect(actual).toBe(expected);
    });

    it('should calculate step of chart having categories and number of x values are less or same to y values, by dividing series.width to categories', () => {
      dataProcessor.hasCategories.and.returnValue(true);
      dataProcessor.isXCountGreaterThanYCount.and.returnValue(false);
      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      dataProcessor.getCategoryCount.and.returnValue(3);
      series.layout.dimension = {
        width: 210
      };

      const actual = series._calculateStep();
      const expected = 70;

      expect(actual).toBe(expected);
    });
  });

  describe('_makeBound()', () => {
    it('should calculate left using x ratio and series.width if there is x ratio(ratioMap.x).', () => {
      series.layout.dimension = {
        width: 200
      };

      const actual = series._makeBound({
        x: 0.4
      });
      const expected = 90;

      expect(actual.left).toBe(expected);
    });

    it('should calculate left using positinoByStep if there is not x ratio(ratioMap.x).', () => {
      const positionByStep = 40;

      series.layout.dimension = {};
      const actual = series._makeBound({}, positionByStep);
      const expected = 50;

      expect(actual.left).toBe(expected);
    });

    it('should calculate top using y ratio and series.height if y ratio(ratioMap.y) is exists.', () => {
      series.layout.dimension = {
        height: 150
      };
      const actual = series._makeBound({
        y: 0.5
      });
      const expected = 85;

      expect(actual.top).toBe(expected);
    });

    it('should calculate top using positionByStep, if y ratio(ratioMap.y) is not exist', () => {
      const positionByStep = 40;

      series.layout.dimension = {
        height: 150
      };
      const actual = series._makeBound({}, positionByStep);
      const expected = 120;

      expect(actual.top).toBe(expected);
    });
  });
});
