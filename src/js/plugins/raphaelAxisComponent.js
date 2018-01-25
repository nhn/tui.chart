/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var raphaelRenderUtil = require('./raphaelRenderUtil');
var AXIS_BACKGROUND_RIGHT_PADDING = 4;
var snippet = require('tui-code-snippet');

var RaphaelAxisComponent = snippet.defineClass(/** @lends RaphaelAxisComponent.prototype */ {
    init: function() {
        this.ticks = [];
    },

    /**
     * Render background with plot background color
     * @param {object} paper Raphael paper
     * @param {object} position axis position
     * @param {object} dimension axis dimension
     * @param {object} theme chart theme
     * @returns {Element} - raphael <rect> element
     * @private
     */
    renderBackground: function(paper, position, dimension, theme) {
        var background = ((theme && theme.background) || {});
        var fillColor = (background.color || '#fff');
        var opacity = (background.opacity || 1);

        return raphaelRenderUtil.renderRect(paper, {
            left: 0,
            top: position.top,
            width: dimension.width + position.left - AXIS_BACKGROUND_RIGHT_PADDING,
            height: dimension.height
        }, {
            fill: fillColor,
            opacity: opacity,
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
        var theme = data.theme;
        var attributes = {
            'dominant-baseline': 'auto',
            'font-family': theme.fontFamily,
            'font-size': theme.fontSize,
            'font-weight': theme.fontWeight,
            fill: theme.color,
            'text-anchor': 'middle'
        };
        var position = this.calculatePosition(paper, data);
        var title;

        attributes.transform = getCSSTransform(data.rotationInfo, position);
        title = raphaelRenderUtil.renderText(paper, position, data.text, attributes);

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
        var isContainDivensionArea = function(position) {
            var compareType = isVertical ? 'height' : 'width';

            return (position > layout.dimension[compareType]);
        };

        snippet.forEach(positions, function(position) {
            var pathString = 'M';

            position += additionalSize;

            if (isContainDivensionArea(position)) {
                return;
            }

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
        var tickColor = data.tickColor;
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
            stroke: tickColor
        }));
    },

    /**
     * Animate ticks for adding data
     * @param {number} tickSize tick size of moving
     */
    animateForAddingData: function(tickSize) {
        snippet.forEach(this.ticks, function(tick) {
            tick.animate({
                transform: 't-' + tickSize + ',0'
            }, 300);
        });
    },

    /**
     * Calculate axis title position, and transforma
     * @param {Raphael.paper} paper - paper
     * @param {object} data - options for calcultating title position
     *  @param {object} data.rotationInfo - isCenter, isVertical, isPositionRight
     *  @param {object} data.text - text
     *  @param {object} data.theme - theme
     *  @param {object} data.layout - layout
     * @returns {object} position - top, left
     */
    calculatePosition: function(paper, data) {
        var rotationInfo = data.rotationInfo;
        var textHeight = getTextHeight(data.text, data.theme);
        var layout = data.layout;
        var centerPosition = calculateCenterPosition(
            rotationInfo.isVertical, layout.dimension, layout.position
        );
        var position = {};

        if (rotationInfo.isCenter) {
            position.top = paper.height - (textHeight / 2);
            position.left = layout.position.left + (layout.dimension.width / 2);
        } else if (rotationInfo.isPositionRight) {
            position.top = centerPosition;
            position.left = layout.position.left + layout.dimension.width;
        } else if (rotationInfo.isVertical) {
            position.top = centerPosition;
            position.left = layout.position.left + (textHeight / 2);
        } else {
            position.top = layout.position.top + layout.dimension.height;
            position.left = centerPosition;
        }

        if (!rotationInfo.isCenter) {
            addOffset(position, data.offset);
        }

        return position;
    }
});

/**
 * Get a text height by theme
 * @param {string} text - text
 * @param {object} theme - axis theme
 * @returns {number} text height
 * @ignore
 */
function getTextHeight(text, theme) {
    var titleSize = raphaelRenderUtil.getRenderedTextSize(text, theme.fontSize, theme.fontFamily);

    return titleSize.height;
}

/**
 * Test axis title need to rotate
 * @param {object} rotationInfo - rotationInfo
 * @returns {boolean} - whether it needs to rotate
 * @ignore
 */
function doesTitleRotate(rotationInfo) {
    if (snippet.isExisty(rotationInfo.rotateTitle)) {
        return rotationInfo.rotateTitle === true;
    }

    return true;
}

/**
 * Calculate center position
 * @param {boolean} isVertical - is vertical axis
 * @param {object} dimension - width, height
 * @param {object} position - top, left
 * @returns {number} - center position
 * @ignore
 */
function calculateCenterPosition(isVertical, dimension, position) {
    var size = isVertical ? dimension.height : dimension.width;
    var margin = isVertical ? position.top : position.left;

    return (size / 2) + margin;
}

/**
 * Add offset to position
 * @param {object} position - top, left
 * @param {object} offset - x, y
 * @ignore
 */
function addOffset(position, offset) {
    if (!offset) {
        return;
    }

    if (offset.x) {
        position.left += offset.x;
    }
    if (offset.y) {
        position.top += offset.y;
    }
}

/**
 * Get transform by rotation info
 * @param {object} rotationInfo - isCenter, isVertical, isPositionRight
 * @param {object} position - top, left
 * @returns {string} css transform
 * @ignore
 */
function getCSSTransform(rotationInfo, position) {
    var transform = 'none';
    if (rotationInfo.isPositionRight) {
        transform = 'r90,' + position.left + ',' + position.top;
    } else if (rotationInfo.isVertical && doesTitleRotate(rotationInfo)) {
        transform = 'r-90,' + position.left + ',' + position.top;
    }

    return transform;
}

module.exports = RaphaelAxisComponent;
