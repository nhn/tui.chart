/**
 * @Fileoverview  Theme manager.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import predicate from '../helpers/predicate';
import defaultTheme from './defaultTheme';
import snippet from 'tui-code-snippet';

const themes = {};

export default {
  /**
   * Theme register.
   * @param {string} themeName theme name
   * @param {object} theme theme
   */
  register(themeName, theme) {
    theme = JSON.parse(JSON.stringify(theme));
    themes[themeName] = theme;
  },

  /**
   * Pick series types from raw series data.
   * @param {string} chartType - chart type
   * @param {object} rawSeriesData - raw series data
   * @returns {Array}
   * @private
   */
  _pickSeriesNames(chartType, rawSeriesData) {
    const seriesTypes = [];
    if (predicate.isComboChart(chartType)) {
      Object.keys(rawSeriesData).forEach(seriesType => {
        seriesTypes.push(seriesType);
      });
    } else {
      seriesTypes.push(chartType);
    }

    return seriesTypes;
  },

  /**
   * Overwrite theme
   * @param {object} fromTheme - from theme
   * @param {object} toTheme - to theme
   * @private
   */
  _overwriteTheme(fromTheme, toTheme) {
    Object.entries(toTheme).forEach(([key, item]) => {
      const fromItem = fromTheme[key];
      if (!fromItem && fromItem !== 0) {
        return;
      }

      if (snippet.isArray(fromItem)) {
        toTheme[key] = fromItem.slice();
      } else if (snippet.isObject(fromItem)) {
        this._overwriteTheme(fromItem, item);
      } else {
        toTheme[key] = fromItem;
      }
    });
  },

  /**
   * Pick valid theme properties.
   * @param {object} theme - theme
   * @param {string} componentType - component type (series or yAxis)
   * @returns {object}
   * @private
   */
  _pickValidTheme(theme, componentType) {
    const validTheme = {};

    chartConst.THEME_PROPS_MAP[componentType].forEach(propName => {
      if (snippet.isExisty(theme[propName])) {
        validTheme[propName] = theme[propName];
      }
    });

    return validTheme;
  },

  /**
   * Create component theme with series name
   * @param {Array.<string>} seriesTypes - series types
   * @param {object} fromTheme - from theme
   * @param {object} toTheme - to theme
   * @param {string} componentType - component type
   * @returns {object}
   * @private
   */
  _createComponentThemeWithSeriesName(seriesTypes, fromTheme, toTheme, componentType) {
    const newTheme = {};

    fromTheme = fromTheme || {};

    seriesTypes.forEach(seriesType => {
      const theme = fromTheme[seriesType] || this._pickValidTheme(fromTheme, componentType);

      if (snippet.keys(theme).length) {
        newTheme[seriesType] = JSON.parse(JSON.stringify(defaultTheme[componentType]));
        this._overwriteTheme(theme, newTheme[seriesType]);
      } else {
        newTheme[seriesType] = JSON.parse(JSON.stringify(toTheme));
      }
    });

    return newTheme;
  },

  /**
   * Make each series's color
   * @param {Array.<string>} themeColors Theme colors to use
   * @param {number} seriesCount Series count
   * @param {number} startColorIndex Start color index
   * @returns {Array.<string>} colors
   */
  _makeEachSeriesColors(themeColors, seriesCount, startColorIndex) {
    const colors = [];
    const themeColorsLen = themeColors.length;
    let colorIndex = startColorIndex || 0;

    for (let i = 0; i < seriesCount; i += 1) {
      colors.push(themeColors[colorIndex]);

      colorIndex += 1;

      if (colorIndex >= themeColorsLen) {
        colorIndex = 0;
      }
    }

    return colors;
  },

  /**
   * Set series colors theme.
   * @param {Array.<string>} seriesTypes - series type
   * @param {object} seriesThemes - series theme map
   * @param {object} rawSeriesThemes - raw series theme map
   * @param {object} rawSeriesData - raw series data
   * @param {boolean} isColorByPoint - check colorByPoint option
   * @private
   */
  _setSeriesColors(seriesTypes, seriesThemes, rawSeriesThemes, rawSeriesData, isColorByPoint) {
    let seriesColors, seriesCount, hasOwnColors;
    let colorIndex = 0;

    rawSeriesThemes = rawSeriesThemes || {}; // to simplify if/else statement

    seriesTypes.forEach(seriesType => {
      if (rawSeriesThemes[seriesType]) {
        seriesColors = rawSeriesThemes[seriesType].colors;
        hasOwnColors = true;
      } else {
        seriesColors = rawSeriesThemes.colors || defaultTheme.series.colors;
        hasOwnColors = false;
      }

      seriesCount = this._getSeriesThemeColorCount(rawSeriesData[seriesType], isColorByPoint);

      seriesThemes[seriesType].colors = this._makeEachSeriesColors(
        seriesColors,
        seriesCount,
        !hasOwnColors && colorIndex
      );

      // To distinct between series that use default theme, we make the colors different
      if (!hasOwnColors) {
        colorIndex = (seriesCount + colorIndex) % seriesColors.length;
      }
    });
  },

  /**
   * Get number of series theme color from seriesData
   * @param {object} rawSeriesDatum - raw series data contains series information
   * @param {boolean} isColorByPoint - check colorByPoint option
   * @returns {number} number of series theme color
   * @private
   */
  _getSeriesThemeColorCount(rawSeriesDatum, isColorByPoint) {
    let seriesCount = 0;

    if (rawSeriesDatum && rawSeriesDatum.length) {
      const existFirstSeriesDataLength =
        rawSeriesDatum[0] && rawSeriesDatum[0].data && rawSeriesDatum[0].data.length;

      if (isColorByPoint && existFirstSeriesDataLength) {
        seriesCount = Math.max(rawSeriesDatum.length, rawSeriesDatum[0].data.length);
      } else {
        seriesCount = rawSeriesDatum.length;
      }
    }

    return seriesCount;
  },

  _initTheme(themeName, rawTheme, seriesTypes, rawSeriesData, isColorByPoint) {
    let theme;

    if (themeName !== chartConst.DEFAULT_THEME_NAME) {
      // customized theme that overrides default theme
      theme = JSON.parse(JSON.stringify(defaultTheme));
      this._overwriteTheme(rawTheme, theme);
    } else {
      // default theme
      theme = JSON.parse(JSON.stringify(rawTheme));
    }

    // make each component theme have theme by series name. theme.yAxis.theme -> theme.yAxis.line.theme
    theme.yAxis = this._createComponentThemeWithSeriesName(
      seriesTypes,
      rawTheme.yAxis,
      theme.yAxis,
      'yAxis'
    );
    theme.series = this._createComponentThemeWithSeriesName(
      seriesTypes,
      rawTheme.series,
      theme.series,
      'series'
    );

    this._setSeriesColors(
      seriesTypes,
      theme.series,
      rawTheme.series,
      rawSeriesData,
      isColorByPoint
    );

    return theme;
  },

  /**
   * Create target themes for font inherit.
   * @param {object} theme - theme
   * @returns {Array.<object>}
   * @private
   */
  _createTargetThemesForFontInherit(theme) {
    const items = [
      theme.title,
      theme.xAxis.title,
      theme.xAxis.label,
      theme.legend.label,
      theme.plot.label
    ];

    snippet.forEach(theme.yAxis, _theme => {
      items.push(_theme.title, _theme.label);
    });

    snippet.forEach(theme.series, _theme => {
      items.push(_theme.label);
    });

    return items;
  },

  /**
   * Inherit theme font.
   * @param {object} theme theme
   * @private
   */
  _inheritThemeFont(theme) {
    const targetThemes = this._createTargetThemesForFontInherit(theme);
    const baseFont = theme.chart.fontFamily;

    targetThemes.forEach(item => {
      if (!item.fontFamily) {
        item.fontFamily = baseFont;
      }
    });
  },

  /**
   * Copy color theme to otherTheme from seriesTheme.
   * @param {object} seriesTheme - series theme
   * @param {object} otherTheme - other theme
   * @param {object} seriesType - series name
   * @private
   */
  _copySeriesColorTheme(seriesTheme, otherTheme, seriesType) {
    otherTheme[seriesType] = {
      colors: seriesTheme.colors,
      borderColor: seriesTheme.borderColor,
      selectionColor: seriesTheme.selectionColor
    };
  },

  /**
   * Copy series color theme to other components.
   * @param {object} theme theme
   * @private
   * @ignore
   */
  _copySeriesColorThemeToOther(theme) {
    snippet.forEach(theme.series, (seriesTheme, seriesType) => {
      this._copySeriesColorTheme(seriesTheme, theme.legend, seriesType);
      this._copySeriesColorTheme(seriesTheme, theme.tooltip, seriesType);
    });
  },

  /**
   * Get theme.
   * @param {string} themeName - theme name
   * @param {string} chartType - chart type
   * @param {object} rawSeriesData - raw series data
   * @param {boolean} isColorByPoint - check colorByPoint option
   * @returns {object}
   */
  get(themeName, chartType, rawSeriesData, isColorByPoint) {
    const rawTheme = themes[themeName];

    if (!rawTheme) {
      throw new Error(`Not exist ${themeName} theme.`);
    }

    const seriesTypes = this._pickSeriesNames(chartType, rawSeriesData);

    const theme = this._initTheme(themeName, rawTheme, seriesTypes, rawSeriesData, isColorByPoint);

    this._inheritThemeFont(theme, seriesTypes);
    this._copySeriesColorThemeToOther(theme);

    return theme;
  }
};
