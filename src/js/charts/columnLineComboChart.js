/**
 * @fileoverview Column and Line Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var axisTypeMixer = require('./axisTypeMixer');
var comboTypeMixer = require('./comboTypeMixer');
var verticalTypeComboMixer = require('./verticalTypeComboMixer');

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
        this._initForVerticalTypeCombo(rawData, options);

        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
    },

    /**
     * On change selected legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     */
    onChangeCheckedLegends: function(checkedLegends) {
        var originalRawData = this.dataProcessor.getOriginalRawData();
        var rawData = rawDataHandler.filterCheckedRawData(originalRawData, checkedLegends);
        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);

        tui.util.extend(this, chartTypesMap);

        this._rerender(checkedLegends, rawData, chartTypesMap);
    },
    addDataRatios: axisTypeMixer.addDataRatios,

    _addComponentsForAxisType: axisTypeMixer._addComponentsForAxisType,
    _addPlotComponent: axisTypeMixer._addPlotComponent,
    _addLegendComponent: axisTypeMixer._addLegendComponent,
    _addAxisComponents: axisTypeMixer._addAxisComponents,
    _addChartExportMenuComponent: axisTypeMixer._addChartExportMenuComponent,
    _addSeriesComponents: axisTypeMixer._addSeriesComponents,
    _addTooltipComponent: axisTypeMixer._addTooltipComponent,
    _addMouseEventDetectorComponent: axisTypeMixer._addMouseEventDetectorComponent,

    _addMouseEventDetectorComponentForGroupTooltip: axisTypeMixer._addMouseEventDetectorComponentForGroupTooltip,

    _makeOptionsMap: comboTypeMixer._makeOptionsMap,
    _getBaseSeriesOptions: comboTypeMixer._getBaseSeriesOptions,

    _initForVerticalTypeCombo: verticalTypeComboMixer._initForVerticalTypeCombo,
    _makeChartTypesMap: verticalTypeComboMixer._makeChartTypesMap,
    _getYAxisOptionChartTypes: verticalTypeComboMixer._getYAxisOptionChartTypes,
    _makeYAxisOptionsMap: verticalTypeComboMixer._makeYAxisOptionsMap,
    addComponents: verticalTypeComboMixer.addComponents,
    getScaleOption: verticalTypeComboMixer.getScaleOption,
    _makeDataForAddingSeriesComponent: verticalTypeComboMixer._makeDataForAddingSeriesComponent,
    _makeYAxisScaleOption: verticalTypeComboMixer._makeYAxisScaleOption,
    _setAdditionalOptions: verticalTypeComboMixer._setAdditionalOptions,
    _increaseYAxisTickCount: verticalTypeComboMixer._increaseYAxisTickCount
});

module.exports = ColumnLineComboChart;
