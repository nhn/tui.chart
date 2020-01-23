/**
 * @fileoverview Test for GroupTooltip.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>

 */

import snippet from 'tui-code-snippet';
import groupTooltipFactory from '../../../src/js/components/tooltips/groupTooltip';
import SeriesGroup from '../../../src/js/models/data/seriesGroup';
import defaultTheme from '../../../src/js/themes/defaultTheme';
import dom from '../../../src/js/helpers/domHandler';

describe('GroupTooltip', () => {
  let tooltip, dataProcessor;

  beforeAll(() => {
    dataProcessor = jasmine.createSpyObj('dataProcessor', [
      'getSeriesGroups',
      'getCategory',
      'getLegendData',
      'getLegendItem',
      'getCategoryCount',
      'makeTooltipCategory'
    ]);
  });

  beforeEach(() => {
    tooltip = new groupTooltipFactory.GroupTooltip({
      dataProcessor,
      eventBus: new snippet.CustomEvents(),
      options: {}
    });
  });

  describe('makeTooltipData()', () => {
    it('should make data for making group tooltip.', () => {
      dataProcessor.getSeriesGroups.and.returnValue([
        new SeriesGroup([
          {
            label: '10'
          },
          {
            label: '20'
          }
        ]),
        new SeriesGroup([
          {
            label: '30'
          },
          {
            label: '40'
          }
        ])
      ]);

      dataProcessor.getCategoryCount.and.returnValue(2);
      dataProcessor.makeTooltipCategory.and.callFake(index => {
        const categories = ['Silver', 'Gold'];

        return categories[index];
      });

      const actual = tooltip.makeTooltipData();
      const expected = [
        {
          category: 'Silver',
          values: [
            {
              type: 'data',
              label: '10'
            },
            {
              type: 'data',
              label: '20'
            }
          ]
        },
        {
          category: 'Gold',
          values: [
            {
              type: 'data',
              label: '30'
            },
            {
              type: 'data',
              label: '40'
            }
          ]
        }
      ];
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeColors()', () => {
    it('should set colors if there is preset color theme.', () => {
      dataProcessor.getLegendData.and.returnValue([
        {
          chartType: 'column',
          label: 'legend1'
        },
        {
          chartType: 'column',
          label: 'legend2'
        }
      ]);

      const actual = tooltip._makeColors({
        colors: ['red', 'blue']
      });
      const expected = ['red', 'blue'];

      expect(actual).toEqual(expected);
    });

    it('should set colors to default series color, if there is no preset colors theme.', () => {
      const legendLabels = [
        {
          chartType: 'column',
          label: 'legend1'
        },
        {
          chartType: 'column',
          label: 'legend2'
        }
      ];
      const actual = tooltip._makeColors(legendLabels, {});
      const expected = defaultTheme.series.colors.slice(0, 2);
      expect(actual).toEqual(expected);
    });
  });

  describe('_updateLegendTheme()', () => {
    it('should return the theme colors reflecting the checkedLegends state.', () => {
      tooltip.originalTheme = {
        line: {
          colors: ['red', 'blue', 'green', 'yellow']
        }
      };

      const actual = tooltip._updateLegendTheme([false, true, true, true]).colors;
      expect(actual).toEqual(['blue', 'green', 'yellow']);
    });
  });

  describe('_makeItemRenderingData()', () => {
    it('should make series item model for series rendering.', () => {
      dataProcessor.getLegendItem.and.callFake(index => {
        const legendData = [
          {
            chartType: 'column',
            label: 'legend1'
          },
          {
            chartType: 'line',
            label: 'legend2'
          }
        ];

        return legendData[index];
      });

      tooltip.suffix = 'suffix';

      const actual = tooltip._makeItemRenderingData([
        {
          label: '20',
          type: 'data'
        },
        {
          label: '30',
          type: 'data'
        }
      ]);
      const expected = [
        {
          value: '20',
          legend: 'legend1',
          chartType: 'column',
          suffix: 'suffix',
          type: 'data'
        },
        {
          value: '30',
          legend: 'legend2',
          chartType: 'line',
          suffix: 'suffix',
          type: 'data'
        }
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeGroupTooltipHtml()', () => {
    beforeEach(() => {
      dataProcessor.getLegendItem.and.callFake(index => {
        const legendData = [
          {
            chartType: 'column',
            label: 'legend1'
          },
          {
            chartType: 'line',
            label: 'legend2'
          }
        ];

        return legendData[index];
      });
    });

    it('return empty string when series data is empty.', () => {
      tooltip.data = [];
      expect(tooltip._makeGroupTooltipHtml(1)).toBe('');
    });
    it('should make default tooltip HTML from data of specific index', () => {
      tooltip.data = [
        {
          category: 'Silver',
          values: [
            {
              label: '10',
              type: 'data'
            }
          ]
        },
        {
          category: 'Gold',
          values: [
            {
              label: '30',
              type: 'data'
            }
          ]
        }
      ];
      tooltip.theme = {
        colors: ['red']
      };
      const actual = tooltip._makeGroupTooltipHtml(1);

      const expected = `<div class="tui-chart-default-tooltip tui-chart-group-tooltip">
    <div class="tui-chart-tooltip-head">Gold</div>
    <table class="tui-chart-tooltip-body">
      <tr>
    <td><div class="tui-chart-legend-rect column" style="background-color:red"></div></td>
    <td>legend1</td>
    <td class="tui-chart-tooltip-value">30 </td>
  </tr>
    </table>
  </div>`;

      expect(actual).toBe(expected);
    });

    it('should make defualt group tooltip HTML from data.', () => {
      tooltip.templateFunc = (category, items) => {
        const head = `<div>${category}</div>`;
        const body = snippet
          .map(items, item => `<div>${item.legend}: ${item.value}</div>`)
          .join('');

        return head + body;
      };

      tooltip.data = [
        {
          category: 'Silver',
          values: [
            {
              label: '10',
              type: 'data'
            }
          ]
        },
        {
          category: 'Gold',
          values: [
            {
              label: '30',
              type: 'data'
            },
            {
              label: '20',
              type: 'data'
            }
          ]
        }
      ];
      tooltip.theme = {
        colors: ['red']
      };

      const actual = tooltip._makeGroupTooltipHtml(1);
      const expected = `<div>Gold</div><div>legend1: 30</div><div>legend2: 20</div>`;

      expect(actual).toBe(expected);
    });
  });

  describe('_getTooltipSectorElement', () => {
    it('should make tooltip selector element.', () => {
      const tooltipContainer = dom.create('DIV');
      tooltip.tooltipContainer = tooltipContainer;
      const actual = tooltip._getTooltipSectorElement();
      expect(actual).toBeDefined();
      expect(actual.className).toBe('tui-chart-group-tooltip-sector');
    });

    it('should return existing tooltip element, this.elTooltipSector.', () => {
      const groupTooltipSector = dom.create('DIV');
      tooltip.groupTooltipSector = groupTooltipSector;
      const actual = tooltip._getTooltipSectorElement();
      const expected = groupTooltipSector;
      expect(actual).toBe(expected);
    });
  });

  describe('_makeVerticalTooltipSectorBound()', () => {
    it('should make vertical tooltip sector bound of line type chart.', () => {
      const actual = tooltip._makeVerticalTooltipSectorBound(
        200,
        {
          start: 0,
          end: 50
        },
        true
      );
      const expected = {
        dimension: {
          width: 1,
          height: 200
        },
        position: {
          left: 0,
          top: 10
        }
      };
      expect(actual).toEqual(expected);
    });

    it('should make vertical tooltip sector bound of non-line type chart.', () => {
      const actual = tooltip._makeVerticalTooltipSectorBound(
        200,
        {
          start: 0,
          end: 50
        },
        false
      );
      const expected = {
        dimension: {
          width: 50,
          height: 200
        },
        position: {
          left: 0,
          top: 10
        }
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeHorizontalTooltipSectorBound()', () => {
    it('should make tooltip sector bound of horizontal chart.', () => {
      const actual = tooltip._makeHorizontalTooltipSectorBound(
        200,
        {
          start: 0,
          end: 50
        },
        false
      );
      const expected = {
        dimension: {
          width: 200,
          height: 50
        },
        position: {
          left: 10,
          top: 0
        }
      };
      expect(actual).toEqual(expected);
    });
  });

  describe('_makeTooltipSectorBound()', () => {
    it('should call _makeVerticalTooltipSectorBound() if vertical chart.', () => {
      const size = 200;
      const range = {
        start: 0,
        end: 5
      };
      const isVertical = true;
      const isLine = true;
      const actual = tooltip._makeTooltipSectorBound(size, range, isVertical, isLine);
      const expected = tooltip._makeVerticalTooltipSectorBound(size, range, isLine);
      expect(actual).toEqual(expected);
    });

    it('should call _makeHorizontalTooltipSectorBound() if horizontal chart.', () => {
      const size = 200;
      const range = {
        start: 0,
        end: 5
      };
      const isVertical = false;
      const isLine = true;
      const actual = tooltip._makeTooltipSectorBound(size, range, isVertical, isLine);
      const expected = tooltip._makeHorizontalTooltipSectorBound(size, range, isLine);
      expect(actual).toEqual(expected);
    });
  });
});
