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
    ColumnChart = require('./columnChart'),
    LineChart = require('./lineChart');

var ComboChart = tui.util.defineClass(ChartBase, /** @lends ComboChart.prototype */ {
    /**
     * Combo chart.
     * @constructs ComboChart
     * @extends ChartBase
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    init: function(userData, theme, options) {
        var seriesChartTypes = tui.util.keys(userData.series).sort(),
            optionChartTypes = this._getYAxisOptionChartTypes(seriesChartTypes, options.yAxis),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesChartTypes;

        this.chartTypes = chartTypes;
        this.seriesChartTypes = seriesChartTypes;
        this.optionChartTypes = optionChartTypes;

        this.className = 'tui-combo-chart';

        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            seriesChartTypes: seriesChartTypes,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.convertedData, this.options);

        this._initSubCharts({
            userData: userData,
            seriesChartTypes: seriesChartTypes
        });
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, options) {
        var axes = ['yAxis', 'xAxis'];
        if (this.optionChartTypes.length) {
            axes.push('yrAxis');
        }
        this.addAxisComponents({
            convertedData: convertedData,
            axes: axes,
            seriesChartTypes: this.seriesChartTypes,
            chartType: options.chartType
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
     * To make y axis data.
     * @param {object} params parameters
     *      @param {number} params.index chart index
     *      @param {object} params.convertedData converted data
     *      @param {{width: number, height: number}} params.seriesDimension series dimension
     *      @param {array.<string>} chartTypes chart type
     *      @param {boolean} isOneYAxis whether one series or not
     *      @param {object} options chart options
     *      @param {object} addParams add params
     * @returns {object} y axis data
     * @private
     */
    _makeYAxisData: function(params) {
        var convertedData = params.convertedData,
            index = params.index,
            chartType = params.chartTypes[index],
            options = params.options,
            yAxisValues, yAxisOptions, seriesOption;

        if (params.isOneYAxis) {
            yAxisValues = convertedData.joinValues;
            yAxisOptions = [options.yAxis];
        } else {
            yAxisValues = convertedData.values[chartType];
            yAxisOptions = options.yAxis || [];
        }

        seriesOption = options.series && options.series[chartType] || options.series;

        return axisDataMaker.makeValueAxisData(tui.util.extend({
            values: yAxisValues,
            stacked: seriesOption && seriesOption.stacked || '',
            options: yAxisOptions[index],
            chartType: chartType,
            seriesDimension: params.seriesDimension,
            formatFunctions: convertedData.formatFunctions,
            isVertical: true
        }, params.addParams));
    },

    /**
     * To make axes data
     * @param {object} convertedData converted data
     * @param {object} bounds chart bounds
     * @param {object} options chart options
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(convertedData, bounds, options) {
        var formatFunctions = convertedData.formatFunctions,
            yAxisParams = {
                convertedData: convertedData,
                seriesDimension: bounds.series.dimension,
                chartTypes: this.chartTypes,
                isOneYAxis: !this.optionChartTypes.length,
                options: options
            },
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: convertedData.labels
            }),
            yAxisData = this._makeYAxisData(tui.util.extend({
                index: 0
            }, yAxisParams)),
            axesData, yrAxisData;

        yAxisData.aligned = xAxisData.aligned;

        axesData = {
            yAxis: yAxisData,
            xAxis: xAxisData
        };

        if (!yAxisParams.isOneYAxis) {
            yrAxisData = this._makeYAxisData(tui.util.extend({
                index: 1,
                addParams: {
                    isPositionRight: true
                }
            }, yAxisParams));
            if (yAxisData.tickCount < yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yrAxisData.tickCount - yAxisData.tickCount, yAxisData, formatFunctions);
            } else if (yAxisData.tickCount > yrAxisData.tickCount) {
                this._increaseYAxisTickCount(yAxisData.tickCount - yrAxisData.tickCount, yrAxisData, formatFunctions);
            }

            yrAxisData.aligned = xAxisData.aligned;
            axesData.yrAxis = yrAxisData;
        }

        return axesData;
    },

    /**
     * To make options map
     * @param {object} chartTypes chart types
     * @param {object} options chart options
     * @param {object} orderInfo chart order
     * @returns {object} options map
     * @private
     */
    _makeOptionsMap: function(chartTypes, options) {
        var result = {};
        tui.util.forEachArray(chartTypes, function(chartType) {
            var chartOptions = JSON.parse(JSON.stringify(options));

            if (chartOptions.series && chartOptions.series[chartType]) {
                chartOptions.series = chartOptions.series[chartType];
            }

            if (chartOptions.tooltip && chartOptions.tooltip[chartType]) {
                chartOptions.tooltip = chartOptions.tooltip[chartType];
            }
            chartOptions.parentChartType = chartOptions.chartType;
            chartOptions.chartType = chartType;
            result[chartType] = chartOptions;
        });
        return result;
    },

    /**
     * To make theme map
     * @param {object} chartTypes chart types
     * @param {object} theme chart theme
     * @param {object} legendLabels legend labels
     * @returns {object} theme map
     * @private
     */
    _makeThemeMap: function(chartTypes, theme, legendLabels) {
        var result = {},
            colorCount = 0;
        tui.util.forEachArray(chartTypes, function(chartType) {
            var chartTheme = JSON.parse(JSON.stringify(theme)),
                removedColors;

            if (chartTheme.series[chartType]) {
                chartTheme.series = chartTheme.series[chartType];
            } else if (!chartTheme.series.colors) {
                chartTheme.series = JSON.parse(JSON.stringify(defaultTheme.series));
                chartTheme.series.label.fontFamily = chartTheme.chart.fontFamily;
            } else {
                removedColors = chartTheme.series.colors.splice(0, colorCount);
                chartTheme.series.colors = chartTheme.series.colors.concat(removedColors);
                colorCount += legendLabels[chartType].length;
            }
            result[chartType] = chartTheme;
        });
        return result;
    },

    /**
     * Increase y axis tick count.
     * @param {number} increaseTickCount increase tick count
     * @param {object} toData to tick info
     * @param {array.<function>} formatFunctions format functions
     * @private
     */
    _increaseYAxisTickCount: function(increaseTickCount, toData, formatFunctions) {
        toData.scale.max += toData.step * increaseTickCount;
        toData.labels = axisDataMaker.formatLabels(calculator.makeLabelsFromScale(toData.scale, toData.step), formatFunctions);
        toData.tickCount += increaseTickCount;
        toData.validTickCount += increaseTickCount;
    },

    /**
     * Init sub charts.
     * @param {object} params parameters
     *      @param {object} params.userData user data
     *      @param {object} params.baseData chart base data
     *      @param {object} params.theme chart theme
     *      @param {object} params.options chart options
     *      @param {{yAxis: object, xAxis: object}} params.baseAxesData base axes data
     *      @param {object} params.axesData axes data
     *      @param {array.<string>} params.seriesChartTypes series chart types
     *      @param {array.<string>} params.chartTypes chart types
     * @private
     */
    _initSubCharts: function(params) {
        var chartClasses = {
                column: ColumnChart,
                line: LineChart
            },
            optionsMap = this._makeOptionsMap(this.chartTypes, this.options),
            themeMap = this._makeThemeMap(this.seriesChartTypes, this.theme, this.convertedData.legendLabels),
            convertedData = this.convertedData;

        this.charts = tui.util.map(params.seriesChartTypes, function(chartType) {
            var legendLabels = convertedData.legendLabels[chartType],
                options = optionsMap[chartType],
                theme = themeMap[chartType],
                Chart = chartClasses[chartType],
                initedData;

            initedData = {
                convertedData: {
                    values: convertedData.values[chartType],
                    labels: convertedData.labels,
                    formatFunctions: convertedData.formatFunctions,
                    formattedValues: convertedData.formattedValues[chartType],
                    legendLabels: legendLabels,
                    joinLegendLabels: convertedData.joinLegendLabels
                },
                chartId: this.chartId,
                userEvent: this.userEvent
            };

            return new Chart(params.userData, theme, options, initedData);
        }, this);
    },

    /**
     * Render combo chart.
     * @returns {HTMLElement} combo chart element
     */
    render: function() {
        var el = ChartBase.prototype.render.call(this, null, null, {
                seriesChartTypes: this.seriesChartTypes,
                optionChartTypes: this.optionChartTypes
            }),
            that = this,
            paper;

        tui.util.forEachArray(this.charts, function(chart, index) {
            setTimeout(function() {
                chart.render(el, paper, null, {
                    bounds: {
                        series: that.bounds.series,
                        tooltip: that.bounds.tooltip
                    },
                    renderingData: that.renderingData
                });
                if (!paper) {
                    paper = chart.getPaper();
                }
                chart.animateChart();
            }, 1 * index);
        }, this);
        return el;
    }
});

axisTypeMixer.mixin(ComboChart);

module.exports = ComboChart;
