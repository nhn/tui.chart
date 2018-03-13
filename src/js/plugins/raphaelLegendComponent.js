/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var raphaelRenderUtil = require('../plugins/raphaelRenderUtil');
var arrayUtil = require('../helpers/arrayUtil');
var snippet = require('tui-code-snippet');

var UNSELECTED_LEGEND_LABEL_OPACITY = 0.5;
var RaphaelLegendComponent;

/**
 * Get sum of icon and left padding width
 * @returns {number} - icon and left padding width
 * @ignore
 */
function getIconWidth() {
    return chartConst.LEGEND_ICON_WIDTH + chartConst.LEGEND_LABEL_LEFT_PADDING;
}

RaphaelLegendComponent = snippet.defineClass(/** @lends RaphaelLegendComponent.prototype */ {

    init: function() {
        /**
         * @type {number}
         * @private
         */
        this._checkBoxWidth = 0;
        /**
         * @type {number}
         * @private
         */
        this._checkBoxHeight = 0;
        /**
         * @type {number}
         * @private
         */
        this._iconHeight = 0;
        /**
         * @type {number}
         * @private
         */
        this._legendItemHeight = 0;
        /**
         * @type {number}
         * @private
         */
        this._currentPageCount = 1;
        /**
         * @type {boolean}
         * @private
         */
        this._showCheckbox = true;
    },

    /**
     * @param {Array.<object>} legendData Array of legend item data
     * @private
     */
    _renderLegendItems: function(legendData) {
        var self = this;
        var labelPaddingLeft = chartConst.LEGEND_LABEL_LEFT_PADDING;
        var position = snippet.extend({}, this.basePosition);

        snippet.forEach(legendData, function(legendDatum, index) {
            var iconType = legendDatum.iconType;
            var legendIndex = legendDatum.index;
            var legendColor = legendDatum.colorByPoint ? '#aaa' : legendDatum.theme.color;
            var isUnselected = legendDatum.isUnselected;
            var labelHeight = legendDatum.labelHeight;
            var checkboxData = legendDatum.checkbox;
            var predicatedLegendWidth = position.left + self._calculateSingleLegendWidth(legendIndex, iconType);
            var isNeedBreakLine = (predicatedLegendWidth >= self.paper.width);

            if (self.isHorizontal && isNeedBreakLine) {
                position.top += (self._legendItemHeight + chartConst.LABEL_PADDING_TOP);
                position.left = self.basePosition.left;
            }

            if (self._showCheckbox) {
                self._renderCheckbox(position, {
                    isChecked: checkboxData.checked,
                    legendIndex: legendIndex,
                    legendSet: self.legendSet
                });

                position.left += (self._checkBoxWidth + labelPaddingLeft);
            }

            self._renderIcon(position, {
                legendColor: legendColor,
                iconType: iconType,
                labelHeight: labelHeight,
                isUnselected: isUnselected,
                legendIndex: legendIndex,
                legendSet: self.legendSet
            });

            position.left += chartConst.LEGEND_ICON_WIDTH + labelPaddingLeft;

            self._renderLabel(position, {
                labelText: legendDatum.label,
                labelHeight: labelHeight,
                isUnselected: isUnselected,
                legendIndex: legendIndex,
                legendSet: self.legendSet
            });

            if (self.isHorizontal) {
                position.left += self.labelWidths[index] + labelPaddingLeft;
            } else {
                position.left = self.basePosition.left;
                position.top += self._legendItemHeight + chartConst.LINE_MARGIN_TOP;
            }
        });
    },

    /**
     * @param {Array.<object>} legendData Array of legend item data
     * @param {number} sliceIndex slice index of
     * @returns {Array.<object>}
     * @private
     */
    _getLegendData: function(legendData, sliceIndex) {
        var positionTop = this.basePosition.top;
        var totalHeight = this.dimension.height;
        var chartHeight = this.paper.height;
        var resultLegendData = legendData;
        var pageHeight, singleItemHeight, visibleItemCount;

        if (!this.isHorizontal && totalHeight + (positionTop * 2) > chartHeight) {
            pageHeight = chartHeight - (positionTop * 2);
            this._legendItemHeight = Math.max(legendData[0].labelHeight, chartConst.LEGEND_ICON_HEIGHT);
            singleItemHeight = (this._legendItemHeight + chartConst.LINE_MARGIN_TOP);

            visibleItemCount = Math.floor(pageHeight / singleItemHeight);

            resultLegendData = legendData.slice((sliceIndex - 1) * visibleItemCount, sliceIndex * visibleItemCount);
        }

        return resultLegendData;
    },

    /**
     * Render legend
     * @param {object} data rendering data
     *     @param {HTMLElement} data.container legend container
     *     @param {Array.<object>} data.legendData rendering legendData
     *     @param {boolean} data.isHorizontal boolean value of horizontal or not
     *     @param {{height:number, width:number}} data.dimension legend dimension
     *     @param {object} data.labelTheme legend label theme object
     *     @param {number} data.labelWidths label widths
     *     @param {object} data.eventBus event bus
     * @returns {object} paper
     */
    render: function(data) {
        var legendData, legendHeight;

        this.eventBus = data.eventBus;
        this.paper = data.paper;
        this.dimension = data.dimension;
        this.legendSet = this.paper.set();
        this.labelWidths = data.labelWidths;
        this.labelTheme = data.labelTheme;
        this.basePosition = data.position;
        this.isHorizontal = data.isHorizontal;
        this.originalLegendData = data.legendData;

        if (this.originalLegendData.length) {
            this._showCheckbox = snippet.isExisty(data.legendData[0].checkbox);
            this._setComponentDimensionsBaseOnLabelHeight(data.legendData[0].labelHeight);

            legendData = this._getLegendData(data.legendData, this._currentPageCount);

            this._renderLegendItems(legendData);

            if (!this.isHorizontal && legendData && legendData.length < data.legendData.length) {
                legendHeight = this.paper.height - (this.basePosition.top * 2);

                this.availablePageCount = Math.ceil(data.dimension.height / legendHeight);

                this._renderPaginationArea(this.basePosition, {
                    width: data.dimension.width,
                    height: legendHeight
                });
            }
        }

        return this.legendSet;
    },

    /**
     * @param {string} direction direction string of paginate 'next' or 'previous'
     * @private
     */
    _paginateLegendAreaTo: function(direction) {
        var pageNumber = this._currentPageCount;

        this._removeLegendItems();

        if (direction === 'next') {
            pageNumber += 1;
        } else {
            pageNumber -= 1;
        }

        this._renderLegendItems(this._getLegendData(this.originalLegendData, pageNumber));
    },

    _removeLegendItems: function() {
        this.legendSet.forEach(function(legendItem) {
            snippet.forEach(legendItem.events, function(event) {
                event.unbind();
            });
            legendItem.remove();
        });
    },

    /**
     * @param {{top: number, left: number}} position legend area position
     * @param {{height: number, width: number}} dimension legend area dimension
     * @private
     */
    _renderPaginationArea: function(position, dimension) {
        var self = this;
        var BUTTON_WIDTH = chartConst.LEGEND_PAGINATION_BUTTON_WIDTH;
        var BUTTON_PADDING_LEFT = chartConst.LEGEND_PAGINATION_BUTTON_PADDING_LEFT;
        var controllerPositionTop = position.top + dimension.height - chartConst.CHART_PADDING;
        var controllerPositionLeft = position.left - chartConst.CHART_PADDING;
        var rightButtonPositionLeft = controllerPositionLeft + dimension.width - BUTTON_WIDTH;
        var leftButtonPositionLeft = rightButtonPositionLeft - (BUTTON_PADDING_LEFT + BUTTON_WIDTH);
        var lowerArrowPath = ['M', rightButtonPositionLeft, ',', (controllerPositionTop + 3),
            'L', (rightButtonPositionLeft + 5), ',', (controllerPositionTop + 8),
            'L', (rightButtonPositionLeft + 10), ',', (controllerPositionTop + 3)].join('');
        var upperArrowPath = ['M', leftButtonPositionLeft, ',', (controllerPositionTop + 8),
            'L', (leftButtonPositionLeft + 5), ',', (controllerPositionTop + 3),
            'L', (leftButtonPositionLeft + 10), ',', (controllerPositionTop + 8)].join('');

        this.upperButton = raphaelRenderUtil.renderLine(this.paper, upperArrowPath, '#555', 3);
        this.lowerButton = raphaelRenderUtil.renderLine(this.paper, lowerArrowPath, '#555', 3);

        this.upperButton.click(function() {
            if (self._currentPageCount > 1) {
                self._paginateLegendAreaTo('previous');
                self._currentPageCount -= 1;
            }
        });

        this.lowerButton.click(function() {
            if (self._currentPageCount < self.availablePageCount) {
                self._paginateLegendAreaTo('next');
                self._currentPageCount += 1;
            }
        });
    },

    /**
     * Make labels width.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @param {object} theme theme object
     * @param {number} maxWidth user option legend max width size
     * @returns {Array.<number>} label widths
     */
    makeLabelWidths: function(legendData, theme, maxWidth) {
        return snippet.map(legendData, function(item) {
            var labelWidth = raphaelRenderUtil.getRenderedTextSize(item.label, theme.fontSize, theme.fontFamily).width;
            if (maxWidth && labelWidth > maxWidth) {
                labelWidth = maxWidth;
            }

            return labelWidth + chartConst.LEGEND_LABEL_LEFT_PADDING;
        });
    },

    /**
     * Get rendered label height
     * @param {string} labelText label text
     * @param {object} theme theme object
     * @returns {number}
     */
    getRenderedLabelHeight: function(labelText, theme) {
        return raphaelRenderUtil.getRenderedTextSize(labelText, theme.fontSize, theme.fontFamily).height;
    },

    /**
     * Render label text and attach event
     * @param {object} position left, top
     * @param {object} data rendering data
     *     @param {string} data.labelText label text
     *     @param {number} data.labelHeight label height
     *     @param {boolean} data.isUnselected boolean value for selected or not
     *     @param {number} data.legendIndex legend index
     *     @param {Array.<object>} data.legendSet legend set
     * @private
     */
    _renderLabel: function(position, data) {
        var eventBus = this.eventBus;
        var labelTheme = this.labelTheme;
        var pos = {
            left: position.left,
            top: position.top + (this._iconHeight / 2)
        };

        var attributes = {
            fill: labelTheme.color,
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            opacity: data.isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1,
            'text-anchor': 'start'
        };
        var label = raphaelRenderUtil.renderText(this.paper, pos, data.labelText, attributes);

        label.data('index', data.legendIndex);

        label.node.style.userSelect = 'none';
        label.node.style.cursor = 'pointer';

        data.legendSet.push(label);

        label.click(function() {
            eventBus.fire('labelClicked', data.legendIndex);
        });
    },

    /**
     * Render checkbox
     * @param {object} position left, top
     * @param {object} data rendering data
     */
    _renderCheckbox: function(position, data) {
        var self = this;
        var checkboxSet;
        var left = position.left;
        var top = position.top + ((this._legendItemHeight - this._checkBoxHeight) / 2);
        var vPathString = 'M' + ((this._checkBoxWidth * 0.3) + left) + ',' + ((this._checkBoxHeight * 0.5) + top)
            + 'L' + ((this._checkBoxWidth * 0.5) + left) + ',' + ((this._checkBoxHeight * 0.7) + top)
            + 'L' + ((this._checkBoxWidth * 0.8) + left) + ',' + ((this._checkBoxHeight * 0.2) + top);

        checkboxSet = this.paper.set();

        checkboxSet.push(this.paper.rect(left, top, this._checkBoxWidth, this._checkBoxHeight, 2).attr({
            fill: '#fff'
        }));

        if (data.isChecked) {
            checkboxSet.push(this.paper.path(vPathString));
        }

        checkboxSet.data('index', data.legendIndex);
        checkboxSet.click(function() {
            self.eventBus.fire('checkboxClicked', data.legendIndex);
        });

        checkboxSet.forEach(function(checkbox) {
            data.legendSet.push(checkbox);
        });
    },

    /**
     * Render legend icon and attach event
     * @param {object} position left, top
     * @param {object} data rendering data
     *     @param {string} data.labelText label text
     *     @param {number} data.labelHeight label height
     *     @param {string} data.legendColor legend color hex
     *     @param {boolean} data.isUnselected boolean value for selected or not
     *     @param {number} data.legendIndex legend index
     *     @param {Array.<object>} data.legendSet legend set
     * @private
     */
    _renderIcon: function(position, data) {
        var self = this;
        var icon, pathString;

        this.paper.setStart();

        if (data.iconType === 'line') {
            pathString = 'M' + position.left + ',' + (position.top + (this._legendItemHeight / 2))
                + 'H' + (position.left + chartConst.LEGEND_ICON_WIDTH);

            icon = raphaelRenderUtil.renderLine(this.paper, pathString, data.legendColor, 3);
            icon.attr('stroke-opacity', data.isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1);
        } else {
            icon = raphaelRenderUtil.renderRect(this.paper, {
                left: position.left,
                top: position.top,
                width: chartConst.LEGEND_ICON_WIDTH,
                height: this._iconHeight
            }, {
                'stroke-width': 0,
                fill: data.legendColor,
                opacity: data.isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1
            });
        }

        icon.data('icon', data.iconType);
        icon.data('index', data.legendIndex);
        icon.click(function() {
            self.eventBus.fire('labelClicked', data.legendIndex);
        });

        data.legendSet.push(icon);
    },

    selectLegend: function(index, legendSet) {
        legendSet.forEach(function(element) {
            var indexData = element.data('index');
            var attributeName = element.data('icon') === 'line' ? 'stroke-opacity' : 'opacity';

            if (snippet.isNull(indexData) || snippet.isUndefined(indexData)) {
                element.attr(attributeName, 1);
            } else if (!snippet.isUndefined(indexData)) {
                if (snippet.isNumber(index) && indexData !== index) {
                    element.attr(attributeName, UNSELECTED_LEGEND_LABEL_OPACITY);
                } else {
                    element.attr(attributeName, 1);
                }
            }
        });
    },

    /**
     * get checkbox area's width depends on checkbox visibility
     * @returns {number} - checkbox region's width
     */
    _getCheckboxWidth: function() {
        return this._showCheckbox ? (this._checkBoxWidth + chartConst.LEGEND_LABEL_LEFT_PADDING) : 0;
    },

    /**
     * Get width of a label when parameter is given.
     * Otherwise, returns maximum width of labels
     * @param {number} [index] - legend index
     * @returns {number} - maximum label width  label width
     */
    _getLabelWidth: function(index) {
        var labelWidth;
        if (index) {
            labelWidth = this.labelWidths[index] || 0;
        } else {
            labelWidth = arrayUtil.max(this.labelWidths);
        }

        return labelWidth;
    },

    /**
     * calulate a whole legend width before start rendering
     * @returns {number} - calculate label
     */
    _calculateLegendWidth: function() {
        return this._calculateSingleLegendWidth();
    },

    /**
     * calculate a single legend width of index `legendIndex`
     * @param {number} legendIndex - index of legend label
     * @returns {number} - calculate single legend width
     */
    _calculateSingleLegendWidth: function(legendIndex) {
        return chartConst.LEGEND_AREA_PADDING
            + this._getCheckboxWidth()
            + getIconWidth()
            + this._getLabelWidth(legendIndex)
            + chartConst.LEGEND_AREA_PADDING;
    },

    /**
     * set component dimension by comparaing label height and icon height
     * @param {number} labelHeight - label height
     */
    _setComponentDimensionsBaseOnLabelHeight: function(labelHeight) {
        this._legendItemHeight = Math.max(labelHeight, chartConst.LEGEND_ICON_HEIGHT);
        this._iconHeight = this._legendItemHeight;
        this._checkBoxWidth = this._checkBoxHeight = labelHeight;
    }
});

module.exports = RaphaelLegendComponent;
