/**
 * @fileoverview Raphael bullet chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var chartConst = require('../const');
var snippet = require('tui-code-snippet');
var renderUtil = require('../helpers/renderUtil');

var browser = snippet.browser;
var IS_LTE_IE8 = browser.msie && browser.version <= 8;
var ANIMATION_DURATION = 700;
var ANIMATION_DELAY = 700;
var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var EVENT_DETECTOR_PADDING = 20;

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
        this.dimension = data.dimension;
        this.position = data.position;
        this.options = data.options;
        this.chartType = data.chartType;
        this.isVertical = data.isVertical;

        this.seriesDataModel = seriesDataModel;
        this.maxRangeCount = seriesDataModel.maxRangeCount;
        this.maxMarkerCount = seriesDataModel.maxMarkerCount;

        this.rangeOpacities = {};

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
        var paper = this.paper;

        this.groupBars = [];
        this.groupLines = [];

        snippet.forEach(groupBounds, function(bounds, groupIndex) {
            var seriesColor = this.theme.colors[groupIndex];
            var rangeIndex = 0;
            var barSet = paper.set();
            var lineSet = paper.set();

            snippet.forEach(bounds, function(bound) {
                var type = bound.type;

                if (type === chartConst.BULLET_TYPE_ACTUAL) {
                    barSet.push(this._renderActual(bound, seriesColor));
                } else if (type === chartConst.BULLET_TYPE_RANGE) {
                    barSet.push(this._renderRange(bound, seriesColor, rangeIndex, rangeThemes[rangeIndex]));
                    rangeIndex += 1;
                } else if (type === chartConst.BULLET_TYPE_MARKER) {
                    lineSet.push(this._renderMarker(bound, seriesColor));
                }
            }, this);

            this.groupBars.push(barSet);
            this.groupLines.push(lineSet);
        }, this);
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
        if (!bound) {
            return null;
        }

        return this._renderLine(bound, seriesColor);
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
     * @param {Array.<object>} seriesSet series set
     */
    animate: function(onFinish, seriesSet) {
        var paper = this.paper;
        var dimension = this.dimension;
        var position = this.position;
        var clipRect = this.clipRect;
        var clipRectId = this._getClipRectId();
        var clipRectWidth = dimension.width - EVENT_DETECTOR_PADDING;
        var clipRectHeight = dimension.height - EVENT_DETECTOR_PADDING;
        var startDimension = {};
        var animateAttr = {};

        if (this.isVertical) {
            startDimension.width = clipRectWidth;
            startDimension.height = 0;
            animateAttr.height = clipRectHeight;
        } else {
            startDimension.width = 0;
            startDimension.height = clipRectHeight;
            animateAttr.width = clipRectWidth;
        }

        // Animation was implemented using <clipPath> SVG element
        // As Browser compatibility of <clipPath> is IE9+,
        // No Animation on IE8
        if (!IS_LTE_IE8 && dimension) {
            if (!clipRect) {
                clipRect = createClipPathRectWithLayout(paper, position, startDimension, clipRectId);
                this.clipRect = clipRect;
            } else {
                clipRect.attr({
                    x: position.left,
                    y: position.top
                });
                clipRect.attr(startDimension);
            }

            seriesSet.forEach(function(element) {
                if (element.type === 'set') {
                    element.forEach(function(item) {
                        item.node.setAttribute('clip-path', 'url(#' + clipRectId + ')');
                    });
                } else {
                    element.node.setAttribute('clip-path', 'url(#' + clipRectId + ')');
                }
            });

            clipRect.animate(animateAttr, ANIMATION_DURATION, '>', onFinish);
        }

        if (onFinish) {
            this.callbackTimeout = setTimeout(function() {
                onFinish();
                delete self.callbackTimeout;
            }, ANIMATION_DELAY);
        }
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
        var width = dimension.width;
        var height = dimension.height;

        this.dimension = params.dimension;
        this.groupBounds = groupBounds;
        this.resizeClipRect(width, height);
        this.paper.setSize(width, height);

        this._renderBounds(groupBounds);
    },

    /**
     * Resize clip rect size
     * @param {number} width series width
     * @param {number} height series height
     */
    resizeClipRect: function(width, height) {
        var clipRect = this.paper.getById(this._getClipRectId() + '_rect');

        clipRect.attr({
            width: width,
            height: height
        });
    },

    /**
     * set clip rect position
     * @param {object} position series position
     */
    setClipRectPosition: function(position) {
        var clipRect = this.paper.getById(this._getClipRectId() + '_rect');

        clipRect.attr({
            x: position.left,
            y: position.top
        });
    },

    /**
     * Set clip rect id
     * @returns {string} id - clip rect id
     * @private
     */
    _getClipRectId: function() {
        if (!this.clipRectId) {
            this.clipRectId = renderUtil.generateClipRectId();
        }

        return this.clipRectId;
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
        var allEmphasized = snippet.isNull(legendIndex);

        snippet.forEachArray(this.groupBars, function(bars, groupIndex) {
            var opacity = (allEmphasized || legendIndex === groupIndex) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            this.groupBars[groupIndex].attr({'fill-opacity': opacity});
            this.groupLabels[groupIndex].attr({opacity: opacity});
            snippet.forEachArray(this.groupLabels[groupIndex], function(label) {
                label.attr({opacity: opacity});
            });
        }, this);
    },

    /**
     * @param {object} paper - raphael paper
     * @param {Array.<object>} positionData - series label positions
     * @param {Array.<string>} labelData - series labels
     * @param {object} labelTheme - series text theme
     * @returns {object} - rendered label set
     */
    renderSeriesLabel: function(paper, positionData, labelData, labelTheme) {
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            opacity: 0,
            'text-anchor': this.isVertical ? 'middle' : 'start'
        };
        var set = paper.set();

        this.groupLabels = snippet.map(labelData, function(labels, groupIndex) {
            var labelSet = paper.set();
            snippet.forEach(labels, function(label, index) {
                var labelElement = this._renderLabel(paper, positionData[groupIndex][index], attributes, label);
                labelSet.push(labelElement);
                set.push(labelElement);
            }, this);

            return labelSet;
        }, this);

        return set;
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
        return snippet.map(this.groupBars, function(barSet, groupIndex) {
            var barColors = [];
            var markerCount = this.groupLines[groupIndex].length;
            var i = 0;
            var legendColor;

            barSet.forEach(function(item) {
                barColors.push(item.attrs.fill);
            });

            legendColor = barColors[barColors.length - 1];

            for (; i <= markerCount; i += 1) {
                barColors.push(legendColor);
            }

            return barColors;
        }, this);
    }
});

/**
 * Create clip rect with layout
 * @param {object} paper Raphael paper
 * @param {object} position position
 * @param {object} dimension dimension
 * @param {string} id ID string
 * @returns {object}
 * @ignore
 */
function createClipPathRectWithLayout(paper, position, dimension, id) {
    var clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    var rect = paper.rect(position.left, position.top, dimension.width, dimension.height);

    rect.id = id + '_rect';
    clipPath.id = id;

    clipPath.appendChild(rect.node);
    paper.defs.appendChild(clipPath);

    return rect;
}

module.exports = RaphaelBulletChart;
