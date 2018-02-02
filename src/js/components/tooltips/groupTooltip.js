/**
 * @fileoverview Group tooltip component.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var TooltipBase = require('./tooltipBase');
var GroupTooltipPositionModel = require('./groupTooltipPositionModel');
var chartConst = require('../../const');
var dom = require('../../helpers/domHandler');
var renderUtil = require('../../helpers/renderUtil');
var defaultTheme = require('../../themes/defaultTheme');
var tooltipTemplate = require('./tooltipTemplate');
var snippet = require('tui-code-snippet');
var predicate = require('../../helpers/predicate');

/**
 * @classdesc GroupTooltip component.
 * @class GroupTooltip
 * @private
 */
var GroupTooltip = snippet.defineClass(TooltipBase, /** @lends GroupTooltip.prototype */ {
    /**
     * Group tooltip component.
     * @constructs GroupTooltip
     * @private
     * @override
     */
    init: function(params) {
        this.prevIndex = null;
        this.isBullet = predicate.isBulletChart(params.chartType);
        TooltipBase.call(this, params);
    },

    /**
     * Make tooltip html.
     * @param {string} category category
     * @param {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} items items data
     * @param {string} rawCategory raw category
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeTooltipHtml: function(category, items, rawCategory, groupIndex) {
        var template = tooltipTemplate.tplGroupItem;
        var cssTextTemplate = tooltipTemplate.tplGroupCssText;
        var colors = this._makeColors(this.theme, groupIndex);
        var prevType, itemsHtml;

        itemsHtml = snippet.map(items, function(item, index) {
            var type = item.type;
            var typeVisible = (type !== 'data') && (prevType !== type);
            var itemHtml = '';

            prevType = type;

            if (!item.value) {
                return null;
            }

            if (typeVisible) {
                itemHtml = tooltipTemplate.tplGroupType({
                    type: type
                });
            }

            itemHtml += template(snippet.extend({
                cssText: cssTextTemplate({color: colors[index]})
            }, item));

            return itemHtml;
        }).join('');

        return tooltipTemplate.tplGroup({
            category: category,
            items: itemsHtml
        });
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
     * Render tooltip component.
     * @returns {HTMLElement}
     * @override
     */
    render: function(data) {
        var container = TooltipBase.prototype.render.call(this, data);
        var chartDimension = this.dimensionMap.chart;
        var bound = this.layout;

        if (data.checkedLegends) {
            this.theme = {
                colors: this.colors
            };
        }

        this.positionModel = new GroupTooltipPositionModel(chartDimension, bound, this.isVertical, this.options);

        return container;
    },

    /**
     * Rerender.
     * @param {{checkedLegends: Array.<boolean>}} data rendering data
     * @override
     */
    rerender: function(data) {
        TooltipBase.prototype.rerender.call(this, data);
        this.prevIndex = null;

        if (data.checkedLegends) {
            this.theme = this._updateLegendTheme(data.checkedLegends);
        }
    },

    /**
     * Zoom.
     */
    zoom: function() {
        this.prevIndex = null;
        TooltipBase.prototype.zoom.call(this);
    },

    /**
     * Update legend theme.
     * @param {object | Array.<boolean>}checkedLegends checked legends
     * @returns {{colors: Array.<string>}} legend theme
     * @private
     */
    _updateLegendTheme: function(checkedLegends) {
        var colors = [];

        snippet.forEachArray(this.dataProcessor.getOriginalLegendData(), function(item) {
            var _checkedLegends = checkedLegends[item.chartType] || checkedLegends;
            if (_checkedLegends[item.index]) {
                colors.push(item.theme.color);
            }
        });

        return {
            colors: colors
        };
    },

    /**
     * Make tooltip data.
     * @returns {Array.<object>} tooltip data
     * @override
     */
    makeTooltipData: function() {
        var length = this.dataProcessor.getCategoryCount(this.isVertical);

        return snippet.map(this.dataProcessor.getSeriesGroups(), function(seriesGroup, index) {
            var values = seriesGroup.map(function(item) {
                return {
                    type: item.type || 'data',
                    label: item.label
                };
            });

            return {
                category: this.dataProcessor.makeTooltipCategory(index, length - index, this.isVertical),
                values: values
            };
        }, this);
    },

    /**
     * Make colors.
     * @param {object} theme tooltip theme
     * @param {number} [groupIndex] groupIndex
     * @returns {Array.<string>} colors
     * @private
     */
    _makeColors: function(theme, groupIndex) {
        var colorIndex = 0,
            legendLabels = this.dataProcessor.getLegendData(),
            defaultColors, colors, prevChartType;

        if (this.isBullet) {
            return this.dataProcessor.getGraphColors()[groupIndex];
        }

        if (theme.colors) {
            return theme.colors;
        }

        defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

        return snippet.map(snippet.pluck(legendLabels, 'chartType'), function(chartType) {
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
     * Make rendering data about legend item.
     * @param {Array.<string>} values values
     * @param {number} groupIndex groupIndex
     * @returns {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} legend item data.
     * @private
     */
    _makeItemRenderingData: function(values, groupIndex) {
        var dataProcessor = this.dataProcessor,
            suffix = this.suffix;

        return snippet.map(values, function(data, index) {
            var item = {
                value: data.label,
                type: data.type,
                suffix: suffix,
                legend: ''
            };
            var legendLabel;

            if (this.isBullet) {
                legendLabel = dataProcessor.getLegendItem(groupIndex);
            } else {
                legendLabel = dataProcessor.getLegendItem(index);
                item.legend = legendLabel.label;
            }

            item.chartType = legendLabel.chartType;

            return item;
        }, this);
    },

    /**
     * Make tooltip.
     * @param {number} groupIndex group index
     * @returns {string} tooltip html
     * @private
     */
    _makeGroupTooltipHtml: function(groupIndex) {
        var data = this.data[groupIndex];
        var items, htmlString = '';

        if (data) {
            items = this._makeItemRenderingData(data.values, groupIndex);
            htmlString = this.templateFunc(data.category, items, this.getRawCategory(groupIndex), groupIndex);
        }

        return htmlString;
    },

    /**
     * Get tooltip sector element.
     * @returns {HTMLElement} sector element
     * @private
     */
    _getTooltipSectorElement: function() {
        var groupTooltipSector;

        if (!this.groupTooltipSector) {
            this.groupTooltipSector = groupTooltipSector = dom.create('DIV', 'tui-chart-group-tooltip-sector');
            dom.append(this.tooltipContainer, groupTooltipSector);
        }

        return this.groupTooltipSector;
    },

    /**
     * Make bound about tooltip sector of vertical type chart.
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
        } else {
            width = range.end - range.start;
        }

        return {
            dimension: {
                width: width,
                height: height
            },
            position: {
                left: range.start,
                top: chartConst.SERIES_EXPAND_SIZE
            }
        };
    },

    /**
     * Make bound about tooltip sector of horizontal type chart.
     * @param {number} width width
     * @param {{start: number, end:number}} range range
     * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
     * @private
     */
    _makeHorizontalTooltipSectorBound: function(width, range) {
        return {
            dimension: {
                width: width,
                height: range.end - range.start
            },
            position: {
                left: chartConst.SERIES_EXPAND_SIZE,
                top: range.start
            }
        };
    },

    /**
     * Make bound about tooltip sector.
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
     * @param {boolean} [isMoving] whether moving or not
     * @private
     */
    _showTooltipSector: function(size, range, isVertical, index, isMoving) {
        var groupTooltipSector = this._getTooltipSectorElement(),
            isLine = (range.start === range.end),
            bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);

        if (isLine) {
            this.eventBus.fire('showGroupTooltipLine', bound);
        } else {
            renderUtil.renderDimension(groupTooltipSector, bound.dimension);
            renderUtil.renderPosition(groupTooltipSector, bound.position);
            dom.addClass(groupTooltipSector, 'show');
        }

        if (isMoving) {
            index -= 1;
        }

        this.eventBus.fire('showGroupAnimation', index);
    },

    /**
     * Hide tooltip sector.
     * @param {number} index index
     * @private
     */
    _hideTooltipSector: function(index) {
        var groupTooltipSector = this._getTooltipSectorElement();

        if (!dom.hasClass(groupTooltipSector, 'show')) {
            this.eventBus.fire('hideGroupTooltipLine');
        } else {
            dom.removeClass(groupTooltipSector, 'show');
        }
        this.eventBus.fire('hideGroupAnimation', index);
        this.eventBus.fire('hideGroupTooltipLine');
    },

    /**
     * Show tooltip.
     * @param {HTMLElement} elTooltip tooltip element
     * @param {{index: number, range: {start: number, end: number},
     *          size: number, direction: string, isVertical: boolean
     *        }} params coordinate event parameters
     * @param {{left: number, top: number}} prevPosition prev position
     * @private
     */
    _showTooltip: function(elTooltip, params, prevPosition) {
        var dimension, position;

        if (!snippet.isNull(this.prevIndex)) {
            this.eventBus.fire('hideGroupAnimation', this.prevIndex);
        }

        elTooltip.innerHTML = this._makeGroupTooltipHtml(params.index);

        this._fireBeforeShowTooltipPublicEvent(params.index, params.range, params.silent);

        dom.addClass(elTooltip, 'show');

        this._showTooltipSector(params.size, params.range, params.isVertical, params.index, params.isMoving);

        dimension = this.getTooltipDimension(elTooltip);
        position = this.positionModel.calculatePosition(dimension, params.range);

        this._moveToPosition(elTooltip, position, prevPosition);

        this._fireAfterShowTooltipPublicEvent(params.index, params.range, {
            element: elTooltip,
            position: position
        }, params.silent);

        this.prevIndex = params.index;
    },

    /**
     * To call beforeShowTooltip callback of public event.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @param {boolean} [silent] - whether invoke a public beforeHideTooltip event or not
     * @private
     */
    _fireBeforeShowTooltipPublicEvent: function(index, range, silent) {
        if (silent) {
            return;
        }

        this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'beforeShowTooltip', {
            chartType: this.chartType,
            index: index,
            range: range
        });
    },

    /**
     * To call afterShowTooltip callback of public event.
     * @param {number} index index
     * @param {{start: number, end: number}} range range
     * @param {object} additionParams addition parameters
     * @param {boolean} [silent] - whether invoke a public beforeHideTooltip event or not
     * @private
     */
    _fireAfterShowTooltipPublicEvent: function(index, range, additionParams, silent) {
        if (silent) {
            return;
        }
        this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'afterShowTooltip', snippet.extend({
            chartType: this.chartType,
            index: index,
            range: range
        }, additionParams));
    },

    /**
     * Hide tooltip.
     * @param {HTMLElement} tooltipElement tooltip element
     * @param {number} prevFoundIndex - showing tooltip index
     * @param {object} [options] - options for hiding tooltip
     * @private
     */
    _hideTooltip: function(tooltipElement, prevFoundIndex, options) {
        var silent = !!(options && options.silent);
        this.prevIndex = null;
        this._fireBeforeHideTooltipPublicEvent(prevFoundIndex, silent);
        this._hideTooltipSector(prevFoundIndex);
        dom.removeClass(tooltipElement, 'show');
        tooltipElement.style.cssText = '';
    },

    /**
     * To call beforeHideTooltip callback of public event.
     * @param {number} index index
     * @param {boolean} [silent] - options for hiding tooltip
     * @private
     */
    _fireBeforeHideTooltipPublicEvent: function(index, silent) {
        if (silent) {
            return;
        }

        this.eventBus.fire(chartConst.PUBLIC_EVENT_PREFIX + 'beforeHideTooltip', {
            chartType: this.chartType,
            index: index
        });
    }
});

function groupTooltipFactory(params) {
    return new GroupTooltip(params);
}

groupTooltipFactory.componentType = 'tooltip';
groupTooltipFactory.GroupTooltip = GroupTooltip;

module.exports = groupTooltipFactory;
