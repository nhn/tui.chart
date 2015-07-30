/**
 * @fileoverview ChartView is parent of all chart.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';
var dom = require('./domHandler.js'),
    View = require('./view.js');

var TITLE_ADD_PADDING = 20;

var ChartView = ne.util.defineClass(View, /** @lends ChartView.prototype */{
    /**
     * ChartView is parent of all chart.
     * @constructs ChartView
     * @extends View
     * @param {object} data chart data
     * @param {object} options chart options
     */
    init: function(data, options) {
        options = options || {};

        View.call(this);
        dom.addClass(this.el, 'ne-chart');
    },

    /**
     * Chart title renderer.
     * @returns {HTMLElement} title element
     */
    renderTitleArea: function() {
        var elTitle = this.renderTitle(this.model.title, this.theme.title, 'ne-chart-title');
        return elTitle;
    },

    /**
     * Render chart font.
     * @param {string} fontFamily font-family
     */
    renderChartFont: function(fontFamily) {
        if (!fontFamily) {
            return;
        }

        this.el.style.fontFamily = fontFamily;
    },

    /**
     * Get rendered title height.
     * @returns {number} title height
     */
    getRenderedTitleHeight: function() {
        var title = this.model.title,
            theme = this.theme.title,
            titleHeight = 0;
        if (title) {
            titleHeight = this.getRenderedLabelHeight(title, theme) + TITLE_ADD_PADDING;
        }

        return titleHeight;
    }
});

module.exports = ChartView;