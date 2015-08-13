/**
 * @fileoverview ChartBase
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js');

var TOOLTIP_PREFIX = 'ne-chart-tooltip-';

var ChartBase = ne.util.defineClass(/** @lends ChartBase.prototype */ {
    tooltipPrefix: TOOLTIP_PREFIX + (new Date()).getTime() + '-',

    init: function(bounds, theme, options) {
        this.components = [];
        this.componentMap = {};
        this.bounds = bounds;
        this.theme = theme;
        this.options = options;
    },

    addComponent: function(name, Component, params) {
        var component;
        params = ne.util.extend({
            bound: this.bounds[name],
            theme: this.theme[name],
            options: this.options[name] || {}
        }, params);
        component = new Component(params);
        this.components.push(component);
        this.componentMap[name] = component;
    },

    render: function() {
        var el = dom.createElement('DIV', this.className);

        dom.addClass(el, 'ne-chart');
        this._renderTitle(el);
        renderUtil.renderDimension(el, this.bounds.chart.dimension);

        this._appendComponent(el, this.components);
        this._attachCustomEvent();
        return el;
    },

    _renderTitle: function(el) {
        var chartOptions = this.options.chart || {},
            elTitle = renderUtil.renderTitle(chartOptions.title, this.theme.title, 'ne-chart-title');
        renderUtil.append(el, elTitle);
    },

    _appendComponent: function(container, components) {
        var elements = ne.util.map(components, function(component) {
            return component.render();
        });
        renderUtil.appends(container, elements);
    },

    /**
     * Attach custom event
     * @private
     */
    _attachCustomEvent: function() {
        var tooltip = this.componentMap.tooltip,
            series = this.componentMap.series;
        series.on('showTooltip', tooltip.onShow, tooltip);
        series.on('hideTooltip', tooltip.onHide, tooltip);
    }
});

module.exports = ChartBase;