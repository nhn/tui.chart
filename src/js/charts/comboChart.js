/**
 * @fileoverview Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator'),
    renderUtil = require('../helpers/renderUtil'),
    ChartBase = require('./chartBase'),
    axisTypeMixer = require('./axisTypeMixer'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    defaultTheme = require('../themes/defaultTheme'),
    ColumnChartSeries = require('../series/columnChartSeries'),
    LineChartSeries = require('../series/lineChartSeries');

var ComboChart = tui.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {
    /**
     * Combo chart.
     * @constructs ComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        var chartTypesMap;

        this.className = 'tui-combo-chart';

        chartTypesMap = this._makeChartTypesMap(rawData.series, options.yAxis);

        tui.util.extend(this, chartTypesMap);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true,
            seriesChartTypes: chartTypesMap.seriesChartTypes
        });

        /**
         * yAxis options map
         * @type {object}
         */
        this.yAxisOptionsMap = this._makeYAxisOptionsMap(chartTypesMap.chartTypes, options.yAxis);
        this._addComponents(chartTypesMap);
    },

    /**
     * Make yAxis options map.
     * @param {Array.<string>} chartTypes chart types
     * @param {?object} yAxisOptions yAxis options
     * @returns {{column: ?object, line: ?object}} options map
     * @private
     */
    _makeYAxisOptionsMap: function(chartTypes, yAxisOptions) {
        var optionMap = {};
        yAxisOptions = yAxisOptions || {};
        tui.util.forEachArray(chartTypes, function(chartType, index) {
            optionMap[chartType] = yAxisOptions[index] || yAxisOptions;
        });

        return optionMap;
    },

    /**
     * Make chart types map.
     * @param {object} rawSeriesData raw series data
     * @param {object} yAxisOption option for y axis
     * @returns {object} chart types map
     * @private
     */
    _makeChartTypesMap: function(rawSeriesData, yAxisOption) {
        var seriesChartTypes = tui.util.keys(rawSeriesData).sort(),
            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, yAxisOption),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes,
            validChartTypes = tui.util.filter(optionChartTypes, function(chartType) {
                return rawSeriesData[chartType].length;
            }),
            chartTypesMap;

        if (validChartTypes.length === 1) {
            chartTypesMap = {
                chartTypes: validChartTypes,
                seriesChartTypes: validChartTypes,
                optionChartTypes: !optionChartTypes.length ? optionChartTypes : validChartTypes
            };
        } else {
            chartTypesMap = {
                chartTypes: chartTypes,
                seriesChartTypes: seriesChartTypes,
                optionChartTypes: optionChartTypes
            };
        }

        return chartTypesMap;
    },

    /**
     * Make options map
     * @param {object} chartTypes chart types
     * @returns {object} options map
     * @private
     */
    _makeOptionsMap: function(chartTypes) {
        var self = this,
            optionsMap = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = self.options.series[chartType] || self.options.series;
        });

        return optionsMap;
    },

    /**
     * Make theme map
     * @param {object} chartTypes chart types
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes) {
        var self = this,
            theme = this.theme,
            themeMap = {},
            colorCount = 0;

        tui.util.forEachArray(chartTypes, function(chartType) {
            var chartTheme = JSON.parse(JSON.stringify(theme)),
                removedColors;

            if (chartTheme.series[chartType]) {
                themeMap[chartType] = chartTheme.series[chartType];
            } else if (!chartTheme.series.colors) {
                themeMap[chartType] = JSON.parse(JSON.stringify(defaultTheme.series));
                themeMap[chartType].label.fontFamily = chartTheme.chart.fontFamily;
            } else {
                removedColors = chartTheme.series.colors.splice(0, colorCount);
                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);
                themeMap[chartType] = chartTheme.series;
                colorCount += self.dataProcessor.getLegendLabels(chartType).length;
            }
        });

        return themeMap;
    },

    /**
     * Make serieses
     * @param {Array.<string>} chartTypes chart types
     * @returns {Array.<object>} serieses
     * @private
     */
    _makeSerieses: function(chartTypes) {
        var seriesClasses = {
                column: ColumnChartSeries,
                line: LineChartSeries
            },
            optionsMap = this._makeOptionsMap(chartTypes),
            themeMap = this._makeThemeMap(chartTypes),
            serieses;

        serieses = tui.util.map(chartTypes, function(chartType) {
            var data = {
                allowNegativeTooltip: true,
                componentType: 'series',
                chartType: chartType,
                options: optionsMap[chartType],
                theme: themeMap[chartType]
            };

            return {
                name: chartType + 'Series',
                SeriesClass: seriesClasses[chartType],
                data: data
            };
        });

        return serieses;
    },

    /**
     * Add components
     * @param {object} chartTypesMap chart types map
     * @private
     */
    _addComponents: function(chartTypesMap) {
        var axes = [{
                name: 'yAxis',
                isLabel: true,
                chartType: chartTypesMap.chartTypes[0]
            },
            {
                name: 'xAxis'
            }],
            serieses = this._makeSerieses(chartTypesMap.seriesChartTypes);

        if (chartTypesMap.optionChartTypes.length) {
            axes.push({
                name: 'rightYAxis',
                isLabel: true,
                chartType: chartTypesMap.chartTypes[1]
            });
        }

        this._addComponentsForAxisType({
            axes: axes,
            seriesChartTypes: chartTypesMap.seriesChartTypes,
            chartType: this.options.chartType,
            serieses: serieses
        });
    },

    /**
     * Get y axis option chart types.
     * @param {Array.<string>} chartTypes chart types
     * @param {object} yAxisOptions y axis options
     * @returns {Array.<string>} chart types
     * @private
     */
    _getYAxisOptionChartTypes: function(chartTypes, yAxisOptions) {
        var resultChartTypes = chartTypes.slice(),
            isReverse = false,
            optionChartTypes;

        yAxisOptions = yAxisOptions ? [].concat(yAxisOptions) : [];

        if (yAxisOptions.length === 1 && !yAxisOptions[0].chartType) {
            resultChartTypes = [];
        } else if (yAxisOptions.length) {
            optionChartTypes = tui.util.map(yAxisOptions, function(option) {
                return option.chartType;
            });

            tui.util.forEachArray(optionChartTypes, function(chartType, index) {
                isReverse = isReverse || (chartType && resultChartTypes[index] !== chartType || false);
            });

            if (isReverse) {
                resultChartTypes.reverse();
            }
        }

        return resultChartTypes;
    },

    /**
     * Make y axis data.
     * @param {object} params parameters
     *      @param {number} params.index chart index
     *      @param {{width: number, height: number}} params.seriesDimension series dimension
     *      @param {Array.<string>} chartTypes chart type
     *      @param {boolean} isSingleYAxis whether single yAxis or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var index = params.index,
            chartType = params.chartTypes[index],
            yAxisOptions = this.yAxisOptionsMap[chartType],
            axisScaleMaker, yAxisData;

        if (!chartType) {
            return {};
        }

        axisScaleMaker = this._createAxisScaleMaker({
            min: yAxisOptions.min,
            max: yAxisOptions.max
        }, {
            isSingleYAxis: params.isSingleYAxis,
            areaType: 'yAxis'
        }, chartType);

        yAxisData = axisDataMaker.makeValueAxisData({
            axisScaleMaker: axisScaleMaker,
            isVertical: true,
            isSingleYAxis: params.isSingleYAxis
        });

        yAxisData.options = yAxisOptions;

        return yAxisData;
    },

    /**
     * Update tick count to make the same tick count of yAxes.
     * @param {object} yAxisData yAxis data
     * @param {object} rightYAxisData right yAxis data
     * @private
     */
    _updateYAxisTickCount: function(yAxisData, rightYAxisData) {
        var tickCountDiff = rightYAxisData.tickCount - yAxisData.tickCount;

        if (tickCountDiff > 0) {
            this._increaseYAxisTickCount(tickCountDiff, yAxisData);
        } else if (tickCountDiff < 0) {
            this._increaseYAxisTickCount(-tickCountDiff, rightYAxisData);
        }
    },

    /**
     * Make axes data
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        var yAxisParams = {
                chartTypes: this.chartTypes,
                isSingleYAxis: !this.optionChartTypes.length
            },
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories()
            }),
            yAxisData = this._makeYAxisData(tui.util.extend({
                index: 0
            }, yAxisParams)),
            axesData = {
                yAxis: yAxisData,
                xAxis: xAxisData
            },
            rightYAxisData;

        if (!yAxisParams.isSingleYAxis) {
            rightYAxisData = this._makeYAxisData(tui.util.extend({
                index: 1
            }, yAxisParams));
            rightYAxisData.aligned = xAxisData.aligned;
            rightYAxisData.isPositionRight = true;

            this._updateYAxisTickCount(yAxisData, rightYAxisData);

            axesData.rightYAxis = rightYAxisData;
        }

        return axesData;
    },

    /**
     * Increase yAxis tick count.
     * @param {number} increaseTickCount increase tick count
     * @param {object} yAxisData yAxis data
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, yAxisData) {
        var formatFunctions = this.dataProcessor.getFormatFunctions(),
            labels;

        yAxisData.limit.max += yAxisData.step * increaseTickCount;
        labels = calculator.makeLabelsFromLimit(yAxisData.limit, yAxisData.step);
        yAxisData.labels = renderUtil.formatValues(labels, formatFunctions, 'yAxis');
        yAxisData.tickCount += increaseTickCount;
        yAxisData.validTickCount += increaseTickCount;
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var rawData = this._filterRawData(this.rawData, checkedLegends),
            chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);

        tui.util.extend(this, chartTypesMap);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, chartTypesMap);
    }
});

axisTypeMixer.mixin(ComboChart);

module.exports = ComboChart;
