/**
 * @fileoverview SeriesView render series area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    chartConst = require('../const.js'),
    pluginFactory = require('../factories/pluginFactory.js');

var HIDDEN_WIDTH = 1;

var SeriesView = ne.util.defineClass(View, /** @lends SeriesView.prototype */ {
    /**
     * SeriesView render series area.
     * @constructs SeriesView
     * @extends View
     * @param {object} model series model
     * @param {object} options series options
     * @param {object} theme series theme
     */
    init: function(model, options, theme) {
        var libType;

        /**
         * Series model
         * @type {object}
         */
        this.model = model;

        /**
         * Series theme
         * @type {object}
         */
        this.theme = theme;

        options = ne.util.extend(options, model.options);

        //barType = options.barType;
        libType = options.libType || chartConst.DEFAULT_PLUGIN;

        /**
         * Series options
         * @type {object}
         */
        this.options = options;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(libType, options.chartType);

        /**
         * Series view className
         * @type {string}
         */
        this.className = 'ne-chart-series-area';

        View.call(this);
    },

    /**
     * Show tooltip (mouseover callback).
     * @param {string} prefix tooltip id prefix
     * @param {boolean} isVertical whether vertical or not
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {string} id tooltip id
     */
    showTooltip: function(prefix, isVertical, bound, id) {
        this.fire('showTooltip', {
            id: prefix + id,
            isVertical: isVertical,
            bound: bound
        });
    },

    /**
     * Hide tooltip (mouseout callback).
     * @param {string} prefix tooltip id prefix
     * @param {string} id tooltip id
     */
    hideTooltip: function(prefix, id) {
        this.fire('hideTooltip', {
            id: prefix + id
        });
    },

    /**
     * Series renderer.
     * @param {{width: number, height: number, top: number, right: number}} bound series bound
     * @param {string} tooltipPrefix tooltip prefix
     * @param {boolean} isVertical is vertical
     * @returns {HTMLElement} series element
     */
    render: function(bound, tooltipPrefix, isVertical) {
        var dimension = bound.dimension,
            position = bound.position,
            inCallback = ne.util.bind(this.showTooltip, this, tooltipPrefix, isVertical),
            outCallback = ne.util.bind(this.hideTooltip, this, tooltipPrefix),
            hiddenWidth = this.isIE8() ? 0 : HIDDEN_WIDTH;

        this.renderDimension(dimension);

        position.top = position.top + (isVertical ? -HIDDEN_WIDTH : -1);
        position.right = position.right + (isVertical ? -(HIDDEN_WIDTH * 2) : -hiddenWidth);

        this.renderPosition(position);

        this.graphRenderer.render(this.el, {
            dimension: dimension,
            model: this.model,
            theme: this.theme,
            options: this.options
        }, inCallback, outCallback);
        return this.el;
    },

    /**
     * Call showDot function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onShowDot: function(data) {
        this.graphRenderer.showDot.call(this.graphRenderer, data);
    },

    /**
     * Call hideDot function of graphRenderer.
     * @param {{groupIndex: number, index: number}} data data
     */
    onHideDot: function(data) {
        this.graphRenderer.hideDot.call(this.graphRenderer, data);
    }
});

module.exports = SeriesView;