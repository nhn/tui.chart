/**
 * @fileoverview ComponentModel is component model.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var ComponentModel = tui.util.defineClass(/** @lends ComponentModel.prototype */ {
    /**
     * ComponentModel is component model.
     * @param {object} params parameters
     *      @param {object} params.theme theme
     *      @param {object} params.options options
     *      @param {DataProcessor} params.dataProcessor data processor
     *      @param {BoundsMaker} params.boundsMaker bounds maker
     * @constructs ComponentModel
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
         * bounds maker
         * @type {BoundsMaker}
         */
        this.boundsMaker = params.boundsMaker;

        /**
         * whether chart has axes or not
         * @type {boolean}
         */
        this.hasAxes = params.hasAxes;
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
        var commonParams = {},
            options, index, theme,
            component, componentType;

        params = params || {};

        componentType = params.componentType || name;
        options = params.options || this.options[componentType];
        theme = params.theme || this.theme[componentType];
        index = params.index || 0;

        commonParams.theme = theme;
        commonParams.options = tui.util.isArray(options) ? options[index] : options || {};
        commonParams.dataProcessor = this.dataProcessor;
        commonParams.boundsMaker = this.boundsMaker;
        commonParams.hasAxes = this.hasAxes;

        params = tui.util.extend(params, commonParams);

        component = new Component(params);
        component.name = name;
        component.componentType = componentType;

        this.components.push(component);
        this.componentMap[name] = component;
    },

    each: function(iteratee) {
        tui.util.forEachArray(this.components, iteratee);
    },

    map: function(iteratee) {
        return tui.util.map(this.components, iteratee);
    },

    where: function(conditionMap) {
        return tui.util.filter(this.components, function(component) {
            var contained = true;

            tui.util.forEach(conditionMap, function(value, key) {
                if (component[key] !== value) {
                    contained = false;
                    return false;
                }
            });

            return contained;
        });
    },

    get: function(name) {
        return this.componentMap[name];
    }
});

module.exports = ComponentModel;
