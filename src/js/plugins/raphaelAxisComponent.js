/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');

var RaphaelAxisComponent = tui.util.defineClass(/** @lends RaphaelAxisComponent.prototype */ {
    init: function() {
        this.ticks = [];
    },

    /**
     * Render background with plot background color
     * @param {object} paper Raphael paper
     * @param {object} position axis position
     * @param {object} dimension axis dimension
     * @private
     */
    renderBackground: function(paper, position, dimension) {
        raphaelRenderUtil.renderRect(paper, {
            left: position.left - 5,
            top: position.top,
            width: dimension.width,
            height: dimension.height
        }, {
            fill: '#fff',
            'stroke-width': 0
        });
    },

    /**
     * Render title
     * @param {object} paper raphael paper
     * @param {object} data rendering data
     * @param {string} data.text text content
     * @param {object} data.theme theme object
     * @param {object} data.rotationInfo object
     * @param {object} data.layout dimension and position
     */
    renderTitle: function(paper, data) {
        var fontSize = data.theme.fontSize;
        var fontFamily = data.theme.fontFamily;
        var titleSize = raphaelRenderUtil.getRenderedTextSize(data.text, fontSize, fontFamily);
        var size = data.rotationInfo.isVertical ? data.layout.dimension.height : data.layout.dimension.width;
        var position = data.rotationInfo.isVertical ? data.layout.position.top : data.layout.position.left;
        var centerPosition = (size / 2) + position;
        var textHeight = titleSize.height;
        var rotateTitle = !tui.util.isExisty(data.rotationInfo.rotateTitle) || data.rotationInfo.rotateTitle === true;
        var attributes = {
            'dominant-baseline': 'auto',
            'font-family': data.theme.fontFamily,
            'font-size': data.theme.fontSize,
            'font-weight': data.theme.fontWeight,
            fill: data.theme.color,
            'text-anchor': 'start'
        };
        var positionTopAndLeft = {};
        var title;

        attributes['text-anchor'] = 'middle';

        if (data.rotationInfo.isCenter) {
            positionTopAndLeft.top = paper.height - (textHeight / 2);
            positionTopAndLeft.left = data.layout.position.left + (data.layout.dimension.width / 2);
        } else if (data.rotationInfo.isPositionRight) {
            positionTopAndLeft.top = centerPosition;
            positionTopAndLeft.left = data.layout.position.left + data.layout.dimension.width - textHeight;
            attributes.transform = 'r90,' + positionTopAndLeft.left + ',' + positionTopAndLeft.top;
        } else if (data.rotationInfo.isVertical) {
            positionTopAndLeft.top = centerPosition;
            positionTopAndLeft.left = data.layout.position.left + textHeight;
            attributes.transform = rotateTitle ? ('r-90,' + positionTopAndLeft.left + ',' + positionTopAndLeft.top) : '';
        } else {
            positionTopAndLeft.top = paper.height - textHeight;
            positionTopAndLeft.left = centerPosition;
        }

        title = raphaelRenderUtil.renderText(paper, positionTopAndLeft, data.text, attributes);

        title.node.style.userSelect = 'none';
        title.node.style.cursor = 'default';

        data.set.push(title);
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
            'dominant-baseline': 'central',
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color
        };
        var textObj;

        if (isPositionRight) {
            attributes['text-anchor'] = 'start';
        } else if (isVertical) {
            attributes['text-anchor'] = 'end';
        } else {
            attributes['text-anchor'] = 'middle';
        }

        textObj = raphaelRenderUtil.renderText(paper, positionTopAndLeft, labelText, attributes);

        textObj.node.style.userSelect = 'none';
        textObj.node.style.cursor = 'default';

        data.set.push(textObj);
        this.ticks.push(textObj);
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
        var textObj = raphaelRenderUtil.renderText(paper, positionTopAndLeft, labelText, {
            'dominant-baseline': 'central',
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'end',
            transform: 'r' + (-data.degree) + ',' + (positionTopAndLeft.left + 20) + ',' + (positionTopAndLeft.top)
        });

        textObj.node.style.userSelect = 'none';
        textObj.node.style.cursor = 'arrow';

        data.set.push(textObj);
        this.ticks.push(textObj);
    },

    /**
     * Render ticks on given paper
     * @param {object} data data for rendering ticks
     */
    renderTicks: function(data) {
        var self = this;
        var paper = data.paper;
        var positions = data.positions;
        var additionalSize = data.additionalSize;
        var isVertical = data.isVertical;
        var isCenter = data.isCenter;
        var isPositionRight = data.isPositionRight;
        var tickColor = data.tickColor;
        var layout = data.layout;
        var rightEdgeOfAxis = layout.position.left + layout.dimension.width;
        var baseTop = layout.position.top;
        var baseLeft = layout.position.left;
        var tick;

        tui.util.forEach(positions, function(position) {
            var pathString = 'M';

            position += additionalSize;

            if (isVertical) {
                if (isCenter) {
                    pathString += baseLeft + ',' + (baseTop + position);
                    pathString += 'H' + (baseLeft + 5);

                    pathString += 'M' + rightEdgeOfAxis + ',' + (baseTop + position);
                    pathString += 'H' + (rightEdgeOfAxis - 5);
                } else if (isPositionRight) {
                    pathString += baseLeft + ',' + (baseTop + position);
                    pathString += 'H' + (baseLeft + 5);
                } else {
                    pathString += rightEdgeOfAxis + ',' + (baseTop + position);
                    pathString += 'H' + (rightEdgeOfAxis - 5);
                }
            } else {
                pathString += (baseLeft + position) + ',' + baseTop;
                pathString += 'V' + (baseTop + 5);
            }

            if (!isNaN(position)) {
                tick = paper.path(pathString).attr({
                    stroke: tickColor
                });
                data.set.push(tick);
                self.ticks.push(tick);
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
        var layout = data.layout;
        var isNotDividedXAxis = data.isNotDividedXAxis;
        var additionalSize = data.additionalSize;
        var isPositionRight = data.isPositionRight;
        var isCenter = data.isCenter;
        var isVertical = data.isVertical;
        var pathString = 'M';
        var baseTop = layout.position.top;
        var baseLeft = layout.position.left;
        var verticalTickLineEndYCoord = layout.dimension.height + baseTop;
        var rightEdgeOfAxis = baseLeft + layout.dimension.width;
        var lineStartYCoord, lineEndXCoord, lineEndYCoord;

        if (isPositionRight) {
            pathString += baseLeft + ',' + baseTop;
            pathString += 'V' + verticalTickLineEndYCoord;
        } else if (isVertical) {
            lineStartYCoord = baseTop;
            pathString += rightEdgeOfAxis + ',' + lineStartYCoord;

            if (isCenter) {
                pathString += 'V' + verticalTickLineEndYCoord;
                pathString += 'M' + baseLeft + ',' + lineStartYCoord;
                pathString += 'V' + verticalTickLineEndYCoord;
            } else {
                lineEndYCoord = baseTop + lineSize;
                pathString += 'V' + lineEndYCoord;
            }
        } else {
            if (isNotDividedXAxis) {
                pathString += baseLeft;
            } else {
                pathString += (baseLeft + additionalSize);
            }
            pathString += ',' + baseTop + 'H';

            lineEndXCoord = (baseLeft + lineSize);

            if (!isNotDividedXAxis) {
                lineEndXCoord += additionalSize;
            }
            pathString += lineEndXCoord;
        }

        data.set.push(paper.path(pathString).attr({
            'stroke-width': 1,
            stroke: 'black'
        }));
    },

    /**
     * Animate ticks for adding data
     * @param {number} tickSize tick size of moving
     */
    animateForAddingData: function(tickSize) {
        tui.util.forEach(this.ticks, function(tick) {
            tick.animate({
                transform: 't-' + tickSize + ',0'
            }, 300);
        });
    }
});

module.exports = RaphaelAxisComponent;
