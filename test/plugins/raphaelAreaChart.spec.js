/**
 * @fileoverview Test for RaphaelAreaChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphael from 'raphael';
import RaphaelAreaChart from '../../src/js/plugins/raphaelAreaChart';

describe('RaphaelAreaChart', () => {
  let areaChart;

  beforeEach(() => {
    areaChart = new RaphaelAreaChart();
  });

  describe('_makeHeight()', () => {
    it('should calculate height by substracting zeroTop from top', () => {
      const actual = areaChart._makeHeight(30, 100);
      const expected = 70;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeAreasPath()', () => {
    it('should make area graph path by left, top, startTop of position', () => {
      const actual = areaChart._makeAreasPath([
        {
          left: 10,
          top: 30,
          startTop: 50
        },
        {
          left: 30,
          top: 40,
          startTop: 50
        }
      ]);
      const expected = [
        'M',
        10,
        30,
        'L',
        30,
        40,
        'L',
        30,
        40,
        'L',
        30,
        50,
        'L',
        30,
        50,
        'L',
        10,
        50
      ];
      expect(actual).toEqual(expected);
    });

    it('should skip additional path if hasExtraPath is true', () => {
      const hasExtraPath = false;
      const actual = areaChart._makeAreasPath(
        [
          {
            left: 10,
            top: 30,
            startTop: 50
          },
          {
            left: 30,
            top: 40,
            startTop: 50
          }
        ],
        hasExtraPath
      );
      const expected = ['M', 10, 30, 'L', 30, 40, 'L', 30, 50, 'L', 10, 50];
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeAreaChartPath()', () => {
    it('should make line, area path', () => {
      const actual = areaChart._makeAreaChartPath([
        [
          {
            left: 10,
            top: 30,
            startTop: 50
          },
          {
            left: 30,
            top: 40,
            startTop: 50
          }
        ]
      ]);
      const expected = [
        {
          area: ['M', 10, 30, 'L', 30, 40, 'L', 30, 40, 'L', 30, 50, 'L', 30, 50, 'L', 10, 50],
          line: ['M', 10, 30, 'L', 30, 40]
        }
      ];
      expect(actual).toEqual(expected);
    });

    it('should create startLine path, if it is range data', () => {
      areaChart.hasRangeData = true;
      const actual = areaChart._makeAreaChartPath([
        [
          {
            left: 10,
            top: 30,
            startTop: 40
          },
          {
            left: 30,
            top: 40,
            startTop: 50
          }
        ]
      ]);
      const expected = [
        {
          area: ['M', 10, 30, 'L', 30, 40, 'L', 30, 40, 'L', 30, 50, 'L', 30, 50, 'L', 10, 40],
          line: ['M', 10, 30, 'L', 30, 40],
          startLine: ['M', 10, 40, 'L', 30, 50]
        }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeSplineAreaChartPath()', () => {
    it('should creat area, line path', () => {
      areaChart.zeroTop = 50;
      const actual = areaChart._makeSplineAreaChartPath([
        [
          {
            left: 10,
            top: 30,
            startTop: 50
          },
          {
            left: 30,
            top: 40,
            startTop: 50
          }
        ]
      ]);
      const expected = [
        {
          area: [
            ['M', 10, 30, 'C', 10, 30],
            [30, 40, 30, 40],
            ['K', 30, 40],
            ['L', 30, 50],
            ['C', 30, 50],
            [10, 50, 10, 50],
            ['K', 10, 50],
            ['L', 10, 50]
          ],
          line: [
            ['M', 10, 30, 'C', 10, 30],
            [30, 40, 30, 40]
          ]
        }
      ];
      expect(actual).toEqual(expected);
    });

    it('should skip additional path, if hasExtraPath is false', () => {
      const hasExtraPath = false;
      areaChart.zeroTop = 50;
      const actual = areaChart._makeSplineAreaChartPath(
        [
          [
            {
              left: 10,
              top: 30,
              startTop: 50
            },
            {
              left: 30,
              top: 40,
              startTop: 50
            }
          ]
        ],
        hasExtraPath
      );
      const expected = [
        {
          area: [
            ['M', 10, 30, 'C', 10, 30],
            [30, 40, 30, 40],
            ['C', 30, 50],
            [10, 50, 10, 50]
          ],
          line: [
            ['M', 10, 30, 'C', 10, 30],
            [30, 40, 30, 40]
          ]
        }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('render()', () => {
    const container = document.createElement('DIV');
    const dimension = {
      width: 100,
      height: 100
    };
    const groupPositions = [
      {
        left: 70,
        top: 245.68,
        startTop: 224.39999999999998
      },
      {
        left: 116.36363636363637,
        top: 231.08800000000002,
        startTop: 224.39999999999998
      },
      {
        left: 162.72727272727275,
        top: 200.08,
        startTop: 224.39999999999998
      },
      {
        left: 209.0909090909091,
        top: 155.696,
        startTop: 224.39999999999998
      },
      {
        left: 255.45454545454547,
        top: 121.03999999999999,
        startTop: 224.39999999999998
      }
    ];
    const paper = raphael(container, dimension.width, dimension.height); // eslint-disable-line new-cap
    const data = {
      theme: {
        colors: ['#f4bf75']
      },
      dimension,
      options: {},
      groupPositions
    };
    it('should set the opacity of series area region by an areaOpacity property.', () => {
      data.options.areaOpacity = 0.3;
      areaChart.render(paper, data);
      const { opacity } = areaChart.groupAreas[0].area.attrs;

      expect(opacity).toBe(0.3);
    });

    it('should set the opacity of series area region as a default value, when an areaOpacity is not set.', () => {
      delete data.options.areaOpacity;
      areaChart.render(paper, data);
      const { opacity } = areaChart.groupAreas[0].area.attrs;
      expect(opacity).toBe(1);
    });

    it('should set the opacity of series area region as a default, when an areaOpacity is not a number.', () => {
      data.options.areaOpacity = '10';
      areaChart.render(paper, data);
      const { opacity } = areaChart.groupAreas[0].area.attrs;

      expect(opacity).toBe(1);
    });

    it('should not change areaOpacity value, when an areaOpacity is less than 0 or bigger than 1.', () => {
      data.options.areaOpacity = -0.1;
      areaChart.render(paper, data);
      let { opacity } = areaChart.groupAreas[0].area.attrs;

      expect(opacity).toBe(-0.1);

      data.options.areaOpacity = 8;
      areaChart.render(paper, data);
      opacity = areaChart.groupAreas[0].area.attrs.opacity;

      expect(opacity).toBe(8);
    });
  });

  describe('isAreaOpacityNumber()', () => {
    it('should return false when no parameter is passed', () => {
      expect(areaChart._isAreaOpacityNumber()).toBe(false);
    });

    it('should return true when passing number', () => {
      expect(areaChart._isAreaOpacityNumber(-0.1)).toBe(true);
      expect(areaChart._isAreaOpacityNumber(0)).toBe(true);
      expect(areaChart._isAreaOpacityNumber(1)).toBe(true);
      expect(areaChart._isAreaOpacityNumber(1.1)).toBe(true);
    });

    it('should return false when passing parameter, not a number', () => {
      expect(areaChart._isAreaOpacityNumber('01')).toBe(false);
    });
  });
});
