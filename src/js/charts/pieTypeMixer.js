/**
 * @fileoverview pieTypeMixer is mixer of pie type chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * pieTypeMixer is mixer of pie type chart.
 * @mixin
 * @private */
var pieTypeMixer = {
    /**
     * Add legend component.
     * @param {Array.<string>} [seriesTypes] - series types
     * @private
     */
    _addLegendComponent: function(seriesTypes) {
        var legendOption = this.options.legend || {};

        if (legendOption.visible) {
            this.componentManager.register('legend', {
                seriesTypes: seriesTypes,
                chartType: this.chartType,
                classType: 'legend'
            });
        }
    },

    _addTitleComponent: function(options) {
        this.componentManager.register('title', {
            dataProcessor: this.dataProcessor,
            libType: options.libType,
            text: options.text,
            theme: this.theme.chart ? this.theme.chart.title : {},
            classType: 'title'
        });
    },
    /**
     * Add tooltip component.
     * @param {object} tooltipOptions tooltip options
     * @private
     */
    _addTooltipComponent: function(tooltipOptions) {
        this.componentManager.register('tooltip', this._makeTooltipData('tooltip', tooltipOptions));
    },

    /**
     * Add series components.
     * @param {Array.<{name: string, additionalParams: ?object}>} seriesData - data for adding series component
     * @private
     */
    _addSeriesComponents: function(seriesData) {
        var componentManager = this.componentManager;
        var seriesBaseParams = {
            libType: this.options.libType,
            componentType: 'series',
            chartBackground: this.theme.chart.background,
            classType: 'pieSeries'
        };

        tui.util.forEach(seriesData, function(seriesDatum) {
            var seriesParams = tui.util.extend(seriesBaseParams, seriesDatum.additionalParams);

            componentManager.register(seriesDatum.name, seriesParams);
        });
    },

    /**
     * Add chartExportMenu component.
     * @private
     */
    _addChartExportMenuComponent: function() {
        var chartOption = this.options.chart;
        var chartTitle = chartOption && chartOption.title ? chartOption.title.text : 'chart';

        this.componentManager.register('chartExportMenu', {
            chartTitle: chartTitle,
            classType: 'chartExportMenu'
        });
    },

    /**
     * Add mouse event detector component.
     * @private
     * @override
     */
    _addMouseEventDetectorComponent: function() {
        this.componentManager.register('mouseEventDetector', {
            chartType: this.chartType,
            classType: 'simpleEventDetector'
        });
    },

    /**
     * Label formatter function for pie chart
     * @param {object} seriesItem series item
     * @param {object} tooltipDatum tooltip datum object
     * @param {string} labelPrefix label prefix
     * @returns {object}
     */
    labelFormatter: function(seriesItem, tooltipDatum, labelPrefix) {
        var ratioLabel;
        var percentageString = (seriesItem.ratio * 100).toFixed(4);
        var percent = parseFloat(percentageString);
        var needSlice = (percent < 0.0009 || percentageString.length > 5);

        percentageString = needSlice ? percentageString.substr(0, 4) : String(percent);
        ratioLabel = percentageString + '&nbsp;%&nbsp;' || '';

        tooltipDatum.ratioLabel = labelPrefix + ratioLabel;
        tooltipDatum.label = seriesItem.tooltipLabel || (seriesItem.label ? seriesItem.label : '');

        return tooltipDatum;
    }
};

module.exports = pieTypeMixer;
