/**
 * @fileoverview Raphael bullet chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');
var raphael = require('raphael');

var ANIMATION_DURATION = 700;
var ANIMATION_DELAY = 700;
var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;

/**
 * @classdesc RaphaelBulletChart is graph renderer for bullet chart.
 * @class RaphaelBulletChart
 * @private
 */
var RaphaelBulletChart = snippet.defineClass(/** @lends RaphaelBulletChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {object} paper paper object
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @returns {Array.<object>} seriesSet
     */
    render: function(paper, data) {
        var groupBounds = data.groupBounds;
        var seriesDataModel = data.seriesDataModel;

        if (!groupBounds || !groupBounds.length) {
            return null;
        }

        this.paper = paper;

        this.theme = data.theme;
        this.options = data.options;
        this.chartType = data.chartType;
        this.isVertical = data.isVertical;

        this.seriesDataModel = seriesDataModel;
        this.maxRangeCount = seriesDataModel.maxRangeCount;
        this.maxMarkerCount = seriesDataModel.maxMarkerCount;

        this.rangeOpacities = {};

        this._initData();
        this.paper.setStart();

        this._renderBounds(groupBounds);

        return this.paper.setFinish();
    },

    /**
     * Get range opacity by index
     * If rangeOpacities[index] not exists, create and store. then use it next time
     * @param {number} index - ranges index
     * @returns {number} - opacity of ranges bar at index
     * @private
     */
    _getRangeOpacity: function(index) {
        var maxRangeCount = this.maxRangeCount;
        if (this.prevMaxRangeCount !== maxRangeCount) {
            this._updateOpacityStep(maxRangeCount);
        }

        if (index < maxRangeCount && !this.rangeOpacities[index]) {
            this.rangeOpacities[index] = 1 - (this.opacityStep * (index + 1));
        }

        return this.rangeOpacities[index];
    },

    /**
     * Update opacity step using maxRangeCount
     * @param {number} maxRangeCount - maximum count of ranges bar among series graphes
     * @private
     */
    _updateOpacityStep: function(maxRangeCount) {
        this.rangeOpacities = {};
        this.opacityStep = Number(1 / (maxRangeCount + 1)).toFixed(2);
        this.prevMaxRangeCount = maxRangeCount;
    },

    /**
     * Render bullet graph using groupBounds model
     * @param {Array.<object>} groupBounds - bounds data for rendering bullet graph
     * @private
     */
    _renderBounds: function(groupBounds) {
        var rangeThemes = this.theme.ranges;

        this.serieses = snippet.map(groupBounds, function(bounds, groupIndex) {
            var barSet = this.paper.set();
            var lineSet = this.paper.set();
            var barBounds = [];
            var seriesColor = this.theme.colors[groupIndex];
            var rangeIndex = 0;

            snippet.forEach(bounds, function(bound) {
                var type = bound.type;

                if (type === chartConst.BULLET_TYPE_ACTUAL) {
                    barSet.push(this._renderActual(bound.start, seriesColor));
                    barBounds.push(bound.end);
                } else if (type === chartConst.BULLET_TYPE_RANGE) {
                    barSet.push(this._renderRange(bound.start, seriesColor, rangeIndex, rangeThemes[rangeIndex]));
                    barBounds.push(bound.end);
                    rangeIndex += 1;
                } else if (type === chartConst.BULLET_TYPE_MARKER) {
                    lineSet.push(this._renderMarker(bound, seriesColor));
                }
            }, this);

            return {
                barSet: barSet,
                lineSet: lineSet,
                barBounds: barBounds
            };
        }, this);
    },

    /**
     * clear array(like) object, before rendering
     * @private
     */
    _initData: function() {
        snippet.forEach(this.serieses, function(series) {
            series.barSet.clear();
            series.lineSet.clear();
            series.labelSet.clear();
        });
    },

    /**
     * Render actual bar
     * @param {object} bound - bound model on start point
     * @param {string} seriesColor - series color for painting actual bar
     * @returns {Element} - rendered actual bar
     * @private
     */
    _renderActual: function(bound, seriesColor) {
        if (!bound) {
            return null;
        }

        return this._renderBar(bound, seriesColor);
    },

    /**
     * Render range bar
     * @param {object} bound - bound model on start point
     * @param {string} seriesColor - series color for painting range bar
     * @param {number} rangeIndex - ranges index
     * @param {object} rangeTheme - range theme
     * @returns {Element} - rendered range bar
     * @private
     */
    _renderRange: function(bound, seriesColor, rangeIndex, rangeTheme) {
        var color = seriesColor;
        var opacity = this._getRangeOpacity(rangeIndex);
        var attr = {opacity: opacity};

        if (!bound) {
            return null;
        }

        if (rangeTheme) {
            color = rangeTheme.color || color;
            attr.opacity = rangeTheme.opacity || opacity;
        }

        return this._renderBar(bound, color, attr);
    },

    /**
     * Create bar type element using passing arguments
     * @param {object} bound - bound data for render rect element
     * @param {string} color - hex type color string
     * @param {object} attributes - styling attributes
     * @returns {Element} - svg rect element
     * @private
     */
    _renderBar: function(bound, color, attributes) {
        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        return raphaelRenderUtil.renderRect(this.paper, bound, snippet.extend({
            fill: color,
            stroke: 'none'
        }, attributes));
    },

    /**
     * Render marker
     * @param {object} bound - bound model of marker
     * @param {string} seriesColor - series color for painting marker
     * @returns {Element} - rendered marker
     * @private
     */
    _renderMarker: function(bound, seriesColor) {
        var line;

        if (!bound) {
            return null;
        }

        line = this._renderLine(bound, seriesColor);
        line.attr({opacity: 0});

        return line;
    },

    /**
     * Create line element using passing arguments
     * @param {object} bound - bound data for render path element
     * @param {string} color - hex type color string
     * @returns {Element} - svg rect element
     * @private
     */
    _renderLine: function(bound, color) {
        var top = bound.top;
        var left = bound.left;
        var length = bound.length;
        var endPosition = this.isVertical ? 'L' + (left + length) + ',' + top : 'L' + left + ',' + (top + length);
        var path = 'M' + left + ',' + top + endPosition;

        return raphaelRenderUtil.renderLine(this.paper, path, color, chartConst.BULLET_MARKER_STROKE_TICK);
    },

    /**
     * Animate.
     * @param {function} onFinish finish callback function
     */
    animate: function(onFinish) {
        var animation = raphael.animation({
            opacity: 1
        }, ANIMATION_DURATION);

        snippet.forEach(this.serieses, function(series) {
            var barBounds = series.barBounds;

            series.barSet.forEach(function(bar, index) {
                if (bar) {
                    this._animateRect(bar, barBounds[index]);
                }
            }, this);
            series.lineSet.forEach(function(line) {
                if (line) {
                    line.animate(animation.delay(ANIMATION_DURATION));
                }
            });
        }, this);

        if (onFinish) {
            this.callbackTimeout = setTimeout(function() {
                onFinish();
                delete self.callbackTimeout;
            }, ANIMATION_DELAY);
        }
    },

    /**
     * Animate rect.
     * @param {SVGElement} element svg rect element
     * @param {object} bound - bound info
     * @private
     */
    _animateRect: function(element, bound) {
        element.animate({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        }, ANIMATION_DURATION, '>');
    },

    /**
     * Resize bullet chart
     * @param {object} params parameters
     *      @param {{width: number, height:number}} params.dimension dimension
     *      @param {Array.<Array.<{
     *                  left:number, top:number, width: number, height: number
     *              }>>} params.groupBounds group bounds
     */
    resize: function(params) {
        var dimension = params.dimension;
        var groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        this._initData();
        this._renderBounds(groupBounds);
    },

    /**
     * Change borders color.
     * @param {Array.<object>} lines raphael objects
     * @param {borderColor} borderColor border color
     * @private
     */
    _changeBordersColor: function(lines, borderColor) {
        snippet.forEach(lines, function(line) {
            line.attr({stroke: borderColor});
        });
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var noneSelected = snippet.isNull(legendIndex);

        snippet.forEach(this.serieses, function(series, index) {
            var opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            series.barSet.attr({'fill-opacity': opacity});
            series.lineSet.attr({opacity: opacity});
            series.labelSet.attr({opacity: opacity});
        }, this);
    },

    /**
     * @param {object} paper - raphael paper
     * @param {Array.<object>} groupPositions - series label positions
     * @param {Array.<string>} groupLabels - series labels
     * @param {object} labelTheme - series text theme
     * @returns {object} - rendered label set
     */
    renderSeriesLabel: function(paper, groupPositions, groupLabels, labelTheme) {
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            opacity: 0,
            'text-anchor': this.isVertical ? 'middle' : 'start'
        };
        var labelSet = paper.set();

        snippet.forEach(groupLabels, function(labels, groupIndex) {
            var seriesLabelSet = paper.set();

            snippet.forEach(labels, function(label, index) {
                var labelElement;

                if (!label.start) {/* if not range */
                    labelElement = this._renderLabel(paper, groupPositions[groupIndex][index], attributes, label.end);
                    seriesLabelSet.push(labelElement);
                    labelSet.push(labelElement);
                }
            }, this);

            this.serieses[groupIndex].labelSet = seriesLabelSet;
        }, this);

        return labelSet;
    },

    /**
     * @param {object} paper - raphael paper
     * @param {Array.<object>} position - series label positions
     * @param {Array.<string>} attributes - label text attributes
     * @param {string} labelText - label text
     * @returns {object} - rendered label object
     * @private
     */
    _renderLabel: function(paper, position, attributes, labelText) {
        var label = raphaelRenderUtil.renderText(paper, position, labelText, attributes);
        var node = label.node;
        var style = node.style;
        style.userSelect = 'none';
        style.cursor = 'default';
        node.setAttribute('filter', 'url(#glow)');

        return label;
    },

    /**
     * @param {number} index - series index
     * @returns {Array.<object>} - color and opacity of series
     */
    getGraphColors: function() {
        return snippet.map(this.serieses, function(series) {
            var barColors = snippet.map(series.barSet.items, function(bar) {
                return bar.attrs.fill;
            });
            var legendColor = barColors[barColors.length - 1];
            var markerCount = series.lineSet.items.length;
            var i = 0;

            for (; i <= markerCount; i += 1) {
                barColors.push(legendColor);
            }

            return barColors;
        });
    }
});

module.exports = RaphaelBulletChart;
