/**
 * @fileoverview Group tooltip component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import TooltipBase from './tooltipBase';
import GroupTooltipPositionModel from './groupTooltipPositionModel';
import chartConst from '../../const';
import dom from '../../helpers/domHandler';
import renderUtil from '../../helpers/renderUtil';
import defaultTheme from '../../themes/defaultTheme';
import tooltipTemplate from './tooltipTemplate';
import snippet from 'tui-code-snippet';
import predicate from '../../helpers/predicate';
const {
  TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION,
  TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION,
  SERIES_EXPAND_SIZE,
  PUBLIC_EVENT_PREFIX
} = chartConst;

/**
 * @classdesc GroupTooltip component.
 * @class GroupTooltip
 * @private
 */
class GroupTooltip extends TooltipBase {
  /**
   * Group tooltip component.
   * @constructs GroupTooltip
   * @private
   * @override
   */
  constructor(params) {
    super(params);
    this.prevIndex = null;
    this.isBullet = predicate.isBulletChart(params.chartType);
  }

  /**
   * Make tooltip html.
   * @param {string} category category
   * @param {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} items items data
   * @param {string} rawCategory raw category
   * @param {number} groupIndex group index
   * @returns {string} tooltip html
   * @private
   */
  _makeTooltipHtml(category, items, rawCategory, groupIndex) {
    const template = tooltipTemplate.tplGroupItem;
    const cssTextTemplate = tooltipTemplate.tplGroupCssText;
    const isBar = predicate.isBarTypeChart(this.chartType);
    const isBoxplot = predicate.isBoxplotChart(this.chartType);
    const colorByPoint = (isBar || isBoxplot) && this.dataProcessor.options.series.colorByPoint;
    const colors = this._makeColors(this.theme, groupIndex);
    let prevType;

    const itemsHtml = items
      .map((item, index) => {
        const { type } = item;
        const typeVisible = type !== 'data' && prevType !== type;
        let itemHtml = '';

        prevType = type;

        if (!item.value) {
          return null;
        }

        if (typeVisible) {
          itemHtml = tooltipTemplate.tplGroupType({
            type
          });
        }

        itemHtml += template(
          snippet.extend(
            {
              cssText: cssTextTemplate({ color: colorByPoint ? '#aaa' : colors[index] })
            },
            item
          )
        );

        return itemHtml;
      })
      .join('');

    return tooltipTemplate.tplGroup({
      category,
      items: itemsHtml
    });
  }

  /**
   * Set default align option of tooltip.
   * @private
   * @override
   */
  _setDefaultTooltipPositionOption() {
    if (this.options.align) {
      return;
    }

    if (this.isVertical) {
      this.options.align = TOOLTIP_DEFAULT_GROUP_ALIGN_OPTION;
    } else {
      this.options.align = TOOLTIP_DEFAULT_GROUP_HORIZONTAL_ALIGN_OPTION;
    }
  }

  /**
   * Render tooltip component.
   * @returns {HTMLElement}
   * @override
   */
  render(data) {
    const container = TooltipBase.prototype.render.call(this, data);
    const chartDimension = this.dimensionMap.chart;
    const bound = this.layout;

    if (data.checkedLegends) {
      this.theme = this._updateLegendTheme(data.checkedLegends);
    }

    this.positionModel = new GroupTooltipPositionModel(
      chartDimension,
      bound,
      this.isVertical,
      this.options
    );

    return container;
  }

  /**
   * Rerender.
   * @param {{checkedLegends: Array.<boolean>}} data rendering data
   * @override
   */
  rerender(data) {
    TooltipBase.prototype.rerender.call(this, data);
    this.prevIndex = null;

    if (data.checkedLegends) {
      this.theme = this._updateLegendTheme(data.checkedLegends);
    }
  }

  /**
   * Zoom.
   */
  zoom() {
    this.prevIndex = null;
    TooltipBase.prototype.zoom.call(this);
  }

  /**
   * Update legend theme.
   * @param {object | Array.<boolean>}checkedLegends checked legends
   * @returns {{colors: Array.<string>}} legend theme
   * @private
   */
  _updateLegendTheme(checkedLegends) {
    const colors = [];
    const chartTypes = Object.keys(this.originalTheme);

    chartTypes.forEach(chartType => {
      const chartColors = this.originalTheme[chartType].colors;
      chartColors.forEach((color, index) => {
        const _checkedLegends = checkedLegends[chartType] || checkedLegends;
        if (_checkedLegends[index]) {
          colors.push(color);
        }
      });
    });

    return {
      colors
    };
  }

