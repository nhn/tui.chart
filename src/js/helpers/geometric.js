/**
 * @fileoverview module for geometric operation
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

/**
 * Rotate a point around the origin with an angle.
 * @param {number} centerX center point x
 * @param {number} centerY center point y
 * @param {number} pointX point x to rotate
 * @param {number} pointY point y to rotate
 * @param {number} angle angle
 * @returns {object} x, y
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

module.exports = {
    rotatePointAroundOrigin: rotatePointAroundOrigin
};
