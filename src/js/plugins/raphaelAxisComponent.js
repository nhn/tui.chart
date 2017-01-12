/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var HALF_PIXEL = 0.5;

var RaphaelAxisComponent = tui.util.defineClass(/** @lends RaphaelAxisComponent.prototype */ {
    /**
     * Render title
     * @param {string} textContent text content
     * @param {object} theme theme object
     * @param {object} paper raphael paper
     * @param {object} rotationInfo object
     * @param {number} size size
     */
    renderTitle: function(textContent, theme, paper, rotationInfo, size) {
        var fontSize = theme.fontSize;
        var fontFamily = theme.fontFamily;
        var titleSize = raphaelRenderUtil.getRenderedTextSize(textContent, fontSize, fontFamily);
        var centerPosition = (size + titleSize.width) / 2;
        var halfTextHeight = titleSize.height / 2;
        var attributes = {
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'start'
        };
        var positionTopAndLeft = {};

        attributes['text-anchor'] = 'middle';

        if (rotationInfo.isCenter) {
            positionTopAndLeft.top = paper.height - halfTextHeight;
            positionTopAndLeft.left = paper.width / 2;
        } else if (rotationInfo.isPositionRight) {
            attributes.transform = 'r90';

            positionTopAndLeft.top = centerPosition;
            positionTopAndLeft.left = paper.width - halfTextHeight;
        } else if (rotationInfo.isVertical) {
            attributes.transform = 'r-90';

            positionTopAndLeft.top = centerPosition;
            positionTopAndLeft.left = halfTextHeight;
        } else {
            positionTopAndLeft.top = paper.height - halfTextHeight;
            positionTopAndLeft.left = centerPosition;
        }

        raphaelRenderUtil.renderText(paper, positionTopAndLeft, textContent, attributes);
    },

    /**
     * Render Axis label
     * @param {object} data data for render label
     *       @param {{
     *           left: number,
     *           top: number
     *       }} data.positionTopAndLeft left, top positions
     *       @param {string} data.labelText label text
     *       @param {number} data.labelSize label size
     *       @param {object} data.paper raphael paper
     *       @param {boolean} data.isVertical boolean value of axis is vertical
     *       @param {boolean} data.isPositionRight boolean value of axis is right yAxis
     *       @param {object} data.theme theme of label
     */
    renderLabel: function(data) {
        var positionTopAndLeft = data.positionTopAndLeft;
        var labelText = data.labelText;
        var paper = data.paper;
        var isVertical = data.isVertical;
        var isPositionRight = data.isPositionRight;
        var theme = data.theme;
        var attributes = {
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color
        };

        if (isPositionRight) {
            attributes['text-anchor'] = 'start';
        } else if (isVertical) {
            attributes['text-anchor'] = 'end';
        } else {
            attributes['text-anchor'] = 'middle';
        }

        raphaelRenderUtil.renderText(paper, positionTopAndLeft, labelText, attributes);
    },

    /**
     * Render rotated Axis label
     * @param {object} data data for render rotated label
     *       @param {{
     *           left: number,
     *           top: number
     *       }} data.positionTopAndLeft left, top positions
     *       @param {string} data.labelText label text
     *       @param {object} data.paper raphael paper
     *       @param {boolean} data.isVertical boolean value of axis is vertical
     *       @param {object} data.theme theme of label
     *       @param {number} data.degree rotation degree
     */
    renderRotatedLabel: function(data) {
        var positionTopAndLeft = data.positionTopAndLeft;
        var labelText = data.labelText;
        var paper = data.paper;
        var theme = data.theme;
        var degree = data.degree;

        raphaelRenderUtil.renderText(paper, positionTopAndLeft, labelText, {
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'end',
            transform: 'r' + (-degree)
        });
    },

    /**
     * Render ticks on given paper
     * @param {object} data data for rendering ticks
     */
    renderTicks: function(data) {
        var paper = data.paper;
        var positions = data.positions;
        var additionalSize = data.additionalSize;
        var isVertical = data.isVertical;
        var isCenter = data.isCenter;
        var additionalWidth = data.additionalWidth;
        var additionalHeight = data.additionalHeight;
        var isPositionRight = data.isPositionRight;
        var tickColor = data.tickColor;

        tui.util.forEach(positions, function(position) {
            var pathString = 'M';

            position += additionalSize;

            if (isVertical) {
                if (isCenter) {
                    pathString += 0 + ',' + (position + additionalHeight - 1);
                    pathString += 'H' + 5;
                    pathString += 'M' + (paper.width - 5) + ',' + (position + additionalHeight - 1);
                    pathString += 'H' + paper.width;
                } else if (isPositionRight) {
                    pathString += 0 + ',' + (position + additionalHeight);
                    pathString += 'H' + 5;
                } else {
                    pathString += (paper.width - 5) + ',' + (position + additionalHeight - 1);
                    pathString += 'H' + paper.width;
                }
            } else {
                pathString += (position + additionalWidth) + ',0';
                pathString += 'V5';
            }

            if (!isNaN(position)) {
                paper.path(pathString).attr({
                    stroke: tickColor
                });
            }
        });
    },

    /**
     * Render tick line  on given paper
     * @param {number} data data for render tick line
     * @param {number} data.areaSize area size width or height
     * @param {object} data.paper raphael paper
     * @param {boolean} data.isNotDividedXAxis boolean value for XAxis divided or not
     * @param {number} data.additionalSize additional size for position and line length
     * @param {number} data.additionalWidth additional width of tick line paper
     * @param {number} data.additionalHeight additional height of tick line paper
     * @param {boolean} data.isPositionRight boolean value of right yAxis or not
     * @param {boolean} data.isCenter boolean value of center yAxis or not
     * @param {boolean} data.isVertical boolean value of vertical axis or not
     */
    renderTickLine: function(data) {
        var areaSize = data.areaSize;
        var lineSize = areaSize;
        var paper = data.paper;
        var isNotDividedXAxis = data.isNotDividedXAxis;
        var additionalSize = data.additionalSize;
        var additionalWidth = data.additionalWidth;
        var additionalHeight = data.additionalHeight;
        var isPositionRight = data.isPositionRight;
        var isCenter = data.isCenter;
        var isVertical = data.isVertical;
        var pathString = 'M';
        var verticalTickLineEndYCoord = lineSize + additionalHeight - 1;
        var lineStartYCoord, lineEndXCoord, lineEndYCoord;

        if (isPositionRight) {
            pathString += '0,' + (additionalHeight + 1);
            pathString += 'V' + verticalTickLineEndYCoord;
        } else if (isVertical) {
            lineStartYCoord = additionalHeight - HALF_PIXEL;
            pathString += (paper.width - HALF_PIXEL) + ',' + lineStartYCoord;

            if (isCenter) {
                pathString += 'V' + verticalTickLineEndYCoord;
                pathString += 'M' + HALF_PIXEL + ',' + lineStartYCoord;
                pathString += 'V' + verticalTickLineEndYCoord;
            } else {
                lineEndYCoord = lineSize - 1 + additionalHeight;
                pathString += 'V' + Math.round(lineEndYCoord);
            }
        } else {
            if (isNotDividedXAxis) {
                pathString += additionalWidth;
            } else {
                pathString += Math.round(additionalWidth + additionalSize);
            }
            pathString += ',' + HALF_PIXEL + 'H';

            lineEndXCoord = lineSize - 1 + additionalWidth;
            if (!isNotDividedXAxis) {
                lineEndXCoord += additionalSize;
            }
            pathString += Math.round(lineEndXCoord);
        }

        paper.path(pathString).attr({
            'stroke-width': 1,
            stroke: 'black'
        });
    }
});

module.exports = RaphaelAxisComponent;
