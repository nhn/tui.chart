/**
 * @Fileoverview  Theme manager.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var defaultTheme = require('./defaultTheme');
var snippet = require('tui-code-snippet');

var themes = {};

module.exports = {
    /**
     * Theme register.
     * @param {string} themeName theme name
     * @param {object} theme theme
     */
    register: function(themeName, theme) {
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
    _pickSeriesNames: function(chartType, rawSeriesData) {
        var seriesTypes = [];
        if (predicate.isComboChart(chartType)) {
            snippet.forEach(rawSeriesData, function(data, seriesType) {
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
    _overwriteTheme: function(fromTheme, toTheme) {
        var self = this;

        snippet.forEach(toTheme, function(item, key) {
            var fromItem = fromTheme[key];
            if (!fromItem && fromItem !== 0) {
                return;
            }

            if (snippet.isArray(fromItem)) {
                toTheme[key] = fromItem.slice();
            } else if (snippet.isObject(fromItem)) {
                self._overwriteTheme(fromItem, item);
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
    _pickValidTheme: function(theme, componentType) {
        var validTheme = {};

        snippet.forEachArray(chartConst.THEME_PROPS_MAP[componentType], function(propName) {
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
    _createComponentThemeWithSeriesName: function(seriesTypes, fromTheme, toTheme, componentType) {
        var self = this;
        var newTheme = {};

        fromTheme = fromTheme || {};

        snippet.forEachArray(seriesTypes, function(seriesType) {
            var theme = fromTheme[seriesType] || self._pickValidTheme(fromTheme, componentType);

            if (snippet.keys(theme).length) {
                newTheme[seriesType] = JSON.parse(JSON.stringify(defaultTheme[componentType]));
                self._overwriteTheme(theme, newTheme[seriesType]);
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
    _makeEachSeriesColors: function(themeColors, seriesCount, startColorIndex) {
        var colors = [];
        var themeColorsLen = themeColors.length;
        var colorIndex = startColorIndex || 0;
        var i;

        for (i = 0; i < seriesCount; i += 1) {
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
     * @private
     */
    _setSeriesColors: function(seriesTypes, seriesThemes, rawSeriesThemes, rawSeriesData) {
        var seriesColors, seriesCount, hasOwnColors;
        var colorIndex = 0;

        rawSeriesThemes = rawSeriesThemes || {}; // to simplify if/else statement

        snippet.forEachArray(seriesTypes, function(seriesType) {
            if (rawSeriesThemes[seriesType]) {
                seriesColors = rawSeriesThemes[seriesType].colors;
                hasOwnColors = true;
            } else {
                seriesColors = rawSeriesThemes.colors || defaultTheme.series.colors;
                hasOwnColors = false;
            }

            seriesCount = this._getSeriesThemeColorCount(rawSeriesData[seriesType]);

            seriesThemes[seriesType].colors = this._makeEachSeriesColors(seriesColors, seriesCount,
                !hasOwnColors && colorIndex);

            // To distinct between series that use default theme, we make the colors different
            if (!hasOwnColors) {
                colorIndex = (seriesCount + colorIndex) % seriesColors.length;
            }
        }, this);
    },

    /**
     * Get number of series theme color from seriesData
     * @param {object} rawSeriesDatum - raw series data contains series information
     * @returns {number} number of series theme color
     * @private
     */
    _getSeriesThemeColorCount: function(rawSeriesDatum) {
        var seriesCount = 0;

        if (rawSeriesDatum && rawSeriesDatum.length) {
            if (rawSeriesDatum.colorLength) {
                seriesCount = rawSeriesDatum.colorLength;
            } else if (rawSeriesDatum[0] && rawSeriesDatum[0].data && rawSeriesDatum[0].data.length) {
                seriesCount = Math.max(rawSeriesDatum.length, rawSeriesDatum[0].data.length);
            } else {
                seriesCount = rawSeriesDatum.length;
            }
        }

        return seriesCount;
    },

    /**
     * Init theme.
     * @param {string} themeName - theme name
     * @param {object} rawTheme - raw theme
     * @param {Array.<string>} seriesTypes - series types
     * @param {object} rawSeriesData - raw series data
     * @returns {object}
     * @private
     * @ignore
     */
    _initTheme: function(themeName, rawTheme, seriesTypes, rawSeriesData) {
        var theme;

        if (themeName !== chartConst.DEFAULT_THEME_NAME) { // customized theme that overrides default theme
            theme = JSON.parse(JSON.stringify(defaultTheme));
            this._overwriteTheme(rawTheme, theme);
        } else { // default theme
            theme = JSON.parse(JSON.stringify(rawTheme));
        }

        // make each component theme have theme by series name. theme.yAxis.theme -> theme.yAxis.line.theme
        theme.yAxis = this._createComponentThemeWithSeriesName(seriesTypes, rawTheme.yAxis, theme.yAxis, 'yAxis');
        theme.series = this._createComponentThemeWithSeriesName(seriesTypes, rawTheme.series, theme.series, 'series');

        this._setSeriesColors(seriesTypes, theme.series, rawTheme.series, rawSeriesData);

        return theme;
    },

    /**
     * Create target themes for font inherit.
     * @param {object} theme - theme
     * @returns {Array.<object>}
     * @private
     */
    _createTargetThemesForFontInherit: function(theme) {
        var items = [
            theme.title,
            theme.xAxis.title,
            theme.xAxis.label,
            theme.legend.label,
            theme.plot.label
        ];

        snippet.forEach(theme.yAxis, function(_theme) {
            items.push(_theme.title, _theme.label);
        });

        snippet.forEach(theme.series, function(_theme) {
            items.push(_theme.label);
        });

        return items;
    },

    /**
     * Inherit theme font.
     * @param {object} theme theme
     * @private
     */
    _inheritThemeFont: function(theme) {
        var targetThemes = this._createTargetThemesForFontInherit(theme);
        var baseFont = theme.chart.fontFamily;

        snippet.forEachArray(targetThemes, function(item) {
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
    _copySeriesColorTheme: function(seriesTheme, otherTheme, seriesType) {
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
    _copySeriesColorThemeToOther: function(theme) {
        var self = this;

        snippet.forEach(theme.series, function(seriesTheme, seriesType) {
            self._copySeriesColorTheme(seriesTheme, theme.legend, seriesType);
            self._copySeriesColorTheme(seriesTheme, theme.tooltip, seriesType);
        });
    },

    /**
     * Get theme.
     * @param {string} themeName - theme name
     * @param {string} chartType - chart type
     * @param {object} rawSeriesData - raw series data
     * @returns {object}
     */
    get: function(themeName, chartType, rawSeriesData) {
        var rawTheme = themes[themeName];
        var theme, seriesTypes;

        if (!rawTheme) {
            throw new Error('Not exist ' + themeName + ' theme.');
        }

        seriesTypes = this._pickSeriesNames(chartType, rawSeriesData);

        theme = this._initTheme(themeName, rawTheme, seriesTypes, rawSeriesData);

        this._inheritThemeFont(theme, seriesTypes);
        this._copySeriesColorThemeToOther(theme);

        return theme;
    }
};
