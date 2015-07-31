/**
 * @fileoverview  LegendView render legend area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    legendTemplate = require('./legendTemplate.js');

var LEGEND_AREA_PADDING = 10,
    LEGEND_RECT_WIDTH = 12,
    LABEL_PADDING_LEFT = 5,
    LABEL_PADDING_TOP = 2;

var LegendView = ne.util.defineClass(View, /** @lends LegendView.prototype */ {
    /**
     * LegendView render legend area.
     * @constructs LegendView
     * @extends View
     * @param {object} model legend model
     * @param {object} theme legend theme
     */
    init: function(model, theme) {
        /**
         * Legend model
         * @type {Object}
         */
        this.model = model;

        this.theme = theme;

        /**
         * Legend view className
         */
        this.className = 'ne-chart-legend-area';

        View.call(this);
    },

    /**
     * Legend renderer.
     * @param {obejct} bound plot bound
     * @returns {HTMLElement} legend element
     */
    render: function(bound) {
        var template = legendTemplate.TPL_LEGEND,
            labels = this.model.labels,
            theme = this.theme,
            themeLabel = theme.label,
            colors = theme.colors,
            borderColor = theme.borderColor,
            labelHeight = this.getRenderedLabelHeight(labels[0], themeLabel) + (LABEL_PADDING_TOP * 2),
            borderCssText = borderColor ? this.concatStr(';border:1px solid ', borderColor) : '',
            rectMargin = this.concatStr(';margin-top:', parseInt((labelHeight - LEGEND_RECT_WIDTH) / 2, 10) - 1, 'px'),
            singleColor = theme.singleColors && labels.length === 1 && 'transparent',
            html = ne.util.map(labels, function(label, index) {
                var data = {
                    cssText: this.concatStr('background-color:', singleColor || colors[index], borderCssText, rectMargin),
                    height: labelHeight,
                    label: label
                };
                return template(data);
            }, this).join('');
        this.el.innerHTML = html;
        this.renderPosition(bound.position);
        this._renderLabelTheme(themeLabel);

        return this.el;
    },

    /**
     * Render label option
     * @param {{fontSize:number, fontFamily: string, color: string}} theme label theme
     * @private
     */
    _renderLabelTheme: function(theme) {
        var cssText = this.makeFontCssText(theme);

        this.el.style.cssText += ';' + cssText;
    },

    /**
     * Get legend area height.
     * @returns {number} height
     * @private
     */
    getLegendAreaHeight: function() {
        var labels = this.model.labels,
            maxLabelHeight = this.getRenderedLabelsMaxHeight(labels, this.theme.label);
        return maxLabelHeight * labels.length;
    },

    /**
     * Get legend area width.
     * @returns {number} width
     */
    getLegendAreaWidth: function() {
        var labels = this.model.labels,
            maxLabelWidth = this.getRenderedLabelsMaxWidth(labels, this.theme.label),
            legendWidth = maxLabelWidth + LEGEND_RECT_WIDTH +
                LABEL_PADDING_LEFT + (LEGEND_AREA_PADDING * 2);
        return legendWidth;
    }
});

module.exports = LegendView;