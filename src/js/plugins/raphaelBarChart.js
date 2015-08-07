/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var HIDDEN_WIDTH = 1;

var Raphael = window.Raphael,
    browser = ne.util.browser,
    isIE8 = browser.msie && browser.version === 8;

/**
 * @classdesc RaphaelBarChart is graph renderer.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = ne.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
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

    /**
     * Render bars.
     * @param {object} paper raphael paper
     * @param {object} model bar chart data model
     * @param {{colors: string[], singleColors: string[], borderColor: string}} theme bar chart theme
     * @param {array.<array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _renderBars: function(paper, model, theme, groupBounds, inCallback, outCallback) {
        var singleColors = (groupBounds[0].length === 1) && theme.singleColors || [],
            colors = theme.colors,
            borderColor = theme.borderColor || 'none';
        ne.util.forEachArray(groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];
            ne.util.forEachArray(bounds, function(bound, index) {
                var color = singleColor || colors[index],
                    id = groupIndex + '-' + index,
                    rect = this._renderBar(paper, color, borderColor, bound);
                if (rect) {
                    this._bindHoverEvent(rect, bound, id, inCallback, outCallback);
                }
            }, this);
        }, this);
    },

    /**
     * Render rect
     * @param {object} paper raphael paper
     * @param {string} color series color
     * @param {string} borderColor series borderColor
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(paper, color, borderColor, bound) {
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }
        var rect = paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: color,
            stroke: borderColor
        });

        return rect;
    },

    /**
     * Bind hover event.
     * @param {object} rect raphael rect
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} id tooltip id
     * @param {function} inCallback in callback
     * @param {function} outCallback out callback
     * @private
     */
    _bindHoverEvent: function(rect, bound, id, inCallback, outCallback) {
        rect.hover(function() {
            inCallback(bound, id);
        }, function() {
            outCallback(id);
        });
    }
});

module.exports = RaphaelBarChart;