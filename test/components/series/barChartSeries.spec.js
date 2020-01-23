/**
 * @fileoverview test bar chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import barSeriesFactory from '../../../src/js/components/series/barChartSeries';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import renderUtil from '../../../src/js/helpers/renderUtil';
import snippet from 'tui-code-snippet';

describe('BarChartSeries', () => {
  let series, dataProcessor;

  beforeAll(() => {
    // Rendered width, height is different according to browser
    // Spy these functions so that make same test environment
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);

    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getSeriesDataModel',
      'getFirstItemLabel',
      'getFormatFunctions'
    ]);
    dataProcessor.getFirstItemLabel.and.returnValue('1');
    dataProcessor.getFormatFunctions.and.returnValue([]);
  });

  beforeEach(() => {
    series = new barSeriesFactory.BarChartSeries({
      chartType: 'bar',
      theme: {
        label: {
          fontFamily: 'Verdana',
          fontSize: 11,
          fontWeight: 'normal'
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

  describe('_makeBound()', () => {
    it('should make bounds having start and end property, by adding startLeft, endLeft, endWidth to baseBound.', () => {
      const width = 40;
      const height = 30;
      const top = 10;
      const startLeft = 10;
      const endLeft = 10;
      const actual = series._makeBound(width, height, top, startLeft, endLeft);
      const expected = {
        start: {
          left: 10,
          top: 10,
          width: 0,
          height: 30
        },
        end: {
          left: 10,
          top: 10,
          width: 40,
          height: 30
        }
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_calculateAdditionalLeft()', () => {
    it('should calculate additional left position by adding additional yAxis and OVERLAPPING_WIDTH when divided option and value is more than 0.', () => {
      const value = 10;

      series.dimensionMap = {
        yAxis: {
          width: 50
        }
      };
      series.options.divided = true;
      const actual = series._calculateAdditionalLeft(value);
      const expected = 51;

      expect(actual).toEqual(expected);
    });

    it('should return 0 if divided option is not exist.', () => {
      const value = 10;
      const actual = series._calculateAdditionalLeft(value);
      const expected = 0;

      expect(actual).toEqual(expected);
    });

    it('should return 0, if negative value althoght there is divided option.', () => {
      const value = -10;

      series.options.divided = true;
      const actual = series._calculateAdditionalLeft(value);
      const expected = 0;

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeBarChartBound()', () => {
    it('should make bar chart bound of emtpy option.', () => {
      const baseData = {
        baseBarSize: 100,
        basePosition: 10,
        barSize: 20,
        pointInterval: 20,
        additionalPosition: 0,
        itemCount: 4
      };
      const iterationData = {
        baseTop: 10,
        top: 0,
        plusLeft: 0
      };
      const isStacked = false;
      const seriesItem = {
        value: 10,
        startRatio: 0,
        ratioDistance: 0.4
      };
      const index = 0;
      const actual = series._makeBarChartBound(
        baseData,
        iterationData,
        isStacked,
        seriesItem,
        index
      );
      const expected = {
        start: {
          top: 20,
          left: 10,
          width: 0,
          height: 20
        },
        end: {
          top: 20,
          left: 10,
          width: 40,
          height: 20
        }
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeBounds()', () => {
    it('should make bar chart bounds of empty option.', () => {
      const seriesDataModel = new SeriesDataModel();

      dataProcessor.getSeriesDataModel.and.returnValue(seriesDataModel);
      seriesDataModel.groups = [
        new SeriesGroup([
          {
            value: 40,
            startRatio: 0,
            ratioDistance: 0.4
          },
          {
            value: 60,
            startRatio: 0,
            ratioDistance: 0.6
          }
        ])
      ];
      series.layout.dimension = {
        width: 100,
        height: 100
      };
      spyOn(series, '_makeBaseDataForMakingBound').and.returnValue({
        groupSize: 25,
        firstAdditionalPosition: 0,
        baseBarSize: 100,
        basePosition: 10,
        barSize: 20,
        pointInterval: 20,
        additionalPosition: 0,
        itemCount: 4
      });

      const actual = series._makeBounds();
      const expected = [
        [
          {
            start: {
              top: 20,
              left: 10,
              width: 0,
              height: 20
            },
            end: {
              top: 20,
              left: 10,
              width: 40,
              height: 20
            }
          },
          {
            start: {
              top: 40,
              left: 10,
              width: 0,
              height: 20
            },
            end: {
              top: 40,
              left: 10,
              width: 60,
              height: 20
            }
          }
        ]
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_calculateTopPositionOfSumLabel()', () => {
    it('calculate top position of sum label', () => {
      const actual = series._calculateTopPositionOfSumLabel(
        {
          top: 10,
          height: 30
        },
        20
      );
      const expected = 16;
      expect(actual).toBe(expected);
    });
  });
});
