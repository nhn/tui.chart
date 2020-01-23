/**
 * @fileoverview Test for themeManager.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import themeManager from '../../src/js/themes/themeManager';
import chartConst from '../../src/js/const';
import defaultTheme from '../../src/js/themes/defaultTheme';

describe('Test for themeManager', () => {
  describe('_pickSeriesNames()', () => {
    it('pick series names from raw series data, when single chart', () => {
      const chartType = chartConst.CHART_TYPE_BAR;
      const actual = themeManager._pickSeriesNames(chartType);

      expect(actual).toEqual([chartConst.CHART_TYPE_BAR]);
    });
  });

  describe('_overwriteTheme()', () => {
    it('overwrite theme to toTheme from fromTheme', () => {
      const fromTheme = {
        series: {
          color: ['blue'],
          borderColor: 'black'
        }
      };
      const toTheme = {
        series: {
          color: ['red']
        }
      };

      themeManager._overwriteTheme(fromTheme, toTheme);

      expect(toTheme).toEqual({
        series: {
          color: ['blue']
        }
      });
    });
  });

  describe('_pickValidTheme()', () => {
    it('pick valid theme properties, when series component', () => {
      const theme = {
        column: {
          label: {}
        },
        label: {},
        colors: [],
        borderColor: ''
      };
      const componentType = 'series';
      const actual = themeManager._pickValidTheme(theme, componentType);

      expect(actual).toEqual({
        label: {},
        colors: [],
        borderColor: ''
      });
    });

    it('pick valid theme properties, when yAxis component', () => {
      const theme = {
        column: {
          label: {}
        },
        label: {},
        title: {},
        tickColor: ''
      };
      const componentType = 'yAxis';
      const actual = themeManager._pickValidTheme(theme, componentType);

      expect(actual).toEqual({
        label: {},
        title: {},
        tickColor: ''
      });
    });
  });

  describe('_createComponentThemeWithSeriesName()', () => {
    it('create component theme with series name, when fromTheme map has key of series name', () => {
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN];
      const fromTheme = {
        column: {
          label: {
            fontSize: 15
          },
          title: {
            fontSize: 18
          }
        }
      };
      const toTheme = {};
      const componentType = 'yAxis';
      const actual = themeManager._createComponentThemeWithSeriesName(
        seriesTypes,
        fromTheme,
        toTheme,
        componentType
      );
      const expected = JSON.parse(JSON.stringify(defaultTheme[componentType]));

      themeManager._overwriteTheme(fromTheme.column, expected);

      expect(actual.column).toEqual(expected);
    });

    it('create component theme with series name, when fromTheme map has not key of series name', () => {
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN];
      const fromTheme = {};
      const toTheme = {
        label: {
          fontSize: 15,
          color: '#000000'
        },
        title: {
          fontSize: 18
        }
      };
      const componentType = 'yAxis';
      const actual = themeManager._createComponentThemeWithSeriesName(
        seriesTypes,
        fromTheme,
        toTheme,
        componentType
      );
      const expected = {
        column: toTheme
      };

      expect(actual).toEqual(expected);
    });
  });

  describe('_makeEachSeriesColor()', () => {
    it('Make color data with given theme data', () => {
      const colors = themeManager._makeEachSeriesColors(['a', 'b', 'c', 'd'], 3);

      expect(colors).toEqual(['a', 'b', 'c']);
    });

    it('Make color data from start of given theme data if there has not enought colors', () => {
      const colors = themeManager._makeEachSeriesColors(['a', 'b', 'c', 'd'], 6);

      expect(colors).toEqual(['a', 'b', 'c', 'd', 'a', 'b']);
    });

    it('Make color data from given data index', () => {
      const colors = themeManager._makeEachSeriesColors(['a', 'b', 'c', 'd'], 6, 2);

      expect(colors).toEqual(['c', 'd', 'a', 'b', 'c', 'd']);
    });
  });

  describe('_setSeriesColors()', () => {
    it('set series colors theme, when single series', () => {
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN];
      const seriesThemeMap = {
        column: {}
      };
      const rawSeriesThemeMap = {
        colors: ['a', 'b', 'c']
      };
      const rawSeriesData = {
        column: [1, 2, 3, 4, 5]
      };

      themeManager._setSeriesColors(seriesTypes, seriesThemeMap, rawSeriesThemeMap, rawSeriesData);

      expect(seriesThemeMap.column).toEqual({
        colors: ['a', 'b', 'c', 'a', 'b']
      });
    });

    it('set series colors theme, when combo series with defaultTheme', () => {
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
      const seriesThemeMap = {
        column: {},
        line: {}
      };
      const rawSeriesThemeMap = {};
      const rawSeriesData = {
        column: [{}, {}, {}, {}, {}, {}],
        line: [{}, {}, {}, {}]
      };

      themeManager._setSeriesColors(seriesTypes, seriesThemeMap, rawSeriesThemeMap, rawSeriesData);

      expect(seriesThemeMap).toEqual({
        column: {
          colors: ['#00a9ff', '#ffb840', '#ff5a46', '#00bd9f', '#785fff', '#f28b8c']
        },
        line: {
          colors: ['#989486', '#516f7d', '#29dbe3', '#dddddd']
        }
      });
    });

    it('set series colors theme, when combo series', () => {
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
      const seriesThemeMap = {
        column: {},
        line: {}
      };
      const rawSeriesThemeMap = {
        column: {
          colors: ['red', 'green', 'blue']
        },
        line: {
          colors: ['white', 'block']
        }
      };
      const rawSeriesData = {
        column: [{}, {}, {}, {}, {}],
        line: [{}, {}, {}]
      };

      themeManager._setSeriesColors(seriesTypes, seriesThemeMap, rawSeriesThemeMap, rawSeriesData);
      expect(seriesThemeMap).toEqual({
        column: {
          colors: ['red', 'green', 'blue', 'red', 'green']
        },
        line: {
          colors: ['white', 'block', 'white']
        }
      });
    });
    it('set series colors theme with default and user theme color', () => {
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
      const seriesThemeMap = {
        column: {},
        line: {}
      };
      const rawSeriesThemeMap = {
        line: {
          colors: ['white', 'block']
        }
      };
      const rawSeriesData = {
        column: [{}, {}, {}, {}, {}],
        line: [{}, {}, {}]
      };

      themeManager._setSeriesColors(seriesTypes, seriesThemeMap, rawSeriesThemeMap, rawSeriesData);
      expect(seriesThemeMap).toEqual({
        column: {
          colors: ['#00a9ff', '#ffb840', '#ff5a46', '#00bd9f', '#785fff']
        },
        line: {
          colors: ['white', 'block', 'white']
        }
      });
    });
  });

  describe('_getSeriesThemeColorCount()', () => {
    it('Must be the same as the data length of one legend when value of isColorByPoint is true.', () => {
      const rawSeriesDatum = [
        {
          name: 'Budget',
          data: [5000, 3000, 5000, 7000, 6000, 4000, 1000]
        }
      ];
      const isColorByPoint = true;

      const themeCount = themeManager._getSeriesThemeColorCount(rawSeriesDatum, isColorByPoint);

      expect(themeCount).toBe(7);
    });
  });

  describe('_initTheme()', () => {
    it('init theme', () => {
      const themeName = 'newTheme';
      const rawTheme = {
        series: {
          colors: ['gray'],
          label: {
            color: '#000000'
          }
        }
      };
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN];
      const actual = themeManager._initTheme(themeName, rawTheme, seriesTypes, { column: [] });

      expect(actual.series.column.colors).toEqual([]);
    });

    it('init theme, when combo chart', () => {
      const themeName = 'newTheme';
      const rawTheme = {
        series: {
          column: {
            colors: ['red', 'green', 'blue']
          },
          line: {
            colors: ['white', 'block']
          },
          label: {
            color: '#000000'
          }
        }
      };
      const seriesTypes = [chartConst.CHART_TYPE_COLUMN, chartConst.CHART_TYPE_LINE];
      const rawSeriesData = {
        column: [{}, {}, {}, {}, {}],
        line: [{}, {}, {}]
      };
      const actual = themeManager._initTheme(themeName, rawTheme, seriesTypes, rawSeriesData);

      expect(actual.series.column.colors).toEqual(['red', 'green', 'blue', 'red', 'green']);
      expect(actual.series.line.colors).toEqual(['white', 'block', 'white']);
    });
  });

  describe('_createTargetThemesForFontInherit()', () => {
    it('create target theme for font inherit, when single chart', () => {
      const theme = {
        title: {},
        xAxis: {
          title: {},
          label: {}
        },
        yAxis: {
          column: {
            title: {},
            label: {}
          }
        },
        series: {
          column: {
            label: {}
          }
        },
        legend: {
          label: {}
        },
        plot: {
          label: {}
        }
      };
      const actual = themeManager._createTargetThemesForFontInherit(theme);

      expect(actual).toEqual([
        theme.title,
        theme.xAxis.title,
        theme.xAxis.label,
        theme.legend.label,
        theme.yAxis.column.title,
        theme.yAxis.column.label,
        theme.series.column.label,
        theme.plot.label
      ]);
    });

    it('create target theme for font inherit, when combo chart', () => {
      const theme = {
        title: {},
        xAxis: {
          title: {},
          label: {}
        },
        yAxis: {
          column: {
            title: {},
            label: {}
          },
          line: {
            title: {},
            label: {}
          }
        },
        series: {
          column: {
            label: {}
          },
          line: {
            label: {}
          }
        },
        legend: {
          label: {}
        },
        plot: {
          label: {}
        }
      };
      const actual = themeManager._createTargetThemesForFontInherit(theme);

      expect(actual).toEqual([
        theme.title,
        theme.xAxis.title,
        theme.xAxis.label,
        theme.legend.label,
        theme.yAxis.column.title,
        theme.yAxis.column.label,
        theme.yAxis.line.title,
        theme.yAxis.line.label,
        theme.series.column.label,
        theme.series.line.label,
        theme.plot.label
      ]);
    });
  });

  describe('_inheritThemeFont', () => {
    it('inherit theme font', () => {
      const theme = {
        chart: {
          fontFamily: 'Verdana'
        },
        title: {},
        xAxis: {
          title: {},
          label: {}
        },
        legend: {
          label: {}
        },
        plot: {
          label: {}
        }
      };
      themeManager._inheritThemeFont(theme, [theme.title, theme.xAxis.title]);

      expect(theme.title.fontFamily).toBe('Verdana');
      expect(theme.xAxis.title.fontFamily).toBe('Verdana');
    });
  });

  describe('_copySeriesColorTheme()', () => {
    it('copy color theme to otherTheme from seriesTheme', () => {
      const seriesTheme = {
        colors: ['red', 'orange'],
        borderColor: 'blue',
        selectionColor: 'yellow'
      };
      const otherTheme = {};

      themeManager._copySeriesColorTheme(seriesTheme, otherTheme, chartConst.CHART_TYPE_COLUMN);

      expect(otherTheme).toEqual({
        column: {
          colors: ['red', 'orange'],
          borderColor: 'blue',
          selectionColor: 'yellow'
        }
      });
    });
  });

  describe('_copySeriesColorThemeToOther()', () => {
    it('copy series color theme to other components', () => {
      const theme = {
        series: {
          column: {
            colors: ['red', 'orange'],
            borderColor: 'blue',
            selectionColor: 'yellow'
          }
        },
        legend: {},
        tooltip: {}
      };

      themeManager._copySeriesColorThemeToOther(theme);

      expect(theme.legend).toEqual({
        column: {
          colors: ['red', 'orange'],
          borderColor: 'blue',
          selectionColor: 'yellow'
        }
      });

      expect(theme.tooltip).toEqual({
        column: {
          colors: ['red', 'orange'],
          borderColor: 'blue',
          selectionColor: 'yellow'
        }
      });
    });
  });

  describe('get()', () => {
    beforeEach(() => {
      themeManager.register('newTheme', {
        plot: {
          lineColor: '#e5dbc4',
          background: '#f6f1e5'
        },
        series: {
          label: {
            color: '#000000'
          }
        }
      });
    });

    it('get theme', () => {
      const themeName = 'newTheme';
      const chartType = chartConst.CHART_TYPE_COLUMN;
      const rawSeriesData = {
        column: [{}, {}]
      };

      const theme = themeManager.get(themeName, chartType, rawSeriesData);

      expect(theme.plot).toEqual({
        lineColor: '#e5dbc4',
        background: '#f6f1e5',
        label: theme.plot.label
      });
    });

    it('get theme, when not exist theme', () => {
      expect(() => {
        themeManager.get('newTheme1');
      }).toThrowError('Not exist newTheme1 theme.');
    });
  });
});
