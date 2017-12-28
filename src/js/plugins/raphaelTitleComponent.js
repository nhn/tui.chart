/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var chartConst = require('./../const');
var snippet = require('tui-code-snippet');

var RaphaelTitleComponent = snippet.defineClass(/** @lends RaphaelTitleComponent.prototype */ {
    /**
     * Render title
     * @param {object} paper - paper
     * @param {string} titleText - title text
     * @param {{x: number, y: number}} offset - title offset x, y
     * @param {object} theme - theme object
     * @returns {Array.<object>} title set
     */
    render: function(paper, titleText, offset, theme) {
        var fontSize = theme.fontSize;
        var fontFamily = theme.fontFamily;
        var titleSize = raphaelRenderUtil.getRenderedTextSize(titleText, fontSize, fontFamily);
        var pos = {
            left: paper.width / 2,
            top: (titleSize.height + chartConst.TITLE_PADDING) / 2 // for renderText's baseline
        };
        var titleSet = paper.set();

        if (offset) {
            if (offset.x) {
                pos.left += offset.x;
            } else if (offset.y) {
                pos.top += offset.y;
            }
        }

        titleSet.push(raphaelRenderUtil.renderText(paper, pos, titleText, {
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'middle'
        }));

        return titleSet;
    },
    /**
     * Resize title component
     * @param {number} chartWidth chart width
     * @param {Array.<object>} titleSet title set
     */
    resize: function(chartWidth, titleSet) {
        titleSet.attr({
            x: chartWidth / 2
        });
    }
});

module.exports = RaphaelTitleComponent;
