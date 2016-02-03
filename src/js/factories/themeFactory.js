/**
 * @fileoverview  Theme factory play role register theme.
 *                Also, you can get theme from this factory.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    defaultTheme = require('../themes/defaultTheme');

var themes = {};

module.exports = {
    /**
     * Get theme.
     * @param {string} themeName theme name
     * @returns {object} theme object
     */
    get: function(themeName) {
        var theme = themes[themeName];

        if (!theme) {
            throw new Error('Not exist ' + themeName + ' theme.');
        }

        return theme;
    },

    /**
     * Theme register.
     * @param {string} themeName theme name
     * @param {object} theme theme
     */
    register: function(themeName, theme) {
        var targetItems;
        theme = JSON.parse(JSON.stringify(theme));

        if (themeName !== chartConst.DEFAULT_THEME_NAME) {
            theme = this._initTheme(theme);
        }

        targetItems = this._getInheritTargetThemeItems(theme);

        this._inheritThemeFont(theme, targetItems);
        this._copyColorInfo(theme);
        themes[themeName] = theme;
    },

    /**
     * Init theme.
     * @param {object} theme theme
     * @returns {object} theme
     * @private
     * @ignore
     */
    _initTheme: function(theme) {
        var cloneTheme = JSON.parse(JSON.stringify(defaultTheme)),
            newTheme;

        this._concatDefaultColors(theme, cloneTheme.series.colors)
        newTheme = this._overwriteTheme(theme, cloneTheme);

        newTheme = this._copyProperty({
            propName: 'yAxis',
            fromTheme: theme,
            toTheme: newTheme,
            rejectionProps: chartConst.YAXIS_PROPS
        });

        newTheme = this._copyProperty({
            propName: 'series',
            fromTheme: theme,
            toTheme: newTheme,
            rejectionProps: chartConst.SERIES_PROPS
        });

        return newTheme;
    },

    /**
     * Filter chart types.
     * @param {object} target target charts
     * @param {Array.<string>} rejectionProps reject property
     * @returns {Object} filtered charts.
     * @private
     */
    _filterChartTypes: function(target, rejectionProps) {
        var result;
        if (!target) {
            return [];
        }

        result = tui.util.filter(target, function(item, name) {
            return tui.util.inArray(name, rejectionProps) === -1;
        });
        return result;
    },

    /**
     * Concat colors.
     * @param {object} theme theme
     * @param {Array.<string>} seriesColors series colors
     * @private
     */
    _concatColors: function(theme, seriesColors) {
        if (theme.colors) {
            theme.colors = theme.colors.concat(seriesColors);
        }

        if (theme.singleColors) {
            theme.singleColors = theme.singleColors.concat(seriesColors);
        }
    },

    /**
     * Concat default colors.
     * @param {object} theme theme
     * @param {Array.<string>} seriesColors series colors
     * @private
     */
    _concatDefaultColors: function(theme, seriesColors) {
        var chartTypes;

        if (!theme.series) {
            return;
        }

        chartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(chartTypes).length) {
            this._concatColors(theme.series, seriesColors);
        } else {
            tui.util.forEach(chartTypes, function(item) {
                this._concatColors(item, seriesColors);
            }, this);
        }
    },

    /**
     * Overwrite theme
     * @param {object} from from theme property
     * @param {object} to to theme property
     * @returns {object} result property
     * @private
     */
    _overwriteTheme: function(from, to) {
        tui.util.forEach(to, function(item, key) {
            var fromItem = from[key];
            if (!fromItem) {
                return;
            }

            if (tui.util.isArray(fromItem)) {
                to[key] = fromItem.slice();
            } else if (tui.util.isObject(fromItem)) {
                this._overwriteTheme(fromItem, item);
            } else {
                to[key] = fromItem;
            }
        }, this);

        return to;
    },

    /**
     * Copy property.
     * @param {object} params parameters
     *      @param {string} params.propName property name
     *      @param {object} params.fromTheme from property
     *      @param {object} params.toTheme tp property
     *      @param {Array.<string>} params.rejectionProps reject property name
     * @returns {object} copied property
     * @private
     */
    _copyProperty: function(params) {
        var chartTypes;

        if (!params.toTheme[params.propName]) {
            return params.toTheme;
        }

        chartTypes = this._filterChartTypes(params.fromTheme[params.propName], params.rejectionProps);
        if (tui.util.keys(chartTypes).length) {
            tui.util.forEach(chartTypes, function(item, key) {
                var cloneTheme = JSON.parse(JSON.stringify(defaultTheme[params.propName]));
                params.fromTheme[params.propName][key] = this._overwriteTheme(item, cloneTheme);
            }, this);

            params.toTheme[params.propName] = params.fromTheme[params.propName];
        }

        return params.toTheme;
    },

    /**
     * Copy color info to legend
     * @param {object} seriesTheme series theme
     * @param {object} legendTheme legend theme
     * @param {Array.<string>} colors colors
     * @private
     */
    _copyColorInfoToOther: function(seriesTheme, legendTheme, colors) {
        legendTheme.colors = colors || seriesTheme.colors;
        if (seriesTheme.singleColors) {
            legendTheme.singleColors = seriesTheme.singleColors;
        }
        if (seriesTheme.borderColor) {
            legendTheme.borderColor = seriesTheme.borderColor;
        }
        if (seriesTheme.selectionColor) {
            legendTheme.selectionColor = seriesTheme.selectionColor;
        }
    },

    /**
     * Get target items about font inherit.
     * @param {object} theme theme
     * @returns {Array.<object>} target items
     * @private
     */
    _getInheritTargetThemeItems: function(theme) {
        var items = [
                theme.title,
                theme.xAxis.title,
                theme.xAxis.label,
                theme.legend.label
            ],
            yAxisChartTypeThems = this._filterChartTypes(theme.yAxis, chartConst.YAXIS_PROPS),
            seriesChartTypeThemes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);

        if (!tui.util.keys(yAxisChartTypeThems).length) {
            items.push(theme.yAxis.title);
            items.push(theme.yAxis.label);
        } else {
            tui.util.forEach(yAxisChartTypeThems, function(chatTypeTheme) {
                items.push(chatTypeTheme.title);
                items.push(chatTypeTheme.label);
            });
        }

        if (!tui.util.keys(seriesChartTypeThemes).length) {
            items.push(theme.series.label);
        } else {
            tui.util.forEach(seriesChartTypeThemes, function(chatTypeTheme) {
                items.push(chatTypeTheme.label);
            });
        }
        return items;
    },

    /**
     * Inherit theme font.
     * @param {object} theme theme
     * @param {Array.<object>} targetItems target theme items
     * @private
     */
    _inheritThemeFont: function(theme, targetItems) {
        var baseFont = theme.chart.fontFamily;

        tui.util.forEachArray(targetItems, function(item) {
            if (!item.fontFamily) {
                item.fontFamily = baseFont;
            }
        });
    },

    /**
     * Copy color info.
     * @param {object} theme theme
     * @private
     * @ignore
     */
    _copyColorInfo: function(theme) {
        var seriesChartTypes = this._filterChartTypes(theme.series, chartConst.SERIES_PROPS);
        if (!tui.util.keys(seriesChartTypes).length) {
            this._copyColorInfoToOther(theme.series, theme.legend);
            this._copyColorInfoToOther(theme.series, theme.tooltip);
        } else {
            tui.util.forEach(seriesChartTypes, function(item, chartType) {
                theme.legend[chartType] = {};
                theme.tooltip[chartType] = {};
                this._copyColorInfoToOther(item, theme.legend[chartType], item.colors || theme.legend.colors);
                this._copyColorInfoToOther(item, theme.tooltip[chartType], item.colors || theme.tooltip.colors);
                delete theme.legend.colors;
                delete theme.tooltip.colors;
            }, this);
        }
    }
};
