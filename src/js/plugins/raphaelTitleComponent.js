/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphael = window.Raphael;

var raphaelRenderUtil = require('./raphaelRenderUtil');

var RaphaelTitleComponent = tui.util.defineClass(/** @lends RaphaelTitleComponent.prototype */ {
    /**
     * Render title
     * @param {HTMLElement} container - title container
     * @param {string} titleText - title text
     * @param {object} theme - theme object
     * @returns {object} Raphael paper
     */
    render: function(container, titleText, theme) {
        var fontSize = theme.fontSize;
        var fontFamily = theme.fontFamily;
        var titleSize = raphaelRenderUtil.getRenderedTextSize(titleText, fontSize, fontFamily);
        var paper = raphael(container, titleSize.width, titleSize.height);
        var pos = {
            left: 0,
            top: titleSize.height / 2    // for renderText's baseline
        };

        raphaelRenderUtil.renderText(paper, pos, titleText, {
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'start'
        });

        return paper;
    }
});

module.exports = RaphaelTitleComponent;
