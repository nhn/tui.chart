/**
 * @fileoverview  Title component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('../../helpers/domHandler');
var chartConst = require('../../const');
var pluginFactory = require('../../factories/pluginFactory');

var Title = tui.util.defineClass(/** @lends Title.prototype */ {
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
         * Title view className
         * @type {string}
         */
        this.className = 'tui-chart-title-area';

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
         * Graph renderer
         * @type {object}
         */
        this.graphRenderer = pluginFactory.get(params.options.libType || chartConst.DEFAULT_PLUGIN, 'title');
    },

    /**
     * Render title component
     * @returns {{
     *     container: HTMLElement,
     *     paper: object
     * }}
     */
    render: function() {
        var container = dom.create('DIV', this.className);

        this._renderTitleArea(container);

        return container;
    },

    /**
     * Render title on given paper
     * @param {HTMLElement} container title container element
     * @returns {object} raphael paper
     * @private
     */
    _renderTitleArea: function(container) {
        container.style.textAlign = 'center';

        return this.graphRenderer.render(container, this.titleText, this.theme);
    }
});

module.exports = Title;
