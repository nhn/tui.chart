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
        var libType;

        this.options = options || {};

        libType = options.libType || chartConst.DEFAULT_PLUGIN;
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
        this.className =  'series-area ' + this.bars;

        View.call(this);
    },

    /**
     * series renderer
     * @param {{width: number, height: number, top: number, right: number}} dimension series dimension
     * @returns {element}
     */
    render: function(bound) {
        var dimension = bound.dimension,
            position = bound.position;

        this.renderDimension(dimension);

        position.top -= HIDDEN_WIDTH;
        position.right -= HIDDEN_WIDTH;

        this.renderPosition(position);

        this.graphRenderer.render(this.el, {
            dimension: dimension,
            model: this.model,
            options: this.options
        });
        return this.el;
    }
});

module.exports = SeriesView;