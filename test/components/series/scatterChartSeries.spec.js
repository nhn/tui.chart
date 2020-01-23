/**
 * @fileoverview test scatter chart series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import scatterSeriesFactory from '../../../src/js/components/series/scatterChartSeries';
import chartConst from '../../../src/js/const';
import snippet from 'tui-code-snippet';

describe('ScatterChartSeries', () => {
  let series;

  beforeEach(() => {
    series = new scatterSeriesFactory.ScatterChartSeries({
      chartType: 'scatter',
      theme: {
        label: {
          fontFamily: 'Verdana',
          fontSize: 11
        }
      },
      options: {},
      eventBus: new snippet.CustomEvents()
    });

    series.layout = {
      position: {
        left: 0,
        top: 0
      }
    };
  });

  describe('_makeBound()', () => {
    it('should calculate left postion using x ratio and series width.', () => {
      series.layout.dimension = {
        width: 200
      };

      const actual = series._makeBound({
        x: 0.4
      });

      expect(actual.left).toBe(80);
    });

    it('should calculate top position using y ratio and series height.', () => {
      series.layout.dimension = {
        height: 150
      };
      const actual = series._makeBound({
        y: 0.5
      });

      expect(actual.top).toBe(75);
    });

    it('should always return chartConst.SCATTER_RADIUS as radius.', () => {
      series.layout.dimension = {};
      const actual = series._makeBound({});

      expect(actual.radius).toBe(chartConst.SCATTER_RADIUS);
    });
  });
});
