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
var raphaelRenderUtil = require('../../plugins/raphaelRenderUtil');
var snippet = require('tui-code-snippet');

var DEFAULT_BAR_SIZE_RATIO_BY_POINT_INTERVAL = 0.8;

var BarTypeSeriesBase = snippet.defineClass(/** @lends BarTypeSeriesBase.prototype */ {
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
        var positionValue, itemCount, barSize, optionSize, basePosition, pointInterval, baseBounds;
        var zeroToMin = this._getLimitDistanceFromZeroPoint(baseBarSize, this.limit).toMin;

        if (predicate.isColumnChart(this.chartType)) {
            positionValue = columnTopOffset;
        } else if (predicate.isBoxplotChart(this.chartType)) {
            positionValue = this.layout.position.top - chartConst.CHART_PADDING;
        } else {
            positionValue = this.layout.position.left;
        }

        if (seriesDataModel.rawSeriesData.length > 0) {
            if (!isStackType) {
                itemCount = seriesDataModel.getFirstSeriesGroup().getSeriesItemCount();
            } else {
                itemCount = this.options.diverging ? 1 : this.dataProcessor.getStackCount(this.seriesType);
            }

            pointInterval = groupSize / (itemCount + 1);
            barSize = pointInterval * DEFAULT_BAR_SIZE_RATIO_BY_POINT_INTERVAL;
            optionSize = this.options.barWidth || this.options.pointWidth;
            barSize = this._getBarWidthOptionSize(pointInterval, optionSize) || barSize;
            basePosition = zeroToMin + positionValue;

            if (predicate.isColumnChart(this.chartType)) {
                basePosition = baseBarSize - basePosition;
            }

            if (predicate.isBoxplotChart(this.chartType) && zeroToMin) {
                basePosition -= zeroToMin * 2;
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

                if (snippet.isExisty(seriesDatum.start)) {
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

        return renderUtil.formatValue({
            value: sum,
            formatFunctions: this.dataProcessor.getFormatFunctions(),
            chartType: this.chartType,
            areaType: 'series'
        });
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

    getGroupLabels: function(seriesDataModel, sumPlusValues, sumMinusValues) {
        var isNormalStack = predicate.isNormalStack(this.options.stackType);

        return seriesDataModel.map(function(seriesGroup) {
            var labels = seriesGroup.map(function(seriesDatum) {
                return {
                    end: seriesDatum.endLabel
                };
            });
            var minusSum;

            if (isNormalStack) {
                sumPlusValues.push(calculator.sumPlusValues(seriesGroup.pluck('value')));

                minusSum = calculator.sumMinusValues(seriesGroup.pluck('value'));
                if (minusSum < 0) {
                    sumMinusValues.push(minusSum);
                }
            }

            return labels;
        });
    },

    getGroupPositions: function(seriesDataModel, groupBounds) {
        var self = this;

        return seriesDataModel.map(function(seriesGroup, index) {
            return self._makeStackedLabelPositions({
                seriesGroup: seriesGroup,
                bounds: groupBounds[index]
            });
        });
    },

    /**
     * Render series label, when has stackType option.
     * @param {object} paper paper
     * @returns {Array.<object>}
     * @private
     */
    _renderStackedSeriesLabel: function(paper) {
        var self = this;
        var sumPlusValues = [];
        var sumMinusValues = [];
        var labelTheme = this.theme.label;
        var groupBounds = this.seriesData.groupBounds;
        var seriesDataModel = this._getSeriesDataModel();
        var groupPositions = this.getGroupPositions(seriesDataModel, groupBounds);
        var groupLabels = this.getGroupLabels(seriesDataModel, sumPlusValues, sumMinusValues);
        var isStacked = true;
        var isNormalStack = predicate.isNormalStack(this.options.stackType);
        var isBarChart = predicate.isBarChart(this.chartType);
        var dimensionType = isBarChart ? 'width' : 'height';
        var positionType = isBarChart ? 'left' : 'top';
        var direction = isBarChart ? 1 : -1;

        if (isNormalStack) {
            snippet.forEach(groupLabels, function(labels, index) {
                var plusSumValue = sumPlusValues[index];
                var minusSumValue = sumMinusValues[index];

                if (minusSumValue < 0 && self.options.diverging) {
                    minusSumValue *= -1;
                }

                labels.push({
                    end: renderUtil.formatToComma(plusSumValue)
                });

                if (sumMinusValues.length) {
                    labels.push({
                        end: renderUtil.formatToComma(minusSumValue)
                    });
                }
            });

            snippet.forEach(groupPositions, function(positions, index) {
                var bounds = groupBounds[index];
                var lastBound = bounds[bounds.length - 1].end;
                var firstBound = bounds[Math.max(parseInt(bounds.length / 2, 10), 1) - 1].end;
                var plusEnd = self._makeStackedLabelPosition(lastBound);
                var minusEnd = self._makeStackedLabelPosition(firstBound);
                var plusLabel = sumPlusValues[index];
                var minusLabel = sumMinusValues[index];
                var plusLabelSize = raphaelRenderUtil.getRenderedTextSize(plusLabel, labelTheme.fontSize,
                    labelTheme.fontFamily);
                var minusLabelSize = raphaelRenderUtil.getRenderedTextSize(minusLabel, labelTheme.fontSize,
                    labelTheme.fontFamily);
                var lastBoundEndPosition = ((lastBound[dimensionType] + plusLabelSize[dimensionType]) / 2);
                var firstBoundStartPosition = ((firstBound[dimensionType] + minusLabelSize[dimensionType]) / 2);

                plusEnd[positionType] += (lastBoundEndPosition + chartConst.LEGEND_LABEL_LEFT_PADDING) * direction;
                minusEnd[positionType] -= (firstBoundStartPosition + chartConst.LEGEND_LABEL_LEFT_PADDING) * direction;

                positions.push({
                    end: plusEnd
                });
                if (sumMinusValues.length) {
                    positions.push({
                        end: minusEnd
                    });
                }
            });
        }

        return this.graphRenderer.renderSeriesLabel(paper, groupPositions, groupLabels, labelTheme, isStacked);
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
    snippet.extend(func.prototype, BarTypeSeriesBase.prototype);
};

module.exports = BarTypeSeriesBase;
