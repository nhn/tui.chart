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
     */
    init: function(model, options) {
        var libType, barType;

        this.options = options || {};

        libType = options.libType || chartConst.DEFAULT_PLUGIN;
        this.graphRenderer = pluginFactory.get(libType, options.chartType);
        barType = options.barType;
        /**
         * Series model
         * @type {Object}
         */
        this.model = model;

        /**
         * Series view className
         */
        this.className =  'series-area ' + barType;

        View.call(this);
    },

    /**
     * Show popup (mouseover callback).
     * @param {string} prefix popup id prefix
     * @param {boolean} isColumn Is column(horizontal bar)?
     * @param {{top:number, left: number, width: number, height: number} bound graph bound information
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
     * series renderer
     * @param {{width: number, height: number, top: number, right: number}} dimension series dimension
     * @returns {element}
     */
    render: function(bound, popupPrefix, isColumn) {
        var dimension = bound.dimension,
            position = bound.position,
            inCallback = ne.util.bind(this.showPopup, this, popupPrefix, isColumn),
            outCallback = ne.util.bind(this.hidePopup, this, popupPrefix),
            hiddenWidth = this.isIE8() ? 0 : HIDDEN_WIDTH;

        this.renderDimension(dimension);

        position.top = position.top + (isColumn ? - HIDDEN_WIDTH : - 1 );
        position.right = position.right + (isColumn ? - (HIDDEN_WIDTH * 2) : - hiddenWidth);

        this.renderPosition(position);

        this.graphRenderer.render(this.el, {
            dimension: dimension,
            model: this.model,
            options: this.options,
        },inCallback, outCallback);
        return this.el;
    }
});

module.exports = SeriesView;