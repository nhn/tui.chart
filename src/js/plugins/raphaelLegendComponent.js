/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var chartConst = require('../const');
var raphaelRenderUtil = require('../plugins/raphaelRenderUtil');

var UNSELECTED_LEGEND_LABEL_OPACITY = 0.5;
var CHECKBOX_WIDTH = 10;
var CHECKBOX_HEIGHT = 10;

var RaphaelLegendComponent = tui.util.defineClass(/** @lends RaphaelLegendComponent.prototype */ {

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
        var self = this;
        var legendData = data.legendData;
        var isHorizontal = data.isHorizontal;
        var position = tui.util.extend({}, data.position);
        var legendSet = data.paper.set();

        this.eventBus = data.eventBus;
        this.paper = data.paper;
        this.labelWidths = data.labelWidths;
        this.labelTheme = data.labelTheme;
        tui.util.forEach(legendData, function(legendDatum, index) {
            var legendIndex = legendDatum.index;
            var legendColor = legendDatum.theme.color;
            var checkboxData = legendDatum.checkbox;
            var iconType = legendDatum.iconType;
            var labelText = legendDatum.label;
            var isUnselected = legendDatum.isUnselected;
            var labelHeight = legendDatum.labelHeight;

            if (checkboxData) {
                self._renderCheckbox(position, checkboxData, legendIndex, legendSet);
                position.left += 10 + chartConst.LEGEND_LABEL_LEFT_PADDING;
            }

            self._renderIcon(position, {
                legendColor: legendColor,
                iconType: iconType,
                labelHeight: labelHeight,
                isUnselected: isUnselected,
                legendIndex: legendIndex,
                legendSet: legendSet
            });

            position.left += 10 + chartConst.LEGEND_LABEL_LEFT_PADDING;

            self._renderLabel(position, {
                labelText: labelText,
                labelHeight: labelHeight,
                isUnselected: isUnselected,
                legendIndex: legendIndex,
                legendSet: legendSet
            });
            if (isHorizontal) {
                position.left += data.labelWidths[index] + chartConst.LEGEND_LABEL_LEFT_PADDING;
            } else {
                position.left = data.position.left;
                position.top += labelHeight + chartConst.LINE_MARGIN_TOP;
            }
        });

        return legendSet;
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
