/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    calculator = require('./calculator'),
    predicate = require('./predicate'),
    renderUtil = require('./renderUtil');

/**
 * Dimension.
 * @typedef {{width: number, height:number}} dimension
 */

/**
 * Position.
 * @typedef {{left: number, top:number}} position
 */

/**
 * Bound.
 * @typedef {{dimension: dimension, position:position}} bound
 */

var BoundsMaker = tui.util.defineClass(/** @lends BoundsMaker.prototype */{
    /**
     * Bounds maker.
     * @constructs BoundsMaker
     * @param {object} params parameters
     */
    init: function(params) {
        /**
         * options
         * @type {object}
         */
        this.options = params.options || {};
        this.options.legend = this.options.legend || {};
        this.options.yAxis = this.options.yAxis || {};

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * chart type
         * @type {string}
         */
        this.chartType = params.chartType;

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        this.initBoundsData();
    },

    /**
     * Initialize bounds data.
     * @param {object} chartOption chart option
     */
    initBoundsData: function(chartOption) {
        this.dimensions = {
            legend: {
                width: 0
            },
            yAxis: {
                width: 0
            },
            rightYAxis: {
                width: 0
            },
            xAxis: {
                height: 0
            }
        };

        this.positions = {};

        this.axesData = {};

        this.xAxisDegree = 0;

        /**
         * chart left padding
         * @type {number}
         */
        this.chartLeftPadding = chartConst.CHART_PADDING;

        if (chartOption) {
            this.options.chart = chartOption;
        }

        this._registerChartDimension();
        this._registerTitleDimension();
    },

    /**
     * Register dimension.
     * @param {string} name component name
     * @param {dimension} dimension component dimension
     * @private
     */
    _registerDimension: function(name, dimension) {
        this.dimensions[name] = tui.util.extend(this.dimensions[name] || {}, dimension);
    },

    /**
     * Register base dimension.
     * @param {string} name component name
     * @param {dimension} dimension component dimension
     */
    registerBaseDimension: function(name, dimension) {
        this._registerDimension(name, dimension);
    },

    /**
     * Register axes data.
     * @param {object} axesData axes data
     */
    registerAxesData: function(axesData) {
        this.axesData = axesData;
    },

    /**
     * Calculate step of pixel unit.
     * @param {{tickCount: number, isLabel: boolean}} axisData - data for rendering axis
     * @param {number} size - width or height of serise area
     * @returns {number}
     * @private
     */
    _calculatePixelStep: function(axisData, size) {
        var tickCount = axisData.tickCount;
        var pixelStep;

        if (axisData.isLabel) {
            pixelStep = size / tickCount / 2;
        } else {
            pixelStep = size / (tickCount - 1);
        }

        return parseInt(pixelStep, 10);
    },

    /**
     * Get minimum step of pixel unit for axis.
     * @returns {number}
     */
    getMinimumPixelStepForAxis: function() {
        var dimension = this.getDimension('series');
        var yPixelStep = this._calculatePixelStep(this.axesData.yAxis, dimension.height);
        var xPixelStep = this._calculatePixelStep(this.axesData.xAxis, dimension.width);

        return Math.min(yPixelStep, xPixelStep);
    },

    /**
     * Get bound.
     * @param {string} name component name
     * @returns {bound} component bound
     */
    getBound: function(name) {
        return {
            dimension: this.dimensions[name] || {},
            position: this.positions[name] || {}
        };
    },

    /**
     * Set bound.
     * @param {string} name component name
     * @param {bound} bound component bound
     * @private
     */
    _setBound: function(name, bound) {
        this.dimensions[name] = bound.dimension;
        this.positions[name] = bound.position;
    },

    /**
     * Get dimension.
     * @param {string} name component name
     * @returns {dimension} component dimension
     */
    getDimension: function(name) {
        return this.dimensions[name];
    },

    /**
     * Get position.
     * @param {string} name component name
     * @returns {position} component position
     */
    getPosition: function(name) {
        return this.positions[name];
    },

    /**
     * Register chart dimension
     * @private
     */
    _registerChartDimension: function() {
        var chartOptions = this.options.chart || {},
            dimension = {
                width: chartOptions.width || chartConst.CHART_DEFAULT_WIDTH,
                height: chartOptions.height || chartConst.CHART_DEFAULT_HEIGHT
            };

        this._registerDimension('chart', dimension);
    },

    /**
     * Register title dimension
     * @private
     */
    _registerTitleDimension: function() {
        var chartOptions = this.options.chart || {},
            titleHeight = renderUtil.getRenderedLabelHeight(chartOptions.title, this.theme.title),
            dimension = {
                height: titleHeight + chartConst.TITLE_PADDING
            };

        this._registerDimension('title', dimension);
    },

    /**
     * Calculate limit width of x axis.
     * @returns {number} limit width
     * @private
     */
    _calculateXAxisLabelLimitWidth: function() {
        var seriesWidth = this.getDimension('series').width,
            labelCount = this.axesData.xAxis.labels.length,
            isAlign = predicate.isLineTypeChart(this.chartType);
        return seriesWidth / (isAlign ? labelCount - 1 : labelCount);
    },

    /**
     * Find rotation degree.
     * @param {number} limitWidth limit width
     * @param {number} labelWidth label width
     * @param {number} labelHeight label height
     * @param {number} index candidates index
     * @returns {number} rotation degree
     * @private
     */
    _findRotationDegree: function(limitWidth, labelWidth, labelHeight) {
        var foundDegree,
            halfWidth = labelWidth / 2,
            halfHeight = labelHeight / 2;

        tui.util.forEachArray(chartConst.DEGREE_CANDIDATES, function(degree) {
            var compareWidth = (calculator.calculateAdjacent(degree, halfWidth) +
                calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, halfHeight)) * 2;

            foundDegree = degree;
            if (compareWidth <= limitWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {
                return false;
            }

            return true;
        });

        return foundDegree;
    },

    /**
     * Make rotation info about horizontal label.
     * @param {number} limitWidth limit width
     * @param {Array.<string>} labels axis labels
     * @param {object} theme axis label theme
     * @returns {?object} rotation info
     * @private
     */
    _makeHorizontalLabelRotationInfo: function(limitWidth) {
        var labels = this.axesData.xAxis.labels,
            theme = this.theme.xAxis.label,
            maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme),
            degree, labelHeight;

        if (maxLabelWidth <= limitWidth) {
            return null;
        }

        labelHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme);
        degree = this._findRotationDegree(limitWidth, maxLabelWidth, labelHeight);

        return {
            maxLabelWidth: maxLabelWidth,
            labelHeight: labelHeight,
            degree: degree
        };
    },


    /**
     * Calculate overflow position left.
     * @param {{degree: number, labelHeight: number}} rotationInfo rotation info
     * @param {string} firstLabel firstLabel
     * @returns {number} overflow position left
     * @private
     */
    _calculateOverflowLeft: function(rotationInfo, firstLabel) {
        var degree = rotationInfo.degree,
            labelHeight = rotationInfo.labelHeight,
            firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, this.theme.xAxis.label),
            newLabelWidth = (calculator.calculateAdjacent(degree, firstLabelWidth / 2)
                + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2,
            yAxisWidth = this.options.yAxis.isCenter ? 0 : this.getDimension('yAxis').width,
            diffLeft = newLabelWidth - yAxisWidth;
        return diffLeft;
    },

    /**
     * Update width of dimensions.
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDimensionsWidth: function(overflowLeft) {
        if (overflowLeft > 0) {
            this.chartLeftPadding += overflowLeft;
            this.dimensions.plot.width -= overflowLeft;
            this.dimensions.series.width -= overflowLeft;
            this.dimensions.customEvent.width -= overflowLeft;
            this.dimensions.xAxis.width -= overflowLeft;
            this.positions.series.left += overflowLeft;
        }
    },

    /**
     * Update degree of rotationInfo.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @param {number} labelLength labelLength
     * @param {number} overflowLeft overflow left
     * @private
     */
    _updateDegree: function(rotationInfo, labelLength, overflowLeft) {
        var limitWidth, newDegree;
        if (overflowLeft > 0) {
            limitWidth = this.getDimension('series').width / labelLength + chartConst.XAXIS_LABEL_GUTTER;
            newDegree = this._findRotationDegree(limitWidth, rotationInfo.maxLabelWidth, rotationInfo.labelHeight);
            rotationInfo.degree = newDegree;
        }
    },

    /**
     * Calculate rotated height of xAxis.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} xAxis height
     * @private
     */
    _calculateXAxisRotatedHeight: function(rotationInfo) {
        var degree = rotationInfo.degree,
            maxLabelWidth = rotationInfo.maxLabelWidth,
            labelHeight = rotationInfo.labelHeight,
            axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) +
                calculator.calculateOpposite(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;

        return axisHeight;
    },

    /**
     * Calculate height difference between origin category and rotation category.
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo rotation info
     * @returns {number} height difference
     * @private
     */
    _calculateDiffWithRotatedHeight: function(rotationInfo) {
        var rotatedHeight = this._calculateXAxisRotatedHeight(rotationInfo);
        return rotatedHeight - rotationInfo.labelHeight;
    },

    /**
     * Calculate height difference between origin category and multiline category.
     * @param {Array.<string>} labels labels
     * @param {number} limitWidth limit width
     * @returns {number} calculated height
     * @private
     */
    _calculateDiffWithMultilineHeight: function(labels, limitWidth) {
        var theme = this.theme.xAxis.label,
            multilineLabels = this.dataProcessor.getMultilineCategories(limitWidth, theme, this.axesData.xAxis.labels),
            normalHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme),
            multilineHeight = renderUtil.getRenderedLabelsMaxHeight(multilineLabels, tui.util.extend({
                cssText: 'line-height:1.2;width:' + limitWidth + 'px'
            }, theme));

        return multilineHeight - normalHeight;
    },

    /**
     * Update height of dimensions.
     * @param {number} diffHeight diff height
     * @private
     */
    _updateDimensionsHeight: function(diffHeight) {
        this.dimensions.plot.height -= diffHeight;
        this.dimensions.series.height -= diffHeight;
        this.dimensions.customEvent.height -= diffHeight;
        this.dimensions.tooltip.height -= diffHeight;
        this.dimensions.yAxis.height -= diffHeight;
        this.dimensions.rightYAxis.height -= diffHeight;
        this.dimensions.xAxis.height += diffHeight;
    },

    /**
     * Update dimensions and degree.
     * @private
     */
    _updateDimensionsAndDegree: function() {
        var xAxisOptions = this.options.xAxis || {},
            limitWidth = this._calculateXAxisLabelLimitWidth(),
            labels = this.axesData.xAxis.labels,
            rotationInfo, overflowLeft, diffHeight;

        if (xAxisOptions.rotation !== false) {
            rotationInfo = this._makeHorizontalLabelRotationInfo(limitWidth);
        }

        if (rotationInfo) {
            overflowLeft = this._calculateOverflowLeft(rotationInfo, labels[0]);
            this.xAxisDegree = rotationInfo.degree;
            this._updateDimensionsWidth(overflowLeft);
            this._updateDegree(rotationInfo, labels.length, overflowLeft);
            diffHeight = this._calculateDiffWithRotatedHeight(rotationInfo);
        } else {
            diffHeight = this._calculateDiffWithMultilineHeight(labels, limitWidth);
        }

        this._updateDimensionsHeight(diffHeight);
    },

    /**
     * Make plot dimention
     * @returns {{width: number, height: number}} plot dimension
     * @private
     */
    _makePlotDimension: function() {
        var seriesDimension = this.getDimension('series');
        return {
            width: seriesDimension.width,
            height: seriesDimension.height + chartConst.OVERLAPPING_WIDTH
        };
    },

    /**
     * Register axis components dimension.
     * @private
     */
    _registerAxisComponentsDimension: function() {
        var plotDimension = this._makePlotDimension();

        this._registerDimension('plot', plotDimension);

        this._registerDimension('xAxis', {
            width: plotDimension.width
        });

        this._registerDimension('yAxis', {
            height: plotDimension.height
        });

        this._registerDimension('rightYAxis', {
            height: plotDimension.height
        });
    },

    /**
     * Make series width.
     * @returns {number} series width
     */
    makeSeriesWidth: function() {
        var chartWidth = this.getDimension('chart').width,
            yAxisWidth = this.getDimension('yAxis').width,
            legendWidth, rightAreaWidth;

        if (predicate.isHorizontalLegend(this.options.legend.align)) {
            legendWidth = 0;
        } else {
            legendWidth = this.getDimension('legend').width;
        }

        rightAreaWidth = legendWidth + this.getDimension('rightYAxis').width;

        return chartWidth - (chartConst.CHART_PADDING * 2) - yAxisWidth - rightAreaWidth;
    },

    /**
     * Make series height
     * @returns {number} series height
     */
    makeSeriesHeight: function() {
        var chartHeight = this.getDimension('chart').height,
            titleHeight = this.getDimension('title').height,
            legendHeight, bottomAreaWidth;

        if (predicate.isHorizontalLegend(this.options.legend.align)) {
            legendHeight = this.getDimension('legend').height;
        } else {
            legendHeight = 0;
        }

        bottomAreaWidth = legendHeight + this.dimensions.xAxis.height;

        return chartHeight - (chartConst.CHART_PADDING * 2) - titleHeight - bottomAreaWidth;
    },

    /**
     * Make series dimension.
     * @returns {{width: number, height: number}} series dimension
     * @private
     */
    _makeSeriesDimension: function() {
        return {
            width: this.makeSeriesWidth(),
            height: this.makeSeriesHeight()
        };
    },

    /**
     * Register center componets dimension.
     * @private
     */
    _registerCenterComponentsDimension: function() {
        var seriesDimension = this._makeSeriesDimension();

        this._registerDimension('series', seriesDimension);
        this._registerDimension('tooltip', seriesDimension);
        this._registerDimension('customEvent', seriesDimension);
    },

    /**
     * Register axes type component positions.
     * @param {number} leftLegendWidth legend width
     * @private
     */
    _registerAxisComponentsPosition: function(leftLegendWidth) {
        var seriesPosition = this.getPosition('series'),
            seriesDimension = this.getDimension('series'),
            yAxisWidth = this.getDimension('yAxis').width,
            leftAreaWidth = yAxisWidth + seriesDimension.width + leftLegendWidth;

        this.positions.plot = {
            top: seriesPosition.top,
            left: seriesPosition.left
        };

        this.positions.yAxis = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftLegendWidth
        };

        this.positions.xAxis = {
            top: seriesPosition.top + seriesDimension.height,
            left: seriesPosition.left
        };

        this.positions.rightYAxis = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftAreaWidth - chartConst.OVERLAPPING_WIDTH
        };
    },

    /**
     * Make legend bound.
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} legend bound
     * @private
     */
    _makeLegendPosition: function() {
        var dimensions = this.dimensions,
            seriesDimension = this.getDimension('series'),
            legendOption = this.options.legend,
            top = dimensions.title.height,
            yAxisAreaWidth, left;

        if (predicate.isLegendAlignBottom(legendOption.align)) {
            top += seriesDimension.height + this.getDimension('xAxis').height + chartConst.LEGEND_AREA_PADDING;
        }

        if (predicate.isHorizontalLegend(legendOption.align)) {
            left = ((this.getDimension('chart').width - this.getDimension('legend').width) / 2)
                - chartConst.LEGEND_AREA_PADDING;
        } else if (predicate.isLegendAlignLeft(legendOption.align)) {
            left = 0;
        } else {
            yAxisAreaWidth = this.getDimension('yAxis').width + this.getDimension('rightYAxis').width;
            left = seriesDimension.width + yAxisAreaWidth + this.chartLeftPadding;
        }

        return {
            top: top,
            left: left
        };
    },

    /**
     * Register essential components positions.
     * @private
     */
    _registerEssentialComponentsPositions: function() {
        var seriesPosition = this.getPosition('series'),
            tooltipPosition;

        this.positions.customEvent = tui.util.extend({}, seriesPosition);
        this.positions.legend = this._makeLegendPosition();

        if (!predicate.isMousePositionChart(this.chartType)) {
            tooltipPosition = {
                top: seriesPosition.top - chartConst.SERIES_EXPAND_SIZE,
                left: seriesPosition.left - chartConst.SERIES_EXPAND_SIZE
            };
        } else {
            tooltipPosition = seriesPosition;
        }

        this.positions.tooltip = tooltipPosition;
    },

    /**
     * Register positions.
     * @private
     */
    _registerPositions: function() {
        var alignOption = this.options.legend.align,
            legendDimension = this.getDimension('legend'),
            topLegendHeight = predicate.isLegendAlignTop(alignOption) ? legendDimension.height : 0,
            leftLegendWidth = predicate.isLegendAlignLeft(alignOption) ? legendDimension.width : 0,
            seriesPosition = {
                top: this.getDimension('title').height + chartConst.CHART_PADDING + topLegendHeight,
                left: this.chartLeftPadding + leftLegendWidth + this.getDimension('yAxis').width
            };

        this.positions.series = seriesPosition;

        if (this.hasAxes) {
            this._updateDimensionsAndDegree();
            this._registerAxisComponentsPosition(leftLegendWidth);
        }

        this._registerEssentialComponentsPositions();
    },

    /**
     * Register bound of extended series for rendering.
     * @private
     */
    _registerExtendedSeriesBound: function() {
        var seriesBound = this.getBound('series');
        if (!predicate.isMousePositionChart(this.chartType)) {
            seriesBound = renderUtil.expandBound(seriesBound);
        }

        this._setBound('extendedSeries', seriesBound);
    },

    /**
     * Update bounds(positions, dimensions) of components for center option of yAxis.
     * @private
     */
    _updateBoundsForYAxisCenterOption: function() {
        var yAxisWidth = this.getDimension('yAxis').width,
            yAxisExtensibleLeft = Math.floor((this.getDimension('series').width / 2)) + chartConst.OVERLAPPING_WIDTH,
            xAxisDecreasingLeft = yAxisWidth - chartConst.OVERLAPPING_WIDTH,
            additionalLeft = renderUtil.isOldBrowser() ? 1 : 0;

        this.dimensions.extendedSeries.width += yAxisWidth;
        this.dimensions.xAxis.width += chartConst.OVERLAPPING_WIDTH;
        this.dimensions.plot.width += yAxisWidth + chartConst.OVERLAPPING_WIDTH;
        this.dimensions.customEvent.width += yAxisWidth;
        this.dimensions.tooltip.width += yAxisWidth;

        this.positions.series.left -= (yAxisWidth - additionalLeft);
        this.positions.extendedSeries.left -= (xAxisDecreasingLeft - additionalLeft);
        this.positions.plot.left -= xAxisDecreasingLeft;
        this.positions.yAxis.left += yAxisExtensibleLeft;
        this.positions.xAxis.left -= xAxisDecreasingLeft;
        this.positions.customEvent.left -= xAxisDecreasingLeft;
        this.positions.tooltip.left -= xAxisDecreasingLeft;
    },

    /**
     * Register bounds data.
     */
    registerBoundsData: function() {
        this._registerCenterComponentsDimension();

        if (this.hasAxes) {
            this._registerAxisComponentsDimension();
        }

        this._registerPositions();
        this._registerExtendedSeriesBound();

        if (this.options.yAxis.isCenter) {
            this._updateBoundsForYAxisCenterOption();
        }
    }
});

module.exports = BoundsMaker;
