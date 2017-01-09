/**
 * @fileoverview Area chart
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase');
var lineTypeMixer = require('./lineTypeMixer');
var zoomMixer = require('./zoomMixer');
var axisTypeMixer = require('./axisTypeMixer');
var addingDynamicDataMixer = require('./addingDynamicDataMixer');
var rawDataHandler = require('../models/data/rawDataHandler');
var Series = require('../components/series/areaChartSeries');

var AreaChart = tui.util.defineClass(ChartBase, /** @lends AreaChart.prototype */ {
    /**
     * className
     * @type {string}
     */
    className: 'tui-area-chart',

    /**
     * Series class
     * @type {function}
     */
    Series: Series,

    /**
     * Area chart.
     * @constructs AreaChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData - raw data
     * @param {object} theme - chart theme
     * @param {object} options - chart options
     * @mixes axisTypeMixer
     * @mixes lineTypeMixer
     */
    init: function(rawData, theme, options) {
        rawDataHandler.removeSeriesStack(rawData.series);
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });
        this._initForAddingData();
    },

    /**
     * On change checked legend.
     * @param {Array.<?boolean> | {line: ?Array.<boolean>, column: ?Array.<boolean>}} checkedLegends checked legends
     * @param {?object} rawData rawData
     * @param {?object} boundsParams addition params for calculating bounds
     * @override
     */
    onChangeCheckedLegends: function(checkedLegends, rawData, boundsParams) {
        this._initForAddingData();
        this._changeCheckedLegends(checkedLegends, rawData, boundsParams);
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

    getScaleOption: lineTypeMixer.getScaleOption,
    addComponents: lineTypeMixer.addComponents,

    addPlotLine: lineTypeMixer.addPlotLine,
    addPlotBand: lineTypeMixer.addPlotBand,
    removePlotBand: lineTypeMixer.removePlotBand,
    removePlotLine: lineTypeMixer.removePlotLine,

    _addMouseEventDetectorComponentForNormalTooltip: lineTypeMixer._addMouseEventDetectorComponentForNormalTooltip,

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
    _rerenderForAddingData: addingDynamicDataMixer._rerenderForAddingData
});

module.exports = AreaChart;
