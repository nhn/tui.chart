/**
 * @fileoverview ComponentManager manages components of chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler');
var Axis = require('../components/axes/axis');
var Plot = require('../components/plots/plot');

// legends
var Legend = require('../components/legends/legend');
var SpectrumLegend = require('../components/legends/spectrumLegend');
var CircleLegend = require('../components/legends/circleLegend');

// tooltips
var Tooltip = require('../components/tooltips/tooltip');
var GroupTooltip = require('../components/tooltips/groupTooltip');
var MapChartTooltip = require('../components/tooltips/mapChartTooltip');

// mouse event detectors
var AreaTypeEventDetector = require('../components/mouseEventDetectors/areaTypeEventDetector');
var BoundsTypeEventDetector = require('../components/mouseEventDetectors/boundsTypeEventDetector');
var GroupTypeEventDetector = require('../components/mouseEventDetectors/groupTypeEventDetector');
var MapChartEventDetector = require('../components/mouseEventDetectors/mapChartEventDetector');
var SimpleEventDetector = require('../components/mouseEventDetectors/simpleEventDetector');

// series
var BarSeries = require('../components/series/barChartSeries');
var ColumnSeries = require('../components/series/columnChartSeries');
var LineSeries = require('../components/series/lineChartSeries');
var AreaSeries = require('../components/series/areaChartSeries');
var BubbleSeries = require('../components/series/bubbleChartSeries');
var ScatterSeries = require('../components/series/scatterChartSeries');
var MapSeries = require('../components/series/mapChartSeries');
var PieSeries = require('../components/series/pieChartSeries');
var HeatmapSeries = require('../components/series/heatmapChartSeries');
var TreemapSeries = require('../components/series/treemapChartSeries');

var Zoom = require('../components/series/zoom');

var COMPONENT_CLASS_MAP = {
    axis: Axis,
    plot: Plot,
    legend: Legend,
    spectrumLegend: SpectrumLegend,
    circleLegend: CircleLegend,
    tooltip: Tooltip,
    groupTooltip: GroupTooltip,
    mapChartTooltip: MapChartTooltip,
    areaTypeEventDetector: AreaTypeEventDetector,
    boundsTypeEventDetector: BoundsTypeEventDetector,
    groupTypeEventDetector: GroupTypeEventDetector,
    mapChartEventDetector: MapChartEventDetector,
    simpleEventDetector: SimpleEventDetector,
    barSeries: BarSeries,
    columnSeries: ColumnSeries,
    lineSeries: LineSeries,
    areaSeries: AreaSeries,
    bubbleSeries: BubbleSeries,
    scatterSeries: ScatterSeries,
    mapSeries: MapSeries,
    pieSeries: PieSeries,
    heatmapSeries: HeatmapSeries,
    treemapSeries: TreemapSeries,
    zoom: Zoom
};

var ComponentManager = tui.util.defineClass(/** @lends ComponentManager.prototype */ {
    /**
     * ComponentManager manages components of chart.
     * @param {object} params parameters
     *      @param {object} params.theme - theme
     *      @param {object} params.options - options
     *      @param {DataProcessor} params.dataProcessor - data processor
     *      @param {boolean} params.hasAxes - whether has axes or not
     * @constructs ComponentManager
     * @private
     */
    init: function(params) {
        /**
         * Components
         * @type {Array.<object>}
         */
        this.components = [];

        /**
         * Component map.
         * @type {object}
         */
        this.componentMap = {};

        /**
         * theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * options
         * @type {object}
         */
        this.options = params.options || {};

        /**
         * data processor
         * @type {DataProcessor}
         */
        this.dataProcessor = params.dataProcessor;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;

        /**
         * event bus for transmitting message
         * @type {object}
         */
        this.eventBus = params.eventBus;
    },

    /**
     * Make component options.
     * @param {object} options options
     * @param {string} componentType component type
     * @param {number} index component index
     * @returns {object} options
     * @private
     */
    _makeComponentOptions: function(options, componentType, index) {
        options = options || this.options[componentType];
        options = tui.util.isArray(options) ? options[index] : options || {};

        return options;
    },

    /**
     * Register component.
     * The component refers to a component of the chart.
     * The component types are axis, legend, plot, series and mouseEventDetector.
     * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
     * @param {string} name component name
     * @param {object} params component parameters
     */
    register: function(name, params) {
        var index, component, componentType, classType, Component;

        params = params || {};

        componentType = params.componentType || name;
        classType = params.classType || componentType || name;

        index = params.index || 0;

        params.theme = params.theme || this.theme[componentType];
        params.options = this._makeComponentOptions(params.options, componentType, index);

        params.dataProcessor = this.dataProcessor;
        params.hasAxes = this.hasAxes;
        params.eventBus = this.eventBus;

        Component = COMPONENT_CLASS_MAP[classType];
        component = new Component(params);
        component.componentName = name;
        component.componentType = componentType;

        this.components.push(component);
        this.componentMap[name] = component;
    },

    /**
     * Make data for rendering.
     * @param {string} name - component name
     * @param {string} type - component type
     * @param {object} paper - raphael object
     * @param {{
     *      layoutBounds: {
     *          dimensionMap: object,
     *          positionMap: object
     *      },
     *      limitMap: object,
     *      axisDataMap: object,
     *      maxRadius: ?number
     * }} boundsAndScale - bounds and scale data
     * @param {?object} additionalData - additional data
     * @returns {object}
     * @private
     */
    _makeDataForRendering: function(name, type, paper, boundsAndScale, additionalData) {
        var data = tui.util.extend({
            paper: paper
        }, additionalData);

        if (boundsAndScale) {
            tui.util.extend(data, boundsAndScale);

            data.layout = {
                dimension: data.dimensionMap[name] || data.dimensionMap[type],
                position: data.positionMap[name] || data.positionMap[type]
            };
        }

        return data;
    },

    /**
     * Render components.
     * @param {string} funcName - function name for executing
     * @param {{
     *      layoutBounds: {
     *          dimensionMap: object,
     *          positionMap: object
     *      },
     *      limitMap: object,
     *      axisDataMap: object,
     *      maxRadius: ?number
     * }} boundsAndScale - bounds and scale data
     * @param {?object} additionalData - additional data
     * @param {?HTMLElement} container - container
     */
    render: function(funcName, boundsAndScale, additionalData, container) {
        var self = this;
        var name, type, paper;

        var elements = tui.util.map(this.components, function(component) {
            var element = null;
            var data, result;

            if (component[funcName]) {
                name = component.componentName;
                type = component.componentType;
                data = self._makeDataForRendering(name, type, paper, boundsAndScale, additionalData);

                result = component[funcName](data);

                if (result && result.container) {
                    element = result.container;
                    paper = result.paper;
                } else {
                    element = result;
                }
            }

            return element;
        });

        if (container) {
            dom.append(container, elements);
        }
    },

    /**
     * Find components to conditionMap.
     * @param {object} conditionMap condition map
     * @returns {Array.<object>} filtered components
     */
    where: function(conditionMap) {
        return tui.util.filter(this.components, function(component) {
            var contained = true;

            tui.util.forEach(conditionMap, function(value, key) {
                if (component[key] !== value) {
                    contained = false;
                }

                return contained;
            });

            return contained;
        });
    },

    /**
     * Execute components.
     * @param {string} funcName - function name
     */
    execute: function(funcName) {
        var args = Array.prototype.slice.call(arguments, 1);

        tui.util.forEachArray(this.components, function(component) {
            if (component[funcName]) {
                component[funcName].apply(component, args);
            }
        });
    },

    /**
     * Get component.
     * @param {string} name component name
     * @returns {object} component instance
     */
    get: function(name) {
        return this.componentMap[name];
    },

    /**
     * Whether has component or not.
     * @param {string} name - comopnent name
     * @returns {boolean}
     */
    has: function(name) {
        return !!this.get(name);
    }
});

module.exports = ComponentManager;
