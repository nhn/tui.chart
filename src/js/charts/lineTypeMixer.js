/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ChartBase = require('./chartBase'),
    predicate = require('../helpers/predicate'),
    axisDataMaker = require('../helpers/axisDataMaker'),
    AreaTypeCustomEvent = require('../customEvents/areaTypeCustomEvent');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Initialize line type chart.
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     * @param {object} initedData initialized data from combo chart
     * @private
     */
    _lineTypeInit: function(rawData, theme, options) {
        ChartBase.call(this, {
            rawData: rawData,
            theme: theme,
            options: options,
            hasAxes: true,
            isVertical: true
        });

        this._addComponents(options.chartType);
    },

    /**
     * Make axes data
     * @param {object} bounds chart bounds
     * @returns {object} axes data
     * @private
     */
    _makeAxesData: function(bounds) {
        var options = this.options,
            aligned = predicate.isLineTypeChart(options.chartType),
            xAxisData = axisDataMaker.makeLabelAxisData({
                labels: this.dataProcessor.getCategories(),
                aligned: aligned,
                options: options.xAxis
            }),
            yAxisData = axisDataMaker.makeValueAxisData({
                values: this.dataProcessor.getGroupValues(),
                seriesDimension: bounds.series.dimension,
                stackedOption: options.series && options.series.stacked || '',
                chartType: options.chartType,
                formatFunctions: this.dataProcessor.getFormatFunctions(),
                options: options.yAxis,
                isVertical: true,
                aligned: aligned
            });

        return {
            xAxis: xAxisData,
            yAxis: yAxisData
        };
    },

    /**
     * Add custom event component for normal tooltip.
     * @private
     */
    _addCustomEventComponentForNormalTooltip: function() {
        this._addComponent('customEvent', AreaTypeCustomEvent, {
            chartType: this.chartType,
            isVertical: this.isVertical
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function(chartType) {
        this._addComponentsForAxisType({
            axes: ['yAxis', 'xAxis'],
            chartType: chartType,
            serieses: [
                {
                    name: this.options.chartType + 'Series',
                    SeriesClass: this.Series
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
