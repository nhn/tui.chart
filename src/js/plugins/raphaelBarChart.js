/**
 * @fileoverview Raphael bar chart renderer.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var raphaelRenderUtil = require('./raphaelRenderUtil');

var raphael = window.Raphael;

var ANIMATION_TIME = 700,
    EMPHASIS_OPACITY = 1,
    DE_EMPHASIS_OPACITY = 0.3,
    DEFAULT_LUMINANC = 0.2;

/**
 * @classdesc RaphaelBarChart is graph renderer for bar, column chart.
 * @class RaphaelBarChart
 */
var RaphaelBarChart = tui.util.defineClass(/** @lends RaphaelBarChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {HTMLElement} container container element
     * @param {{size: object, model: object, options: object, tooltipPosition: string}} data chart data
     * @returns {object} paper raphael paper
     */
    render: function(container, data) {
        var groupBounds = data.groupBounds,
            dimension = data.dimension,
            paper, baseParams;

        if (!groupBounds) {
            return null;
        }

        this.paper = paper = raphael(container, dimension.width, dimension.height);

        baseParams = {
            theme: data.theme,
            groupBounds: groupBounds,
            groupValues: data.groupValues,
            chartType: data.chartType
        };

        this.groupBars = this._renderBars(baseParams);
        this.groupBorders = this._renderBarBorders(baseParams);

        this.overlay = this._renderOverlay();
        this.theme = data.theme;
        this.groupBounds = groupBounds;
        this.chartType = data.chartType;

        return paper;
    },

    /**
     * Render overlay.
     * @returns {object} raphael object
     * @private
     */
    _renderOverlay: function() {
        var rect = this._renderBar({
            bound: {
                width: 1,
                height: 1,
                left: 0,
                top: 0
            },
            color: '#fff'
        }).attr({
            'fill-opacity': 0
        });

        return rect;
    },

    /**
     * Render rect
     * @param {object} params parameters
     *      @param {string} params.color series color
     *      @param {string} params.borderColor series borderColor
     *      @param {{left: number, top: number, width: number, height: number}} params.bound bound
     * @returns {object} bar rect
     * @private
     */
    _renderBar: function(params) {
        var bound = params.bound,
            rect;

        if (bound.width < 0 || bound.height < 0) {
            return null;
        }

        rect = this.paper.rect(bound.left, bound.top, bound.width, bound.height);
        rect.attr({
            fill: params.color,
            stroke: 'none'
        });

        return rect;
    },

    /**
     * Render bars.
     * @param {object} params parameters
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @returns {Array.<Array.<object>>} bars
     * @private
     */
    _renderBars: function(params) {
        var self = this,
            singleColors = (params.groupBounds[0].length === 1) && params.theme.singleColors || [],
            colors = params.theme.colors,
            groupBars;

        groupBars = tui.util.map(params.groupBounds, function(bounds, groupIndex) {
            var singleColor = singleColors[groupIndex];

            return tui.util.map(bounds, function(bound, index) {
                var color, rect, value;

                if (!bound) {
                    return null;
                }

                color = singleColor || colors[index];
                value = params.groupValues[groupIndex][index];

                rect = self._renderBar({
                    chartType: params.chartType,
                    color: color,
                    borderColor: params.theme.borderColor,
                    bound: bound.start,
                    value: value
                });

                return {
                    rect: rect,
                    color: color,
                    bound: bound.end,
                    value: value,
                    groupIndex: groupIndex,
                    index: index
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
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeTopLinePath: function(points, chartType, value) {
        var linePath = null,
            cloneLeftTop;

        if (chartType === 'bar' || value >= 0) {
            cloneLeftTop = tui.util.extend({}, points.leftTop);
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
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeRightLinePath: function(points, chartType, value) {
        var linePath = null;

        if (chartType === 'column' || value >= 0) {
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
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeBottomLinePath: function(points, chartType, value) {
        var linePath = null;

        if (chartType === 'bar' || value < 0) {
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
     * @param {number} value value
     * @returns {string} top line path
     * @private
     */
    _makeLeftLinePath: function(points, chartType, value) {
        var linePath = null;

        if (chartType === 'column' || value < 0) {
            linePath = raphaelRenderUtil.makeLinePath(points.leftTop, points.leftBottom).join(' ');
        }

        return linePath;
    },

    /**
     * Make border lines paths.
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @returns {{top: string, right: string, bottom: string, left: string}} paths
     * @private
     */
    _makeBorderLinesPaths: function(bound, chartType, value) {
        var points = this._makeRectPoints(bound),
            paths = {
                top: this._makeTopLinePath(points, chartType, value),
                right: this._makeRightLinePath(points, chartType, value),
                bottom: this._makeBottomLinePath(points, chartType, value),
                left: this._makeLeftLinePath(points, chartType, value)
            };

        return tui.util.filter(paths, function(path) {
            return path;
        });
    },

    /**
     * Render border lines;
     * @param {object} params parameters
     *      @param {{left: number, top:number, width: number, height: number}} params.bound bar bound
     *      @param {string} params.borderColor border color
     *      @param {string} params.chartType chart type
     *      @param {number} params.value value
     * @returns {object} raphael object
     * @private
     */
    _renderBorderLines: function(params) {
        var self = this,
            borderLinePaths = this._makeBorderLinesPaths(params.bound, params.chartType, params.value),
            lines = {};

        tui.util.forEach(borderLinePaths, function(path, name) {
            lines[name] = raphaelRenderUtil.renderLine(self.paper, path, params.borderColor, 1);
        });

        return lines;
    },

    /**
     * Render bar borders.
     * @param {object} params parameters
     *      @param {{colors: string[], singleColors: string[], borderColor: string}} params.theme bar chart theme
     *      @param {Array.<Array.<{left: number, top:number, width: number, height: number}>>} params.groupBounds bounds
     * @returns {Array.<Array.<object>>} borders
     * @private
     */
    _renderBarBorders: function(params) {
        var self = this,
            borderColor = params.theme.borderColor,
            groupBorders;

        if (!borderColor) {
            return null;
        }

        groupBorders = tui.util.map(params.groupBounds, function(bounds, groupIndex) {
            return tui.util.map(bounds, function(bound, index) {
                var value;

                if (!bound) {
                    return null;
                }

                value = params.groupValues[groupIndex][index];

                return self._renderBorderLines({
                    paper: self.paper,
                    bound: bound.start,
                    borderColor: borderColor,
                    chartType: params.chartType,
                    value: value
                });
            });
        }, this);

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
        }, ANIMATION_TIME);
    },

    /**
     * Animate borders.
     * @param {Array.<object>} lines raphael objects
     * @param {{left: number, top:number, width: number, height: number}} bound rect bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _animateBorders: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);

        tui.util.forEach(lines, function(line, name) {
            line.animate({path: paths[name]}, ANIMATION_TIME);
        });
    },

    /**
     * Animate.
     * @param {function} onFinish finish callback function
     */
    animate: function(onFinish) {
        var self = this,
            groupBorders = this.groupBorders || [];

        if (this.callbackTimeout) {
            clearTimeout(this.callbackTimeout);
            delete this.callbackTimeout;
        }
        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            if (!bar) {
                return;
            }
            self._animateRect(bar.rect, bar.bound);
            if (lines) {
                self._animateBorders(lines, bar.bound, self.chartType, bar.value);
            }
        });

        if (onFinish) {
            this.callbackTimeout = setTimeout(function() {
                onFinish();
                delete self.callbackTimeout;
            }, ANIMATION_TIME);
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
     * Update borders attribute
     * @param {Array.<object>} lines raphael objects
     * @param {{left: number, top: number, width: number, height: number}} bound bound
     * @param {string} chartType chart type
     * @param {number} value value
     * @private
     */
    _updateBordersPath: function(lines, bound, chartType, value) {
        var paths = this._makeBorderLinesPaths(bound, chartType, value);

        tui.util.forEach(lines, function(line, name) {
            line.attr({path: paths[name]});
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
            self._updateRectBound(bar.rect, bound);

            if (lines) {
                self._updateBordersPath(lines, bound, self.chartType, bar.value);
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
        tui.util.forEach(lines, function(line) {
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
            noneSelected = tui.util.isNull(legendIndex);

        raphaelRenderUtil.forEach2dArray(this.groupBars, function(bar, groupIndex, index) {
            var lines, opacity;

            if (!bar) {
                return;
            }

            lines = groupBorders[groupIndex] && groupBorders[groupIndex][index];
            opacity = (noneSelected || legendIndex === index) ? EMPHASIS_OPACITY : DE_EMPHASIS_OPACITY;

            bar.rect.attr({'fill-opacity': opacity});
            if (lines) {
                tui.util.forEach(lines, function(line) {
                    line.attr({'stroke-opacity': opacity});
                });
            }
        });
    }
});

module.exports = RaphaelBarChart;
