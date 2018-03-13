/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var arrayUtil = require('../../helpers/arrayUtil');
var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @private
 * @mixin
 * @private */
var LineTypeSeriesBase = snippet.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * Make positions for default data type.
     * @param {number} [seriesWidth] - width of series area
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _makePositionsForDefaultType: function(seriesWidth) {
        var dimension = this.layout.dimension;
        var seriesDataModel = this._getSeriesDataModel();
        var width = seriesWidth || dimension.width || 0;
        var height = dimension.height;
        var len = seriesDataModel.getGroupCount();
        var baseTop = this.layout.position.top;
        var baseLeft = this.layout.position.left;
        var step;

        if (this.aligned) {
            step = width / (len > 1 ? (len - 1) : len);
        } else {
            step = width / len;
            baseLeft += (step / 2);
        }

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem, index) {
                var position;

                if (!snippet.isNull(seriesItem.end)) {
                    position = {
                        left: baseLeft + (step * index),
                        top: baseTop + height - (seriesItem.ratio * height)
                    };

                    if (snippet.isExisty(seriesItem.startRatio)) {
                        position.startTop = baseTop + height - (seriesItem.startRatio * height);
                    }
                }

                return position;
            });
        }, true);
    },

    /**
     * Make positions for coordinate data type.
     * @param {number} [seriesWidth] - width of series area
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _makePositionForCoordinateType: function(seriesWidth) {
        var dimension = this.layout.dimension;
        var seriesDataModel = this._getSeriesDataModel();
        var width = seriesWidth || dimension.width || 0;
        var height = dimension.height;
        var xAxis = this.axisDataMap.xAxis;
        var additionalLeft = 0;
        var baseTop = this.layout.position.top;
        var baseLeft = this.layout.position.left;

        if (xAxis.sizeRatio) {
            additionalLeft = calculator.multiply(width, xAxis.positionRatio);
            width = calculator.multiply(width, xAxis.sizeRatio);
        }

        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesItem) {
                var position;

                if (!snippet.isNull(seriesItem.end)) {
                    position = {
                        left: baseLeft + (seriesItem.ratioMap.x * width) + additionalLeft,
                        top: baseTop + height - (seriesItem.ratioMap.y * height)
                    };

                    if (snippet.isExisty(seriesItem.ratioMap.start)) {
                        position.startTop =
                            height - (seriesItem.ratioMap.start * height) + chartConst.SERIES_EXPAND_SIZE;
                    }
                }

                return position;
            });
        }, true);
    },

    /**
     * Make basic positions for rendering line graph.
     * @param {number} [seriesWidth] - width of series area
     * @returns {Array.<Array.<object>>}
     * @private
     */
    _makeBasicPositions: function(seriesWidth) {
        var positions;

        if (this.dataProcessor.isCoordinateType()) {
            positions = this._makePositionForCoordinateType(seriesWidth);
        } else {
            positions = this._makePositionsForDefaultType(seriesWidth);
        }

        return positions;
    },

    /**
     * Calculate label position top.
     * @param {{top: number, startTop: number}} basePosition - base position
     * @param {number} value - value of seriesItem
     * @param {number} labelHeight - label height
     * @param {boolean} [isStart] - whether start value of seriesItem or not
     * @returns {number} position top
     * @private
     */
    _calculateLabelPositionTop: function(basePosition, value, labelHeight, isStart) {
        var baseTop = basePosition.top,
            top;

        if (predicate.isValidStackOption(this.options.stackType)) {
            top = ((basePosition.startTop + baseTop - labelHeight) / 2) + 1;
        } else if ((value >= 0 && !isStart) || (value < 0 && isStart)) {
            top = baseTop - labelHeight - chartConst.SERIES_LABEL_PADDING;
        } else {
            top = baseTop + chartConst.SERIES_LABEL_PADDING;
        }

        return top;
    },

    /**
     * Make label position for rendering label of series area.
     * @param {{left: number, top: number, startTop: ?number}} basePosition - base position for calculating
     * @param {number} labelHeight - label height
     * @param {(string | number)} label - label of seriesItem
     * @param {number} value - value of seriesItem
     * @param {boolean} [isStart] - whether start label position or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makeLabelPosition: function(basePosition, labelHeight, label, value, isStart) {
        return {
            left: basePosition.left,
            top: this._calculateLabelPositionTop(basePosition, value, labelHeight / 2, isStart)

        };
    },

    /**
     * Get label positions for line type chart
     * @param {object} seriesDataModel series data model
     * @param {object} theme label theme
     * @returns {object}
     * @private
     */
    _getLabelPositions: function(seriesDataModel, theme) {
        var self = this;
        var basePositions = arrayUtil.pivot(this.seriesData.groupPositions);
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORD, theme);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var basePosition = basePositions[groupIndex][index];
                var end = self._makeLabelPosition(basePosition, labelHeight, seriesItem.endLabel, seriesItem.end);
                var position = {
                    end: end
                };

                if (seriesItem.isRange) {
                    basePosition.top = basePosition.startTop;
                    position.start =
                        self._makeLabelPosition(basePosition, labelHeight, seriesItem.startLabel, seriesItem.start);
                }

                return position;
            });
        });
    },

    /**
     * Get label texts
     * @param {object} seriesDataModel sereis data model
     * @returns {Array.<string>}
     * @private
     */
    _getLabelTexts: function(seriesDataModel) {
        return seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesDatum) {
                var label = {
                    end: seriesDatum.endLabel
                };

                if (seriesDatum.isRange) {
                    label.start = seriesDatum.startLabel;
                }

                return label;
            });
        });
    },

    /**
     * Render series label.
     * @param {object} paper paper
     * @returns {Array.<object>}
     * @private
     */
    _renderSeriesLabel: function(paper) {
        var theme = this.theme.label;
        var seriesDataModel = this._getSeriesDataModel();
        var groupLabels = this._getLabelTexts(seriesDataModel);
        var positionsSet = this._getLabelPositions(seriesDataModel, theme);

        return this.graphRenderer.renderSeriesLabel(paper, positionsSet, groupLabels, theme);
    },

    /**
     * To call showGroupTooltipLine function of graphRenderer.
     * @param {{
     *      dimension: {width: number, height: number},
     *      position: {left: number, top: number}
     * }} bound bound
     */
    onShowGroupTooltipLine: function(bound) {
        if (!this.graphRenderer.showGroupTooltipLine) {
            return;
        }

        this.graphRenderer.showGroupTooltipLine(bound, this.layout);
    },

    /**
     * To call hideGroupTooltipLine function of graphRenderer.
     */
    onHideGroupTooltipLine: function() {
        if (!this.seriesData
            || !this.seriesData.isAvailable()
            || !this.graphRenderer.hideGroupTooltipLine
        ) {
            return;
        }
        this.graphRenderer.hideGroupTooltipLine();
    },

    /**
     * Zoom by mouse drag.
     * @param {object} data - data
     */
    zoom: function(data) {
        this._cancelMovingAnimation();
        this._clearSeriesContainer(data.paper);
        this._setDataForRendering(data);
        this._renderSeriesArea(data.paper, snippet.bind(this._renderGraph, this));
        this.animateComponent(true);

        if (!snippet.isNull(this.selectedLegendIndex)) {
            this.graphRenderer.selectLegend(this.selectedLegendIndex);
        }
    },

    /**
     * Whether changed or not.
     * @param {{min: number, max: number}} before - before limit
     * @param {{min: number, max: number}} after - after limit
     * @returns {boolean}
     * @private
     */
    _isChangedLimit: function(before, after) {
        return before.min !== after.min || before.max !== after.max;
    },

    /**
     * Whether changed axis limit(min, max) or not.
     * @returns {boolean}
     * @private
     */
    _isChangedAxisLimit: function() {
        var beforeAxisDataMap = this.beforeAxisDataMap;
        var axisDataMap = this.axisDataMap;
        var changed = true;

        if (beforeAxisDataMap) {
            changed = this._isChangedLimit(beforeAxisDataMap.yAxis.limit, axisDataMap.yAxis.limit);

            if (axisDataMap.xAxis.limit) {
                changed = changed || this._isChangedLimit(beforeAxisDataMap.xAxis.limit, axisDataMap.xAxis.limit);
            }
        }

        this.beforeAxisDataMap = axisDataMap;

        return changed;
    },

    /**
     * Animate for motion of series area.
     * @param {function} callback - callback function
     * @private
     */
    _animate: function(callback) {
        var self = this;
        var duration = chartConst.ADDING_DATA_ANIMATION_DURATION;
        var changedLimit = this._isChangedAxisLimit();

        if (changedLimit && this.seriesLabelContainer) {
            this.seriesLabelContainer.innerHTML = '';
        }

        if (!callback) {
            return;
        }

        this.movingAnimation = renderUtil.startAnimation(duration, callback, function() {
            self.movingAnimation = null;
        });
    },

    /**
     * Make top of zero point for adding data.
     * @returns {number}
     * @private
     * @override
     */
    _makeZeroTopForAddingData: function() {
        var seriesHeight = this.layout.dimension.height;
        var limit = this.axisDataMap.yAxis.limit;

        return this._getLimitDistanceFromZeroPoint(seriesHeight, limit).toMax + chartConst.SERIES_EXPAND_SIZE;
    },

    /**
     * Animate for adding data.
     * @param {{tickSize: number}} data - parameters for adding data.
     */
    animateForAddingData: function(data) {
        var dimension = this.dimensionMap.extendedSeries;
        var seriesWidth = this.layout.dimension.width;
        var tickSize = data.tickSize;
        var shiftingOption = this.options.shifting;
        var seriesData, paramsForRendering, groupPositions, zeroTop;

        this.limit = data.limitMap[this.chartType];
        this.axisDataMap = data.axisDataMap;

        seriesData = this._makeSeriesData();
        paramsForRendering = this._makeParamsForGraphRendering(dimension, seriesData);

        if (shiftingOption) {
            seriesWidth += tickSize;
        }

        groupPositions = this._makePositions(seriesWidth);
        zeroTop = this._makeZeroTopForAddingData();

        this.graphRenderer.animateForAddingData(paramsForRendering, tickSize, groupPositions, shiftingOption, zeroTop);
    },

    /**
     * Cancel moving animation.
     * @private
     */
    _cancelMovingAnimation: function() {
        if (this.movingAnimation) {
            cancelAnimationFrame(this.movingAnimation.id);
            this.movingAnimation = null;
        }
    }
});

LineTypeSeriesBase.mixin = function(func) {
    snippet.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;
