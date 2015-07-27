/**
 * @fileoverview Raphael render plugin
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var HIDDEN_WIDTH = 1;

var Raphael = window.Raphael,
    pluginName = 'raphael',
    browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8,
    BarChart,
    pluginRaphael;

/**
 * @classdesc This class is BarChart graph renderer.
 * @class
 */
BarChart = ne.util.defineClass({
    /**
     * set Rect
     * @param {object} paper raphael paper
     * @param {string} color series color
     * @param {string} borderColor series borderColor
     * @param {object} bound bound
     * @param {string} id tooltip id
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _setRect: function(paper, color, borderColor, bound, id, inCallback, outCallback) {
        var rect = paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: color,
            stroke: borderColor
        });

        rect.hover(function() {
            inCallback(bound, id);
        }, function() {
            outCallback(id);
        });
    },

    /**
     * Columns(Vertical bars) bars renderer
     * @param {object} paper raphael paper
     * @param {{width: number, height: number}} dimension graph dimension
     * @param {number} maxBarWidth max bar width
     * @param {[array]} values percent values
     * @param {object} theme theme
     * @param {string} lastColor last color
     * @param {number} groupIndex bar group index
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private;
     */
    _renderColumns: function(paper, dimension, maxBarWidth, values, theme, lastColor, groupIndex, inCallback, outCallback) {
        var colors = theme.colors,
            borderColor = theme.borderColor || 'none',
            barWidth = parseInt(maxBarWidth / (values.length + 1), 10),
            paddingLeft = (maxBarWidth * groupIndex) + (barWidth / 2),
            lastIndex = values.length - 1;

        ne.util.forEachArray(values, function(value, index) {
            var color = lastIndex === index && lastColor ? lastColor : colors[index],
                barHeight = parseInt(value * dimension.height, 10),
                top = dimension.height - barHeight + HIDDEN_WIDTH,
                left = paddingLeft + (barWidth * index),
                bound = {
                    top: top,
                    left: left,
                    width: barWidth,
                    height: barHeight
                },
                id = groupIndex + '-' + index;

            this._setRect(paper, color, borderColor, bound, id, inCallback, outCallback);
        }, this);
    },

    /**
     * Bars(horizontal bars) renderer
     * @param {object} paper raphael paper
     * @param {{width: number, height: number}} size graph size
     * @param {number} maxBarHeight max bar height
     * @param {[array]} values percent values
     * @param {object} theme theme
     * @param {string} lastColor last color
     * @param {number} groupIndex bar group index
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private;
     */
    _renderBars: function(paper, size, maxBarHeight, values, theme, lastColor, groupIndex, inCallback, outCallback) {
        var colors = theme.colors,
            borderColor = theme.borderColor || 'none',
            barHeight = parseInt(maxBarHeight / (values.length + 1), 10),
            hiddenWidth = isIE8 ? 0 : HIDDEN_WIDTH,
            paddingTop = (maxBarHeight * groupIndex) + (barHeight / 2) + hiddenWidth,
            lastIndex = values.length - 1;

        ne.util.forEachArray(values, function(value, index) {
            var color = lastIndex === index && lastColor ? lastColor : colors[index],
                barWidth = parseInt(value * size.width, 10),
                top = paddingTop + (barHeight * index),
                left = -HIDDEN_WIDTH,
                bound = {
                    top: top,
                    left: left,
                    width: barWidth,
                    height: barHeight
                },
                id = groupIndex + '-' + index;

            this._setRect(paper, color, borderColor, bound, id, inCallback, outCallback);
        }, this);
    },

    /**
     * This is Bar chart graph render function.
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object}} data chart data
     * @param {function} inCallback mouseover callback
     * @param {function} outCallback mouseout callback
     */
    render: function(container, data, inCallback, outCallback) {
        var isColumn = data.options.barType === 'column',
            dimension = data.dimension,
            groupValues = data.model.percentValues,
            theme = data.theme,
            lastColors = data.model.pickLastColors(),
            paper = Raphael(container, dimension.width, dimension.height),
            barMaxSize, renderBars;

        if (isColumn) {
            barMaxSize = (dimension.width / groupValues.length);
            renderBars = ne.util.bind(this._renderColumns, this);
        } else {
            barMaxSize = (dimension.height / groupValues.length);
            renderBars = ne.util.bind(this._renderBars, this);
        }

        ne.util.forEachArray(groupValues, function(values, index) {
            var lastColor = lastColors.length ? lastColors[index] : '';
            renderBars(paper, dimension, barMaxSize, values, theme, lastColor, index, inCallback, outCallback);
        }, this);
    }
});

pluginRaphael = {
    bar: BarChart
};

ne.application.chart.registerPlugin(pluginName, pluginRaphael);
