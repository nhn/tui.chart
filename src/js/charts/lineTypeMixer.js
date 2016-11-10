/**
 * @fileoverview lineTypeMixer is mixer of line type chart(line, area).
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var AreaTypeEventDetector = require('../components/mouseEventDetectors//areaTypeEventDetector');

/**
 * lineTypeMixer is mixer of line type chart(line, area).
 * @mixin
 */
var lineTypeMixer = {
    /**
     * Get scale option.
     * @returns {{xAxis: ?{valueType:string}, yAxis: ?(boolean|{valueType:string})}}
     * @private
     * @override
     */
    _getScaleOption: function() {
        var scaleOption = {};

        if (this.dataProcessor.isCoordinateType()) {
            scaleOption.xAxis = {
                valueType: 'x'
            };
            scaleOption.yAxis = {
                valueType: 'y'
            };
        } else {
            scaleOption.yAxis = true;
        }

        return scaleOption;
    },

    /**
     * Add mouse event detector component for normal tooltip.
     * @private
     */
    _addMouseEventDetectorComponentForNormalTooltip: function() {
        var seriesOptions = this.options.series;

        this.componentManager.register('mouseEventDetector', AreaTypeEventDetector, {
            chartType: this.chartType,
            isVertical: this.isVertical,
            zoomable: seriesOptions.zoomable,
            allowSelect: seriesOptions.allowSelect
        });
    },

    /**
     * Add components
     * @param {string} chartType chart type
     * @private
     */
    _addComponents: function() {
        if (this.dataProcessor.isCoordinateType()) {
            delete this.options.xAxis.tickInterval;
            this.options.tooltip.grouped = false;
            this.options.series.shifting = false;
        }

        this._addComponentsForAxisType({
            axis: [
                {
                    name: 'yAxis',
                    seriesName: this.chartType,
                    isVertical: true
                },
                {
                    name: 'xAxis'
                }
            ],
            series: [
                {
                    name: this.chartType + 'Series',
                    SeriesClass: this.Series
                }
            ],
            plot: true
        });
    },

    /**
     * Add plot line.
     * @param {{index: number, color: string, id: string}} data - data
     * @override
     * @api
     */
    addPlotLine: function(data) {
        this.componentManager.get('plot').addPlotLine(data);
    },

    /**
     * Add plot band.
     * @param {{range: Array.<number>, color: string, id: string}} data - data
     * @override
     * @api
     */
    addPlotBand: function(data) {
        this.componentManager.get('plot').addPlotBand(data);
    },

    /**
     * Remove plot line.
     * @param {string} id - line id
     * @override
     * @api
     */
    removePlotLine: function(id) {
        this.componentManager.get('plot').removePlotLine(id);
    },

    /**
     * Remove plot band.
     * @param {string} id - band id
     * @override
     * @api
     */
    removePlotBand: function(id) {
        this.componentManager.get('plot').removePlotBand(id);
    }
};

module.exports = lineTypeMixer;
