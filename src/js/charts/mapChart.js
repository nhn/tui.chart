/**
 * @fileoverview Map chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

import ChartBase from './chartBase';
import mapManager from '../factories/mapManager';
import MapChartMapModel from './mapChartMapModel';
import MapChartDataProcessor from '../models/data/mapChartDataProcessor';
import ColorSpectrum from './colorSpectrum';

class MapChart extends ChartBase {
    /**
     * Map chart.
     * @constructs MapChart
     * @extends ChartBase
     * @param {Array.<Array>} rawData raw data
     * @param {object} theme chart theme
     * @param {object} options chart options
     */
    constructor(rawData, theme, options) {
        options.map = mapManager.get(options.map);
        options.tooltip = options.tooltip || {};
        options.legend = options.legend || {};

        super({
            rawData,
            theme,
            options,
            DataProcessor: MapChartDataProcessor
        });

        /**
         * class name
         * @type {string}
         */
        this.className = 'tui-map-chart';
    }

    /**
     * Add components.
     * @override
     * @private
     */
    addComponents() {
        const seriesTheme = this.theme.series[this.chartType];
        const mapModel = new MapChartMapModel(this.dataProcessor, this.options.map);
        const colorSpectrum = new ColorSpectrum(seriesTheme.startColor, seriesTheme.endColor);

        this.componentManager.register('mapSeries', 'mapSeries', {
            mapModel,
            colorSpectrum
        });

        this.componentManager.register('title', 'title');

        this.componentManager.register('legend', 'spectrumLegend', {
            colorSpectrum
        });

        this.componentManager.register('tooltip', 'tooltip', {
            mapModel,
            colorSpectrum
        });

        this.componentManager.register('zoom', 'zoom');
        this.componentManager.register('mouseEventDetector', 'mapChartEventDetector');
    }

    /**
     * Get scale option.
     * @returns {{legend: boolean}}
     * @override
     */
    getScaleOption() {
        return {
            legend: true
        };
    }

    /**
     * Add data ratios.
     * @override
     */
    addDataRatios(limitMap) {
        this.dataProcessor.addDataRatios(limitMap.legend);
    }
}

export default MapChart;
