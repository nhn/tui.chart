/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');

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
    lineTypeInit: function(userData, theme, options) {
        ChartBase.call(this, {
            userData: userData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(this.convertedData, options.chartType);
    },

    _addCustomEventComponentForNormalTooltip: function() {
        this.addComponent('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add components
     * @param {object} convertedData converted data
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(convertedData, chartType) {
        var seriesData = {
            data: {
                values: tui.util.pivot(convertedData.values),
                formattedValues: tui.util.pivot(convertedData.formattedValues),
                formatFunctions: convertedData.formatFunctions
            }
        };
        this.addComponentsForAxisType({
            convertedData: convertedData,
            axes: ['yAxis', 'xAxis'],
            chartType: chartType,
            serieses: [
                {
                    name: 'series',
                    SeriesClass: this.Series,
                    data: seriesData
                }
            ]
        });
    },

    /**
     * Render
     * @returns {HTMLElement} chart element
     */
    render: function() {
        return ChartBase.prototype.render.apply(this, arguments);
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
