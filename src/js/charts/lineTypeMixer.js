/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    calculator = require('../helpers/calculator'),
    LineTypeEventHandleLayer = require('../eventHandleLayers/lineTypeEventHandleLayer');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Line chart.
     * @constructs lineTypeMixer
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    lineTypeInit: function(userData, theme, options, initedData) {
        var baseData = initedData || this.makeBaseData(userData, theme, options, {
                isVertical: true,
                hasAxes: true
            }),
            convertedData = baseData.convertedData,
            bounds = baseData.bounds,
            axesData = this._makeAxesData(convertedData, bounds, options, initedData);

        ChartBase.call(this, {
            bounds: bounds,
            axesData: axesData,
            theme: theme,
            options: options,
            isVertical: true,
            initedData: initedData
        });

        if (!this.isSubChart && !this.isGroupedTooltip) {
            this.addComponent('eventHandleLayer', LineTypeEventHandleLayer, {
                tickCount: axesData.xAxis ? axesData.xAxis.tickCount : -1
            });
        }

        this._addComponents(convertedData, axesData, options);
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, axesData) {
        var plotData, seriesData;

        plotData = this.makePlotData(convertedData.plotData, axesData);
        seriesData = {
            data: {
                values: ne.util.pivot(convertedData.values),
                formattedValues: ne.util.pivot(convertedData.formattedValues),
                scale: axesData.yAxis.scale,
                xTickCount: axesData.xAxis && axesData.xAxis.tickCount || -1
            }
        };
        this.addAxisComponents({
            convertedData: convertedData,
            axes: axesData,
            plotData: plotData,
            Series: this.Series,
            seriesData: seriesData,
            aligned: axesData.xAxis && axesData.xAxis.aligned
        });
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        if (!this.isSubChart && !this.isGroupedTooltip) {
            this._attachLineTypeCoordinateEvent();
        }
        return ChartBase.prototype.render.apply(this, arguments);
    },

    /**
     * To attach coordinate event of line type.
     * @private
     */
    _attachLineTypeCoordinateEvent: function() {
        var eventHandleLayer = this.componentMap.eventHandleLayer,
            series = this.componentMap.series;
        eventHandleLayer.on('overTickSector', series.onLineTypeOverTickSector, series);
        eventHandleLayer.on('outTickSector', series.onLineTypeOutTickSector, series);
    },

    /**
     * Mix in.
     * @param {function} func target function
     */
    mixin: function(func) {
        ne.util.extend(func.prototype, this);
    }
};

module.exports = lineTypeMixer;
