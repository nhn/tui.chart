/**
 * @fileoverview Raphael bar chart renderer.
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

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 * @private
 */
var RaphaelBarChart = snippet.defineClass(/** @lends RaphaelBarChart.prototype */ {
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
        this.seriesDataModel = data.seriesDataModel;
        this.chartType = data.chartType;

        this.paper.setStart();

        this.options = data.options;
        this.theme = data.theme;
        this.groupBars = this._renderBars(groupBounds);
        this.groupBorders = this._renderBarBorders(groupBounds);

        this.overlay = this._renderOverlay();
        this.groupBounds = groupBounds;

        return this.paper.setFinish();
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderOverlay: function() {
        var bound = {
            width: 1,
            height: 1,
            left: 0,
            top: 0
        };
        var attributes = {
            'fill-opacity': 0
        };

        return this._renderBar(bound, '#fff', attributes);
    },

    /**
     * Render rect
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} color series color
     * @param {object} [attributes] - attributes
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(bound, color, attributes) {
        var rect;

        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = raphaelRenderUtil.renderRect(this.paper, bound, snippet.extend({
            fill: color,
            stroke: 'none'
        }, attributes));

        return rect;
    },

    /**
     * Render bars.
     * @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} groupBounds bounds
     * @returns {Array.<Array.<object>>} bars
     * @private
     */
    _renderBars: function(groupBounds) {
        var self = this;
        var colors = this.theme.colors;
        var colorByPoint = this.options.colorByPoint;
        var groupBars = snippet.map(groupBounds, function(bounds, groupIndex) {
            return snippet.map(bounds, function(bound, index) {
                var color, rect, item;

                if (!bound) {
                    return null;
                }

                item = self.seriesDataModel.getSeriesItem(groupIndex, index);

                color = colorByPoint ? colors[groupIndex] : colors[index];
                rect = self._renderBar(bound.start, color);

                return {
                    rect: rect,
                    color: color,
                    bound: bound.end,
                    item: item,
                    groupIndex: groupIndex,
                    index: index,
                    isRange: item.isRange
                };
            });
        });

        return groupBars;
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
     * Make top line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.leftTop left top
     *      @param {{left: number, top: number}} points.rightTop right top
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeTopLinePath: function(points, chartType, item) {
        var linePath = null,
            value = item.value,
            cloneLeftTop;

        if (chartType === 'bar' || value >= 0 || item.isRange) {
            cloneLeftTop = snippet.extend({}, points.leftTop);
            cloneLeftTop.left -= chartType === 'column' || value < 0 ? 1 : 0;
            linePath = raphaelRenderUtil.makeLinePath(cloneLeftTop, points.rightTop).join(' ');
        }

        return linePath;
    },

    /**
     * Make right line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.rightTop right top
     *      @param {{left: number, top: number}} points.rightBottom right bottom
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeRightLinePath: function(points, chartType, item) {
        var linePath = null;

        if (chartType === 'column' || item.value >= 0 || item.isRange) {
            linePath = raphaelRenderUtil.makeLinePath(points.rightTop, points.rightBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make bottom line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.lefBottom left bottom
     *      @param {{left: number, top: number}} points.rightBottom right bottom
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeBottomLinePath: function(points, chartType, item) {
        var linePath = null;

        if (chartType === 'bar' || item.value < 0 || item.isRange) {
            linePath = raphaelRenderUtil.makeLinePath(points.leftBottom, points.rightBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make left line path.
     * @param {object} points points
     *      @param {{left: number, top: number}} points.lefTop left top
     *      @param {{left: number, top: number}} points.leftBottom left bottom
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {string} top line path
     * @private
     */
    _makeLeftLinePath: function(points, chartType, item) {
        var linePath = null;

        if (chartType === 'column' || item.value < 0 || item.isRange) {
            linePath = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make border lines paths.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {Item} item item
     * @returns {{top: string, right: string, bottom: string, left: string}} paths
     * @private
     */
    _makeBorderLinesPaths: function(bound, chartType, item) {
        var points = this._makeRectPoints(bound),
            paths = {
                top: this._makeTopLinePath(points, chartType, item),
                right: this._makeRightLinePath(points, chartType, item),
                bottom: this._makeBottomLinePath(points, chartType, item),
                left: this._makeLeftLinePath(points, chartType, item)
            };

        return snippet.filter(paths, function(path) {
            return path;
        });
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
        var self = this,
            borderLinePaths = this._makeBorderLinesPaths(bound, chartType, item),
            lines = {};

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
    _renderBarBorders: function(groupBounds) {
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
     * Animate borders.
     * @param {Array.<object>} lines raphael objects
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {Item} item item
     * @private
     */
    _animateBorders: function(lines, bound, chartType, item) {
        var paths = this._makeBorderLinesPaths(bound, chartType, item);

        snippet.forEach(lines, function(line, name) {
            line.animate({
                path: paths[name]
            }, ANIMATION_DURATION, '>');
        });
    },

    /**
     * Animate.
     * @param {function} onFinish finish callback function
     */
    animate: function(onFinish) {
        var self = this,
            groupBorders = this.groupBorders || [];

        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            if (!bar) {
                return;
            }
            self._animateRect(bar.rect, bar.bound);
            if (lines) {
                self._animateBorders(lines, bar.bound, self.chartType, bar.item);
            }
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
        var bar = this.groupBars[data.groupIndex][data.index],
            bound = bar.bound;
        this.overlay.attr({
            width: bound.width,
            height: bound.height,
            x: bound.left,
            y: bound.top,
            'fill-opacity': 0.3
        });
    },

    /**
     * Hide animation.
     */
    hideAnimation: function() {
        this.overlay.attr({
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
        var self = this,
            groupBorders = this.groupBorders || [],
            dimension = params.dimension,
            groupBounds = params.groupBounds;

        this.groupBounds = groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines, bound;

            if (!bar) {
                return;
            }

            lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            bound = groupBounds[groupIndex][index].end;
            bar.bound = bound;
            raphaelRenderUtil.updateRectBound(bar.rect, bound);

            if (lines) {
                self._updateBordersPath(lines, bound, self.chartType, bar.item);
            }
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
    _changeBarColor: function(indexes, color, borderColor) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            lines;

        bar.rect.attr({
            fill: color
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
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            objColor = raphael.color(bar.color),
            selectionColorTheme = this.theme.selectionColor,
            color = selectionColorTheme || raphaelRenderUtil.makeChangedLuminanceColor(objColor.hex, DEFAULT_LUMINANC),
            borderColor = this.theme.borderColor,
            objBorderColor;

        if (borderColor) {
            objBorderColor = raphael.color(borderColor);
            borderColor = raphaelRenderUtil.makeChangedLuminanceColor(objBorderColor.hex, DEFAULT_LUMINANC);
        }

        this._changeBarColor(indexes, color, borderColor);
    },

    /**
     * Unselect series.
     * @param {{groupIndex: number, index: number}} indexes indexes
     */
    unselectSeries: function(indexes) {
        var bar = this.groupBars[indexes.groupIndex][indexes.index],
            borderColor = this.theme.borderColor;
        this._changeBarColor(indexes, bar.color, borderColor);
    },

    /**
     * Select legend.
     * @param {?number} legendIndex legend index
     */
    selectLegend: function(legendIndex) {
        var groupBorders = this.groupBorders || [],
            noneSelected = snippet.isNull(legendIndex);

        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines, opacity;

            if (!bar) {
                return;
            }

            lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            bar.rect.attr({'fill-opacity': opacity});
            if (lines) {
                snippet.forEach(lines, function(line) {
                    line.attr({'stroke-opacity': opacity});
                });
            }
        });
    },

    renderSeriesLabel: function(paper, groupPositions, groupLabels, labelTheme, isStacked) {
        var textAnchor = (isStacked || this.chartType === 'column') ? 'middle' : 'start';
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            opacity: 0,
            'text-anchor': textAnchor
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

module.exports = RaphaelBarChart;
