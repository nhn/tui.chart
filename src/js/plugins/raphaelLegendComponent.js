/**
 * @fileoverview Raphael title renderer.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';
var chartConst = require('../const');
var raphaelRenderUtil = require('../plugins/raphaelRenderUtil');

var raphael = window.Raphael;
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
     *     @param {number} data.labelsWidth label widths
     *     @param {object} data.eventBus event bus
     * @returns {object} paper
     */
    render: function(data) {
        var self = this;
        var container = data.container;
        var legendData = data.legendData;
        var isHorizontal = data.isHorizontal;
        var position = {
            top: 1,
            left: 1
        };
        var horizontalWidth, horizontalHeight;

        this.eventBus = data.eventBus;
        this.paper = raphael(container, data.dimension.width, data.dimension.height);
        this.labelsWidth = data.labelsWidth;
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
                self._renderCheckbox(position, checkboxData, legendIndex);
                position.left += 10 + chartConst.LEGEND_LABEL_LEFT_PADDING;
            }

            self._renderIcon(position, legendColor, iconType, labelHeight, legendIndex);
            position.left += 10 + chartConst.LEGEND_LABEL_LEFT_PADDING;

            self._renderLabel(position, labelText, labelHeight, isUnselected, legendIndex);
            if (isHorizontal) {
                position.left += data.labelsWidth[index] + chartConst.LEGEND_LABEL_LEFT_PADDING;
            } else {
                position.left = 1;
                position.top += labelHeight + chartConst.LINE_MARGIN_TOP;
            }
        });

        if (isHorizontal) {
            horizontalWidth = position.left + data.labelsWidth[data.labelsWidth.length - 1];
            horizontalHeight = legendData[0].labelHeight + chartConst.LEGEND_LABEL_LEFT_PADDING;
            this.paper.setSize(horizontalWidth, horizontalHeight);
        }

        return this.paper;
    },

    /**
     * Make labels width.
     * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
     * @param {object} theme theme object
     * @returns {Array.<number>} label widths
     */
    makeLabelsWidth: function(legendData, theme) {
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
     * @param {string} labelText label text
     * @param {number} labelHeight label height
     * @param {boolean} isUnselected boolean value for selected or not
     * @param {number} legendIndex legend index
     * @private
     */
    _renderLabel: function(position, labelText, labelHeight, isUnselected, legendIndex) {
        var self = this;
        var labelTheme = this.labelTheme;
        var pos = {
            left: position.left,
            top: position.top + (labelHeight / 2)
        };

        raphaelRenderUtil.renderText(this.paper, pos, labelText, {
            'font-size': labelTheme.fontSize,
            'font-family': labelTheme.fontFamily,
            'font-weight': labelTheme.fontWeight,
            opacity: isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1,
            'text-anchor': 'start'
        }, {
            name: 'click',
            handler: function() {
                self.eventBus.fire('labelClicked', legendIndex);
            }
        });
    },

    /**
     * Render checkbox
     * @param {object} position left, top
     * @param {{checked: boolean}} checkboxData checkbox data
     * @param {number} legendIndex legend index
     */
    _renderCheckbox: function(position, checkboxData, legendIndex) {
        var self = this;
        var checkboxSet;
        var left = position.left;
        var top = position.top;
        var vPathString = 'M' + ((CHECKBOX_WIDTH * 0.3) + left) + ',' + ((CHECKBOX_HEIGHT * 0.5) + top)
            + 'L' + ((CHECKBOX_WIDTH * 0.5) + left) + ',' + ((CHECKBOX_HEIGHT * 0.7) + top)
            + 'L' + ((CHECKBOX_WIDTH * 0.8) + left) + ',' + ((CHECKBOX_HEIGHT * 0.2) + top);

        if (checkboxData) {
            this.paper.setStart();

            this.paper.rect(left, top, CHECKBOX_WIDTH, CHECKBOX_HEIGHT, 2).attr({
                fill: '#fff'
            });

            if (checkboxData.checked) {
                this.paper.path(vPathString);
            }

            checkboxSet = this.paper.setFinish();

            checkboxSet.click(function() {
                self.eventBus.fire('checkboxClicked', legendIndex);
            });
        }
    },

    /**
     * Render legend icon and attach event
     * @param {object} position left, top
     * @param {string} legendColor legend's color hex string
     * @param {string} iconType 'line' or 'rect'
     * @param {number} labelHeight label's height
     * @param {number} legendIndex legend index
     * @private
     */
    _renderIcon: function(position, legendColor, iconType, labelHeight, legendIndex) {
        var self = this;
        var icon, pathString;

        this.paper.setStart();

        if (iconType === 'line') {
            pathString = 'M' + position.left + ',' + (position.top + (labelHeight / 2))
                + 'H' + (position.left + 10);

            raphaelRenderUtil.renderLine(this.paper, pathString, legendColor, 3);
        } else {
            raphaelRenderUtil.renderRect(this.paper, {
                left: position.left,
                top: position.top,
                width: 10,
                height: 10
            }, {
                'stroke-width': 0,
                fill: legendColor
            });
        }

        icon = this.paper.setFinish();

        icon.click(function() {
            self.eventBus.fire('labelClicked', legendIndex);
        });
    }
});

module.exports = RaphaelLegendComponent;
