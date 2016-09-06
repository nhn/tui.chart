/**
 * @fileoverview Bounds maker.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var calculator = require('../helpers/calculator');
var predicate = require('../helpers/predicate');
var renderUtil = require('../helpers/renderUtil');
var axisDimensionCalculator = require('./axisDimensionCalculator');
var legendDimensionCalculator = require('./legendDimensionCalculator');

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
         * series names
         */
        this.seriesNames = params.seriesNames || [];

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        this.scaleModel = null;

        /**
         * adding data mode
         * @type {boolean}
         */
        this.addingDataMode = false;

        this.initBoundsData();
    },

    /**
     * On adding data mode.
     */
    onAddingDataMode: function() {
        this.addingDataMode = true;
    },

    /**
     * Off adding data mode.
     */
    offAddingDataMode: function() {
        this.addingDataMode = false;
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
            },
            circleLegend: {
                width: 0
            },
            calculationLegend: {
                width: 0
            }
        };

        this.positions = {};

        this.xAxisDegree = 0;

        /**
         * chart left padding
         * @type {number}
         */
        this.chartLeftPadding = chartConst.CHART_PADDING;

        if (chartOption) {
            this.options.chart = chartOption;
        }

        this.maxRadiusForBubbleChart = null;

        this._registerChartDimension();
        this._registerTitleDimension();
    },

    setScaleModel: function(scaleModel) {
        this.scaleModel = scaleModel;
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
     * Register height for x axis component.
     */
    registerXAxisHeight: function() {
        this._registerDimension('xAxis', {
            height: axisDimensionCalculator.calculateXAxisHeight(this.options.xAxis.title, this.theme.xAxis)
        });
    },

    /**
     * Register dimension for legend component.
     */
    registerLegendDimension: function() {
        var legendLabels = tui.util.pluck(this.dataProcessor.getLegendData(), 'label');
        var legendOptions = this.options.legend;
        var labelTheme = this.theme.legend.label;
        var chartWidth = this.getDimension('chart').width;
        var legendDimension = legendDimensionCalculator.calculate(legendOptions, labelTheme, legendLabels, chartWidth);

        this._registerDimension('legend', legendDimension);

        if (!predicate.hasVerticalLegendWidth(legendOptions)) {
            return;
        }

        this._registerDimension('calculationLegend', {
            width: legendDimension.width
        });
    },

    /**
     * Register dimension for y axis.
     * @param {string} componentName - component name like yAxis, rightYAxis
     * @param {object} options - options for y axis
     * @param {{title: object, label: object}} theme - them for y axis
     */
    registerYAxisDimension: function(componentName, options, theme) {
        var categories, scaleData, limit;

        scaleData = this.scaleModel.getScaleMap()[componentName];

        if (!scaleData) {
            categories = this.dataProcessor.getCategories(true);
        } else {
            limit = scaleData.getLimit();
            categories = [limit.min, limit.max];
            options = scaleData.axisOptions;
        }

        this._registerDimension(componentName, {
            width: axisDimensionCalculator.calculateYAxisWidth(categories, options, theme)
        });
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

        if (axisData.isLabelAxis) {
            pixelStep = size / tickCount / 2;
        } else {
            pixelStep = size / (tickCount - 1);
        }

        return parseInt(pixelStep, 10);
    },

    /**
     * Calculate max radius for circle legend.
     * @returns {number}
     * @private
     */
    _calculateMaxRadius: function() {
        var dimension = this.getDimension('series');
        var axesData = this.scaleModel.getAxisDataMap();
        var yPixelStep = this._calculatePixelStep(axesData.yAxis, dimension.height);
        var xPixelStep = this._calculatePixelStep(axesData.xAxis, dimension.width);

        return Math.min(yPixelStep, xPixelStep);
    },

    /**
     * Calculate max radius for bubble chart.
     * @returns {number}
     * @private
     */
    _calculateMaxRadiusForBubbleChart: function() {
        var maxRadius = this._calculateMaxRadius();
        var legendWidth = this.getDimension('calculationLegend').width || chartConst.MIN_LEGEND_WIDTH;
        var circleLegendWidth = this.getDimension('circleLegend').width || legendWidth;

        return Math.min((circleLegendWidth - chartConst.CIRCLE_LEGEND_PADDING) / 2, maxRadius);
    },

    /**
     * Get max radius for bubble chart.
     * @returns {number}
     */
    getMaxRadiusForBubbleChart: function() {
        if (!this.maxRadiusForBubbleChart) {
            this.maxRadiusForBubbleChart = this._calculateMaxRadiusForBubbleChart();
        }

        return this.maxRadiusForBubbleChart;
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
     * @param {number} labelCount - label count
     * @returns {number} limit width
     * @private
     */
    _calculateXAxisLabelLimitWidth: function(labelCount) {
        var seriesWidth = this.getDimension('series').width;
        var isAlign = predicate.isLineTypeChart(this.chartType);

        return seriesWidth / (isAlign ? labelCount - 1 : labelCount);
    },

    /**
     * Find rotation degree.
     * @param {number} limitWidth limit width
     * @param {number} labelWidth label width
     * @param {number} labelHeight label height
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
     * @returns {?object} rotation info
     * @private
     */
    _makeHorizontalLabelRotationInfo: function(limitWidth, labels) {
        var theme = this.theme.xAxis.label;
        var maxLabelWidth = renderUtil.getRenderedLabelsMaxWidth(labels, theme);
        var degree, labelHeight;

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
        var degree = rotationInfo.degree;
        var labelHeight = rotationInfo.labelHeight;
        var firstLabelWidth = renderUtil.getRenderedLabelWidth(firstLabel, this.theme.xAxis.label);
        var newLabelWidth = (calculator.calculateAdjacent(degree, firstLabelWidth / 2)
                + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;
        var yAxisWidth = this.options.yAxis.isCenter ? 0 : this.getDimension('yAxis').width;
        var diffLeft = newLabelWidth - yAxisWidth;

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
     * @param {{degree: number, maxLabelWidth: number, labelHeight: number}} rotationInfo - rotation info
     * @param {number} labelCount - label count
     * @param {number} overflowLeft - overflow left
     * @private
     */
    _updateDegree: function(rotationInfo, labelCount, overflowLeft) {
        var limitWidth, newDegree;
        if (overflowLeft > 0) {
            limitWidth = this._calculateXAxisLabelLimitWidth(labelCount) + chartConst.XAXIS_LABEL_GUTTER;
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
        var degree = rotationInfo.degree;
        var maxLabelWidth = rotationInfo.maxLabelWidth;
        var labelHeight = rotationInfo.labelHeight;
        var axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) +
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

    _calculateMultilineHeight: function(limitWidth) {
        var theme = this.theme.xAxis.label;
        var labels = this.scaleModel.getMultilineXAxisLabels(limitWidth, theme);

        return renderUtil.getRenderedLabelsMaxHeight(labels, tui.util.extend({
            cssText: 'line-height:1.2;width:' + limitWidth + 'px'
        }, theme));
    },

    /**
     * Calculate height difference between origin category and multiline category.
     * @param {Array.<string>} labels labels
     * @param {number} limitWidth limit width
     * @returns {number} calculated height
     * @private
     */
    _calculateDiffWithMultilineHeight: function(labels, limitWidth) {
        var theme = this.theme.xAxis.label;
        var multilineHeight = this._calculateMultilineHeight(limitWidth);
        var normalHeight = renderUtil.getRenderedLabelsMaxHeight(labels, theme);

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
        var xAxisOptions = this.options.xAxis || {};
        var labels = this.scaleModel.getAxisData('xAxis').labels;
        var labelCount, limitWidth, rotationInfo, overflowLeft, diffHeight;

        if (this.addingDataMode) {
            labels = labels.slice(0, labels.length - 1);
        }

        labels = tui.util.filter(labels, function(label) {
            return !!label;
        });
        labelCount = labels.length;
        limitWidth = this._calculateXAxisLabelLimitWidth(labelCount);

        if (xAxisOptions.rotateLabel !== false) {
            rotationInfo = this._makeHorizontalLabelRotationInfo(limitWidth, labels);
        }

        if (rotationInfo) {
            overflowLeft = this._calculateOverflowLeft(rotationInfo, labels[0]);
            this.xAxisDegree = rotationInfo.degree;
            this._updateDimensionsWidth(overflowLeft);
            this._updateDegree(rotationInfo, labelCount, overflowLeft);
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
        var chartWidth = this.getDimension('chart').width;
        var yAxisWidth = this.getDimension('yAxis').width;
        var legendDimension = this.getDimension('calculationLegend');
        var legendWidth, rightAreaWidth;

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            legendWidth = legendDimension ? legendDimension.width : 0;
        } else {
            legendWidth = 0;
        }

        rightAreaWidth = legendWidth + this.getDimension('rightYAxis').width;

        return chartWidth - (chartConst.CHART_PADDING * 2) - yAxisWidth - rightAreaWidth;
    },

    /**
     * Make series height
     * @returns {number} series height
     */
    makeSeriesHeight: function() {
        var chartHeight = this.getDimension('chart').height;
        var titleHeight = this.getDimension('title').height;
        var legendOption = this.options.legend;
        var legendHeight, bottomAreaWidth;

        if (predicate.isHorizontalLegend(legendOption.align) && legendOption.visible) {
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
        var seriesDimension = this.getDimension('series');

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
     * Make CircleLegend position.
     * @returns {{top: number, left: number}}
     * @private
     */
    _makeCircleLegendPosition: function() {
        var seriesPosition = this.getPosition('series');
        var seriesDimension = this.getDimension('series');
        var circleDimension = this.getDimension('circleLegend');
        var legendOption = this.options.legend;
        var left, legendWidth;

        if (predicate.isLegendAlignLeft(legendOption.align)) {
            left = 0;
        } else {
            left = seriesPosition.left + seriesDimension.width;
        }

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            legendWidth = this.getDimension('legend').width + chartConst.CHART_PADDING;
            left += (legendWidth - circleDimension.width) / 2;
        }

        return {
            top: seriesPosition.top + seriesDimension.height - circleDimension.height,
            left: left
        };
    },

    /**
     * Whether need expansion series or not.
     * @returns {boolean}
     * @private
     */
    _isNeedExpansionSeries: function() {
        var chartType = this.chartType;

        return !predicate.isMousePositionChart(chartType) && !predicate.isTreemapChart(chartType)
            && !predicate.isPieDonutComboChart(chartType, this.seriesNames);
    },

    /**
     * Register essential components positions.
     * Essential components is all components except components for axis.
     * @private
     */
    _registerEssentialComponentsPositions: function() {
        var seriesPosition = this.getPosition('series');
        var tooltipPosition;

        this.positions.customEvent = tui.util.extend({}, seriesPosition);
        this.positions.legend = this._makeLegendPosition();

        if (this.getDimension('circleLegend').width) {
            this.positions.circleLegend = this._makeCircleLegendPosition();
        }

        if (this._isNeedExpansionSeries()) {
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
        var alignOption = this.options.legend.align;
        var isVisibleLegend = this.options.legend.visible;
        var legendDimension = this.getDimension('legend');
        var topLegendHeight = (predicate.isLegendAlignTop(alignOption) && isVisibleLegend) ? legendDimension.height : 0;
        var leftLegendWidth = (predicate.isLegendAlignLeft(alignOption) && isVisibleLegend) ? legendDimension.width : 0;
        var seriesPosition = {
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
        if (this._isNeedExpansionSeries()) {
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
     * Register series dimension.
     */
    registerSeriesDimension: function() {
        var seriesDimension = this._makeSeriesDimension();

        this._registerDimension('series', seriesDimension);
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
    },

    /**
     * Get max width of label for CircleLegend.
     * @returns {number}
     * @private
     */
    _getCircleLegendLabelMaxWidth: function() {
        var maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'circleLegend', 'r');
        var maxLabelWidth = renderUtil.getRenderedLabelWidth(maxLabel, {
            fontSize: chartConst.CIRCLE_LEGEND_LABEL_FONT_SIZE,
            fontFamily: this.theme.chart.fontFamily
        });

        return maxLabelWidth;
    },

    /**
     * Get circle legend width.
     * @returns {number}
     * @private
     */
    _getCircleLegendWidth: function() {
        var maxRadius = this._calculateMaxRadius();
        var maxLabelWidth = this._getCircleLegendLabelMaxWidth();

        return Math.max((maxRadius * 2), maxLabelWidth) + chartConst.CIRCLE_LEGEND_PADDING;
    },

    /**
     * Register dimension of circle legend.
     * @private
     */
    registerCircleLegendDimension: function() {
        var circleLegendWidth = this._getCircleLegendWidth();
        var legendWidth = this.getDimension('calculationLegend').width;

        legendWidth = Math.max(legendWidth, chartConst.MIN_LEGEND_WIDTH);
        circleLegendWidth = Math.min(circleLegendWidth, legendWidth);

        this._registerDimension('circleLegend', {
            width: circleLegendWidth,
            height: circleLegendWidth
        });
    },

    /**
     * Make vertical legend dimension.
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeVerticalDimension: function() {
        var maxValue = tui.util.max(this.dataProcessor.getValues());
        var formatFunctions = this.dataProcessor.getFormatFunctions();
        var valueStr = renderUtil.formatValue(maxValue, formatFunctions, this.chartType, 'legend');
        var labelWidth = renderUtil.getRenderedLabelWidth(valueStr, this.theme.label);
        var padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_GRAPH_SIZE + labelWidth + padding,
            height: chartConst.MAP_LEGEND_SIZE
        };
    },

    /**
     * Make horizontal legend dimension
     * @returns {{width: number, height: number}} dimension
     * @private
     */
    _makeHorizontalDimension: function() {
        var maxValue = tui.util.max(this.dataProcessor.getValues()),
            labelHeight = renderUtil.getRenderedLabelHeight(maxValue, this.theme.label),
            padding = chartConst.LEGEND_AREA_PADDING + chartConst.MAP_LEGEND_LABEL_PADDING;

        return {
            width: chartConst.MAP_LEGEND_SIZE,
            height: chartConst.MAP_LEGEND_GRAPH_SIZE + labelHeight + padding
        };
    },

    /**
     * Register dimension.
     */
    updateLegendDimensionForCircleLegend: function() {
        var dimension;

        if (this.isHorizontal) {
            dimension = this._makeHorizontalDimension();
        } else {
            dimension = this._makeVerticalDimension();
        }

        this._registerDimension('legend', dimension);
        this._registerDimension('calculationLegend', dimension);
    },
    /**
     * Update width of legend and series of boundsMaker.
     * @param {number} seriesWidth - width of series area
     * @param {number} legendWidth - width of legend area
     * @private
     */
    _updateLegendAndSeriesWidth: function(seriesWidth, legendWidth) {
        var circleLegendWidth = this.getDimension('circleLegend').width;

        if (predicate.hasVerticalLegendWidth(this.options.legend)) {
            this._registerDimension('legend', {
                width: circleLegendWidth
            });
        }

        this._registerDimension('series', {
            width: seriesWidth - (circleLegendWidth - legendWidth)
        });
    },

    /**
     * Update width for legend area by width of circle legend area.
     * @returns {boolean}
     */
    updateLegendWidthByCircleLegendWidth: function() {
        var circleLegendWidth = this.getDimension('circleLegend').width;
        var legendWidth = this.getDimension('calculationLegend').width;
        var updated = false;
        var seriesWidth;

        if (legendWidth < circleLegendWidth) {
            seriesWidth = this.getDimension('series').width;
            this._updateLegendAndSeriesWidth(seriesWidth, legendWidth);
            updated = true;
        }

        return updated;
    }
});

module.exports = BoundsMaker;
