/**
 * @fileoverview Bounds model.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var predicate = require('../../helpers/predicate');
var renderUtil = require('../../helpers/renderUtil');
var raphaelRenderUtil = require('../../plugins/raphaelRenderUtil');
var circleLegendCalculator = require('./circleLegendCalculator');
var axisCalculator = require('./axisCalculator');
var legendCalculator = require('./legendCalculator');
var seriesCalculator = require('./seriesCalculator');
var spectrumLegendCalculator = require('./spectrumLegendCalculator');
var snippet = require('tui-code-snippet');

/**
 * Dimension.
 * @typedef {{width: number, height:number}} dimension
 * @private
 */

/**
 * Position.
 * @typedef {{left: number, top:number}} position
 * @private
 */

/**
 * Bound.
 * @typedef {{dimension: dimension, position:position}} bound
 * @private
 */

var BoundsModel = snippet.defineClass(/** @lends BoundsModel.prototype */{
    /**
     * Bounds maker.
     * @constructs BoundsModel
     * @private
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
         * series types
         */
        this.seriesTypes = params.seriesTypes || [];

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        this.initBoundsData();
    },

    /**
     * Initialize bounds data.
     */
    initBoundsData: function() {
        this.dimensionMap = {
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
            chartExportMenu: {
                width: 0
            }
        };

        this.positionMap = {};

        /**
         * chart left padding
         * @type {number}
         */
        this.chartLeftPadding = chartConst.CHART_PADDING;

        this.maxRadiusForBubbleChart = null;

        this._registerChartDimension();
        this._registerTitleDimension();
        this._registerChartExportMenuDimension();
    },

    /**
     * Register dimension.
     * @param {string} name component name
     * @param {dimension} dimension component dimension
     * @private
     */
    _registerDimension: function(name, dimension) {
        this.dimensionMap[name] = snippet.extend(this.dimensionMap[name] || {}, dimension);
    },

    /**
     * Get bound.
     * @param {string} name component name
     * @returns {bound} component bound
     */
    getBound: function(name) {
        return {
            dimension: this.dimensionMap[name] || {},
            position: this.positionMap[name] || {}
        };
    },

    /**
     * Set bound.
     * @param {string} name component name
     * @param {bound} bound component bound
     * @private
     */
    _setBound: function(name, bound) {
        this.dimensionMap[name] = bound.dimension;
        this.positionMap[name] = bound.position;
    },

    /**
     * Get dimension.
     * @param {string} name component name
     * @returns {dimension} component dimension
     */
    getDimension: function(name) {
        return this.dimensionMap[name];
    },

    /**
     * Get dimension map.
     * @param {string} types - dimension type names
     * @returns {object}
     */
    getDimensionMap: function(types) {
        var self = this;
        var dimensionMap = {};

        if (types && types.length) {
            snippet.forEachArray(types, function(type) {
                dimensionMap[type] = self.dimensionMap[type];
            });
        } else {
            dimensionMap = this.dimensionMap;
        }

        return JSON.parse(JSON.stringify((dimensionMap)));
    },

    /**
     * Get position.
     * @param {string} name component name
     * @returns {position} component position
     */
    getPosition: function(name) {
        return this.positionMap[name];
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
        var chartOptions = this.options.chart || {};
        var hasTitleOption = snippet.isExisty(chartOptions.title);
        var titleHeight =
            hasTitleOption ? raphaelRenderUtil.getRenderedTextSize(chartOptions.title.text,
                this.theme.title.fontSize, this.theme.title.fontFamily).height : 0;
        var dimension = {
            height: titleHeight ? titleHeight + chartConst.TITLE_PADDING : 0
        };

        this._registerDimension('title', dimension);
    },

    /**
     * Register chartExportMenu dimension
     * @private
     */
    _registerChartExportMenuDimension: function() {
        var dimension;

        if (this.options.chartExportMenu.visible) {
            dimension = {
                height: 17 + chartConst.CHART_PADDING,
                width: 60
            };
        } else {
            dimension = {
                width: 0,
                height: 0
            };
        }
        this._registerDimension('chartExportMenu', dimension);
    },

    /**
     * Register height for x axis component.
     */
    registerXAxisHeight: function() {
        this._registerDimension('xAxis', {
            height: axisCalculator.calculateXAxisHeight(this.options.xAxis, this.theme.xAxis)
        });
    },

    /**
     * Register dimension for legend component.
     */
    registerLegendDimension: function() {
        var legendLabels = snippet.pluck(this.dataProcessor.getOriginalLegendData(), 'label');
        var legendOptions = this.options.legend;
        var labelTheme = this.theme.legend.label;
        var chartWidth = this.getDimension('chart').width;
        var legendDimension = legendCalculator.calculate(legendOptions, labelTheme, legendLabels, chartWidth);

        this._registerDimension('legend', legendDimension);
    },

    /**
     * Register dimension for spectrum legend component.
     */
    registerSpectrumLegendDimension: function() {
        var maxValue = this.dataProcessor.getFormattedMaxValue(this.chartType, 'legend');
        var labelTheme = this.theme.label;
        var dimension;

        if (predicate.isHorizontalLegend(this.options.legend.align)) {
            dimension = spectrumLegendCalculator._makeHorizontalDimension(maxValue, labelTheme);
        } else {
            dimension = spectrumLegendCalculator._makeVerticalDimension(maxValue, labelTheme);
        }

        this._registerDimension('legend', dimension);
    },

    /**
     * Register dimension for y axis.
     * @param {{min: number, max: number}} limit - min, max
     * @param {string} componentName - component name like yAxis, rightYAxis
     * @param {object} options - options for y axis
     * @param {{title: object, label: object}} theme - them for y axis
     * @param {boolean} isVertical - whether vertical or not
     */
    registerYAxisDimension: function(limit, componentName, options, theme, isVertical) {
        var categories, yAxisOptions;

        if (limit) {
            categories = [limit.min, limit.max];
        } else if (predicate.isHeatmapChart(this.chartType) || !isVertical) {
            categories = this.dataProcessor.getCategories(true);
        } else {
            return;
        }

        if (snippet.isArray(options)) {
            yAxisOptions = (componentName === 'yAxis') ? options[0] : options[1];
        } else {
            yAxisOptions = options;
        }

        this._registerDimension(componentName, {
            width: axisCalculator.calculateYAxisWidth(categories, yAxisOptions, theme)
        });
    },

    /**
     * Create series width.
     * @returns {number} series width
     */
    calculateSeriesWidth: function() {
        var dimensionMap = this.getDimensionMap(['chart', 'yAxis', 'legend', 'rightYAxis']);

        return seriesCalculator.calculateWidth(dimensionMap, this.options.legend);
    },

    /**
     * Create series height
     * @returns {number} series height
     */
    calculateSeriesHeight: function() {
        var dimensionMap = this.getDimensionMap(['chart', 'title', 'legend', 'xAxis', 'chartExportMenu']);

        return seriesCalculator.calculateHeight(dimensionMap, this.options.legend, this.chartType, this.theme.series);
    },

    getBaseSizeForLimit: function(isVertical) {
        var baseSize;

        if (isVertical) {
            baseSize = this.calculateSeriesHeight();
        } else {
            baseSize = this.calculateSeriesWidth();
        }

        return baseSize;
    },

    /**
     * Make series dimension.
     * @returns {{width: number, height: number}} series dimension
     * @private
     */
    _makeSeriesDimension: function() {
        return {
            width: this.calculateSeriesWidth(),
            height: this.calculateSeriesHeight()
        };
    },

    /**
     * Register series dimension.
     */
    registerSeriesDimension: function() {
        var seriesDimension = this._makeSeriesDimension();

        this._registerDimension('series', seriesDimension);
    },

    /**
     * Update width of legend and series of BoundsModel.
     * @param {number} circleLegendWidth - width for circle legend
     * @param {number} diffWidth - difference width
     * @private
     */
    _updateLegendAndSeriesWidth: function(circleLegendWidth, diffWidth) {
        var legendOptions = this.options.legend;

        if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
            this._registerDimension('legend', {
                width: circleLegendWidth
            });
        }

        this._registerDimension('series', {
            width: this.getDimension('series').width - diffWidth
        });
    },

    /**
     * Register dimension of circle legend.
     * @param {object} axisDataMap - axisData map
     * @private
     */
    registerCircleLegendDimension: function(axisDataMap) {
        var seriesDimension = this.getDimension('series');
        var legendOptions = this.options.legend;
        var maxLabel = this.dataProcessor.getFormattedMaxValue(this.chartType, 'circleLegend', 'r');
        var fontFamily = this.theme.chart.fontFamily;
        var circleLegendWidth = circleLegendCalculator.calculateCircleLegendWidth(seriesDimension, axisDataMap,
            maxLabel, fontFamily);
        var legendWidth, diffWidth;

        if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
            legendWidth = this.getDimension('legend').width;
        } else {
            legendWidth = 0;
        }

        circleLegendWidth = Math.min(circleLegendWidth, Math.max(legendWidth, chartConst.MIN_LEGEND_WIDTH));
        diffWidth = circleLegendWidth - legendWidth;

        this._registerDimension('circleLegend', {
            width: circleLegendWidth,
            height: circleLegendWidth
        });

        /**
         * the reason why check diffWidth is positive:
         * if circle legend area is narrower than text legend area, patial text legend area is not showing.
         * because legend area width is set to circle legend area
         */
        if (diffWidth > 0) {
            /**
             * If circle legend area is wider than text legend area,
             * recalculate legend and series width, base on circle legend width
             */
            this._updateLegendAndSeriesWidth(circleLegendWidth, diffWidth);
        }
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
     * Register center components dimension.
     * @private
     */
    _registerCenterComponentsDimension: function() {
        var seriesDimension = this.getDimension('series');

        this._registerDimension('tooltip', seriesDimension);
        this._registerDimension('mouseEventDetector', seriesDimension);
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
     * Update width of dimensions.
     * @param {object} overflowInfo overflowLeft, overflowRight
     * @private
     */
    _updateDimensionsWidth: function(overflowInfo) {
        var overflowLeft = Math.max(overflowInfo.overflowLeft, 0);
        var overflowRight = Math.max(overflowInfo.overflowRight, 0);
        var margin = overflowLeft + overflowRight;

        this.chartLeftPadding += overflowLeft;
        this.dimensionMap.plot.width -= margin;
        this.dimensionMap.series.width -= margin;
        this.dimensionMap.mouseEventDetector.width -= margin;
        this.dimensionMap.xAxis.width -= margin;
    },

    /**
     * Update height of dimensions.
     * @param {number} diffHeight diff height
     * @private
     */
    _updateDimensionsHeight: function(diffHeight) {
        this.dimensionMap.plot.height -= diffHeight;
        this.dimensionMap.series.height -= diffHeight;
        this.dimensionMap.mouseEventDetector.height -= diffHeight;
        this.dimensionMap.tooltip.height -= diffHeight;
        this.dimensionMap.yAxis.height -= diffHeight;
        this.dimensionMap.rightYAxis.height -= diffHeight;
        this.dimensionMap.xAxis.height += diffHeight;
    },

    /**
     * Update dimensions for label of x axis.
     * @param {?object} xAxisData - axis data for x axis.
     * @private
     */
    _updateDimensionsForXAxisLabel: function(xAxisData) {
        if (xAxisData.overflowRight > 0 || xAxisData.overflowLeft > 0) {
            this._updateDimensionsWidth(xAxisData);
        }

        if (xAxisData.overflowHeight) {
            this._updateDimensionsHeight(xAxisData.overflowHeight);
        }
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
            leftAreaWidth = leftLegendWidth + yAxisWidth + seriesDimension.width;

        this.positionMap.plot = {
            top: seriesPosition.top,
            left: seriesPosition.left
        };

        this.positionMap.yAxis = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftLegendWidth
        };

        this.positionMap.xAxis = {
            top: seriesPosition.top + seriesDimension.height,
            left: seriesPosition.left
        };

        this.positionMap.rightYAxis = {
            top: seriesPosition.top,
            left: this.chartLeftPadding + leftAreaWidth - chartConst.OVERLAPPING_WIDTH
        };
    },

    /**
     * Make legend position.
     * @returns {{top: number, left: number}} legend bound
     * @private
     */
    _makeLegendPosition: function() {
        var dimensionMap = this.dimensionMap;
        var seriesDimension = this.getDimension('series');
        var legendOption = this.options.legend;
        var top = dimensionMap.title.height || dimensionMap.chartExportMenu.height;
        var yAxisAreaWidth, left;

        if (predicate.isLegendAlignBottom(legendOption.align)) {
            top += seriesDimension.height + this.getDimension('xAxis').height + chartConst.LEGEND_AREA_PADDING;
        }

        if (predicate.isHorizontalLegend(legendOption.align)) {
            left = (this.getDimension('chart').width - this.getDimension('legend').width) / 2;
        } else if (predicate.isLegendAlignLeft(legendOption.align)) {
            left = this.chartLeftPadding;
        } else {
            yAxisAreaWidth = this.getDimension('yAxis').width + this.getDimension('rightYAxis').width;
            left = this.chartLeftPadding + yAxisAreaWidth + seriesDimension.width;
        }

        return {
            top: top,
            left: left
        };
    },

    /**
     * Make chartExportMenu position.
     * @returns {{top: number, left: number}}
     * @private
     */
    _makeChartExportMenuPosition: function() {
        return {
            top: 1,
            right: 20
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
        var legendOptions = this.options.legend;
        var left, legendWidth;

        if (predicate.isLegendAlignLeft(legendOptions.align)) {
            left = 0;
        } else {
            left = seriesPosition.left + seriesDimension.width;
        }

        if (predicate.isVerticalLegend(legendOptions.align) && legendOptions.visible) {
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

        return !(predicate.isPieChart(chartType) || predicate.isMapChart(chartType))
            && !predicate.isTreemapChart(chartType)
            && !predicate.isRadialChart(chartType)
            && !predicate.isPieDonutComboChart(chartType, this.seriesTypes);
    },

    /**
     * Register essential components positions.
     * Essential components is all components except components for axis.
     * @private
     */
    _registerEssentialComponentsPositions: function() {
        var seriesPosition = this.getPosition('series');
        var tooltipPosition;

        this.positionMap.mouseEventDetector = snippet.extend({}, seriesPosition);
        this.positionMap.legend = this._makeLegendPosition();
        this.positionMap.chartExportMenu = this._makeChartExportMenuPosition();

        if (this.getDimension('circleLegend').width) {
            this.positionMap.circleLegend = this._makeCircleLegendPosition();
        }

        if (this._isNeedExpansionSeries()) {
            tooltipPosition = {
                top: seriesPosition.top - chartConst.SERIES_EXPAND_SIZE,
                left: seriesPosition.left - chartConst.SERIES_EXPAND_SIZE
            };
        } else {
            tooltipPosition = seriesPosition;
        }

        this.positionMap.tooltip = tooltipPosition;
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
        var titleOrExportMenuHeight = Math.max(this.getDimension('title').height, this.getDimension('chartExportMenu').height);
        var seriesTop = titleOrExportMenuHeight + topLegendHeight;
        var defaultSeriesTop = renderUtil.getDefaultSeriesTopAreaHeight(this.chartType, this.theme.series);
        var seriesPosition = {
            top: (!seriesTop ? defaultSeriesTop : seriesTop) + chartConst.CHART_PADDING,
            left: this.chartLeftPadding + leftLegendWidth + this.getDimension('yAxis').width
        };

        this.positionMap.series = seriesPosition;

        if (this.hasAxes) {
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
        var yAxisWidth = this.getDimension('yAxis').width;
        var yAxisExtensibleLeft = Math.floor((this.getDimension('series').width / 2)) + chartConst.OVERLAPPING_WIDTH;
        var xAxisDecreasingLeft = yAxisWidth - chartConst.OVERLAPPING_WIDTH;
        var additionalLeft = renderUtil.isOldBrowser() ? 1 : 0;

        this.dimensionMap.extendedSeries.width += yAxisWidth;
        this.dimensionMap.xAxis.width += chartConst.OVERLAPPING_WIDTH;
        this.dimensionMap.plot.width += yAxisWidth + chartConst.OVERLAPPING_WIDTH;
        this.dimensionMap.mouseEventDetector.width += yAxisWidth;
        this.dimensionMap.tooltip.width += yAxisWidth;

        this.positionMap.series.left -= (yAxisWidth - additionalLeft);
        this.positionMap.extendedSeries.left -= (xAxisDecreasingLeft - additionalLeft);
        this.positionMap.plot.left -= xAxisDecreasingLeft;
        this.positionMap.yAxis.left += yAxisExtensibleLeft;
        this.positionMap.xAxis.left -= xAxisDecreasingLeft;
        this.positionMap.mouseEventDetector.left -= xAxisDecreasingLeft;
        this.positionMap.tooltip.left -= xAxisDecreasingLeft;
    },

    /**
     * Register bounds data.
     * @param {?object} xAxisData - axis data for x axis.
     */
    registerBoundsData: function(xAxisData) {
        this._registerCenterComponentsDimension();

        if (this.hasAxes) {
            this._registerAxisComponentsDimension();
            this._updateDimensionsForXAxisLabel(xAxisData);
        }

        this._registerPositions();
        this._registerExtendedSeriesBound();

        if (this.options.yAxis.isCenter) {
            this._updateBoundsForYAxisCenterOption();
        }
    },

    /**
     * Calculate max radius.
     * @param {object} axisDataMap - axisData map
     * @returns {number}
     */
    calculateMaxRadius: function(axisDataMap) {
        var dimensionMap = this.getDimensionMap(['series', 'circleLegend']);
        var circleLegendVisible = this.options.circleLegend ? this.options.circleLegend.visible : false;

        return circleLegendCalculator.calculateMaxRadius(dimensionMap, axisDataMap, circleLegendVisible);
    }
});

module.exports = BoundsModel;
