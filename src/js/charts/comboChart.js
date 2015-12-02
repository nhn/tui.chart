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
    predicate = require('../helpers/predicate'),
    defaultTheme = require('../themes/defaultTheme'),
    ColumnChartSeries = require('../series/columnChartSeries'),
    LineChartSeries = require('../series/lineChartSeries');

var ComboChart = tui.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {
    /**
     * Combo chart.
     * @constructs ComboChart
     * @extends ChartBase
     * @param {array.<array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(rawData, theme, options) {
        var seriesChartTypes = tui.util.keys(rawData.series).sort(),
            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, options.yAxis),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes;

        this.chartTypes = chartTypes;
        this.seriesChartTypes = seriesChartTypes;
        this.optionChartTypes = optionChartTypes;
        this.className = 'tui-combo-chart';

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            seriesChartTypes: seriesChartTypes,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.processedData, this.options, this.theme);
    },

    /**
     * Make options map
     * @param {object} chartTypes chart types
     * @param {object} options chart options
     * @param {object} orderInfo chart order
     * @returns {object} options map
     * @private
     */
    _makeOptionsMap: function(chartTypes, options) {
        var optionsMap = {};
        tui.util.forEachArray(chartTypes, function(chartType) {
            optionsMap[chartType] = options.series && options.series[chartType];
        });
        return optionsMap;
    },

    /**
     * Make theme map
     * @param {object} chartTypes chart types
     * @param {object} theme chart theme
     * @param {object} legendLabels legend labels
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes, theme, legendLabels) {
        var themeMap = {},
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
                colorCount += legendLabels[chartType].length;
            }
        });

        return themeMap;
    },

    /**
     * Make serieses
     * @param {array.<string>} chartTypes chart types
     * @param {object} processedData processed data.
     * @param {object} options chart options
     * @param {object} theme chart theme
     * @returns {array.<object>} serieses
     * @private
     */
    _makeSerieses: function(chartTypes, processedData, options, theme) {
        var seriesClasses = {
                column: ColumnChartSeries,
                line: LineChartSeries
            },
            optionsMap = this._makeOptionsMap(chartTypes, options),
            themeMap = this._makeThemeMap(chartTypes, theme, processedData.legendLabels),
            serieses;

        serieses = tui.util.map(chartTypes, function(chartType) {
            var values = processedData.values[chartType],
                formattedValues = processedData.formattedValues[chartType],
                data;

            if (predicate.isLineTypeChart(chartType)) {
                values = tui.util.pivot(values);
                formattedValues = tui.util.pivot(formattedValues);
            }

            data = {
                allowNegativeTooltip: true,
                componentType: 'series',
                chartType: chartType,
                options: optionsMap[chartType],
                theme: themeMap[chartType],
                data: {
                    values: values,
                    formattedValues: formattedValues,
                    formatFunctions: processedData.formatFunctions,
                    joinLegendLabels: processedData.joinLegendLabels
                }
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
     * @param {object} processedData processed data
     * @param {object} options chart options
     * @param {object} theme chart theme
     * @private
     */
    _addComponents: function(processedData, options, theme) {
        var axes = ['yAxis', 'xAxis'],
            serieses = this._makeSerieses(this.seriesChartTypes, processedData, options, theme);

        if (this.optionChartTypes.length) {
            axes.push('rightYAxis');
        }

        this._addComponentsForAxisType({
            processedData: processedData,
            axes: axes,
            seriesChartTypes: this.seriesChartTypes,
            chartType: options.chartType,
            serieses: serieses
        });
    },

    /**
     * Get y axis option chart types.
     * @param {array.<string>} chartTypes chart types
     * @param {object} yAxisOptions y axis options
     * @returns {array.<string>} chart types
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
     *      @param {object} params.processedData processed data
     *      @param {{width: number, height: number}} params.seriesDimension series dimension
     *      @param {array.<string>} chartTypes chart type
     *      @param {boolean} isOneYAxis whether one series or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var processedData = params.processedData,
            index = params.index,
            chartType = params.chartTypes[index],
            options = params.options,
            yAxisValues, yAxisOptions, seriesOption;

        if (params.isOneYAxis) {
            yAxisValues = processedData.joinValues;
            yAxisOptions = [options.yAxis];
        } else {
            yAxisValues = processedData.values[chartType];
            yAxisOptions = options.yAxis || [];
        }

        seriesOption = options.series && options.series[chartType] || options.series;

        return axisDataMaker.makeValueAxisData(tui.util.extend({
            values: yAxisValues,
            stacked: seriesOption && seriesOption.stacked || '',
            options: yAxisOptions[index],
            chartType: chartType,
            seriesDimension: params.seriesDimension,
            formatFunctions: processedData.formatFunctions,
            isVertical: true
        }, params.addParams));
    },

    /**
     * Make axes data
     * @param {object} processedData processed data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(processedData, bounds, options) {
        var formatFunctions = processedData.formatFunctions,
            yAxisParams = {
                processedData: processedData,
                seriesDimension: bounds.series.dimension,
                chartTypes: this.chartTypes,
                isOneYAxis: !this.optionChartTypes.length,
                options: options
            },
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: processedData.labels
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
     * @param {array.<function>} formatFunctions format functions
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, toData, formatFunctions) {
        toData.limit.max += toData.step * increaseTickCount;
        toData.labels = axisDataMaker.formatLabels(calculator.makeLabelsFromLimit(toData.limit, toData.step), formatFunctions);
        toData.tickCount += increaseTickCount;
        toData.validTickCount += increaseTickCount;
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        return ChartBase.prototype.render.call(this, {
            seriesChartTypes: this.seriesChartTypes,
            optionChartTypes: this.optionChartTypes
        });
    }
});

axisTypeMixer.mixin(ComboChart);

module.exports = ComboChart;
