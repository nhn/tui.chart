/**
 * @fileoverview  Theme Factory.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var DEFAULT_THEME_NAME = 'default';

var themes = {},
    _initTheme, _inheritThemeProperty;

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

    theme.series = {
        colors: theme.chart.colors
    };
    theme.legend.colors = theme.chart.colors;
};

/**
 * Init theme.
 * @param {object} theme theme
 * @returns {object} theme
 * @private
 */
_initTheme = function(theme) {
    var defaultTheme = themes[DEFAULT_THEME_NAME],
        cloneTheme = JSON.parse(JSON.stringify(defaultTheme));

    theme = ne.util.extend(cloneTheme, theme);

    return theme;
};

module.exports = {
    /**
     * Get theme.
     * @param {string} themeName chart type
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
     * @param {class} theme theme
     */
    register: function(themeName, theme) {
        var defaultTheme = themes[DEFAULT_THEME_NAME];

        if (themeName !== DEFAULT_THEME_NAME && defaultTheme) {
            theme = _initTheme(theme);
        }

        _inheritThemeProperty(theme);

        themes[themeName] = theme;
    }
};