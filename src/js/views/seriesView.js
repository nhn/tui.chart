/**
 * @fileoverview SeriesView render series area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    chartConst = require('../const.js'),
    pluginFactory = require('../factories/pluginFactory.js');

var HIDDEN_WIDTH = 1;

/**
 * @classdesc SeriesView render series area.
 * @class
 * @augments View
 */
var SeriesView = ne.util.defineClass(View, {
    /**
     * Constructor
     * @param {object} model series model
     * @param {object} options series options
     * @param {object} theme series theme
     */
    init: function(model, options, theme) {
        var libType, barType;

        /**
         * Series model
         * @type {object}
         */
        this.model = model;

        this.theme = theme;

        options = ne.util.extend(options, model.options);

        barType = options.barType;
        libType = options.libType || chartConst.DEFAULT_PLUGIN;

        this.options = options;

        this.graphRenderer = pluginFactory.get(libType, options.chartType);

        /**
         * Series view className
         * @type {string}
         */
        this.className = 'series-area ' + barType;

        View.call(this);
    },

    /**
     * Show popup (mouseover callback).
     * @param {string} prefix popup id prefix
     * @param {boolean} isColumn Is column(horizontal bar)?
     * @param {{top:number, left: number, width: number, height: number}} bound graph bound information
     * @param {string} id popup id
     */
    showPopup: function(prefix, isColumn, bound, id) {
        this.fire('showPopup', {
            id: prefix + id,
            isColumn: isColumn,
            bound: bound
        });
    },

    /**
     * Hide popup (mouseout callback).
     * @param {string} prefix popup id prefix
     * @param {string} id popup id
     */
    hidePopup: function(prefix, id) {
        this.fire('hidePopup', {
            id: prefix + id
        });
    },

    /**
     * Series renderer
     * @param {{width: number, height: number, top: number, right: number}} bound series bound
     * @param {string} popupPrefix popup prefix
     * @param {boolean} isColumn is column
     * @returns {element} series element
     */
    render: function(bound, popupPrefix, isColumn) {
        var dimension = bound.dimension,
            position = bound.position,
            inCallback = ne.util.bind(this.showPopup, this, popupPrefix, isColumn),
            outCallback = ne.util.bind(this.hidePopup, this, popupPrefix),
            hiddenWidth = this.isIE8() ? 0 : HIDDEN_WIDTH;

        this.renderDimension(dimension);

        position.top = position.top + (isColumn ? -HIDDEN_WIDTH : -1);
        position.right = position.right + (isColumn ? -(HIDDEN_WIDTH * 2) : -hiddenWidth);

        this.renderPosition(position);

        this.graphRenderer.render(this.el, {
            dimension: dimension,
            model: this.model,
            theme: this.theme,
            options: this.options
        }, inCallback, outCallback);
        return this.el;
    }
});

module.exports = SeriesView;