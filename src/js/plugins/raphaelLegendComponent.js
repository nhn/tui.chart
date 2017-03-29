/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var raphaelRenderUtil = require('../plugins/raphaelRenderUtil');

var UNSELECTED_LEGEND_LABEL_OPACITY = 0.5;
var ICON_WIDTH = 10;
var CHECKBOX_WIDTH = 10;
var CHECKBOX_HEIGHT = 10;

var RaphaelLegendComponent = tui.util.defineClass(/** @lends RaphaelLegendComponent.prototype */ {

    /**
     * @param {Array.<object>} legendData Array of legend item data
     * @private
     */
    _renderLegendItems: function(legendData) {
        var self = this;
        var labelPaddingLeft = chartConst.LEGEND_LABEL_LEFT_PADDING;
        var position = tui.util.extend({}, this.basePosition);

        tui.util.forEach(legendData, function(legendDatum, index) {
            var legendIndex = legendDatum.index;
            var legendColor = legendDatum.colorByPoint ? '#aaa' : legendDatum.theme.color;
            var isUnselected = legendDatum.isUnselected;
            var labelHeight = legendDatum.labelHeight;
            var checkboxData = legendDatum.checkbox;
            var predicatedLegendLength = position.left + ICON_WIDTH + self.labelWidths[index]
                + (labelPaddingLeft * 2) + (checkboxData ? CHECKBOX_WIDTH + labelPaddingLeft : 0);
            var isNeedBreakLine = (predicatedLegendLength > self.paper.width);

            if (self.isHorizontal && isNeedBreakLine) {
                position.top += (labelHeight + chartConst.LABEL_PADDING_TOP);
                position.left = self.basePosition.left;
            }

            if (checkboxData) {
                self._renderCheckbox(position, checkboxData, legendIndex, self.legendSet);

                position.left += (CHECKBOX_WIDTH + labelPaddingLeft);
            }

            self._renderIcon(position, {
                legendColor: legendColor,
                iconType: legendDatum.iconType,
                labelHeight: labelHeight,
                isUnselected: isUnselected,
                legendIndex: legendIndex,
                legendSet: self.legendSet
            });

            position.left += ICON_WIDTH + labelPaddingLeft;

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
                position.top += labelHeight + chartConst.LINE_MARGIN_TOP;
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
        var resultLegendData, pageHeight, singleItemHeight, visibleItemCount;

        if (!legendData.length) {
            return null;
        }

        if (!this.isHorizontal && totalHeight + (positionTop * 2) > chartHeight) {
            pageHeight = chartHeight - (positionTop * 2);
            singleItemHeight = (legendData[0].labelHeight + chartConst.LINE_MARGIN_TOP);

            visibleItemCount = Math.floor(pageHeight / singleItemHeight);

            resultLegendData = legendData.slice((sliceIndex - 1) * visibleItemCount, sliceIndex * visibleItemCount);
        } else {
            resultLegendData = legendData;
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
        if (!tui.util.isNumber(this.currentPageCount)) {
            this.currentPageCount = 1;
        }

        legendData = this._getLegendData(data.legendData, this.currentPageCount);

        this._renderLegendItems(legendData);

        if (!this.isHorizontal && legendData.length < data.legendData.length) {
            legendHeight = this.paper.height - (this.basePosition.top * 2);

            this.availablePageCount = Math.ceil(data.dimension.height / legendHeight);

            this._renderPaginationArea(this.basePosition, {
                width: data.dimension.width,
                height: legendHeight
            });
        }

        return this.legendSet;
    },

    /**
     * @param {string} direction direction string of paginate 'next' or 'previous'
     * @private
     */
    _paginateLegendAreaTo: function(direction) {
        var pageNumber = this.currentPageCount;

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
            tui.util.forEach(legendItem.events, function(event) {
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
        var BUTTON_WIDTH = 10;
        var BUTTON_PADDING_LEFT = 5;
        var controllerPositionTop = position.top + dimension.height - chartConst.CHART_PADDING;
        var controllerPositionLeft = position.left - chartConst.CHART_PADDING;
        var rightButtonPositionLeft = controllerPositionLeft + dimension.width - BUTTON_WIDTH;
        var leftButtonPositionLeft = rightButtonPositionLeft - (BUTTON_PADDING_LEFT + BUTTON_WIDTH);
        var lowerArrowPath = [
            'M', rightButtonPositionLeft, ',', (controllerPositionTop + 3),
            'L', (rightButtonPositionLeft + 5), ',', (controllerPositionTop + 8),
            'L', (rightButtonPositionLeft + 10), ',', (controllerPositionTop + 3)].join('');
        var upperArrowPath = [
            'M', leftButtonPositionLeft, ',', (controllerPositionTop + 8),
            'L', (leftButtonPositionLeft + 5), ',', (controllerPositionTop + 3),
            'L', (leftButtonPositionLeft + 10), ',', (controllerPositionTop + 8)].join('');

        this.upperButton = raphaelRenderUtil.renderLine(this.paper, upperArrowPath, '#555', 3);
        this.lowerButton = raphaelRenderUtil.renderLine(this.paper, lowerArrowPath, '#555', 3);

        this.upperButton.click(function() {
            if (self.currentPageCount > 1) {
                self._paginateLegendAreaTo('previous');
                self.currentPageCount -= 1;
            }
        });

        this.lowerButton.click(function() {
            if (self.currentPageCount < self.availablePageCount) {
                self._paginateLegendAreaTo('next');
                self.currentPageCount += 1;
            }
        });
    },

    /**
     * Make labels width.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @param {object} theme theme object
     * @returns {Array.<number>} label widths
     */
    makeLabelWidths: function(legendData, theme) {
        return tui.util.map(legendData, function(item) {
            var labelWidth = raphaelRenderUtil.getRenderedTextSize(item.label, theme.fontSize, theme.fontFamily).width;

            return labelWidth + chartConst.LEGEND_AREA_PADDING;
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
            top: position.top + (data.labelHeight / 2)
        };
        var attributes = {
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
     * @param {{checked: boolean}} checkboxData checkbox data
     * @param {number} legendIndex legend index
     * @param {Array.<object>} legendSet legend set
     */
    _renderCheckbox: function(position, checkboxData, legendIndex, legendSet) {
        var self = this;
        var checkboxSet;
        var left = position.left;
        var top = position.top;
        var vPathString = 'M' + ((CHECKBOX_WIDTH * 0.3) + left) + ',' + ((CHECKBOX_HEIGHT * 0.5) + top)
            + 'L' + ((CHECKBOX_WIDTH * 0.5) + left) + ',' + ((CHECKBOX_HEIGHT * 0.7) + top)
            + 'L' + ((CHECKBOX_WIDTH * 0.8) + left) + ',' + ((CHECKBOX_HEIGHT * 0.2) + top);

        if (checkboxData) {
            checkboxSet = this.paper.set();

            checkboxSet.push(this.paper.rect(left, top, CHECKBOX_WIDTH, CHECKBOX_HEIGHT, 2).attr({
                fill: '#fff'
            }));

            if (checkboxData.checked) {
                checkboxSet.push(this.paper.path(vPathString));
            }

            checkboxSet.click(function() {
                self.eventBus.fire('checkboxClicked', legendIndex);
            });

            checkboxSet.forEach(function(checkbox) {
                legendSet.push(checkbox);
            });
        }
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
            pathString = 'M' + position.left + ',' + (position.top + (data.labelHeight / 2))
                + 'H' + (position.left + 10);

            icon = raphaelRenderUtil.renderLine(this.paper, pathString, data.legendColor, 3);
        } else {
            icon = raphaelRenderUtil.renderRect(this.paper, {
                left: position.left,
                top: position.top,
                width: 10,
                height: 10
            }, {
                'stroke-width': 0,
                fill: data.legendColor
            });
        }

        icon.click(function() {
            self.eventBus.fire('labelClicked', data.legendIndex);
        });

        data.legendSet.push(icon);
    },
    selectLegend: function(index, legendSet) {
        legendSet.forEach(function(element) {
            var indexData = element.data('index');

            if (tui.util.isNull(indexData) || tui.util.isUndefined(indexData)) {
                element.attr({
                    opacity: 1
                });
            } else if (!tui.util.isUndefined(indexData)) {
                if (tui.util.isNumber(index) && indexData !== index) {
                    element.attr({
                        opacity: UNSELECTED_LEGEND_LABEL_OPACITY
                    });
                } else {
                    element.attr({
                        opacity: 1
                    });
                }
            }
        });
    }
});

module.exports = RaphaelLegendComponent;
