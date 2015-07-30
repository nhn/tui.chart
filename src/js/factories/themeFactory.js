/**
 * @fileoverview  Theme Factory.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js');

var themes = {},
    _initTheme, _copyColors, _inheritThemeProperty;

/**
 * Inherit theme property.
 * @param {object} theme theme
 * @private
 */
_inheritThemeProperty = function(theme) {
    var baseFont = theme.chart.fontFamily,
        items = [
            theme.title,
            theme.vAxis.title,
            theme.vAxis.label,
            theme.hAxis.title,
            theme.hAxis.label,
            theme.legend.label
        ];
    ne.util.forEachArray(items, function(item) {
        if (!item.fontFamily) {
            item.fontFamily = baseFont;
        }
    });
    theme.legend.colors = theme.series.colors;
    if (theme.series.borderColor) {
        theme.legend.borderColor = theme.series.borderColor;
    }
};

/**
 * Copy colors.
 * @param {array} from colors
 * @param {array} to colors
 * @private
 */
_copyColors = function(from, to) {
    var fromLen = from.length,
        diffLen = fromLen - to.length,
        start,
        i;
    if (diffLen <= 0) {
        return to;
    }

    start = fromLen - diffLen;
    for (i = start; i < fromLen; i += 1) {
        to[i] = from[i];
    }
};

/**
 * Init theme.
 * @param {object} theme theme
 * @returns {object} theme
 * @private
 */
_initTheme = function(theme) {
    var defaultTheme = themes[chartConst.DEFAULT_THEME_NAME],
        cloneTheme = JSON.parse(JSON.stringify(defaultTheme)),
        seriesColors = cloneTheme.series.colors;
    if (theme.series && theme.series.colors) {
        _copyColors(seriesColors, theme.series.colors);
    }

    if (theme.series && theme.series.singleColors) {
        _copyColors(seriesColors, theme.series.singleColors);
    }

    theme = ne.util.extend(cloneTheme, theme);

    return theme;
};

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
        var defaultTheme = themes[chartConst.DEFAULT_THEME_NAME];

        if (themeName !== chartConst.DEFAULT_THEME_NAME && defaultTheme) {
            theme = _initTheme(theme);
        }

        _inheritThemeProperty(theme);

        themes[themeName] = theme;
    }
};