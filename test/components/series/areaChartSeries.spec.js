/**
 * @fileoverview Test for area chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import areaSeriesFactory from '../../../src/js/components/series/areaChartSeries';
import chartConst from '../../../src/js/const';

describe('AreaChartSeries', () => {
  let series;

  beforeEach(() => {
    series = new areaSeriesFactory.AreaChartSeries({
      chartType: 'area',
      theme: {},
      options: {},
      eventBus: new snippet.CustomEvents()
    });
    series.layout = {
      position: {
        top: 10,
        left: 10
      }
    };
  });

  describe('_makePositionTopOfZeroPoint', () => {
    it('should make postion to _getLimitDistanceFromZeroPoint().toMax + EXPAND_SIZE, when min is negative and max is positive', () => {
      const limit = {
        min: -10,
        max: 10
      };
      const height = 100;
      series.layout.dimension = {
        height
      };
      series.axisDataMap = {
        yAxis: {
          limit
        }
      };

      const actual = series._makePositionTopOfZeroPoint();
      const expected =
        series._getLimitDistanceFromZeroPoint(height, limit).toMax + chartConst.SERIES_EXPAND_SIZE;

      expect(actual).toBe(expected);
    });

    it('should return height + EXPAND_SIZE, if min, max are positive.', () => {
      const limit = {
        min: 0,
        max: 10
      };
      const height = 100;

      series.layout.dimension = {
        height
      };
      series.axisDataMap = {
        yAxis: {
          limit
        }
      };

      const actual = series._makePositionTopOfZeroPoint();
      const expected = height + chartConst.SERIES_EXPAND_SIZE;

      expect(actual).toBe(expected);
    });

    it('should return EXPAND_SIZE if min, max are negatives.', () => {
      const limit = {
        min: -20,
        max: -10
      };
      const height = 100;

      series.layout.dimension = {
        height
      };
      series.axisDataMap = {
        yAxis: {
          limit
        }
      };

      const actual = series._makePositionTopOfZeroPoint();
      const expected = chartConst.SERIES_EXPAND_SIZE;

      expect(actual).toBe(expected);
    });
  });

  describe('_makeStackedPositions()', () => {
    it('should make stack type position by setting the previous top to startTop.', () => {
      series.layout.dimension = {
        height: 190
      };

      spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

      const actual = series._makeStackedPositions([[{ top: 150 }], [{ top: 100 }], [{ top: 180 }]]);
      const expected = [
        [{ top: 150, startTop: 200 }],
        [{ top: 50, startTop: 150 }],
        [{ top: 30, startTop: 50 }]
      ];

      expect(actual).toEqual(expected);
    });
    it('use prevTop if position is null.', () => {
      series.layout.dimension = {
        height: 190
      };

      spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

      const actual = series._makeStackedPositions([
        [{ top: 150 }, { top: 100 }],
        [null, { top: 150 }],
        [{ top: 180 }, { top: 150 }]
      ]);
      const expected = [
        [
          { top: 150, startTop: 200 },
          { top: 100, startTop: 200 }
        ],
        [null, { top: 50, startTop: 100 }],
        [
          { top: 130, startTop: 150 },
          { top: 0, startTop: 50 }
        ]
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makePositions()', () => {
    it('should make stack type position by using _makeBasicPositions() and _makeStackedPosition().', () => {
      const basicPositions = [[{ top: 150 }], [{ top: 100 }], [{ top: 180 }]];

      series.layout.dimension = {
        height: 190
      };

      spyOn(series, '_makeBasicPositions').and.returnValue(basicPositions);
      spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

      const actual = series._makePositions();
      const expected = series._makeStackedPositions(basicPositions);

      expect(actual).toEqual(expected);
    });

    it('should make non stack type position by using _makeBasicPosition().', () => {
      series.layout.dimension = {
        height: 190
      };
      spyOn(series, '_makeBasicPositions').and.returnValue([
        [{ top: 150 }],
        [{ top: 100 }],
        [{ top: 180 }]
      ]);
      spyOn(series, '_makePositionTopOfZeroPoint').and.returnValue(200);

      const actual = series._makePositions();
      const expected = series._makeBasicPositions();

      expect(actual).toEqual(expected);
    });
  });
});
