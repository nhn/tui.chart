/**
 * @fileoverview This is base model.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

/**
 * @classdesc Model is parent of all model.
 * @class
 */
var Model = ne.util.defineClass({
    /**
     * Get scale step.
     * @param {object} scale axis scale
     * @param {number} count value count
     * @returns {number} scale step
     */
    getScaleStep: function(scale, count) {
        return (scale.max - scale.min) / (count - 1);
    },

    /**
     * Makes pixel type tick positions.
     * @param {number} size area width or height
     * @param {number} count tick count
     * @returns {array} positions
     */
    makePixelPositions: function(size, count) {
        var positions = [],
            pxScale, pxStep;

        if (count > 0) {
            pxScale = {min: 0, max: size - 1};
            pxStep = this.getScaleStep(pxScale, count);
            positions = ne.util.map(ne.util.range(0, size, pxStep), function(position) {
                return Math.round(position);
            });
            positions[positions.length - 1] = size - 1;
        }

        return positions;
    }
});

module.exports = Model;