/**
 * @fileoverview Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator'),
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
        var optionsMap = {};

        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = this.options.series[chartType] || this.options.series;
        }, this);

        return optionsMap;
    },

    /**
     * Make theme map
     * @param {object} chartTypes chart types
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes) {
        var theme = this.theme,
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
                colorCount += this.dataProcessor.getLegendLabels(chartType).length;
            }
        }, this);

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
        var axes = [
                {
                    name: 'yAxis',
                    isLabel: true,
                    chartType: chartTypesMap.chartTypes[0]
                },
                {
                    name: 'xAxis'
                }
            ],
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
     *      @param {boolean} isOneYAxis whether one series or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var index = params.index,
            chartType = params.chartTypes[index],
            options = params.options,
            yAxisOptions = this.yAxisOptionsMap[chartType],
            yAxisValues, seriesOption, yAxisData;

        if (!chartType) {
            return {};
        }

        if (params.isOneYAxis) {
            yAxisValues = this.dataProcessor.getWholeGroupValues();
        } else {
            yAxisValues = this.dataProcessor.getGroupValues(chartType);
        }

        seriesOption = options.series && options.series[chartType] || options.series;

        yAxisData = axisDataMaker.makeValueAxisData(tui.util.extend({
            values: yAxisValues,
            stackedOption: seriesOption && seriesOption.stacked || '',
            options: yAxisOptions,
            chartType: chartType,
            seriesDimension: params.seriesDimension,
            formatFunctions: this.dataProcessor.getFormatFunctions(),
            isVertical: true
        }, params.addParams));
        yAxisData.options = yAxisOptions;

        return yAxisData;
    },

    /**
     * Make axes data
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function() {
        var options = this.options,
            formatFunctions = this.dataProcessor.getFormatFunctions(),
            yAxisParams = {
                seriesDimension: {
                    height: this.boundsMaker.makeSeriesHeight()
                },
                chartTypes: this.chartTypes,
                isOneYAxis: !this.optionChartTypes.length,
                options: options
            },
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories()
            }),
            yAxisData = this._makeYAxisData(tui.util.extend({
                index: 0
            }, yAxisParams)),
            axesData, rightYAxisData;

        axesData = {
            yAxis: yAxisData,
            xAxis: xAxisData
        };

        if (!yAxisParams.isOneYAxis) {
            rightYAxisData = this._makeYAxisData(tui.util.extend({
                index: 1,
                addParams: {
                    isPositionRight: true
                }
            }, yAxisParams));
            if (yAxisData.tickCount < rightYAxisData.tickCount) {
                this._increaseYAxisTickCount(rightYAxisData.tickCount - yAxisData.tickCount, yAxisData, formatFunctions);
            } else if (yAxisData.tickCount > rightYAxisData.tickCount) {
                this._increaseYAxisTickCount(yAxisData.tickCount - rightYAxisData.tickCount, rightYAxisData, formatFunctions);
            }

            rightYAxisData.aligned = xAxisData.aligned;
            axesData.rightYAxis = rightYAxisData;
        }

        return axesData;
    },

    /**
     * Increase y axis tick count.
     * @param {number} increaseTickCount increase tick count
     * @param {object} toData to tick info
     * @param {Array.<function>} formatFunctions format functions
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, toData, formatFunctions) {
        toData.limit.max += toData.step * increaseTickCount;
        toData.labels = axisDataMaker.formatLabels(calculator.makeLabelsFromLimit(toData.limit, toData.step), formatFunctions);
        toData.tickCount += increaseTickCount;
        toData.validTickCount += increaseTickCount;
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
