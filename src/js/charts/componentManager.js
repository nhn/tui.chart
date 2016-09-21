/**
 * @fileoverview ComponentManager manages components of chart.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler');

var ComponentManager = tui.util.defineClass(/** @lends ComponentManager.prototype */ {
    /**
     * ComponentManager manages components of chart.
     * @param {object} params parameters
     *      @param {object} params.theme - theme
     *      @param {object} params.options - options
     *      @param {DataProcessor} params.dataProcessor - data processor
     *      @param {boolean} params.hasAxes - whether has axes or not
     * @constructs ComponentManager
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
     * The component types are axis, legend, plot, series and customEvent.
     * Chart Component Description : https://i-msdn.sec.s-msft.com/dynimg/IC267997.gif
     * @param {string} name component name
     * @param {function} Component component constructor
     * @param {object} params component parameters
     */
    register: function(name, Component, params) {
        var index, component, componentType;

        params = params || {};

        componentType = params.componentType || name;
        index = params.index || 0;

        params.theme = params.theme || this.theme[componentType];
        params.options = this._makeComponentOptions(params.options, componentType, index);

        params.dataProcessor = this.dataProcessor;
        params.hasAxes = this.hasAxes;

        component = new Component(params);
        component.componentName = name;
        component.componentType = componentType;

        this.components.push(component);
        this.componentMap[name] = component;
    },

    /**
     * Make data for rendering.
     * @param {object} renderingData - data for rendering
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
     * @returns {object}
     * @private
     */
    _makeDataForRendering: function(renderingData, name, type, paper, boundsAndScale) {
        var data = renderingData[name] || renderingData || {};

        data.paper = paper;

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
     * @param {object} renderingData - data for rendering
     * @param {{
     *      layoutBounds: {
     *          dimensionMap: object,
     *          positionMap: object
     *      },
     *      limitMap: object,
     *      axisDataMap: object,
     *      maxRadius: ?number
     * }} boundsAndScale - bounds and scale data
     * @param {HTMLElement} container - container
     */
    render: function(funcName, renderingData, boundsAndScale, container) {
        var self = this;
        var name, type, paper;

        var elements = tui.util.map(this.components, function(component) {
            var element = null;
            var data, result;

            if (component[funcName]) {
                name = component.componentName;
                type = component.componentType;
                data = self._makeDataForRendering(renderingData, name, type, paper, boundsAndScale);

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
        tui.util.forEachArray(this.components, function(component) {
            if (component[funcName]) {
                component[funcName]();
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
