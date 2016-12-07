/**
 * @Fileoverview  Theme manager.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var predicate = require('../helpers/predicate');
var defaultTheme = require('./defaultTheme');

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
     * Pick series names from raw series data.
     * @param {string} chartType - chart type
     * @param {object} rawSeriesData - raw series data
     * @returns {Array}
     * @private
     */
    _pickSeriesNames: function(chartType, rawSeriesData) {
        var seriesNames = [];
        if (predicate.isComboChart(chartType)) {
            tui.util.forEach(rawSeriesData, function(data, seriesName) {
                seriesNames.push(seriesName);
            });
        } else {
            seriesNames.push(chartType);
        }

        return seriesNames;
    },

    /**
     * Overwrite theme
     * @param {object} fromTheme - from theme
     * @param {object} toTheme - to theme
     * @private
     */
    _overwriteTheme: function(fromTheme, toTheme) {
        var self = this;

        tui.util.forEach(toTheme, function(item, key) {
            var fromItem = fromTheme[key];
            if (!fromItem) {
                return;
            }

            if (tui.util.isArray(fromItem)) {
                toTheme[key] = fromItem.slice();
            } else if (tui.util.isObject(fromItem)) {
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

        tui.util.forEachArray(chartConst.THEME_PROPS_MAP[componentType], function(propName) {
            if (tui.util.isExisty(theme[propName])) {
                validTheme[propName] = theme[propName];
            }
        });

        return validTheme;
    },

    /**
     * Create component theme with series name
     * @param {array.<string>} seriesNames - series names
     * @param {object} fromTheme - from theme
     * @param {object} toTheme - to theme
     * @param {string} componentType - component type
     * @returns {object}
     * @private
     */
    _createComponentThemeWithSeriesName: function(seriesNames, fromTheme, toTheme, componentType) {
        var self = this;
        var newTheme = {};

        fromTheme = fromTheme || {};

        tui.util.forEachArray(seriesNames, function(seriesName) {
            var theme = fromTheme[seriesName] || self._pickValidTheme(fromTheme, componentType);

            if (tui.util.keys(theme).length) {
                newTheme[seriesName] = JSON.parse(JSON.stringify(defaultTheme[componentType]));
                self._overwriteTheme(theme, newTheme[seriesName]);
            } else {
                newTheme[seriesName] = JSON.parse(JSON.stringify(toTheme));
            }
        });

        return newTheme;
    },

    /**
     * Set series colors.
     * @param {object} theme - theme
     * @param {object} rawTheme - raw theme
     * @param {Array.<string>} baseColors - base colors
     * @private
     */
    _setSingleColorsThemeIfNeed: function(theme, rawTheme, baseColors) {
        // TODO 추후 수정을 위해 singleColor파트는 최대한 건드리지 않음
        if (rawTheme && rawTheme.singleColors && rawTheme.singleColors.length) {
            theme.singleColors = rawTheme.singleColors.concat(baseColors);
        }
    },

    /**
     * Make each series's color
     * @param {[string]} themeColors Theme colors to use
     * @param {number} seriesCount Series count
     * @param {number} startColorIndex Start color index
     * @returns {[string]} colors
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
        var self = this;
        var seriesColors, seriesCount, hasOwnColors;
        var colorIndex = 0;

        rawSeriesThemes = rawSeriesThemes || {}; //분기문 간소화를위해

        tui.util.forEachArray(seriesTypes, function(seriesType) {
            if (rawSeriesThemes[seriesType]) {
                seriesColors = rawSeriesThemes[seriesType].colors;
                hasOwnColors = true;
            } else {
                seriesColors = rawSeriesThemes.colors || defaultTheme.series.colors;
                hasOwnColors = false;
            }

            seriesCount = rawSeriesData[seriesType] ? rawSeriesData[seriesType].length : 0;

            seriesThemes[seriesType].colors = self._makeEachSeriesColors(seriesColors,
                                                                         seriesCount,
                                                                         !hasOwnColors && colorIndex);

            self._setSingleColorsThemeIfNeed(seriesThemes[seriesType],
                                             rawSeriesThemes,
                                             seriesColors);

            // To distinct between series that use default theme, we make the colors different
            if (!hasOwnColors) {
                colorIndex = (seriesCount + colorIndex) % seriesColors.length;
            }
        });
    },

    /**
     * Init theme.
     * @param {string} themeName - theme name
     * @param {object} rawTheme - raw theme
     * @param {array.<string>} seriesNames - series names
     * @param {object} rawSeriesData - raw series data
     * @returns {object}
     * @private
     * @ignore
     */
    _initTheme: function(themeName, rawTheme, seriesNames, rawSeriesData) {
        var theme;

        // 테마 선택, 디폴트 테마 or 유저가 지정하는 컬러
        if (themeName !== chartConst.DEFAULT_THEME_NAME) {
            theme = JSON.parse(JSON.stringify(defaultTheme));
            this._overwriteTheme(rawTheme, theme);
        } else {
            theme = JSON.parse(JSON.stringify(rawTheme));
        }

        // 각 컴포넌트 테마에 시리즈명별로 뎊스를 넣어준다. theme.yAxis.테마들 -> theme.yAxis.line.테마들
        theme.yAxis = this._createComponentThemeWithSeriesName(seriesNames, rawTheme.yAxis, theme.yAxis, 'yAxis');
        theme.series = this._createComponentThemeWithSeriesName(seriesNames, rawTheme.series, theme.series, 'series');

        this._setSeriesColors(seriesNames, theme.series, rawTheme.series, rawSeriesData);

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
            theme.legend.label
        ];

        tui.util.forEach(theme.yAxis, function(_theme) {
            items.push(_theme.title, _theme.label);
        });

        tui.util.forEach(theme.series, function(_theme) {
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

        tui.util.forEachArray(targetThemes, function(item) {
            if (!item.fontFamily) {
                item.fontFamily = baseFont;
            }
        });
    },

    /**
     * Copy color theme to otherTheme from seriesTheme.
     * @param {object} seriesTheme - series theme
     * @param {object} otherTheme - other theme
     * @param {object} seriesName - series name
     * @private
     */
    _copySeriesColorTheme: function(seriesTheme, otherTheme, seriesName) {
        otherTheme[seriesName] = {
            colors: seriesTheme.colors,
            singleColors: seriesTheme.singleColors,
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

        tui.util.forEach(theme.series, function(seriesTheme, seriesName) {
            self._copySeriesColorTheme(seriesTheme, theme.legend, seriesName);
            self._copySeriesColorTheme(seriesTheme, theme.tooltip, seriesName);
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
        var theme, seriesNames;

        if (!rawTheme) {
            throw new Error('Not exist ' + themeName + ' theme.');
        }

        seriesNames = this._pickSeriesNames(chartType, rawSeriesData);

        theme = this._initTheme(themeName, rawTheme, seriesNames, rawSeriesData);

        this._inheritThemeFont(theme, seriesNames);
        this._copySeriesColorThemeToOther(theme);

        return theme;
    }
};
