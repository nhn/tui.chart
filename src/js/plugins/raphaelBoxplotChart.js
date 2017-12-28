/**
 * @fileoverview Raphael boxplot chart renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');
var raphael = require('raphael');

var ANIMATION_DURATION = 700;
var EMPHASIS_OPACITY = 1;
var DE_EMPHASIS_OPACITY = 0.3;
var DEFAULT_LUMINANC = 0.2;
var BOX_STROKE_WIDTH = 1;
var EDGE_LINE_WIDTH = 2;
var MEDIAN_LINE_WIDTH = 2;
var WHISKER_LINE_WIDTH = 1;

/**
 * @classdesc RaphaelBoxplotChart is graph renderer for bar, column chart.
 * @class RaphaelBoxplotChart
 * @private
 */
var RaphaelBoxplotChart = snippet.defineClass(/** @lends RaphaelBoxplotChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {object} paper paper object
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @returns {Array.<object>} seriesSet
     */
    render: function(paper, data) {
        var groupBounds = data.groupBounds;

        if (!groupBounds) {
            return null;
        }

        this.paper = paper;

        this.theme = data.theme;
        this.options = data.options;
        this.seriesDataModel = data.seriesDataModel;
        this.chartType = data.chartType;

        this.paper.setStart();
        this.groupWhiskers = [];
        this.groupMedians = [];
        this.groupBoxes = this._renderBoxplots(groupBounds);
        this.groupBorders = this._renderBoxBorders(groupBounds);

        this.rectOverlay = this._renderRectOverlay();
        this.circleOverlay = this._renderCircleOverlay();
        this.groupBounds = groupBounds;

        return this.paper.setFinish();
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderRectOverlay: function() {
        var bound = {
            width: 1,
            height: 1,
            left: 0,
            top: 0
        };
        var attributes = {
            'fill-opacity': 0
        };

        return raphaelRenderUtil.renderRect(this.paper, bound, snippet.extend({
            'stroke-width': 0
        }, attributes));
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderCircleOverlay: function() {
        var position = {
            left: 0,
            top: 0
        };
        var attributes = {
            'fill-opacity': 0
        };

        return raphaelRenderUtil.renderCircle(this.paper, position, 0, snippet.extend({
            'stroke-width': 0
        }, attributes));
    },

    /**
     * Render rect
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} color series color
     * @param {object} [attributes] - attributes
     * @returns {object} bar rect
     * @private
     */
    _renderBox: function(bound, color, attributes) {
        var rect;

        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = raphaelRenderUtil.renderRect(this.paper, bound, snippet.extend({
            fill: '#fff',
            stroke: color,
            'stroke-width': BOX_STROKE_WIDTH
        }, attributes));

        return rect;
    },

    /**
     * Render boxes.
     * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @returns {Array.<Array.<object>>} bars
     * @private
     */
    _renderBoxes: function(groupBounds) {
        var self = this;
        var colors = this.theme.colors;
        var colorByPoint = this.options.colorByPoint;

        return snippet.map(groupBounds, function(bounds, groupIndex) {
            return snippet.map(bounds, function(bound, index) {
                var color, rect, item;

                if (!bound) {
                    return null;
                }

                item = self.seriesDataModel.getSeriesItem(groupIndex, index);

                color = colorByPoint ? colors[groupIndex] : colors[index];

                if (bound.start) {
                    rect = self._renderBox(bound.start, color);
                }

                return {
                    rect: rect,
                    color: color,
                    bound: bound.end,
                    item: item,
                    groupIndex: groupIndex,
                    index: index
                };
            });
        });
    },

    /**
     * Render boxplots.
     * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @returns {Array.<Array.<object>>} bars
     * @private
     */
    _renderBoxplots: function(groupBounds) {
        var groupBoxes = this._renderBoxes(groupBounds);

        this.groupWhiskers = this._renderWhiskers(groupBounds);
        this.groupMedians = this._renderMedianLines(groupBounds);
        this.groupOutliers = this._renderOutliers(groupBounds);

        return groupBoxes;
    },

    _renderWhisker: function(end, start, color) {
        var paper = this.paper;
        var topDistance = start.top - end.top;
        var whiskerDirection = topDistance > 0 ? 1 : -1;
        var width = end.width;
        var left = end.left;
        var quartileWidth = width / 4;
        var edgePath = 'M' + (left + quartileWidth) + ',' + end.top + 'H' + (left + (quartileWidth * 3));
        var whiskerPath = 'M' + (left + (quartileWidth * 2)) + ',' + end.top + 'V' + (end.top + (Math.abs(topDistance) * whiskerDirection));
        var edge = raphaelRenderUtil.renderLine(paper, edgePath, color, EDGE_LINE_WIDTH);
        var whisker = raphaelRenderUtil.renderLine(paper, whiskerPath, color, WHISKER_LINE_WIDTH);
        var whiskers = [];

        edge.attr({
            opacity: 0
        });
        whisker.attr({
            opacity: 0
        });

        whiskers.push(edge);
        whiskers.push(whisker);

        return whiskers;
    },

    _renderWhiskers: function(groupBounds) {
        var self = this;
        var colors = this.theme.colors;
        var colorByPoint = this.options.colorByPoint;
        var groupWhiskers = [];

        snippet.forEach(groupBounds, function(bounds, groupIndex) {
            var whiskers = [];

            snippet.forEach(bounds, function(bound, index) {
                var color = colorByPoint ? colors[groupIndex] : colors[index];

                if (!bound) {
                    return;
                }

                whiskers = whiskers.concat(self._renderWhisker(bound.min, bound.start, color));
                whiskers = whiskers.concat(self._renderWhisker(bound.max, bound.end, color));
            });

            groupWhiskers.push(whiskers);
        });

        return groupWhiskers;
    },

    _renderMedianLine: function(bound, color) {
        var width = bound.width;
        var medianLinePath = 'M' + bound.left + ',' + bound.top + 'H' + (bound.left + width);
        var median = raphaelRenderUtil.renderLine(this.paper, medianLinePath, color, MEDIAN_LINE_WIDTH);

        median.attr({
            opacity: 0
        });

        return median;
    },

    _renderMedianLines: function(groupBounds) {
        var self = this;
        var colors = this.theme.colors;
        var colorByPoint = this.options.colorByPoint;
        var groupMedians = [];

        snippet.forEach(groupBounds, function(bounds, groupIndex) {
            var medians = [];

            snippet.forEach(bounds, function(bound, index) {
                var color = colorByPoint ? colors[groupIndex] : colors[index];

                if (!bound) {
                    return;
                }

                medians.push(self._renderMedianLine(bound.median, color));
            });
            groupMedians.push(medians);
        });

        return groupMedians;
    },

    _renderOutlier: function(bound, color) {
        var outlier = raphaelRenderUtil.renderCircle(this.paper, {
            left: bound.left,
            top: bound.top
        }, 3, {
            stroke: color
        });

        outlier.attr({
            opacity: 0
        });

        return outlier;
    },

    _renderOutliers: function(groupBounds) {
        var self = this;
        var colors = this.theme.colors;
        var colorByPoint = this.options.colorByPoint;
        var groupOutliers = [];

        snippet.forEach(groupBounds, function(bounds, groupIndex) {
            var outliers = [];
            snippet.forEach(bounds, function(bound, index) {
                var color = colorByPoint ? colors[groupIndex] : colors[index];
                var seriesOutliers = [];

                if (!bound) {
                    return;
                }

                if (bound.outliers.length) {
                    snippet.forEach(bound.outliers, function(outlier) {
                        seriesOutliers.push(self._renderOutlier(outlier, color));
                    });
                }
                outliers.push(seriesOutliers);
            });
            groupOutliers.push(outliers);
        });

        return groupOutliers;
    },

    /**
     * Make rect points.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @returns {{
     *      leftTop: {left: number, top: number},
     *      rightTop: {left: number, top: number},
     *      rightBottom: {left: number, top: number},
     *      leftBottom: {left: number, top: number}
     * }} rect points
     * @private
     */
    _makeRectPoints: function(bound) {
        return {
            leftTop: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top)
            },
            rightTop: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top)
            },
            rightBottom: {
                left: Math.ceil(bound.left + bound.width),
                top: Math.ceil(bound.top + bound.height)
            },
            leftBottom: {
                left: Math.ceil(bound.left),
                top: Math.ceil(bound.top + bound.height)
            }
        };
    },

    /**
     * Render border lines;
     * @param {{left: number, top:number, width: number, height: number}} bound bar bound
     * @param {string} borderColor border color
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {object} raphael object
     * @private
     */
    _renderBorderLines: function(bound, borderColor, chartType, item) {
        var self = this;
        var borderLinePaths = this._makeBorderLinesPaths(bound, chartType, item);
        var lines = {};

        snippet.forEach(borderLinePaths, function(path, name) {
            lines[name] = raphaelRenderUtil.renderLine(self.paper, path, borderColor, 1);
        });

        return lines;
    },

    /**
     * Render bar borders.
     * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @returns {Array.<Array.<object>>} borders
     * @private
     */
    _renderBoxBorders: function(groupBounds) {
        var self = this,
            borderColor = this.theme.borderColor,
            groupBorders;

        if (!borderColor) {
            return null;
        }

        groupBorders = snippet.map(groupBounds, function(bounds, groupIndex) {
            return snippet.map(bounds, function(bound, index) {
                var seriesItem;

                if (!bound) {
                    return null;
                }

                seriesItem = self.seriesDataModel.getSeriesItem(groupIndex, index);

                return self._renderBorderLines(bound.start, borderColor, self.chartType, seriesItem);
            });
        });

        return groupBorders;
    },

    /**
     * Animate rect.
     * @param {object} rect raphael object
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @private
     */
    _animateRect: function(rect, bound) {
        rect.animate({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        }, ANIMATION_DURATION, '>');
    },

    /**
     * Animate.
     * @param {function} onFinish finish callback function
     */
    animate: function(onFinish) {
        var self = this;
        var animation = raphael.animation({
            opacity: 1
        }, ANIMATION_DURATION);

        raphaelRenderUtil.forEach2dArray(this.groupBoxes, function(box) {
            if (!box) {
                return;
            }
            self._animateRect(box.rect, box.bound);
        });

        raphaelRenderUtil.forEach2dArray(self.groupWhiskers, function(whisker) {
            whisker.animate(animation.delay(ANIMATION_DURATION));
        });

        raphaelRenderUtil.forEach2dArray(self.groupMedians, function(median) {
            median.animate(animation.delay(ANIMATION_DURATION));
        });

        raphaelRenderUtil.forEach2dArray(self.groupOutliers, function(outliers) {
            snippet.forEach(outliers, function(outlier) {
                outlier.animate(animation.delay(ANIMATION_DURATION));
            });
        });

        if (onFinish) {
            this.callbackTimeout = setTimeout(function() {
                onFinish();
                delete self.callbackTimeout;
            }, ANIMATION_DURATION);
        }
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showAnimation: function(data) {
        if (snippet.isNumber(data.outlierIndex)) {
            this.showOutlierAnimation(data);
        } else {
            this.showRectAnimation(data);
        }
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showRectAnimation: function(data) {
        var bar = this.groupBoxes[data.groupIndex][data.index],
            bound = bar.bound;

        this.rectOverlay.attr({
            width: bound.width,
            height: bound.height,
            x: bound.left,
            y: bound.top,
            fill: bar.color,
            'fill-opacity': 0.3
        });
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} data show info
     */
    showOutlierAnimation: function(data) {
        var targetAttr = this.groupOutliers[data.groupIndex][data.index][data.outlierIndex].attr();

        this.circleOverlay.attr({
            r: targetAttr.r,
            cx: targetAttr.cx,
            cy: targetAttr.cy,
            fill: targetAttr.stroke,
            'fill-opacity': 0.3,
            stroke: targetAttr.stroke,
            'stroke-width': 2
        });
    },

    /**
     * Hide animation.
     */
    hideAnimation: function() {
        this.circleOverlay.attr({
            width: 1,
            height: 1,
            x: 0,
            y: 0,
            'fill-opacity': 0,
            'stroke-width': 0
        });
        this.rectOverlay.attr({
            width: 1,
            height: 1,
            x: 0,
            y: 0,
            'fill-opacity': 0
        });
    },

    /**
     * Update rect bound
     * @param {object} rect raphael object
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @private
     */
    _updateRectBound: function(rect, bound) {
        rect.attr({
            x: bound.left,
            y: bound.top,
            width: bound.width,
            height: bound.height
        });
    },

    /**
     * Resize graph of bar type chart.
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

        raphaelRenderUtil.forEach2dArray(this.groupBoxes, function(bar, groupIndex, index) {
            var bound;

            if (!bar) {
                return;
            }

            bound = groupBounds[groupIndex][index].end;
            bar.bound = bound;
            raphaelRenderUtil.updateRectBound(bar.rect, bound);
        });
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
     * Change bar color.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @param {string} color fill color
     * @param {?string} borderColor stroke color
     * @private
     */
    _changeBoxColor: function(indexes, color, borderColor) {
        var bar = this.groupBoxes[indexes.groupIndex][indexes.index];
        var lines;

        bar.rect.attr({
            stroke: color
        });

        if (borderColor) {
            lines = this.groupBorders[indexes.groupIndex][indexes.index];
            this._changeBordersColor(lines, borderColor);
        }
    },

    /**
     * Select series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    selectSeries: function(indexes) {
        var bar = this.groupBoxes[indexes.groupIndex][indexes.index],
            objColor = raphael.color(bar.color),
            selectionColorTheme = this.theme.selectionColor,
            color = selectionColorTheme || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC),
            borderColor = this.theme.borderColor,
            objBorderColor;

        if (borderColor) {
            objBorderColor = raphael.color(borderColor);
            borderColor = raphaelRenderUtil.makeChangedLuminanceColor(objBorderColor.hex, DEFAULT_LUMINANC);
        }

        this._changeBoxColor(indexes, color, borderColor);
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var bar = this.groupBoxes[indexes.groupIndex][indexes.index],
            borderColor = this.theme.borderColor;
        this._changeBoxColor(indexes, bar.color, borderColor);
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var noneSelected = snippet.isNull(legendIndex);

        raphaelRenderUtil.forEach2dArray(this.groupBoxes, function(box, groupIndex, index) {
            var opacity;

            if (!box) {
                return;
            }

            opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            box.rect.attr({'stroke-opacity': opacity});
        });
        raphaelRenderUtil.forEach2dArray(this.groupWhiskers, function(whisker, groupIndex, index) {
            var opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            whisker.attr({'stroke-opacity': opacity});
        });
        raphaelRenderUtil.forEach2dArray(this.groupMedians, function(median, groupIndex, index) {
            var opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            median.attr({'stroke-opacity': opacity});
        });
    },

    renderSeriesLabel: function(paper, groupPositions, groupLabels, labelTheme, isStacked) {
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            opacity: 0,
            'text-anchor': isStacked ? 'middle' : 'start'
        };
        var labelSet = paper.set();

        snippet.forEach(groupLabels, function(categoryLabel, categoryIndex) {
            snippet.forEach(categoryLabel, function(label, seriesIndex) {
                var position = groupPositions[categoryIndex][seriesIndex];
                var endLabel = raphaelRenderUtil.renderText(paper, position.end, label.end, attributes);
                var startLabel;

                endLabel.node.style.userSelect = 'none';
                endLabel.node.style.cursor = 'default';
                endLabel.node.setAttribute('filter', 'url(#glow)');

                labelSet.push(endLabel);

                if (position.start) {
                    startLabel = raphaelRenderUtil.renderText(paper, position.start, label.start, attributes);
                    startLabel.node.style.userSelect = 'none';
                    startLabel.node.style.cursor = 'default';
                    startLabel.node.setAttribute('filter', 'url(#glow)');

                    labelSet.push(startLabel);
                }
            });
        });

        return labelSet;
    }
});

module.exports = RaphaelBoxplotChart;