  /**
   * Make tooltip data.
   * @returns {Array.<object>} tooltip data
   * @override
   */
  makeTooltipData() {
    const length = this.dataProcessor.getCategoryCount(this.isVertical);

    return this.dataProcessor.getSeriesGroups().map((seriesGroup, index) => {
      const values = seriesGroup.map(item => ({
        type: item.type || 'data',
        label: item.tooltipLabel || item.label
      }));

      return {
        category: this.dataProcessor.makeTooltipCategory(index, length - index, this.isVertical),
        values
      };
    });
  }

  /**
   * Make colors.
   * @param {object} theme tooltip theme
   * @param {number} [groupIndex] groupIndex
   * @returns {Array.<string>} colors
   * @private
   */
  _makeColors(theme, groupIndex) {
    let colorIndex = 0;
    const legendLabels = this.dataProcessor.getLegendData();
    let colors, prevChartType;

    if (this.isBullet) {
      return this.dataProcessor.getGraphColors()[groupIndex];
    }

    if (theme.colors) {
      return theme.colors;
    }

    const defaultColors = defaultTheme.series.colors.slice(0, legendLabels.length);

    return snippet.pluck(legendLabels, 'chartType').map(chartType => {
      if (prevChartType !== chartType) {
        colors = theme[chartType] ? theme[chartType].colors : defaultColors;
        colorIndex = 0;
      }

      prevChartType = chartType;
      const color = colors[colorIndex];
      colorIndex += 1;

      return color;
    });
  }

  /**
   * Make rendering data about legend item.
   * @param {Array.<string>} values values
   * @param {number} groupIndex groupIndex
   * @returns {Array.<{value: string, legend: string, chartType: string, suffix: ?string}>} legend item data.
   * @private
   */
  _makeItemRenderingData(values, groupIndex) {
    const { dataProcessor, suffix } = this;

    return values.map((data, index) => {
      const item = {
        value: data.label,
        type: data.type,
        suffix,
        legend: ''
      };
      let legendLabel;

      if (this.isBullet) {
        legendLabel = dataProcessor.getLegendItem(groupIndex);
      } else {
        legendLabel = dataProcessor.getLegendItem(index);
        item.legend = legendLabel.label;
      }

      item.chartType = legendLabel.chartType;

      return item;
    });
  }

  /**
   * Make tooltip.
   * @param {number} groupIndex group index
   * @returns {string} tooltip html
   * @private
   */
  _makeGroupTooltipHtml(groupIndex) {
    const data = this.data[groupIndex];
    let htmlString = '';

    if (data) {
      const items = this._makeItemRenderingData(data.values, groupIndex);
      htmlString = this.templateFunc(
        data.category,
        items,
        this.getRawCategory(groupIndex),
        groupIndex
      );
    }

    return htmlString;
  }

  /**
   * Get tooltip sector element.
   * @returns {HTMLElement} sector element
   * @private
   */
  _getTooltipSectorElement() {
    if (!this.groupTooltipSector) {
      const groupTooltipSector = (this.groupTooltipSector = dom.create(
        'DIV',
        'tui-chart-group-tooltip-sector'
      ));
      dom.append(this.tooltipContainer, groupTooltipSector);
    }

    return this.groupTooltipSector;
  }

  /**
   * Make bound about tooltip sector of vertical type chart.
   * @param {number} height height
   * @param {{start: number, end: number}} range range
   * @param {boolean} isLine whether line or not
   * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
   * @private
   */
  _makeVerticalTooltipSectorBound(height, range, isLine) {
    let width;

    if (isLine) {
      width = 1;
    } else {
      width = range.end - range.start;
    }

    return {
      dimension: {
        width,
        height
      },
      position: {
        left: range.start,
        top: SERIES_EXPAND_SIZE
      }
    };
  }

  /**
   * Make bound about tooltip sector of horizontal type chart.
   * @param {number} width width
   * @param {{start: number, end:number}} range range
   * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
   * @private
   */
  _makeHorizontalTooltipSectorBound(width, range) {
    return {
      dimension: {
        width,
        height: range.end - range.start
      },
      position: {
        left: SERIES_EXPAND_SIZE,
        top: range.start
      }
    };
  }

  /**
   * Make bound about tooltip sector.
   * @param {number} size width or height
   * @param {{start: number, end:number}} range range
   * @param {boolean} isVertical whether vertical or not
   * @param {boolean} isLine whether line type or not
   * @returns {{dimension: {width: number, height: number}, position: {left: number, top: number}}} bound
   * @private
   */
  _makeTooltipSectorBound(size, range, isVertical, isLine) {
    if (isVertical) {
      return this._makeVerticalTooltipSectorBound(size, range, isLine);
    }

    return this._makeHorizontalTooltipSectorBound(size, range);
  }

