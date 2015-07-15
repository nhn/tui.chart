/**
 * @fileoverview Raphael render plugin
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var HIDDEN_WIDTH = 1;

var pluginName = 'raphael',
    BarChart,
    pluginRaphael;

/**
 * @classdesc This class is BarChart graph renderer.
 * @class
 */
BarChart = ne.util.defineClass({
    /**
     * Vertical bars renderer
     * @param {object} paper raphael paper
     * @param {{width: number, height: number}} size graph size
     * @param {number} maxBarWidth max bar width
     * @param {[array, ...]} values percent values
     * @param {array} colors colors
     * @param {number} groupIndex bar group index
     * @private;
     */
    _renderVerticalBars: function(paper, size, maxBarWidth, values, colors, groupIndex) {
        var value = values[0],
            barWidth = parseInt(maxBarWidth / (values.length + 1), 10),
            paddingLeft = (maxBarWidth * groupIndex) + (barWidth / 2);

        ne.util.forEach(values, function(value, index) {
            var barHeight = parseInt(value * size.height, 10),
                top = size.height - barHeight + HIDDEN_WIDTH,
                left = paddingLeft + (barWidth * index),
                rect = paper.rect(left, top, barWidth, barHeight);
            rect.attr({
                fill: colors[index]
            });
        });
        //pos = {
        //    left: left,
        //    top: top,
        //    width: barWidth,
        //    height: barHeight
        //};

        //rect.hover(function() {
        //    inCallback(pos, groupIndex);
        //}, function() {
        //    outCallback(groupIndex);
        //});
    },

    /**
     * Horizontal bars renderer
     * @param {object} paper raphael paper
     * @param {{width: number, height: number}} size graph size
     * @param {number} maxBarHeight max bar height
     * @param {[array, ...]} values percent values
     * @param {array} colors colors
     * @param {number} groupIndex bar group index
     * @private;
     */
    _renderHorizontalBars: function(paper, size, maxBarHeight, values, colors, groupIndex) {
        var value = values[0],
            barHeight = parseInt(maxBarHeight / (values.length + 1), 10),
            paddingTop = (maxBarHeight * groupIndex) + (barHeight / 2);

        ne.util.forEach(values, function(value, index) {
            var barWidth = parseInt(value * size.width, 10),
                top = paddingTop + (barHeight * index),
                left = - HIDDEN_WIDTH,
                rect = paper.rect(left, top, barWidth, barHeight);
            rect.attr({
                fill: colors[index]
            });
        });
    },

    /**
     * This is Bar chart graph render function.
     * @param {element} container container element
     * @param {size: object, model: object, options: object} data chart data
     * @param {function} inCallback mouseover callback
     * @param {function} outCallback mouseout callback
     */
    render: function(container, data, inCallback, outCallback) {
        var isVertical = data.options.bars === 'vertical',
            size = data.size,
            groupValues = data.model.percentValues,
            colors = data.model.colors,
            paper = Raphael(container, size.width, size.height),
            barMaxSize, renderBars;

        if (isVertical) {
            barMaxSize = (size.width / groupValues.length);
            renderBars = this._renderVerticalBars;
        } else {
            barMaxSize = (size.height / groupValues.length);
            renderBars = this._renderHorizontalBars;
        }

        ne.util.forEachArray(groupValues, function(values, index) {
            renderBars(paper, size, barMaxSize, values, colors, index);
        }, this);
    }
});

pluginRaphael = {
    bar: BarChart
};

ne.application.chart.registPlugin(pluginName, pluginRaphael);
