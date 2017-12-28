/**
 * @fileoverview module for geometric operation
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');

/**
 * Rotate a point around the origin with an angle.
 * @param {number} centerX center point x
 * @param {number} centerY center point y
 * @param {number} pointX point x to rotate
 * @param {number} pointY point y to rotate
 * @param {number} angle angle
 * @returns {object} x, y
 * @ignore
 */
function rotatePointAroundOrigin(centerX, centerY, pointX, pointY, angle) {
    var rad = angle * (Math.PI / 180);

    var newX = ((pointX - centerX) * Math.cos(rad)) - ((pointY - centerY) * Math.sin(rad));
    var newY = ((pointX - centerX) * Math.sin(rad)) + ((pointY - centerY) * Math.cos(rad));

    newX += centerX;
    newY += centerY;

    return {
        x: newX,
        y: newY
    };
}
/**
 * Calculate adjacent.
 * @param {number} degree degree
 * @param {number} hypotenuse hypotenuse
 * @returns {number} adjacent
 * @ignore
 *
 *   H : Hypotenuse
 *   A : Adjacent
 *   O : Opposite
 *   D : Degree
 *
 *        /|
 *       / |
 *    H /  | O
 *     /   |
 *    /\ D |
 *    -----
 *       A
 */
function calculateAdjacent(degree, hypotenuse) {
    return Math.cos(degree * chartConst.RAD) * hypotenuse;
}

/**
 * Calculate opposite.
 * @param {number} degree degree
 * @param {number} hypotenuse hypotenuse
 * @returns {number} opposite
 * @ignore
 */
function calculateOpposite(degree, hypotenuse) {
    return Math.sin(degree * chartConst.RAD) * hypotenuse;
}

/**
 * Calculate rotated width.
 * @param {number} degree - degree
 * @param {number} width - width
 * @param {number} height - height
 * @returns {number}
 * @ignore
 */
function calculateRotatedWidth(degree, width, height) {
    var centerHalf = calculateAdjacent(degree, width / 2);
    var sideHalf = calculateAdjacent(chartConst.ANGLE_90 - degree, height / 2);

    return (centerHalf + sideHalf) * 2;
}

/**
 * Calculate rotated height
 * @param {number} degree - degree
 * @param {number} width - width
 * @param {number} height - height
 * @returns {number}
 * @ignore
 */
function calculateRotatedHeight(degree, width, height) {
    var centerHalf = calculateOpposite(degree, width / 2);
    var sideHalf = calculateOpposite(chartConst.ANGLE_90 - degree, height / 2);

    return (centerHalf + sideHalf) * 2;
}

module.exports = {
    rotatePointAroundOrigin: rotatePointAroundOrigin,
    calculateAdjacent: calculateAdjacent,
    calculateRotatedHeight: calculateRotatedHeight,
    calculateRotatedWidth: calculateRotatedWidth,
    calculateOpposite: calculateOpposite
};
