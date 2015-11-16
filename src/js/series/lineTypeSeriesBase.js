/**
 * @fileoverview LineTypeSeriesBase is base class for line type series.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil');
/**
 * @classdesc LineTypeSeriesBase is base class for line type series.
 * @class LineTypeSeriesBase
 * @mixin
 */
var LineTypeSeriesBase = tui.util.defineClass(/** @lends LineTypeSeriesBase.prototype */ {
    /**
     * To make positions of line chart.
     * @param {{width: number, height:nunber}} dimension line chart dimension
     * @returns {array.<array.<object>>} positions
     */
    makePositions: function(dimension) {
        var groupValues = this.percentValues,
            width = dimension.width,
            height = dimension.height,
            len = groupValues[0].length,
            start = chartConst.SERIES_EXPAND_SIZE,
            step, result;

        if (this.data.aligned) {
            step = width / (len - 1);
        } else {
            step = width / len;
            start += (step / 2);
        }

        result = tui.util.map(groupValues, function(values) {
            return tui.util.map(values, function(value, index) {
                return {
                    left: start + (step * index),
                    top: height - (value * height)
                };
            });
        });
        this.groupPositions = result;
        return result;
    },

    /**
     * Render series label.
     * @param {object} params parameters
     *      @param {HTMLElement} params.container container
     *      @param {array.<array>} params.groupPositions group positions
     *      @param {array.<array>} params.formattedValues formatted values
     * @return {HTMLElement} series area element
     * @private
     */
    _renderSeriesLabel: function(params) {
        var groupPositions, labelHeight, elSeriesLabelArea, html;

        if (!this.options.showLabel) {
            return null;
        }
        groupPositions = params.groupPositions;
        labelHeight = renderUtil.getRenderedLabelHeight(params.formattedValues[0][0], this.theme.label);
        elSeriesLabelArea = dom.create('div', 'tui-chart-series-label-area');

        html = tui.util.map(params.formattedValues, function(values, groupIndex) {
            return tui.util.map(values, function(value, index) {
                var position = groupPositions[groupIndex][index],
                    labelWidth = renderUtil.getRenderedLabelWidth(value, this.theme.label),
                    labelHtml = this.makeSeriesLabelHtml({
                        left: position.left - (labelWidth / 2),
                        top: position.top - labelHeight - chartConst.SERIES_LABEL_PADDING
                    }, value, index, groupIndex);
                return labelHtml;
            }, this).join('');
        }, this).join('');

        elSeriesLabelArea.innerHTML = html;
        params.container.appendChild(elSeriesLabelArea);

        return elSeriesLabelArea;
    },

    /**
     * Get bound.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {{left: number, top: number}} bound
     * @private
     */
    _getBound: function(groupIndex, index) {
        return this.groupPositions[index][groupIndex];
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

        if (!this.tickItems) {
            this.tickItems = tui.util.pivot(this.groupPositions);
        }

        tui.util.forEach(this.tickItems[groupIndex], function(position, index) {
            var compare = Math.abs(layerY - position.top);
            if (diff > compare) {
                diff = compare;
                foundIndex = index;
            }
        });
        return foundIndex;
    },

    /**
     * Whether changed or not.
     * @param {number} groupIndex group index
     * @param {number} index index
     * @returns {boolean} whether changed or not
     * @private
     */
    _isChanged: function(groupIndex, index) {
        var prevIndexes = this.prevIndexes;

        this.prevIndexes = {
            groupIndex: groupIndex,
            index: index
        };

        return !prevIndexes || (prevIndexes.groupIndex !== groupIndex) || (prevIndexes.index !== index);
    },

    /**
     * On over tick sector.
     * @param {number} groupIndex groupIndex
     * @param {number} layerY layerY
     */
    onLineTypeOverTickSector: function(groupIndex, layerY) {
        var index;

        index = this._findIndex(groupIndex, layerY);

        if (!this._isChanged(groupIndex, index)) {
            return;
        }

        this.inCallback(this._getBound(groupIndex, index), groupIndex, index);
    },

    /**
     * On out tick sector.
     */
    onLineTypeOutTickSector: function() {
        delete this.prevIndexes;
        this.outCallback();
    }
});

LineTypeSeriesBase.mixin = function(func) {
    tui.util.extend(func.prototype, LineTypeSeriesBase.prototype);
};

module.exports = LineTypeSeriesBase;
