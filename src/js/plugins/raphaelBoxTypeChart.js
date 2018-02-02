/**
 * @fileoverview RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var snippet = require('tui-code-snippet');

var ANIMATION_DURATION = 100;
var MIN_BORDER_WIDTH = 1;
var MAX_BORDER_WIDTH = 3;

/**
 * @classdesc RaphaelBoxTypeChart is graph renderer for box type chart(heatmap chart, treemap chart).
 * @class RaphaelBarChart
 * @private
 */
var RaphaelBoxTypeChart = snippet.defineClass(/** @lends RaphaelBoxTypeChart.prototype */ {
    /**
     * Render function of bar chart
     * @param {object} paper Raphael paper
     * @param {{
     *      dimension: {width: number, height: number},
     *      colorSpectrum: object,
     *      seriesDataModel: SeriesDataModel,
     *      groupBounds: (Array.<Array.<object>>|object.<string, object>),
     *      theme: object
     * }} seriesData - data for graph rendering
     * @returns {object}
     */
    render: function(paper, seriesData) {
        var seriesSet = paper.set();

        this.paper = paper;

        /**
         * theme
         * @type {*|{}}
         */
        this.theme = seriesData.theme || {};

        /**
         * color spectrum
         * @type {Object}
         */
        this.colorSpectrum = seriesData.colorSpectrum;

        /**
         *
         */
        this.chartBackground = seriesData.chartBackground;

        /**
         * zoomable option
         */
        this.zoomable = seriesData.zoomable;

        /**
         * border color for rendering box
         * @type {string}
         */
        this.borderColor = this.theme.borderColor || 'none';

        /**
         * border width for rendering box
         */
        this.borderWidth = this.theme.borderWidth;

        /**
         * group bounds
         * @type {Array.<Array.<object>>|object.<string, object>}
         */
        this.groupBounds = seriesData.groupBounds;

        /**
         * bound map
         * @type {object.<string, {left: number, top: number, width: number, height: number}>}
         */
        this.boundMap = seriesData.boundMap;

        this._bindGetBoundFunction();
        this._bindGetColorFunction();

        /**
         * boxes set
         * @type {Array.<Array.<{rect: Object, color: string}>>}
         */
        this.boxesSet = this._renderBoxes(seriesData.seriesDataModel, seriesData.startDepth, !!seriesData.isPivot,
            seriesSet);

        return seriesSet;
    },

    /**
     * Bind _getBound private function.
     * @private
     */
    _bindGetBoundFunction: function() {
        if (this.boundMap) {
            this._getBound = this._getBoundFromBoundMap;
        } else {
            this._getBound = this._getBoundFromGroupBounds;
        }
    },

    /**
     * Bind _bindGetColorFunction private function.
     * @private
     */
    _bindGetColorFunction: function() {
        if (this.colorSpectrum) {
            this._getColor = this._getColorFromSpectrum;
        } else if (this.zoomable) {
            this._getColor = this._getColorFromColorsWhenZoomable;
        } else {
            this._getColor = this._getColorFromColors;
        }
    },

    /**
     * Get bound from groupBounds by indexes(groupIndex, index) of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _getBoundFromGroupBounds: function(seriesItem) {
        return this.groupBounds[seriesItem.groupIndex][seriesItem.index].end;
    },

    /**
     * Get bound from boundMap by id of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {{width: number, height: number, left: number, top: number}}
     * @private
     */
    _getBoundFromBoundMap: function(seriesItem) {
        return this.boundMap[seriesItem.id];
    },

    /**
     * Get color from colorSpectrum by ratio of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {string}
     * @private
     */
    _getColorFromSpectrum: function(seriesItem) {
        var color;

        if (!seriesItem.hasChild) {
            color = this.colorSpectrum.getColor(seriesItem.colorRatio || seriesItem.ratio) || this.chartBackground;
        } else {
            color = 'none';
        }

        return color;
    },

    /**
     * Get color from colors theme by group property of seriesItem.
     * @param {SeriesItem} seriesItem - seriesItem
     * @returns {string}
     * @private
     */
    _getColorFromColors: function(seriesItem) {
        return seriesItem.hasChild ? 'none' : this.theme.colors[seriesItem.group];
    },

    /**
     * Get color from colors theme, when zoomable option.
     * @param {SeriesItem} seriesItem - seriesItem
     * @param {number} startDepth - start depth
     * @returns {string}
     * @private
     */
    _getColorFromColorsWhenZoomable: function(seriesItem, startDepth) {
        return (seriesItem.depth === startDepth) ? this.theme.colors[seriesItem.group] : 'none';
    },

    /**
     * Render rect.
     * @param {{width: number, height: number, left: number, top: number}} bound - bound
     * @param {string} color - color
     * @param {number} strokeWidth - stroke width
     * @returns {object}
     * @private
     */
    _renderRect: function(bound, color, strokeWidth) {
        return raphaelRenderUtil.renderRect(this.paper, bound, {
            fill: color,
            stroke: this.borderColor,
            'stroke-width': strokeWidth
        });
    },

    /**
     * Get stroke width.
     * @param {?number} depth - depth
     * @param {number} startDepth - start depth
     * @returns {number}
     * @private
     */
    _getStrokeWidth: function(depth, startDepth) {
        var strokeWidth;

        if (this.borderWidth) {
            strokeWidth = this.borderWidth;
        } else if (snippet.isExisty(depth)) {
            strokeWidth = Math.max(MIN_BORDER_WIDTH, MAX_BORDER_WIDTH - (depth - startDepth));
        } else {
            strokeWidth = MIN_BORDER_WIDTH;
        }

        return strokeWidth;
    },

    /**
     * Render boxes.
     * @param {SeriesDataModel} seriesDataModel - seriesDataModel
     * @param {number} startDepth - start depth
     * @param {boolean} isPivot - whether pivot or not
     * @param {Array.<object>} seriesSet - seriesSet
     * @returns {Array.<Array.<{rect: object, color: string}>>}
     * @private
     */
    _renderBoxes: function(seriesDataModel, startDepth, isPivot, seriesSet) {
        var self = this;
        var rectToBack;

        if (this.colorSpectrum || !this.zoomable) {
            rectToBack = function(rect) {
                rect.toBack();
            };
        } else {
            rectToBack = function() {};
        }

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var result = null;
                var strokeWidth = self._getStrokeWidth(seriesItem.depth, startDepth);
                var bound, color;

                seriesItem.groupIndex = groupIndex;
                seriesItem.index = index;
                bound = self._getBound(seriesItem);

                if (bound) {
                    color = self._getColor(seriesItem, startDepth);
                    result = {
                        rect: self._renderRect(bound, color, strokeWidth),
                        seriesItem: seriesItem,
                        color: color
                    };
                    rectToBack(result.rect);

                    if (seriesSet) {
                        seriesSet.push(result.rect);
                    }
                }

                return result;
            });
        }, isPivot);
    },

    /**
     * Animate changing color of box.
     * @param {object} rect - raphael object
     * @param {string} [color] - fill color
     * @param {number} [opacity] - fill opacity
     * @private
     */
    _animateChangingColor: function(rect, color, opacity) {
        var properties = {
            'fill-opacity': snippet.isExisty(opacity) ? opacity : 1
        };

        if (color) {
            properties.fill = color;
        }

        rect.animate(properties, ANIMATION_DURATION, '>');
    },

    /**
     * Show animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     * @param {boolean} [useSpectrum] - whether use spectrum legend or not
     * @param {number} [opacity] - fill opacity
     */
    showAnimation: function(indexes, useSpectrum, opacity) {
        var box = this.boxesSet[indexes.groupIndex][indexes.index];
        var color;

        if (!box) {
            return;
        }

        useSpectrum = snippet.isUndefined(useSpectrum) ? true : useSpectrum;
        color = useSpectrum ? this.theme.overColor : box.color;

        if (box.seriesItem.hasChild) {
            if (useSpectrum) {
                box.rect.attr({'fill-opacity': 0});
            }
            box.rect.toFront();
        }

        this._animateChangingColor(box.rect, color, opacity);
    },

    /**
     * Hide animation.
     * @param {{groupIndex: number, index:number}} indexes - index info
     * @param {boolean} [useColorValue] - whether use colorValue or not
     */
    hideAnimation: function(indexes, useColorValue) {
        var colorSpectrum = this.colorSpectrum;
        var box = this.boxesSet[indexes.groupIndex][indexes.index];
        var opacity = 1;
        var color, paper;

        if (!box) {
            return;
        }

        paper = box.rect.paper;

        if (box.seriesItem.hasChild) {
            color = null;
            if (useColorValue) {
                opacity = 0;
            }
        } else {
            color = box.color;
        }

        this._animateChangingColor(box.rect, color, opacity);

        setTimeout(function() {
            if (!colorSpectrum && box.seriesItem.hasChild) {
                box.rect.toBack();
                paper.pushDownBackgroundToBottom();
            }
        }, ANIMATION_DURATION);
    },

    /**
     * Resize.
     * @param {{
     *      dimension: {width: number, height: number},
     *      groupBounds: (Array.<Array.<object>>|object.<string, object>)
     * }} seriesData - data for graph rendering
     */
    resize: function(seriesData) {
        var self = this;
        var dimension = seriesData.dimension;

        this.boundMap = seriesData.boundMap;
        this.groupBounds = seriesData.groupBounds;
        this.paper.setSize(dimension.width, dimension.height);

        raphaelRenderUtil.forEach2dArray(this.boxesSet, function(box, groupIndex, index) {
            var bound;

            if (!box) {
                return;
            }

            bound = self._getBound(box.seriesItem, groupIndex, index);

            if (bound) {
                raphaelRenderUtil.updateRectBound(box.rect, bound);
            }
        });
    },

    renderSeriesLabel: function(paper, positionSet, labels, labelTheme) {
        var labelSet = paper.set();
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            opacity: 0
        };

        snippet.forEach(labels, function(categoryLabel, categoryIndex) {
            snippet.forEach(categoryLabel, function(label, seriesIndex) {
                var seriesLabel = raphaelRenderUtil.renderText(paper, positionSet[categoryIndex][seriesIndex].end,
                    label, attributes);

                seriesLabel.node.style.userSelect = 'none';
                seriesLabel.node.style.cursor = 'default';
                seriesLabel.node.setAttribute('filter', 'url(#glow)');

                labelSet.push(seriesLabel);
            });
        });

        return labelSet;
    },

    renderSeriesLabelForTreemap: function(paper, positions, labels, labelTheme) {
        var labelSet = paper.set();
        var attributes = {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            fill: labelTheme.color,
            opacity: 0
        };

        snippet.forEach(labels, function(label, index) {
            var seriesLabel = raphaelRenderUtil.renderText(paper, positions[index], label, attributes);

            seriesLabel.node.style.userSelect = 'none';
            seriesLabel.node.style.cursor = 'default';
            seriesLabel.node.setAttribute('filter', 'url(#glow)');

            labelSet.push(seriesLabel);
        });

        return labelSet;
    }
});

module.exports = RaphaelBoxTypeChart;
