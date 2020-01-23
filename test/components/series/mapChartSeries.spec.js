/**
 * @fileoverview test for MapChartSeries
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import snippet from 'tui-code-snippet';
import mapSeriesFactory from '../../../src/js/components/series/mapChartSeries.js';

describe('MapChartSeries', () => {
  let series, dataProcessor, mapModel;

  beforeAll(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', ['getValueMap']);
    mapModel = jasmine.createSpyObj('mapModel', ['getMapDimension']);
  });

  beforeEach(() => {
    series = new mapSeriesFactory.MapChartSeries({
      dataProcessor,
      chartType: 'map',
      theme: {
        heatmap: {}
      },
      eventBus: new snippet.CustomEvents()
    });
    series.mapModel = mapModel;
    series.mapDimension = {
      width: 600,
      height: 400
    };
  });

  describe('_setMapRatio()', () => {
    it('should calculate map ratio by dividing map size to chart area size. ', () => {
      series.layout = {
        dimension: {
          width: 400,
          height: 300
        }
      };
      series.graphDimension = {
        width: 800,
        height: 600
      };
      series._setMapRatio(series.graphDimension);

      const actual = series.mapRatio;
      const expected = 0.5;

      expect(actual).toBe(expected);
    });

    it('should set map ratio, to smaller ratio of width and height', () => {
      series.layout = {
        dimension: {
          width: 200,
          height: 300
        }
      };
      series.graphDimension = {
        width: 800,
        height: 600
      };
      series._setMapRatio(series.graphDimension);

      const actual = series.mapRatio;
      const expected = 0.25;

      expect(actual).toBe(expected);
    });
  });

  describe('_setGraphDimension()', () => {
    it('should set graph dimension by multiplying series dimension with zoom magnification', () => {
      series.layout = {
        dimension: {
          width: 400,
          height: 300
        }
      };
      series.zoomMagn = 2;
      series._setGraphDimension();

      const actual = series.graphDimension;
      const expected = {
        width: 800,
        height: 600
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_setLimitPositionToMoveMap', () => {
    it('should limit position of moving map.', () => {
      series.layout = {
        dimension: {
          width: 400,
          height: 300
        }
      };
      series.graphDimension = {
        width: 800,
        height: 600
      };
      series._setLimitPositionToMoveMap();

      const actual = series.limitPosition;
      const expected = {
        left: -400,
        top: -300
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_adjustMapPosition()', () => {
    it('should adjust map position for making position not to over limit or under 0', () => {
      series.limitPosition = {
        left: -400,
        top: -300
      };

      const actual = series._adjustMapPosition({
        left: -420,
        top: 10
      });
      const expected = {
        left: -400,
        top: 0
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_updatePositionsToResize()', () => {
    it('should update position for resizing.', () => {
      series.mapRatio = 2;
      series.basePosition = {
        left: -10,
        top: -20
      };
      series.limitPosition = {
        left: -100,
        top: -50
      };
      series._updatePositionsToResize(1);

      expect(series.basePosition.left).toBe(-20);
      expect(series.basePosition.top).toBe(-40);
      expect(series.limitPosition.left).toBe(-200);
      expect(series.limitPosition.top).toBe(-100);
    });
  });
});
