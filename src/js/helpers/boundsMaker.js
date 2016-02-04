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
         * chart left padding
         * @type {number}
         */
        this.chartLeftPadding = chartConst.CHART_PADDING;

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
            dimension = {
            height: renderUtil.getRenderedLabelHeight(chartOptions.title, this.theme.title) + chartConst.TITLE_PADDING
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
            var compareWidth = (calculator.calculateAdjacent(degree, halfWidth) + calculator.calculateAdjacent(chartConst.ANGLE_90 - degree, halfHeight)) * 2;
            foundDegree = degree;
            if (compareWidth <= limitWidth + chartConst.XAXIS_LABEL_COMPARE_MARGIN) {
                return false;
            }
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
            diffLeft = newLabelWidth - this.getDimension('yAxis').width;
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
            this.dimensions.xAxis.width -= overflowLeft;
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
            axisHeight = (calculator.calculateOpposite(degree, maxLabelWidth / 2) + calculator.calculateOpposite(chartConst.ANGLE_90 - degree, labelHeight / 2)) * 2;
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
            multilineLabels = this.dataProcessor.getMultilineCategories(limitWidth, theme),
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
            width: seriesDimension.width + chartConst.HIDDEN_WIDTH,
            height: seriesDimension.height + chartConst.HIDDEN_WIDTH
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
        var legendWidth, rightAreaWidth;

        if (predicate.isHorizontalLegend(this.options.legend.align)) {
            legendWidth = 0;
        } else {
            legendWidth = this.getDimension('legend').width;
        }

        rightAreaWidth = legendWidth + this.getDimension('rightYAxis').width;

        return this.getDimension('chart').width - (chartConst.CHART_PADDING * 2) - this.getDimension('yAxis').width - rightAreaWidth;
    },

    /**
     * Make series height
     * @returns {number} series height
     */
    makeSeriesHeight: function() {
        var legendHeight, bottomAreaWidth;

        if (predicate.isHorizontalLegend(this.options.legend.align)) {
            legendHeight = this.getDimension('legend').height;
        } else {
            legendHeight = 0;
        }

        bottomAreaWidth = legendHeight + this.dimensions.xAxis.height;

        return this.getDimension('chart').height - (chartConst.CHART_PADDING * 2) - this.getDimension('title').height - bottomAreaWidth;
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
     * @param {position} seriesPosition series position
     * @param {number} leftLegendWidth legend width
     * @private
     */
    _registerAxisComponentsPosition: function(seriesPosition, leftLegendWidth) {
        var seriesDimension = this.getDimension('series');

        this.positions['plot'] = {
            top: seriesPosition.top,
            left: seriesPosition.left - chartConst.HIDDEN_WIDTH
        };

        this.positions['yAxis'] = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftLegendWidth
        };

        this.positions['xAxis'] = {
            top: seriesPosition.top + seriesDimension.height,
            left: seriesPosition.left - chartConst.HIDDEN_WIDTH
        };

        this.positions['rightYAxis'] = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + this.getDimension('yAxis').width + seriesDimension.width + leftLegendWidth - chartConst.HIDDEN_WIDTH
        };
    },

    /**
     * Make legend bound.
     * @returns {{dimension: {width: number, height: number}, position: {top: number, left: number}}} legend bound
     * @private
     */
    _makeLegendPosition: function() {
        var dimensions = this.dimensions,
            sereisDimension = this.getDimension('series'),
            legendOption = this.options.legend,
            top = dimensions.title.height,
            left;

        if (predicate.isBottomLegendAlign(legendOption.align)) {
            top += sereisDimension.height + this.getDimension('xAxis').height + chartConst.LEGEND_AREA_PADDING;
        }

        if (predicate.isHorizontalLegend(legendOption.align)) {
            left = (this.getDimension('chart').width - this.getDimension('legend').width) / 2;
        } else if (predicate.isLeftLegendAlign(legendOption.align)) {
            left = 0;
        } else {
            left = this.getDimension('yAxis').width + sereisDimension.width + this.getDimension('rightYAxis').width + this.chartLeftPadding;
        }

        return {
            top: top,
            left: left
        };
    },

    /**
     * Register essential components positions.
     * @param {position} seriesPosition series position
     * @private
     */
    _registerEssentialComponentsPositions: function(seriesPosition) {
        var tooltipPosition;

        this.positions['series'] = seriesPosition;
        this.positions['customEvent']= seriesPosition;
        this.positions['legend'] = this._makeLegendPosition();

        if (this.hasAxes) {
            tooltipPosition = {
                top: seriesPosition.top - chartConst.SERIES_EXPAND_SIZE,
                left: seriesPosition.left - chartConst.SERIES_EXPAND_SIZE
            }
        } else {
            tooltipPosition = seriesPosition;
        }

        this.positions['tooltip'] = tooltipPosition;
    },

    /**
     * Register positions.
     * @private
     */
    _registerPositions: function() {
        var alignOption = this.options.legend.align,
            legendDimension = this.getDimension('legend'),
            topLegendHeight = predicate.isTopLegendAlign(alignOption) ? legendDimension.height : 0,
            leftLegendWidth = predicate.isLeftLegendAlign(alignOption) ? legendDimension.width : 0,
            seriesPosition = {
                top: this.getDimension('title').height + chartConst.CHART_PADDING + topLegendHeight,
                left: this.getDimension('yAxis').width + this.chartLeftPadding + leftLegendWidth
            };

        if (this.hasAxes) {
            this._updateDimensionsAndDegree();
            this._registerAxisComponentsPosition(seriesPosition, leftLegendWidth);
        }

        this._registerEssentialComponentsPositions(seriesPosition);
    },

    /**
     * Register bounds data.
     * @param {{xAxis: object, yAxis: object, rightYAxis: ?object}} axesData axes data
     */
    registerBoundsData: function() {
        this._registerCenterComponentsDimension();
        if (this.hasAxes) {
            this._registerAxisComponentsDimension();
        }
        this._registerPositions();
    }
});

module.exports = BoundsMaker;
