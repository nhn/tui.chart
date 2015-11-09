/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    LineTypeEventHandleLayer = require('../eventHandleLayers/lineTypeEventHandleLayer');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {array.<array>} userData chart data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     */
    lineTypeInit: function(userData, theme, options, initedData) {
        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true,
            initedData: initedData
        });

        this._addComponents(this.convertedData, options);

        if (!this.isSubChart && !this.isGroupedTooltip) {
            this.addComponent('eventHandleLayer', LineTypeEventHandleLayer);
        }
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {object} axesData axes data
     * @param {object} options chart options
     * @private
     */
    _addComponents: function(convertedData, axesData) {
        var seriesData = {
            data: {
                values: tui.util.pivot(convertedData.values),
                formattedValues: tui.util.pivot(convertedData.formattedValues)
            }
        };
        this.addAxisComponents({
            convertedData: convertedData,
            axes: ['yAxis', 'xAxis'],
            Series: this.Series,
            seriesData: seriesData
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
     * @ignore
     */
    mixin: function(func) {
        tui.util.extend(func.prototype, this);
    }
};

module.exports = lineTypeMixer;
