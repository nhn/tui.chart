/**
 * @fileoverview test radial series
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import radialSeriesFactory from '../../../src/js/components/series/radialSeries';
import snippet from 'tui-code-snippet';

describe('Test for RadialSeries', () => {
  let series;

  beforeEach(() => {
    series = new radialSeriesFactory.RadialChartSeries({
      chartType: 'radial',
      theme: {
        radial: {
          label: {
            fontFamily: 'Verdana',
            fontSize: 11,
            fontWeight: 'normal'
          },
          colors: ['blue']
        }
      },
      eventBus: new snippet.CustomEvents()
    });
  });

  it('_makePositions should make point positions', () => {
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

    const positions = series._makePositionsForRadial(
      [
        [
          {
            ratio: 1
          },
          {
            ratio: 0.5
          },
          {
            ratio: 0
          }
        ]
      ],
      3
    );

    expect(parseInt(positions[0][0].left, 10)).toEqual(50);
    expect(parseInt(positions[0][0].top, 10)).toEqual(37);
    expect(parseInt(positions[0][1].left, 10)).toEqual(55);
    expect(parseInt(positions[0][1].top, 10)).toEqual(53);
    expect(parseInt(positions[0][2].left, 10)).toEqual(50);
    expect(parseInt(positions[0][2].top, 10)).toEqual(50);
  });
});
