/**
 * @fileoverview Raphael bar chart renderer
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var HIDDEN_WIDTH = 1;

var Raphael = window.Raphael,
    browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8;

/**
 * @classdesc This class is BarChart graph renderer.
 * @class
 */
var BarChart = ne.util.defineClass({
    /**
     * This is Bar chart graph render function.
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object}} data chart data
     * @param {function} inCallback mouseover callback
     * @param {function} outCallback mouseout callback
     */
    render: function(container, data, inCallback, outCallback) {
        var model = data.model,
            theme = data.theme,
            dimension = data.dimension,
            isColumn = model.isVertical,
            paper = Raphael(container, dimension.width, dimension.height),
            groupBounds, hiddenWidth;

        if (isColumn) {
            groupBounds = model.makeColumnBounds(dimension);
        } else {
            hiddenWidth = isIE8 ? 0 : HIDDEN_WIDTH;
            groupBounds = model.makeBarBounds(dimension, hiddenWidth);
        }

        this._renderBars(paper, model, theme, groupBounds, inCallback, outCallback);
    },

    _renderBars: function(paper, model, theme, groupBounds, inCallback, outCallback) {
        var lastColors = model.pickLastColors() || [],
            colors = theme.colors,
            borderColor = theme.borderColor || 'none';

        ne.util.forEachArray(groupBounds, function(bounds, groupIndex) {
            var lastIndex = bounds.length - 1,
                lastColor = lastColors[groupIndex];
            ne.util.forEachArray(bounds, function(bound, index) {
                var color = (lastIndex === index && lastColor) ? lastColor : colors[index],
                    id = groupIndex + '-' + index,
                    rect = this._renderBar(paper, color, borderColor, bound);
                this._bindHoverEvent(rect, bound, id, inCallback, outCallback);
            }, this);
        }, this);
    },

    /**
     * Render rect
     * @param {object} paper raphael paper
     * @param {string} color series color
     * @param {string} borderColor series borderColor
     * @param {object} bound bound
     * @private
     */
    _renderBar: function(paper, color, borderColor, bound) {
        var rect = paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: color,
            stroke: borderColor
        });

        return rect;
    },

    _bindHoverEvent: function(rect, bound, id, inCallback, outCallback) {
        rect.hover(function() {
            inCallback(bound, id);
        }, function() {
            outCallback(id);
        });
    }
});

module.exports = BarChart;