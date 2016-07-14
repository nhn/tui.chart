/**
 * @fileoverview  renderingLabelHelper is helper for rendering of series label.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var renderUtil = require('../helpers/renderUtil');
var seriesTemplate = require('./seriesTemplate');

/**
 * renderingLabelHelper is helper for rendering of series label.
 */
var renderingLabelHelper = {
    /**
     * Calculate left position for center align of series label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelWidth - label width
     * @returns {number}
     * @private
     */
    _calculateLeftPositionForCenterAlign: function(bound, labelWidth) {
        return bound.left + ((bound.width - labelWidth) / 2);
    },

    /**
     * Calculate top position for middle align of series label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @returns {number}
     * @private
     */
    _calculateTopPositionForMiddleAlign: function(bound, labelHeight) {
        return bound.top + ((bound.height - labelHeight + chartConst.TEXT_PADDING) / 2);
    },

    /**
     * Make position for type of bound for rendering label.
     * @param {{left: number, top: number, width:number, height: number}} bound - bound
     * @param {number} labelHeight - label height
     * @param {string} label - label
     * @param {object} theme - theme for series label
     * @returns {{left: number, top: number}}
     * @private
     */
    _makePositionForBoundType: function(bound, labelHeight, label, theme) {
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);

        return {
            left: this._calculateLeftPositionForCenterAlign(bound, labelWidth),
            top: this._calculateTopPositionForMiddleAlign(bound, labelHeight)
        };
    },

    /**
     * Make position map for rendering label.
     * @param {SeriesItem} seriesItem - series item
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
            end: makePosition(bound, labelHeight, seriesItem.endLabel, theme, isOppositeSide)
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
     * @returns {Array.<Object>}
     */
    boundsToLabelPositions: function(seriesDataModel, boundsSet, theme, makePosition) {
        var self = this;
        var labelHeight = renderUtil.getRenderedLabelHeight(chartConst.MAX_HEIGHT_WORLD, theme);

        makePosition = makePosition || tui.util.bind(this._makePositionForBoundType, this);

        return seriesDataModel.map(function(seriesGroup, groupIndex) {
            var bounds = boundsSet[groupIndex];

            return seriesGroup.map(function(seriesItem, index) {
                var bound = bounds[index].end;

                return self._makePositionMap(seriesItem, bound, labelHeight, theme, makePosition);
            });
        });
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
            top: this._calculateTopPositionForMiddleAlign(bound, labelHeight)
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
        var makePositionFunction = tui.util.bind(this._makePositionForBarChart, this);

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
        var labelWidth = renderUtil.getRenderedLabelWidth(label, theme);
        var top = bound.top;

        if (isOppositeSide) {
            top -= labelHeight + chartConst.SERIES_LABEL_PADDING;
        } else {
            top += bound.height + chartConst.SERIES_LABEL_PADDING;
        }

        return {
            left: this._calculateLeftPositionForCenterAlign(bound, labelWidth),
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
        var makePositionFunction = tui.util.bind(this._makePositionForColumnChart, this);

        return this.boundsToLabelPositions(seriesDataModel, boundsSet, theme, makePositionFunction);
    },

    /**
     * Make css text for series label.
     * @param {{left: number, top: number}} position - position for rendering label
     * @param {object} theme - theme for series label
     * @param {number} index - index of legends
     * @param {number} selectedIndex - selected index of legends
     * @param {object} [tplCssText] - cssText template object
     * @returns {*}
     * @private
     */
    _makeLabelCssText: function(position, theme, index, selectedIndex, tplCssText) {
        var cssObj = tui.util.extend(position, theme);

        tplCssText = tplCssText || seriesTemplate.tplCssText;

        if (tui.util.isExisty(selectedIndex) && (selectedIndex !== index)) {
            cssObj.opacity = renderUtil.makeOpacityCssText(chartConst.SERIES_LABEL_OPACITY);
        } else {
            cssObj.opacity = '';
        }

        return tplCssText(cssObj);
    },

    /**
     * Make html about series label.
     * @param {{left: number, top: number}} position - position for rendering label
     * @param {string} label - label of SeriesItem
     * @param {object} theme - theme for series label
     * @param {number} index - index of legends
     * @param {number} selectedIndex - selected index of legends
     * @param {object} [tplCssText] - cssText template object
     * @param {boolean} [isStart] - whether start label or not
     * @returns {string}
     */
    makeSeriesLabelHtml: function(position, label, theme, index, selectedIndex, tplCssText, isStart) {
        /*eslint max-params: [2, 7]*/
        var cssText = this._makeLabelCssText(position, theme, index, selectedIndex, tplCssText);
        var rangeLabelAttribute = '';

        if (isStart) {
            rangeLabelAttribute = ' data-range="true"';
        }
        return seriesTemplate.tplSeriesLabel({
            label: label,
            cssText: cssText,
            rangeLabelAttribute: rangeLabelAttribute
        });
    },

    /**
     * Make
     * @param {SeriesDataModel} seriesDataModel - series data model
     * @param {Array.<Array.<{left: number, top: number}>>} positionsSet - positions set
     * @param {object} theme - theme for series label
     * @param {number} selectedIndex - selected index of legends
     * @returns {*}
     */
    makeLabelsHtmlForBoundType: function(seriesDataModel, positionsSet, theme, selectedIndex) {
        var makeSeriesLabelHtml = tui.util.bind(this.makeSeriesLabelHtml, this);
        var labelsHtml = seriesDataModel.map(function(seriesGroup, groupIndex) {
            return seriesGroup.map(function(seriesItem, index) {
                var positionMap = positionsSet[groupIndex][index];
                var html = makeSeriesLabelHtml(positionMap.end, seriesItem.endLabel, theme, index, selectedIndex);

                if (positionMap.start) {
                    html += makeSeriesLabelHtml(positionMap.start, seriesItem.startLabel, theme, index, selectedIndex);
                }

                return html;
            }).join('');
        }).join('');

        return labelsHtml;
    }
};

module.exports = renderingLabelHelper;
