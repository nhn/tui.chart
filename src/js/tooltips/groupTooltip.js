/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase'),
    GroupTooltipPositionModel = require('./groupTooltipPositionModel'),
    chartConst = require('../const'),
    dom = require('../helpers/domHandler'),
    renderUtil = require('../helpers/renderUtil'),
    defaultTheme = require('../themes/defaultTheme'),
    tooltipTemplate = require('./tooltipTemplate');

var GroupTooltip = tui.util.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @param {object} params parameters
     *      @param {array.<number>} params.values converted values
     *      @param {array} params.labels labels
     *      @param {array} params.legendLabels legend labels
     *      @param {object} params.bound axis bound
     *      @param {object} params.theme axis theme
     */
    init: function(params) {
        TooltipBase.call(this, params);
    },

    /**
     * Set default align option of tooltip.
     * @private
     * @override
     */
    _setDefaultTooltipPositionOption: function() {
        if (this.options.align) {
            return;
        }

        if (this.isVertical) {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION;
        } else {
            this.options.align = chartConst.TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION;
        }
    },

    /**
     * To render tooltip component.
     * @param {{position: object}} bound tooltip bound
     * @param {?{seriesPosition: {left: number, top: number}}} data rendering data
     * @returns {HTMLElement} tooltip element
     * @override
     */
    render: function(bound, data) {
        var el = TooltipBase.prototype.render.call(this, bound, data);

        this.positionModel = new GroupTooltipPositionModel(this.chartDimension, bound, this.isVertical, this.options);
        return el;
    },

    /**
     * To make tooltip data.
     * @returns {array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        return tui.util.map(this.joinFormattedValues, function(values, index) {
            return {
                category: this.labels[index],
                values: values
            };
        }, this);
    },

    /**
     * To make colors.
     * @param {array.<string>} legendLabels legend labels
     * @param {object} theme tooltip theme
     * @returns {array.<string>} colors
     * @private
     */
    _makeColors: function(legendLabels, theme) {
        var colorIndex = 0,
            defaultColors, colors, prevChartType;

        if (theme.colors) {
            return theme.colors;
        }

        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

        return tui.util.map(tui.util.pluck(legendLabels, 'chartType'), function(chartType) {
            var color;
            if (prevChartType !== chartType) {
                colors = theme[chartType] ? theme[chartType].colors : defaultColors;
                colorIndex = 0;
            }
            prevChartType = chartType;
            color = colors[colorIndex];
            colorIndex += 1;
            return color;
        });
    },

    /**
     * To make tooltip html.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(groupIndex) {
        var item = this.data[groupIndex],
            template = tooltipTemplate.tplGroupItem,
            cssTextTemplate = tooltipTemplate.tplGroupCssText,
            colors = this._makeColors(this.joinLegendLabels, this.theme),
            itemsHtml;

        itemsHtml = tui.util.map(item.values, function(value, index) {
            var legendLabel = this.joinLegendLabels[index];
            return template({
                value: value,
                legend: legendLabel.label,
                chartType: legendLabel.chartType,
                cssText: cssTextTemplate({color: colors[index]}),
                suffix: this.suffix
            });
        }, this).join('');

        return tooltipTemplate.tplGroup({
            category: item.category,
            items: itemsHtml
        });
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        var elTooltipSector;

        if (!this.elTooltipSector) {
            this.elTooltipSector = elTooltipSector = dom.create('DIV', 'tui-chart-group-tooltip-sector');
            dom.append(this.elTooltipArea, elTooltipSector);
        }

        return this.elTooltipSector;
    },

    /**
     * To make bound about tooltip sector of vertical type chart.
     * @param {number} height height
     * @param {{start: number, end: number}} range range
     * @param {boolean} isLine whether line or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeVerticalTooltipSectorBound: function(height, range, isLine) {
        var width;

        if (isLine) {
            width = 1;
            height += 6;
        } else {
            width = range.end - range.start;
        }

        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start + chartConst.SERIES_EXPAND_SIZE,
                top: 0
            }
        };
    },

    /**
     * To make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start + chartConst.HIDDEN_WIDTH
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE - chartConst.HIDDEN_WIDTH,
                top: range.start
            }
        };
    },

    /**
     * To make bound about tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {boolean} isLine whether line type or not
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeTooltipSectorBound: function(size, range, isVertical, isLine) {
        var bound;

        if (isVertical) {
            bound = this._makeVerticalTooltipSectorBound(size, range, isLine);
        } else {
            bound = this._makeHorizontalTooltipSectorBound(size, range);
        }

        return bound;
    },

    /**
     * Show tooltip sector.
     * @param {number} size width or height
     * @param {{start: number, end:number}} range range
     * @param {boolean} isVertical whether vertical or not
     * @param {number} index index
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index) {
        var elTooltipSector = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);

        if (isLine) {
            this.fire('showGroupTooltipLine', bound);
        } else {
            renderUtil.renderDimension(elTooltipSector, bound.dimension);
            renderUtil.renderPosition(elTooltipSector, bound.position);
            dom.addClass(elTooltipSector, 'show');
        }

        this.fire('showGroupAnimation', index);
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var elTooltipSector = this._getTooltipSectorElement();

        dom.removeClass(elTooltipSector, 'show');
        this.fire('hideGroupAnimation', index);
        this.fire('hideGroupTooltipLine');
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     */
    showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!tui.util.isUndefined(this.prevIndex)) {
            this.fire('hideGroupAnimation', this.prevIndex);
        }
        elTooltip.innerHTML = this._makeTooltipHtml(params.index);

        this._fireBeforeShowTooltip(params.index, params.range);

        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index);

        dimension = this.getTooltipDimension(elTooltip);
        position = this.positionModel.calculatePosition(dimension, params.range);
        this.moveToPosition(elTooltip, position, prevPosition);

        this._fireAfterShowTooltip(params.index, params.range, {
            element: elTooltip,
            position: position
        });

        this.prevIndex = params.index;
    },

    /**
     * To call beforeShowTooltip callback of userEvent.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @private
     */
    _fireBeforeShowTooltip: function(index, range) {
        this.userEvent.fire('beforeShowTooltip', {
            index: index,
            range: range
        });
    },

    /**
     * To call afterShowTooltip callback of userEvent.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @param {object} additionParams addition parameters
     * @private
     */
    _fireAfterShowTooltip: function(index, range, additionParams) {
        this.userEvent.fire('afterShowTooltip', tui.util.extend({
            index: index,
            range: range
        }, additionParams));
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {number} index index
     */
    hideTooltip: function(elTooltip, index) {
        delete this.prevIndex;
        this._hideTooltipSector(index);
        this.hideAnimation(elTooltip);
    }
});

tui.util.CustomEvents.mixin(GroupTooltip);

module.exports = GroupTooltip;
