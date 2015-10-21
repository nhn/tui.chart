/**
 * @fileoverview LineTypeCoordinateEventMixer is mixer for coordinate event.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var Series = require('./series'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    calculator = require('../helpers/calculator');
/**
 * @classdesc  LineTypeCoordinateEventMixer is mixer for coordinate event.
 * @class LineTypeCoordinateEventMixer
 * @mixin
 */
var LineTypeCoordinateEventMixer = ne.util.defineClass(Series, /** @lends LineTypeCoordinateEventMixer.prototype */ {
    /**
     * Initialize coordinate event.
     */
    initCoordinateEvent: function() {
        this.coordinateData = this._makeCoordinateData(this.bound.dimension, this.data.xTickCount, this.seriesData);
    },

    /**
     * To make tick groups.
     * @param {number} tickCount tick count
     * @param {number} width width
     * @returns {array.<{min: number, max: number}>} tick groups
     * @private
     */
    _makeTickGroups: function(tickCount, width) {
        var tickInterval = width / (tickCount - 1),
            halfInterval = tickInterval / 2;
        return ne.util.map(ne.util.range(0, tickCount), function(index) {
            return {
                min: ne.util.max([0, index * tickInterval - halfInterval]),
                max: ne.util.min([width, index * tickInterval + halfInterval])
            };
        });
    },

    /**
     * To make coordinate data.
     * @param {{width: number, height: number}} dimension dimension
     * @param {number} tickCount tick count
     * @param {array.<array.<{left: number, top: number}>>} seriesData series data
     * @returns {{groups: (array.<{min: number, max: number}>), items: (array.<array.<{left: number, top: number}>>)}} coordinate data
     * @private
     */
    _makeCoordinateData: function(dimension, tickCount, seriesData) {
        var tickGroups = this._makeTickGroups(tickCount, dimension.width),
            tickItems = calculator.arrayPivot(seriesData.groupPositions);
        return {
            groups: tickGroups,
            items: tickItems
        };
    },

    /**
     * Render coordinate area.
     * @param {HTMLElement} container container
     * @param {{width: number, height: number}} dimension dimension
     * @returns {HTMLElement} coordinate area element
     * @private
     */
    _renderCoordinateArea: function(container, dimension) {
        var elCoordinateArea = dom.create('DIV', 'ne-chart-series-coordinate-area');
        renderUtil.renderDimension(elCoordinateArea, dimension);
        dom.append(container, elCoordinateArea);
        return elCoordinateArea;
    },

    /**
     * Render coordinate event.
     * @param {HTMLElement} container container
     */
    renderCoordinateEvent: function(container) {
        var elCoordinateArea = this._renderCoordinateArea(container, this.bound.dimension);
        this.attachEvent(elCoordinateArea);
    },

    /**
     * Find group index.
     * @param {number} layerX mouse position
     * @returns {number} group index
     * @private
     */
    _findGroupIndex: function(layerX) {
        var foundIndex = -1;
        ne.util.forEachArray(this.coordinateData.groups, function(scale, index) {
            if (scale.min < layerX && scale.max >= layerX) {
                foundIndex = index;
                return false;
            }
        });

        return foundIndex;
    },

    /**
     * Find index.
     * @param {number} groupIndex group index
     * @param {number} layerY mouse position
     * @returns {number} index
     * @private
     */
    _findIndex: function(groupIndex, layerY) {
        var foundIndex = -1,
            diff = 1000;
        ne.util.forEach(this.coordinateData.items[groupIndex], function(position, index) {
            var compare = Math.abs(layerY - position.top);
            if (diff > compare) {
                diff = compare;
                foundIndex = index;
            }
        });
        return foundIndex;
    },

    /**
     * Find indexes
     * @param {number} layerX mouse position
     * @param {number} layerY mouse position
     * @returns {{groupIndex: (number), index: (number)}} indexes
     * @private
     */
    _findIndexes: function(layerX, layerY) {
        var groupIndex = this._findGroupIndex(layerX);
        return {
            groupIndex: groupIndex,
            index: this._findIndex(groupIndex, layerY)
        };
    },

    /**
     * Whether changed or not.
     * @param {{groupIndex: number, index: number}} indexes indexes
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(indexes) {
        var prevIndexes = this.prevIndexes;

        this.prevIndexes = indexes;

        return !prevIndexes || prevIndexes.groupIndex !== indexes.groupIndex || prevIndexes.index !== indexes.index;
    },

    /**
     * On mouseover.
     * @param {object} e event object
     */
    onMouseover: function() {},

    /**
     * On mousemove.
     * @param {object} e event object
     */
    onMousemove: function(e) {
        var elTarget = e.target || e.srcElement,
            bound = elTarget.getBoundingClientRect(),
            layerX = e.clientX - bound.left,
            layerY = e.clientY - bound.top,
            indexes = this._findIndexes(layerX, layerY),
            prevIndexes = this.prevIndexes;

        if (indexes.groupIndex === -1 || indexes.index === -1) {
            if (prevIndexes) {
                this.outCallback();
            }
            return;
        }

        if (!this._isChanged(indexes)) {
            return;
        }

        if (prevIndexes) {
            this.outCallback();
        }

        this.prevIndexes = indexes;
        this.inCallback(this._getBound(indexes.groupIndex, indexes.index), indexes.groupIndex, indexes.index);
    },

    /**
     * On mouseout.
     * @param {object} e event object
     */
    onMouseout: function() {
        delete this.prevIndexes;
        this.outCallback();
    }
});

LineTypeCoordinateEventMixer.mixin = function(func) {
    ne.util.extend(func, LineTypeCoordinateEventMixer.prototype);
};

module.exports = LineTypeCoordinateEventMixer;
