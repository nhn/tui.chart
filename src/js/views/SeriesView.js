/**
 * @fileoverview SeriesView render series area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    neConst = require('../const.js'),
    pluginFactory = require('../factories/pluginFactory.js');

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
        var libType;

        this.options = options || {};

        libType = options.libType || neConst.DEFAULT_PLUGIN;
        this.graphRenderer = pluginFactory.get(libType, options.chartType);
        this.bars = options.bars;
        /**
         * Series model
         * @type {Object}
         */
        this.model = model;

        /**
         * Series view className
         */
        this.className =  'series-area';

        View.call(this);
    },

    /**
     * series renderer
     * @param {{width: number, height: number}} size series size
     * @returns {element}
     */
    render: function(size) {
        this.renderSize(size);
        this.graphRenderer.render(this.el, {
            size: size,
            model: this.model,
            options: this.options
        });
        return this.el;
    }
});

module.exports = SeriesView;