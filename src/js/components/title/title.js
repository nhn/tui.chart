/**
 * @fileoverview  Title component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var pluginFactory = require('../../factories/pluginFactory');
var snippet = require('tui-code-snippet');

var Title = snippet.defineClass(/** @lends Title.prototype */ {
    /**
     * Title component.
     * @constructs Title
     * @param {object} params parameters
     *      @param {object} params.bound title bound
     *      @param {object} params.theme title theme
     *      @param {object} params.options title options
     *      @param {object} params.text title text content
     */
    init: function(params) {
        /**
         * Theme
         * @type {object}
         */
        this.theme = params.theme || {};

        /**
         * Title text content
         * @type {string}
         */
        this.titleText = params.text;

        /**
         * Relative offset position
         * @type {object}
         */
        this.offset = params.offset;

        /**
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(chartConst.COMPONENT_TYPE_RAPHAEL, 'title');

        /**
         * Drawing type
         * @type {string}
         */
        this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
    },

    /**
     * Render title component
     * @param {object} data data for render title
     */
    render: function(data) {
        this.titleSet = this._renderTitleArea(data.paper);
    },

    /**
     * Render title component
     * @param {object} data data for render title
     */
    resize: function(data) {
        var dimensionMap = data.dimensionMap;
        var legendWidth = dimensionMap.legend ? dimensionMap.legend.width : 0;
        var width = dimensionMap.series.width + legendWidth;
        this.graphRenderer.resize(width, this.titleSet);
    },

    /**
     * Render title component
     * @param {object} data data for render title
     */
    rerender: function(data) {
        this.titleSet.remove();

        this.render(data);
    },

    /**
     * Render title on given paper
     * @param {object} paper paper object
     * @returns {object} raphael paper
     * @private
     */
    _renderTitleArea: function(paper) {
        return this.graphRenderer.render(paper, this.titleText, this.offset, this.theme);
    }
});

/**
 * Factory for Title
 * @param {object} param parameter
 * @returns {object|null}
 * @ignore
 */
function titleFactory(param) {
    var options = param.chartOptions.chart || {title: {}};
    var title = null;

    if (options.title && options.title.text) {
        param.text = options.title.text;
        param.offset = options.title.offset;

        title = new Title(param);
    }

    return title;
}

titleFactory.componentType = 'title';
titleFactory.Title = Title;

module.exports = titleFactory;
