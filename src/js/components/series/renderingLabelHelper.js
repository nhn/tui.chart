/**
 * @fileoverview  renderingLabelHelper is helper for rendering of series label.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../../const');
var renderUtil = require('../../helpers/renderUtil');
var snippet = require('tui-code-snippet');

/**
 * renderingLabelHelper is helper for rendering of series label.
 * @module renderingLabelHelper
 * @private
 */
var renderingLabelHelper = {
    /**
     * Calculate left position for center align of series label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @returns {number}
     * @private
     */
    _calculateLeftPositionForCenterAlign: function(bound) {
        return bound.left + (bound.width / 2);
    },

    /**
     * Calculate top position for middle align of series label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @returns {number}
     * @private
     */
    _calculateTopPositionForMiddleAlign: function(bound) {
        return bound.top + (bound.height / 2);
    },

    /**
     * Make position for type of bound for rendering label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForBoundType: function(bound) {
        return {
            left: this._calculateLeftPositionForCenterAlign(bound),
            top: this._calculateTopPositionForMiddleAlign(bound)
        };
    },

    /**
     * Make position map for rendering label.
     * @param {SeriesItem} seriesItem - series itemyuio
     * @param {{left: number, top: number, width: number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {object} theme - theme for series label
     * @param {function} makePosition - function for making position of label
     * @returns {{end: *}}
     * @private
     */
    _makePositionMap: function(seriesItem, bound, labelHeight, theme, makePosition) {
        var value = seriesItem.value;
        var isOppositeSide = value >= 0;
        var positionMap = {
            end: makePosition(bound, labelHeight, seriesItem.endLabel || seriesItem.label, theme, isOppositeSide)
        };

        if (seriesItem.isRange) {
            isOppositeSide = value < 0;
            positionMap.start = makePosition(bound, labelHeight, seriesItem.startLabel, theme, isOppositeSide);
        }

        return positionMap;
    },

    /**
     * Bounds to label positions.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
     * @param {object} theme - theme for series label
     * @param {function} [makePosition] - function for making position of label
     * @param {boolean} [isPivot] - whether pivot or not
     * @returns {Array.<Object>}
     */
    boundsToLabelPositions: function(seriesDataModel, boundsSet, theme, makePosition, isPivot) {
        var self = this;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORD, theme);

        makePosition = makePosition || snippet.bind(this._makePositionForBoundType, this);
        isPivot = !!isPivot;

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var bounds = boundsSet[groupIndex];

            return seriesGroup.map(function(seriesItem, index) {
                var bound = bounds[index].end;

                return self._makePositionMap(seriesItem, bound, labelHeight, theme, makePosition);
            });
        }, isPivot);
    },

    /**
     * Make label position for bar chart.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {string} label - label
     * @param {object} theme - theme for series label
     * @param {boolean} isOppositeSide - whether opossite side or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForBarChart: function(bound, labelHeight, label, theme, isOppositeSide) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);
        var left = bound.left;

        if (isOppositeSide) {
            left += bound.width + chartConst.SERIES_LABEL_PADDING;
        } else {
            left -= labelWidth + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: left,
            top: this._calculateTopPositionForMiddleAlign(bound)
        };
    },

    /**
     * Bounds to label positions for bar chart.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
     * @param {object} theme - theme for series label
     * @returns {*|Array.<Object>|Array}
     */
    boundsToLabelPositionsForBarChart: function(seriesDataModel, boundsSet, theme) {
        var makePositionFunction = snippet.bind(this._makePositionForBarChart, this);

        return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
    },

    /**
     * Make label position for column chart.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {string} label - label
     * @param {object} theme - theme for series label
     * @param {boolean} isOppositeSide - whether opossite side or not
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForColumnChart: function(bound, labelHeight, label, theme, isOppositeSide) {
        var top = bound.top;

        if (isOppositeSide) {
            top -= labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: this._calculateLeftPositionForCenterAlign(bound),
            top: top
        };
    },

    /**
     * Bounds to label positions for column chart.
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number, width: number, height: number}>>} boundsSet - bounds set
     * @param {object} theme - theme for series label
     * @returns {*|Array.<Object>|Array}
     */
    boundsToLabelPositionsForColumnChart: function(seriesDataModel, boundsSet, theme) {
        var makePositionFunction = snippet.bind(this._makePositionForColumnChart, this);

        return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
    },

    /**
     * Make labels html for treemap chart.
     * @param {Array.<SeriesItem>} seriesItems - seriesItems
     * @param {object.<string, {left: number, top: number, width: number, height: number}>} boundMap - bound map
     * @returns {string}
     */
    boundsToLabelPostionsForTreemap: function(seriesItems, boundMap) {
        var self = this;
        var positions = snippet.map(seriesItems, function(seriesItem) {
            var bound = boundMap[seriesItem.id];
            var position;

            if (bound) {
                position = self._makePositionForBoundType(bound);
            }

            return position;
        });

        return positions;
    }
};

module.exports = renderingLabelHelper;
