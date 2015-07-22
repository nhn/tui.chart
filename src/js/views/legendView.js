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
    LABEL_PADDING_LEFT = 5,
    LABEL_PADDING_TOP = 2;
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
    render: function(bound) {
        var template = legendTemplate.TPL_LEGEND,
            data = this.model.data,
            labelHeight = this.getRenderedLabelHeight(data[0][0], this.model.labelOptions) + (LABEL_PADDING_TOP * 2),
            rectMargin = this.concatStr('margin-top:', parseInt((labelHeight - LEGEND_RECT_WIDTH) / 2) - 1, 'px'),
            html = ne.util.map(this.model.data, function(items) {
                var data = {
                        cssText: this.concatStr('background-color:', items[1], ';', rectMargin),
                        height: labelHeight,
                        label: items[0]
                    };
                return template(data);
            }, this).join('');

        this.el.innerHTML = html;
        this.renderPosition(bound.position);
        this._renderLabelOption(this.model.labelOptions);

        return this.el;
    },

    /**
     * Render label option
     * @param {{fontSize:number, fontFamily: string, color: string}}options
     * @private
     */
    _renderLabelOption: function(options) {
        var cssText = this.makeFontCssText(options);

        this.el.style.cssText += ';' + cssText;
    },

    /**
     * Get legend area height.
     * @returns {number}
     * @private
     */
    getLegendAreaHeight: function() {
        var maxLabelHeight = this.getRenderedLabelsMaxHeight(this.labels, this.model.labelOptions);
        return maxLabelHeight * this.labels.length;
    },

    /**
     * Get legend area width.
     * @returns {number}
     */
    getLegendAreaWidth: function() {
        var maxLabelWidth = this.getRenderedLabelsMaxWidth(this.labels, this.model.labelOptions),
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LABEL_PADDING_LEFT + (LEGEND_AREA_PADDING * 2);
        return legendWidth;
    }
});

module.exports = LegendView;