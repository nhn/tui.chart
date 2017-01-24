/**
 * @fileoverview BarTypeSeriesBase is base class for bar type series.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var labelHelper = require('./renderingLabelHelper');
var predicate = require('../../helpers/predicate');
var calculator = require('../../helpers/calculator');
var renderUtil = require('../../helpers/renderUtil');

var DEFAULT_BAR_SIZE_RATIO_BY_POINT_INTERVAL = 0.8;

var BarTypeSeriesBase = tui.util.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
    /**
     * Make series data.
     * @returns {object} add data
     * @private
     * @override
     */
    _makeSeriesData: function() {
        var groupBounds = this._makeBounds(this.layout.dimension);

        this.groupBounds = groupBounds;

        return {
            groupBounds: groupBounds,
            seriesDataModel: this._getSeriesDataModel(),
            isAvailable: function() {
                return groupBounds && groupBounds.length > 0;
            }
        };
    },

    /**
     * Get bar width option size.
     * @param {number} pointInterval point interval
     * @param {number} [optionBarWidth] barWidth option
     * @returns {number} option size
     * @private
     */
    _getBarWidthOptionSize: function(pointInterval, optionBarWidth) {
        var optionsSize = 0;

        if (optionBarWidth) {
            if ((optionBarWidth / 2) >= pointInterval) {
                optionBarWidth = pointInterval * 2;
            } else if (optionBarWidth < 0) {
                optionBarWidth = 0;
            }
            optionsSize = optionBarWidth;
        }

        return optionsSize;
    },

    /**
     * Calculate difference between optionSize and barSize.
     * @param {number} barSize bar size
     * @param {number} optionSize option size
     * @param {number} itemCount item count
     * @returns {number} addition padding
     * @private
     */
    _calculateAdditionalPosition: function(barSize, optionSize, itemCount) {
        var additionalPosition = 0;

        if (optionSize && optionSize < barSize) {
            additionalPosition = (barSize / 2) + ((barSize - optionSize) * itemCount / 2);
        }

        return additionalPosition;
    },

    /**
     * Make base data for making bound.
     * @param {number} baseGroupSize base group size
     * @param {number} baseBarSize base bar size
     * @returns {undefined|{
     *      baseBarSize: number,
     *      groupSize: number,
     *      barSize: number,
     *      pointInterval: number,
     *      firstAdditionalPosition: number,
     *      basePosition: number
     * }}
     * @private
     */
    _makeBaseDataForMakingBound: function(baseGroupSize, baseBarSize) {
        var isStackType = predicate.isValidStackOption(this.options.stackType);
        var seriesDataModel = this._getSeriesDataModel();
        var groupSize = baseGroupSize / seriesDataModel.getGroupCount();
        var columnTopOffset = -this.layout.position.top + chartConst.CHART_PADDING;
        var positionValue =
            predicate.isColumnChart(this.chartType) ? columnTopOffset : this.layout.position.left;
        var itemCount, barSize, optionSize, basePosition, pointInterval, baseBounds;

        if (seriesDataModel.rawSeriesData.length > 0) {
            if (!isStackType) {
                itemCount = seriesDataModel.getFirstSeriesGroup().getSeriesItemCount();
            } else {
                itemCount = this.options.diverging ? 1 : this.dataProcessor.getStackCount(this.seriesType);
            }

            pointInterval = groupSize / (itemCount + 1);
            barSize = pointInterval * DEFAULT_BAR_SIZE_RATIO_BY_POINT_INTERVAL;
            optionSize = this.options.barWidth;
            barSize = this._getBarWidthOptionSize(pointInterval, optionSize) || barSize;
            basePosition = this._getLimitDistanceFromZeroPoint(baseBarSize, this.limit).toMin
                + positionValue;

            if (predicate.isColumnChart(this.chartType)) {
                basePosition = baseBarSize - basePosition;
            }

            baseBounds = {
                baseBarSize: baseBarSize,
                groupSize: groupSize,
                barSize: barSize,
                pointInterval: pointInterval,
                firstAdditionalPosition: pointInterval,
                basePosition: basePosition
            };
        }

        return baseBounds;
    },

    /**
     * Render normal series label.
     * @param {object} paper paper
     * @returns {Array.<object>}
     * @private
     */
    _renderNormalSeriesLabel: function(paper) {
        var graphRenderer = this.graphRenderer;
        var seriesDataModel = this._getSeriesDataModel();
        var boundsSet = this.seriesData.groupBounds;
        var labelTheme = this.theme.label;
        var selectedIndex = this.selectedLegendIndex;
        var groupLabels = seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesDatum) {
                var label = {
                    end: seriesDatum.endLabel
                };

                if (tui.util.isExisty(seriesDatum.start)) {
                    label.start = seriesDatum.startLabel;
                }

                return label;
            });
        });
        var positionsSet;

        if (predicate.isBarChart(this.chartType)) {
            positionsSet = labelHelper.boundsToLabelPositionsForBarChart(seriesDataModel, boundsSet, labelTheme);
        } else {
            positionsSet = labelHelper.boundsToLabelPositionsForColumnChart(seriesDataModel, boundsSet, labelTheme);
        }

        return graphRenderer.renderSeriesLabel(paper, positionsSet, groupLabels, labelTheme, selectedIndex);
    },

    /**
     * Make sum values.
     * @param {Array.<number>} values values
     * @returns {number} sum result.
     */
    _makeSumValues: function(values) {
        var sum = calculator.sum(values);

        return renderUtil.formatValue(sum, this.dataProcessor.getFormatFunctions(), this.chartType, 'seires');
    },

    /**
     * Make stackType label position.
     * @param {{width: number, height: number, left: number, top: number}} bound element bound
     * @returns {{left: number, top: number}} position
     * @private
     */
    _makeStackedLabelPosition: function(bound) {
        var left = bound.left + (bound.width / 2);
        var top = bound.top + (bound.height / 2);

        return {
            left: left,
            top: top
        };
    },

    /**
     * Make labels html, when has stackType option.
     * @param {object} params parameters
     *      @param {number} params.groupIndex group index
     *      @param {Array.<object>} params.bounds bounds,
     * @returns {string} label positions
     * @private
     */
    _makeStackedLabelPositions: function(params) {
        var self = this;
        var seriesGroup = params.seriesGroup;
        var positions = seriesGroup.map(function(seriesItem, index) {
            var bound = params.bounds[index];
            var position;

            if (bound && seriesItem) {
                position = self._makeStackedLabelPosition(bound.end);
            }

            return {
                end: position
            };
        });

        return positions;
    },

    /**
     * Render series label, when has stackType option.
     * @param {object} paper paper
     * @returns {Array.<object>}
     * @private
     */
    _renderStackedSeriesLabel: function(paper) {
        var self = this;
        var graphRenderer = this.graphRenderer;
        var labelTheme = this.theme.label;
        var groupBounds = this.seriesData.groupBounds;
        var seriesDataModel = this._getSeriesDataModel();
        var groupPositions = seriesDataModel.map(function(seriesGroup, index) {
            return self._makeStackedLabelPositions({
                seriesGroup: seriesGroup,
                bounds: groupBounds[index]
            });
        });
        var groupLabels = seriesDataModel.map(function(seriesGroup) {
            return seriesGroup.map(function(seriesDatum) {
                return {
                    end: seriesDatum.endLabel
                };
            });
        });
        var isStacked = true;

        return graphRenderer.renderSeriesLabel(paper, groupPositions, groupLabels, labelTheme, isStacked);
    },

    /**
     * Render series label.
     * @param {object} paper paper
     * @returns {Array.<object>}
     * @private
     */
    _renderSeriesLabel: function(paper) {
        var labelSet;

        if (this.options.stackType) {
            labelSet = this._renderStackedSeriesLabel(paper);
        } else {
            labelSet = this._renderNormalSeriesLabel(paper);
        }

        return labelSet;
    }
});

BarTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;
