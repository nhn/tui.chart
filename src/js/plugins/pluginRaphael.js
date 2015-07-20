/**
 * @fileoverview Raphael render plugin
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var chartConst = require('../const.js');

var HIDDEN_WIDTH = 1;

var pluginName = 'raphael',
    BarChart,
    pluginRaphael;

/**
 * @classdesc This class is BarChart graph renderer.
 * @class
 */
BarChart = ne.util.defineClass({

    _setRect: function(paper, color, position, id, inCallback, outCallback) {
        var rect = paper.rect(position.left, position.top, position.width, position.height);
        rect.attr({
            fill: color
        });

        rect.hover(function() {
            inCallback(position, id)
        }, function() {
            outCallback(id);
        });
    },

    /**
     * Vertical bars renderer
     * @param {object} paper raphael paper
     * @param {{width: number, height: number}} dimension graph dimension
     * @param {number} maxBarWidth max bar width
     * @param {[array, ...]} values percent values
     * @param {array} colors colors
     * @param {number} groupIndex bar group index
     * @private;
     */
    _renderBars: function(paper, dimension, maxBarWidth, values, colors, groupIndex, inCallback, outCallback) {
        var barWidth = parseInt(maxBarWidth / (values.length + 1), 10),
            paddingLeft = (maxBarWidth * groupIndex) + (barWidth / 2);
        ne.util.forEachArray(values, function(value, index) {
            var color = colors[index],
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

            this._setRect(paper, color, bound, id, inCallback, outCallback);
        }, this);
    },

    /**
     * Columns(horizontal bars) renderer
     * @param {object} paper raphael paper
     * @param {{width: number, height: number}} size graph size
     * @param {number} maxBarHeight max bar height
     * @param {[array, ...]} values percent values
     * @param {array} colors colors
     * @param {number} groupIndex bar group index
     * @private;
     */
    _renderColumns: function(paper, size, maxBarHeight, values, colors, groupIndex, inCallback, outCallback) {
        var barHeight = parseInt(maxBarHeight / (values.length + 1), 10),
            paddingTop = (maxBarHeight * groupIndex) + (barHeight / 2);

        ne.util.forEachArray(values, function(value, index) {
            var color = colors[index],
                barWidth = parseInt(value * size.width, 10),
                top = paddingTop + (barHeight * index),
                left = - HIDDEN_WIDTH,
                bound = {
                    top: top,
                    left: left,
                    width: barWidth,
                    height: barHeight
                },
                id = groupIndex + '-' + index;

            this._setRect(paper, color, bound, id, inCallback, outCallback);
        }, this);
    },

    /**
     * This is Bar chart graph render function.
     * @param {element} container container element
     * @param {size: object, model: object, options: object} data chart data
     * @param {function} inCallback mouseover callback
     * @param {function} outCallback mouseout callback
     */
    render: function(container, data, inCallback, outCallback) {
        var isColumn = data.options.barType === chartConst.BAR_TYPE_COLUMN,
            dimension = data.dimension,
            groupValues = data.model.percentValues,
            colors = data.model.colors,
            paper = Raphael(container, dimension.width, dimension.height),
            barMaxSize, renderBars;

        if (isColumn) {
            barMaxSize = (dimension.width / groupValues.length);
            renderBars = ne.util.bind(this._renderBars, this);
        } else {
            barMaxSize = (dimension.height / groupValues.length);
            renderBars = ne.util.bind(this._renderColumns, this);
        }

        ne.util.forEachArray(groupValues, function(values, index) {
            renderBars(paper, dimension, barMaxSize, values, colors, index, inCallback, outCallback);
        }, this);
    }
});

pluginRaphael = {
    bar: BarChart
};

ne.application.chart.registPlugin(pluginName, pluginRaphael);
