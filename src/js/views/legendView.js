/**
 * @fileoverview  LegendView render legend area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    legendTemplate = require('./legendTemplate.js');

var LEGEND_AREA_PADDING = 10,
    LEGEND_RECT_WIDTH = 12,
    LABEL_PADDING = 5;
/**
 * @classdesc LegendView render legend area.
 * @class
 * @augments View
 */
var LegendView = ne.util.defineClass(View, {
    init: function(model) {
        /**
         * Legend model
         * @type {Object}
         */
        this.model = model;

        /**
         * Legend labels
         * @type {array}
         */
        this.labels = ne.util.pluck(this.model.data, 0);

        /**
         * Legend view className
         */
        this.className =  'ne-chart-legend-area';

        View.call(this);
    },

    /**
     * Legend renderer.
     * @param {number} plotHeight plot height
     * @returns {element}
     */
    render: function(plotHeight) {
        var template = legendTemplate.TPL_LEGEND,
            html = ne.util.map(this.model.data, function(items) {
                var data = {
                        cssText: 'background-color:' + items[1],
                        label: items[0]
                    };
                return template(data);
            }).join(''),
            height = this._getLegendAreaHeight(),
            position = {top: (plotHeight - height) / 2 };

        this.el.innerHTML = html;
        this.renderPosition(position);

        return this.el;
    },

    /**
     * Get legend area height.
     * @returns {number}
     * @private
     */
    _getLegendAreaHeight: function() {
        var maxLabelHeight = this.getRenderedLabelsMaxHeight(this.labels);
        return maxLabelHeight * this.labels.length;
    },

    /**
     * Get legend area width.
     * @returns {number}
     */
    getLegendAreaWidth: function() {
        var maxLabelWidth = this.getRenderedLabelsMaxWidth(this.labels),
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LABEL_PADDING + (LEGEND_AREA_PADDING * 2);

        return legendWidth;
    }
});

module.exports = LegendView;