/**
 * @fileoverview test column chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import columnSeriesFactory from '../../../src/js/components/series/columnChartSeries.js';
import SeriesDataModel from '../../../src/js/models/data/seriesDataModel';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import renderUtil from '../../../src/js/helpers/renderUtil.js';

describe('ColumnChartSeries', () => {
  let series, dataProcessor;

  beforeAll(() => {
    // Rendered width, height is different according to browser
    // Spy these functions so that make same test environment
    spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(40);
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  beforeEach(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getSeriesDataModel',
      'getFirstItemLabel',
      'getFormatFunctions'
    ]);
    dataProcessor.getFirstItemLabel.and.returnValue('1');
    dataProcessor.getFormatFunctions.and.returnValue([]);

    series = new columnSeriesFactory.ColumnChartSeries({
      chartType: 'column',
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
  });

  describe('_makeBound()', () => {
    it('should make bounds information having start and end property, using baseBound, startLeft, endLeft, endWidth', () => {
      const width = 40;
      const height = 30;
      const left = 10;
      const startTop = 10;
      const endTop = 20;
      const actual = series._makeBound(width, height, left, startTop, endTop);
      const expected = {
        start: {
          left: 10,
          top: 10,
          width: 40,
          height: 0
        },
        end: {
          left: 10,
          top: 20,
          width: 40,
          height: 30
        }
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeColumnChartBound()', () => {
    it('should calculate column chart bound of empty option.', () => {
      const baseData = {
        baseBarSize: 100,
        basePosition: 40,
        barSize: 20,
        pointInterval: 20,
        itemCount: 2
      };
      const iterationData = {
        baseLeft: 10,
        left: 0,
        plusTop: 0
      };
      const isStacked = false;
      const seriesItem = {
        value: 10,
        startRatio: 0,
        ratioDistance: 0.4
      };
      const index = 0;
      const actual = series._makeColumnChartBound(
        baseData,
        iterationData,
        isStacked,
        seriesItem,
        index
      );
      const expected = {
        start: {
          top: 50,
          left: 20,
          width: 20,
          height: 0
        },
        end: {
          top: 10,
          left: 20,
          width: 20,
          height: 40
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
      series.layout = {
        dimension: {
          width: 100,
          height: 100
        },
        position: {
          left: 0,
          top: 0
        }
      };
      spyOn(series, '_makeBaseDataForMakingBound').and.returnValue({
        groupSize: 25,
        firstAdditionalPosition: 0,
        baseBarSize: 100,
        basePosition: 60,
        barSize: 20,
        pointInterval: 20,
        itemCount: 2
      });

      const actual = series._makeBounds();
      const expected = [
        [
          {
            start: {
              top: 70,
              left: 10,
              width: 20,
              height: 0
            },
            end: {
              top: 30,
              left: 10,
              width: 20,
              height: 40
            }
          },
          {
            start: {
              top: 70,
              left: 30,
              width: 20,
              height: 0
            },
            end: {
              top: 10,
              left: 30,
              width: 20,
              height: 60
            }
          }
        ]
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_calculateLeftPositionOfSumLabel()', () => {
    it('calculate left position of sum label', () => {
      const actual = series._calculateLeftPositionOfSumLabel(
        {
          left: 10,
          width: 30
        },
        20
      );
      const expected = 6;
      expect(actual).toBe(expected);
    });
  });
});
