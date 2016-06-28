/**
 * @fileoverview Column and Line Combo chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var calculator = require('../helpers/calculator');
var renderUtil = require('../helpers/renderUtil');
var ChartBase = require('./chartBase');
var axisTypeMixer = require('./axisTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');
var ColumnChartSeries = require('../series/columnChartSeries');
var LineChartSeries = require('../series/lineChartSeries');

var ColumnLineComboChart = tui.util.defineClass(ChartBase, /** @lends ColumnLineComboChart.prototype */ {
    /**
     * Column and Line Combo chart.
     * @constructs ColumnLineComboChart
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
            seriesNames: chartTypesMap.seriesNames
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
        var optionsMap = {};
        yAxisOptions = yAxisOptions || {};
        tui.util.forEachArray(chartTypes, function(chartType, index) {
            optionsMap[chartType] = yAxisOptions[index] || yAxisOptions;
        });

        return optionsMap;
    },

    /**
     * Make chart types map.
     * @param {object} rawSeriesData raw series data
     * @param {object} yAxisOption option for y axis
     * @returns {object} chart types map
     * @private
     */
    _makeChartTypesMap: function(rawSeriesData, yAxisOption) {
        var seriesNames = tui.util.keys(rawSeriesData).sort(),
            optionChartTypes = this._getYAxisOptionChartTypes(seriesNames, yAxisOption),
            chartTypes = optionChartTypes.length ? optionChartTypes : seriesNames,
            validChartTypes = tui.util.filter(optionChartTypes, function(chartType) {
                return rawSeriesData[chartType].length;
            }),
            chartTypesMap;

        if (validChartTypes.length === 1) {
            chartTypesMap = {
                chartTypes: validChartTypes,
                seriesNames: validChartTypes,
                optionChartTypes: !optionChartTypes.length ? optionChartTypes : validChartTypes
            };
        } else {
            chartTypesMap = {
                chartTypes: chartTypes,
                seriesNames: seriesNames,
                optionChartTypes: optionChartTypes
            };
        }

        return chartTypesMap;
    },

    /**
     * Make data for adding series component.
     * @param {Array.<string>} seriesNames - series names
     * @returns {Array.<object>}
     * @private
     */
    _makeDataForAddingSeriesComponent: function(seriesNames) {
        var seriesClasses = {
            column: ColumnChartSeries,
            line: LineChartSeries
        };
        var optionsMap = this._makeOptionsMap(seriesNames);
        var themeMap = this._makeThemeMap(seriesNames);
        var dataProcessor = this.dataProcessor;
        var serieses = tui.util.map(seriesNames, function(seriesName) {
            var chartType = dataProcessor.findChartType(seriesName);
            var data = {
                allowNegativeTooltip: true,
                chartType: chartType,
                seriesName: seriesName,
                options: optionsMap[seriesName],
                theme: themeMap[seriesName]
            };

            return {
                name: seriesName + 'Series',
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
                chartType: chartTypesMap.chartTypes[0],
                isVertical: true
            },
            {
                name: 'xAxis',
                isLabel: true
            }
        ];
        var serieses = this._makeDataForAddingSeriesComponent(chartTypesMap.seriesNames);

        if (chartTypesMap.optionChartTypes.length) {
            axes.push({
                name: 'rightYAxis',
                chartType: chartTypesMap.chartTypes[1]
            });
        }

        this._addComponentsForAxisType({
            axes: axes,
            seriesNames: chartTypesMap.seriesNames,
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
     * Create AxisScaleMake for y axis.
     * @param {number} index - index of this.chartTypes
     * @param {boolean} isSingleYAxis - whether single y axis or not.
     * @returns {AxisScaleMaker}
     * @private
     */
    _createYAxisScaleMaker: function(index, isSingleYAxis) {
        var chartType = this.chartTypes[index];
        var yAxisOption = this.yAxisOptionsMap[chartType];
        var additionalParams = {
            isSingleYAxis: !!isSingleYAxis
        };

        return this._createAxisScaleMaker(yAxisOption, 'yAxis', null, chartType, additionalParams);
    },

    /**
     * Make map for AxisScaleMaker of axes(xAxis, yAxis).
     * @returns {Object.<string, AxisScaleMaker>}
     * @private
     */
    _makeAxisScaleMakerMap: function() {
        var isSingleYAxis = this.optionChartTypes.length < 2;
        var axisScaleMakerMap = {
            yAxis: this._createYAxisScaleMaker(0, isSingleYAxis)
        };

        if (!isSingleYAxis) {
            axisScaleMakerMap.rightYAxis = this._createYAxisScaleMaker(1);
        }

        return axisScaleMakerMap;
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
     * Update tick count to make the same tick count of y Axes(yAxis, rightYAxis).
     * @param {{yAxis: object, rightYAxis: object}} axesData - axesData
     * @private
     */
    _updateYAxisTickCount: function(axesData) {
        var yAxisData = axesData.yAxis;
        var rightYAxisData = axesData.rightYAxis;
        var tickCountDiff = rightYAxisData.tickCount - yAxisData.tickCount;

        if (tickCountDiff > 0) {
            this._increaseYAxisTickCount(tickCountDiff, yAxisData);
        } else if (tickCountDiff < 0) {
            this._increaseYAxisTickCount(-tickCountDiff, rightYAxisData);
        }
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var rawData = this._filterCheckedRawData(this.rawData, checkedLegends);
        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);

        tui.util.extend(this, chartTypesMap);

        ChartBase.prototype.onChangeCheckedLegends.call(this, checkedLegends, rawData, chartTypesMap);
    }
});

axisTypeMixer.mixin(ColumnLineComboChart);
comboTypeMixer.mixin(ColumnLineComboChart);

/**
 * Make axes data, used in a axis component like yAxis, xAxis, rightYAxis.
 * @returns {object} axes data
 * @private
 * @override
 */
ColumnLineComboChart.prototype._makeAxesData = function() {
    var axisScaleMakerMap = this._getAxisScaleMakerMap();
    var yAxisOptionsMap = this.yAxisOptionsMap;
    var yAxisOptions = yAxisOptionsMap[this.chartTypes[0]];
    var axesData = {
        xAxis: this._makeAxisData(null, this.options.xAxis),
        yAxis: this._makeAxisData(axisScaleMakerMap.yAxis, yAxisOptions, true)
    };

    if (axisScaleMakerMap.rightYAxis) {
        yAxisOptions = yAxisOptionsMap[this.chartTypes[1]];
        axesData.rightYAxis = this._makeAxisData(axisScaleMakerMap.rightYAxis, yAxisOptions, true, true);
        axesData.rightYAxis.aligned = axesData.xAxis.aligned;
        this._updateYAxisTickCount(axesData);
    }

    return axesData;
};


module.exports = ColumnLineComboChart;
