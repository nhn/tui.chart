/**
 * @fileoverview  LegendView render legend area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../helpers/domHandler.js'),
    renderUtil = require('../helpers/renderUtil.js'),
    legendTemplate = require('./../legends/legendTemplate.js');

var LEGEND_RECT_WIDTH = 12,
    LABEL_PADDING_TOP = 2;

var LegendView = ne.util.defineClass(/** @lends LegendView.prototype */ {
    /**
     * LegendView render legend area.
     * @constructs LegendView
     * @param {object} model legend model
     * @param {object} theme legend theme
     */
    init: function(params) {
        ne.util.extend(this, params);

        /**
         * Legend view className
         */
        this.className = 'ne-chart-legend-area';
    },

    /**
     * Legend renderer.
     * @param {object} bound plot bound
     * @returns {HTMLElement} legend element
     */
    render: function() {
        var el = dom.createElement('DIV', this.className);
        el.innerHTML = this._makeLegendHtml();
        renderUtil.renderPosition(el, this.bound.position);
        this._renderLabelTheme(el, this.theme.label);

        return el;
    },

    _makeLegendHtml: function() {
        var theme = this.theme,
            labels = this.legendLabels,
            template = legendTemplate.TPL_LEGEND,
            colors = theme.colors,
            borderColor = theme.borderColor,
            labelHeight = renderUtil.getRenderedLabelHeight(labels[0], theme.labels) + (LABEL_PADDING_TOP * 2),
            borderCssText = borderColor ? renderUtil.concatStr(';border:1px solid ', borderColor) : '',
            rectMargin = renderUtil.concatStr(';margin-top:', parseInt((labelHeight - LEGEND_RECT_WIDTH) / 2, 10) - 1, 'px'),
            singleColor = theme.singleColors && labels.length === 1 && 'transparent',
            html = ne.util.map(labels, function(label, index) {
                var data = {
                    cssText: renderUtil.concatStr('background-color:', singleColor || colors[index], borderCssText, rectMargin),
                    height: labelHeight,
                    label: label
                };
                return template(data);
            }, this).join('');
        return html;
    },

    /**
     * Render label option
     * @param {{fontSize:number, fontFamily: string, color: string}} theme label theme
     * @private
     */
    _renderLabelTheme: function(el, theme) {
        var cssText = renderUtil.makeFontCssText(theme);
        el.style.cssText += ';' + cssText;
    }
});

module.exports = LegendView;