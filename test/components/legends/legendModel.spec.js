/**
 * @fileoverview Test for LegendModel.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import LegendModel from '../../../src/js/components/legends/legendModel';
import renderUtil from '../../../src/js/helpers/renderUtil';

describe('Test for LegendModel', () => {
  let legendModel;

  beforeAll(() => {
    spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
  });

  beforeEach(() => {
    legendModel = new LegendModel({
      labels: {
        column: ['legend1', 'legend2'],
        line: ['legend3']
      },
      legendData: [
        {
          label: 'legend1',
          chartType: 'column',
          visible: true
        },
        {
          label: 'legend2',
          chartType: 'column',
          visible: true
        }
      ],
      theme: {
        label: {
          fontSize: 12
        },
        column: {
          colors: ['red', 'orange']
        }
      },
      chartType: 'column'
    });
  });

  describe('_addSendingDatum()', () => {
    it('add sending data of column, index 1', () => {
      legendModel.data[0] = {
        chartType: 'column',
        index: 0
      };
      legendModel.data[1] = {
        chartType: 'column',
        index: 1
      };
      legendModel._addSendingDatum(1);

      expect(legendModel.checkedIndexesMap.column[1]).toBe(true);
    });
  });

  describe('_initCheckedIndexes()', () => {
    it('should reset checkedIndexes(used to legend checkbox', () => {
      spyOn(legendModel, 'updateCheckedLegendsWith');
      legendModel.labelInfos = [
        {
          chartType: 'column',
          index: 0
        },
        {
          chartType: 'column',
          index: 1
        }
      ];

      legendModel._initCheckedIndexes();

      expect(legendModel.checkedWholeIndexes).toEqual([true, true]);
      expect(legendModel.updateCheckedLegendsWith).toHaveBeenCalledWith([0, 1]);
    });
  });

  describe('_setThemeToLegendData()', () => {
    it('should set theme information and index to legend data', () => {
      const legendData = [{}, {}];
      const theme = {
        colors: ['red', 'blue'],
        borderColor: 'black'
      };

      legendModel._setThemeToLegendData(legendData, theme);

      expect(legendData[0]).toEqual({
        theme: {
          color: 'red',
          borderColor: 'black'
        },
        index: 0,
        seriesIndex: 0
      });
      expect(legendData[1]).toEqual({
        theme: {
          color: 'blue',
          borderColor: 'black'
        },
        index: 1,
        seriesIndex: 1
      });
    });

    it('should set increased index for checked indexes only. If not, it should set index to -1', () => {
      const legendData = [{}, {}];
      const theme = {
        colors: ['red', 'blue'],
        borderColor: 'black'
      };
      const checkedIndexes = [];

      checkedIndexes[1] = true;
      legendModel._setThemeToLegendData(legendData, theme, checkedIndexes);

      expect(legendData[0].seriesIndex).toEqual(-1);
      expect(legendData[1].seriesIndex).toEqual(0);
    });
  });

  describe('_setData()', () => {
    it('should make label data by labelInfos and theme, if seriesTypes is empty', () => {
      const legendData = [{}, {}];
      const expected = [{}, {}];
      const colorTheme = {
        colors: ['red', 'blue'],
        borderColor: 'black'
      };

      legendModel.legendData = legendData;
      legendModel.theme[legendModel.chartType] = colorTheme;

      legendModel._setData();

      const actual = legendModel.data;
      legendModel._setThemeToLegendData(expected, colorTheme);

      expect(actual).toEqual(expected);
    });

    it('should make legend data by seriesTypes, and set index for each chartType', () => {
      const legendData = [{}, {}];
      const seriesTypes = ['column', 'line'];
      const labelMap = {
        column: ['legend1'],
        line: ['legend2']
      };
      const theme = {
        column: {
          colors: ['red']
        },
        line: {
          colors: ['blue']
        }
      };

      legendModel.legendData = legendData;
      legendModel.theme = theme;
      legendModel.seriesTypes = seriesTypes;
      legendModel.labels = labelMap;

      legendModel._setData();

      const expected = [
        {
          theme: {
            color: 'red'
          },
          index: 0,
          seriesIndex: 0
        },
        {
          theme: {
            color: 'blue'
          },
          index: 0,
          seriesIndex: 0
        }
      ];

      expect(legendModel.data).toEqual(expected);
    });
  });

  describe('toggleSelectedIndex()', () => {
    it('should set index to selectedIndex, when selectedIndex is not same to index', () => {
      legendModel.toggleSelectedIndex(0);

      expect(legendModel.selectedIndex).toBe(0);
    });

    it('should return null if selectedIndex is same to index', () => {
      legendModel.selectedIndex = 0;
      legendModel.toggleSelectedIndex(0);

      expect(legendModel.selectedIndex).toBeNull();
    });
  });

  describe('getCheckedIndexes()', () => {
    it('return checked data of series of singleChart', () => {
      const checkedLegends = [true, true];

      legendModel.checkedIndexesMap = {
        pie: checkedLegends
      };
      legendModel.chartType = 'pie';

      const actual = legendModel.getCheckedIndexes();
      const expected = {
        pie: [true, true]
      };

      expect(actual).toEqual(expected);
    });

    it('return checked data of series of comboChart', () => {
      const checkedIndexesMap = {
        column: [true, true],
        line: [true]
      };

      legendModel.checkedIndexesMap = checkedIndexesMap;
      legendModel.chartType = 'combo';

      expect(legendModel.getCheckedIndexes()).toEqual(checkedIndexesMap);
    });
  });

  describe('updateCheckedData()', () => {
    it('should update checkbox check data', () => {
      const checkedIndexes = [];
      const checkedIndexesMap = {
        column: [true, false],
        line: [true]
      };

      checkedIndexes[0] = true;
      checkedIndexes[2] = true;

      legendModel.data = [
        {
          chartType: 'column',
          index: 0
        },
        {
          chartType: 'column',
          index: 1
        },
        {
          chartType: 'line',
          index: 0
        }
      ];

      legendModel.updateCheckedLegendsWith([0, 2]);

      expect(legendModel.checkedIndexesMap).toEqual(checkedIndexesMap);
      expect(legendModel.checkedWholeIndexes).toEqual(checkedIndexes);
    });
  });
});
