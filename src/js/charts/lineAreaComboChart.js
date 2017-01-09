/**
 * @fileoverview Line and Area Combo chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var rawDataHandler = require('../models/data/rawDataHandler');
var axisTypeMixer = require('./axisTypeMixer');
var zoomMixer = require('./zoomMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var comboTypeMixer = require('./comboTypeMixer');
var verticalTypeComboMixer = require('./verticalTypeComboMixer');

var LineAreaComboChart = tui.util.defineClass(ChartBase, /** @lends LineAreaComboChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-combo-chart',
    /**
     * Line and Area Combo chart.
     * @constructs LineAreaComboChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     */
    init: function(rawData, theme, options) {
        this._initForVerticalTypeCombo(rawData, options);
        this._initForAddingData();

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
        var zoomedRawData = this.dataProcessor.getZoomedRawData();
        var rawData = rawDataHandler.filterCheckedRawData(zoomedRawData, checkedLegends);
        var chartTypesMap = this._makeChartTypesMap(rawData.series, this.options.yAxis);

        tui.util.extend(this, chartTypesMap);

        this._initForAddingData();
        this._changeCheckedLegends(checkedLegends, rawData, chartTypesMap);
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

    onZoom: zoomMixer.onZoom,
    onResetZoom: zoomMixer.onResetZoom,
    _renderForZoom: zoomMixer._renderForZoom,

    _initForAddingData: addingDynamicDataMixer._initForAddingData,
    _pauseAnimationForAddingData: addingDynamicDataMixer._pauseAnimationForAddingData,
    _changeCheckedLegends: addingDynamicDataMixer._changeCheckedLegends,
    _restartAnimationForAddingData: addingDynamicDataMixer._restartAnimationForAddingData,
    _startLookup: addingDynamicDataMixer._startLookup,
    _calculateAnimateTickSize: addingDynamicDataMixer._calculateAnimateTickSize,
    _animateForAddingData: addingDynamicDataMixer._animateForAddingData,
    _checkForAddedData: addingDynamicDataMixer._checkForAddedData,
    addData: addingDynamicDataMixer.addData,
    _rerenderForAddingData: addingDynamicDataMixer._rerenderForAddingData,

    _makeOptionsMap: comboTypeMixer._makeOptionsMap,
    _getBaseSeriesOptions: comboTypeMixer._getBaseSeriesOptions
});

tui.util.extend(LineAreaComboChart.prototype, verticalTypeComboMixer);

module.exports = LineAreaComboChart;
