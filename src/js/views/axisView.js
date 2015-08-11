/**
 * @fileoverview  AxisView render axis ticks and labels.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var dom = require('./domHandler.js'),
    View = require('./view.js'),
    axisTemplate = require('./axisTemplate.js');

var TITLE_AREA_WIDTH_PADDING = 20,
    TITLE_AREA_HEIGHT_PADDING = 20,
    V_LABEL_RIGHT_PADDING = 10;

var AxisView = ne.util.defineClass(View, /** @lends AxisView.prototype */ {
    /**
     * AxisView render axis ticks and labels.
     * @constructs AxisView
     * @extends View
     * @param {object} model axis model
     * @param {object} theme axis theme
     */
    init: function(model, theme) {
        /**
         * Axis model
         * @type {Object}
         */
        this.model = model;

        this.theme = theme;

        /**
         * Axis view className
         */
        this.className = 'ne-chart-axis-area';

        View.call(this);
    },

    /**
     * Axis renderer.
     * @param {{width: number, height: number, top: number, right: number}} bound axis area dimension
     * @returns {HTMLElement} axis area base element
     */
    render: function(bound) {
        var model = this.model,
            theme = this.theme,
            isVertical = model.isVertical,
            dimension = bound.dimension,
            size = isVertical ? dimension.height : dimension.width,
            elTitleArea = this._renderTitleArea(model.title, theme.title, isVertical, size),
            elTickArea = this._renderTickArea(size),
            elLabelArea = this._renderLabelArea(size, dimension.width);

        this.renderDimension(dimension);
        this.renderPosition(bound.position);
        dom.addClass(this.el, this.model.isVertical ? 'vertical' : 'horizontal');
        this.appends([elTitleArea, elTickArea, elLabelArea]);

        return this.el;
    },

    /**
     * Title area renderer
     * @param {string} title axis title
     * @param {obejct} theme title theme
     * @param {boolean} isVertical is vertical?
     * @param {number} size (width or height)
     * @returns {HTMLElement} title element
     * @private
     */
    _renderTitleArea: function(title, theme, isVertical, size) {
        var elTitleArea = this.renderTitle(title, theme, 'ne-chart-title-area'),
            cssTexts = [];

        if (elTitleArea && isVertical) {
            cssTexts = [
                this.concatStr('width:', size, 'px'),
                this.concatStr('left:', 0, 'px')
            ];
            if (!this.isIE8()) {
                cssTexts.push(this.concatStr('top:', size, 'px'));
            }
            elTitleArea.style.cssText += ';' + cssTexts.join(';');
        }
        return elTitleArea;
    },

    /**
     * Tick area renderer
     * @param {number} size size or height
     * @returns {HTMLElement} tick area element
     * @private
     */
    _renderTickArea: function(size) {
        var model = this.model,
            tickCount = model.tickCount,
            tickColor = this.theme.tickColor,
            positions = model.makePixelPositions(size, tickCount),
            elTickArea = dom.createElement('DIV', 'ne-chart-tick-area'),
            isVertical = model.isVertical,
            posType = isVertical ? 'bottom' : 'left',
            borderColorType = isVertical ? 'borderRightColor' : 'borderTopColor',
            template = axisTemplate.TPL_AXIS_TICK,
            ticksHtml = ne.util.map(positions, function(position) {
                var cssText = [
                    this.concatStr('background-color:', tickColor),
                    this.concatStr(posType, ': ', position, 'px')
                ].join(';');
                return template({cssText: cssText});
            }, this).join('');

        elTickArea.innerHTML = ticksHtml;
        elTickArea.style[borderColorType] = tickColor;

        return elTickArea;
    },

    /**
     * Label area renderer.
     * @param {number} size label area size
     * @param {number} axisWidth axis area width
     * @returns {HTMLElement} label area element
     * @private
     */
    _renderLabelArea: function(size, axisWidth) {
        var model = this.model,
            theme = this.theme,
            positions = model.makePixelPositions(size, model.tickCount),
            labelWidth = positions[1] - positions[0],
            labels = model.labels,
            isVertical = model.isVertical,
            isLabelAxis = model.isLabelAxis(),
            posType = isVertical ? (model.isLabelAxis() ? 'top' : 'bottom') : 'left',
            cssTexts = this._makeLabelCssTexts({
                isVertical: isVertical,
                isLabelAxis: isLabelAxis,
                labelWidth: labelWidth
            }),
            elLabelArea = dom.createElement('DIV', 'ne-chart-label-area'),
            labelsHtml, titleAreaWidth, areaCssText;

        positions.length = labels.length;
        labelsHtml = this._makeLabelsHtml({
            positions: positions,
            labels: labels,
            posType: posType,
            cssTexts: cssTexts
        });
        elLabelArea.innerHTML = labelsHtml;
        areaCssText = this.makeFontCssText(theme.label);

        if (isVertical) {
            titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING;
            areaCssText += ';width:' + (axisWidth - titleAreaWidth + V_LABEL_RIGHT_PADDING) + 'px';
        }

        elLabelArea.style.cssText = areaCssText;
        this._changeLabelAreaPosition({
            elLabelArea: elLabelArea,
            isVertical: isVertical,
            isLabelAxis: isLabelAxis,
            theme: theme.label,
            labelWidth: labelWidth
        });

        return elLabelArea;
    },

    /**
     * Get height of title area ;
     * @returns {number} height
     * @private
     */
    _getRenderedTitleHeight: function() {
        var title = this.model.title,
            theme = this.theme.title,
            result = title ? this.getRenderedLabelHeight(title, theme) : 0;
        return result;
    },

    /**
     * To make cssTexts of label.
     * @param {object} params parameter
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.isLabelAxis whether label axis or not
     *      @param {number} params.labelWidth label width or height
     * @returns {string[]} cssTexts
     * @private
     */
    _makeLabelCssTexts: function(params) {
        var cssTexts = [];

        if (params.isVertical && params.isLabelAxis) {
            cssTexts.push(this.concatStr('height:', params.labelWidth, 'px'));
            cssTexts.push(this.concatStr('line-height:', params.labelWidth, 'px'));
        } else if (!params.isVertical) {
            cssTexts.push(this.concatStr('width:', params.labelWidth, 'px'));
        }

        return cssTexts;
    },

    /**
     * To make html of label.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions label position array
     *      @param {string[]} params.labels label array
     *      @param {string} params.posType position type (left or bottom)
     *      @param {string[]} params.cssTexts css array
     * @returns {string} html
     * @private
     */
    _makeLabelsHtml: function(params) {
        var template = axisTemplate.TPL_AXIS_LABEL,
            labelsHtml = ne.util.map(params.positions, function(position, index) {
                var labelCssTexts = params.cssTexts.slice(),
                    html;

                labelCssTexts.push(this.concatStr(params.posType, ':', position, 'px'));
                html = template({
                    cssText: labelCssTexts.join(';'),
                    label: params.labels[index]
                });
                return html;
            }, this).join('');

        return labelsHtml;
    },

    /**
     * Change position of label area.
     * @param {object} params parameter
     *      @param {HTMLElement} params.elLabelArea label area element
     *      @param {boolean} params.isVertical whether vertical or not
     *      @param {boolean} params.isLabelAxis whether label axis or not
     *      @param {{fontSize: number, fontFamily: string, color: string}} params.theme label theme
     *      @param {number} params.labelWidth label width or height
     * @private
     */
    _changeLabelAreaPosition: function(params) {
        var labelHeight;

        if (params.isLabelAxis) {
            return;
        }

        if (params.isVertical) {
            labelHeight = this.getRenderedLabelHeight('ABC', params.theme);
            params.elLabelArea.style.top = this.concatStr(parseInt(labelHeight / 2, 10), 'px');
        } else {
            params.elLabelArea.style.left = this.concatStr('-', parseInt(params.labelWidth / 2, 10), 'px');
        }
    },

    /**
     * Get width of vertical axis area.
     * @returns {number} width
     */
    getVAxisAreaWidth: function() {
        var titleAreaWidth = this._getRenderedTitleHeight() + TITLE_AREA_WIDTH_PADDING,
            width = this.getRenderedLabelsMaxWidth(this.model.labels, this.theme.label) + titleAreaWidth;
        return width;
    },

    /**
     * Get height of horizontal axis area.
     * @returns {number} height
     */
    getHAxisAreaHeight: function() {
        var titleAreaHeight = this._getRenderedTitleHeight() + TITLE_AREA_HEIGHT_PADDING,
            height = this.getRenderedLabelsMaxHeight(this.model.labels, this.theme.label) + titleAreaHeight;
        return height;
    }
});

module.exports = AxisView;