  /**
   * Show tooltip sector.
   * @param {number} size width or height
   * @param {{start: number, end:number}} range range
   * @param {boolean} isVertical whether vertical or not
   * @param {number} index index
   * @param {boolean} [isMoving] whether moving or not
   * @private
   */
  _showTooltipSector(size, range, isVertical, index, isMoving) {
    const groupTooltipSector = this._getTooltipSectorElement();
    const isLine = range.start === range.end;
    const bound = this._makeTooltipSectorBound(size, range, isVertical, isLine);

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
  }

  /**
   * Hide tooltip sector.
   * @param {number} index index
   * @private
   */
  _hideTooltipSector(index) {
    const groupTooltipSector = this._getTooltipSectorElement();

    if (!dom.hasClass(groupTooltipSector, 'show')) {
      this.eventBus.fire('hideGroupTooltipLine');
    } else {
      dom.removeClass(groupTooltipSector, 'show');
    }
    this.eventBus.fire('hideGroupAnimation', index);
    this.eventBus.fire('hideGroupTooltipLine');
  }

  /**
   * Show tooltip.
   * @param {HTMLElement} elTooltip tooltip element
   * @param {{index: number, range: {start: number, end: number},
   *          size: number, direction: string, isVertical: boolean
   *        }} params coordinate event parameters
   * @param {{left: number, top: number}} prevPosition prev position
   * @private
   */
  _showTooltip(elTooltip, params, prevPosition) {
    if (!snippet.isNull(this.prevIndex)) {
      this.eventBus.fire('hideGroupAnimation', this.prevIndex);
    }

    elTooltip.innerHTML = this._makeGroupTooltipHtml(params.index);

    this._fireBeforeShowTooltipPublicEvent(params.index, params.range, params.silent);

    if (document.getElementsByClassName) {
      this.makeLineLegendIcon(elTooltip.querySelectorAll('.tui-chart-legend-rect.line'));
    }

    dom.addClass(elTooltip, 'show');

    this._showTooltipSector(
      params.size,
      params.range,
      params.isVertical,
      params.index,
      params.isMoving
    );

    const dimension = this.getTooltipDimension(elTooltip);
    const position = this.positionModel.calculatePosition(dimension, params.range);

    this._moveToPosition(elTooltip, position, prevPosition);

    this._fireAfterShowTooltipPublicEvent(
      params.index,
      params.range,
      {
        element: elTooltip,
        position
      },
      params.silent
    );

    this.prevIndex = params.index;
  }

  /**
   * To call beforeShowTooltip callback of public event.
   * @param {number} index index
   * @param {{start: number, end: number}} range range
   * @param {boolean} [silent] - whether invoke a public beforeHideTooltip event or not
   * @private
   */
  _fireBeforeShowTooltipPublicEvent(index, range, silent) {
    if (silent) {
      return;
    }

    this.eventBus.fire(`${PUBLIC_EVENT_PREFIX}beforeShowTooltip`, {
      chartType: this.chartType,
      index,
      range
    });
  }

  /**
   * To call afterShowTooltip callback of public event.
   * @param {number} index index
   * @param {{start: number, end: number}} range range
   * @param {object} additionParams addition parameters
   * @param {boolean} [silent] - whether invoke a public beforeHideTooltip event or not
   * @private
   */
  _fireAfterShowTooltipPublicEvent(index, range, additionParams, silent) {
    if (silent) {
      return;
    }
    this.eventBus.fire(
      `${PUBLIC_EVENT_PREFIX}afterShowTooltip`,
      Object.assign(
        {
          chartType: this.chartType,
          index,
          range
        },
        additionParams
      )
    );
  }

  /**
   * Hide tooltip.
   * @param {HTMLElement} tooltipElement tooltip element
   * @param {number} prevFoundIndex - showing tooltip index
   * @param {object} [options] - options for hiding tooltip
   * @private
   */
  _hideTooltip(tooltipElement, prevFoundIndex, options) {
    const silent = !!(options && options.silent);
    this.prevIndex = null;
    this._fireBeforeHideTooltipPublicEvent(prevFoundIndex, silent);
    this._hideTooltipSector(prevFoundIndex);
    dom.removeClass(tooltipElement, 'show');
    tooltipElement.style.cssText = '';
  }

  /**
   * To call beforeHideTooltip callback of public event.
   * @param {number} index index
   * @param {boolean} [silent] - options for hiding tooltip
   * @private
   */
  _fireBeforeHideTooltipPublicEvent(index, silent) {
    if (silent) {
      return;
    }

    this.eventBus.fire(`${PUBLIC_EVENT_PREFIX}beforeHideTooltip`, {
      chartType: this.chartType,
      index
    });
  }
}

/**
 * groupTooltipFactory
 * @param {object} params chart options
 * @returns {object} group tooltip instance
 * @ignore
 */
export default function groupTooltipFactory(params) {
  return new GroupTooltip(params);
}

groupTooltipFactory.componentType = 'tooltip';
groupTooltipFactory.GroupTooltip = GroupTooltip;
