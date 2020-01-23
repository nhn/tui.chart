/**
 * @fileoverview Raphael title renderer.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../const';
import raphaelRenderUtil from '../plugins/raphaelRenderUtil';
import arrayUtil from '../helpers/arrayUtil';
import renderUtil from '../helpers/renderUtil';
import calculator from '../helpers/calculator';
import snippet from 'tui-code-snippet';
const UNSELECTED_LEGEND_LABEL_OPACITY = 0.5;
const PAGINATION_POSITION_HEIGHT = 8;
const PAGINATION_POSITION_WIDTH = 10;
const PAGINATION_POSITION_HALF_WIDTH = PAGINATION_POSITION_WIDTH / 2;
const PAGINATION_POSITION_PADDING = 3;

/**
 * Get sum of icon and left padding width
 * @returns {number} - icon and left padding width
 * @ignore
 */
function getIconWidth() {
  return chartConst.LEGEND_ICON_WIDTH + chartConst.LEGEND_LABEL_LEFT_PADDING;
}

// const RaphaelLegendComponent = snippet.defineClass(/** @lends RaphaelLegendComponent.prototype */ {
class RaphaelLegendComponent {
  /** @lends RaphaelLegendComponent.prototype */
  constructor() {
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
  }

  /**
   * @param {Array.<object>} legendData Array of legend item data
   * @private
   */
  _renderLegendItems(legendData) {
    const labelPaddingLeft = chartConst.LEGEND_LABEL_LEFT_PADDING;
    const position = Object.assign({}, this.basePosition);

    legendData.forEach((legendDatum, index) => {
      const {
        iconType,
        index: legendIndex,
        isUnselected,
        labelHeight,
        checkbox: checkboxData
      } = legendDatum;
      const legendColor = legendDatum.colorByPoint ? '#aaa' : legendDatum.theme.color;
      const predicatedLegendWidth =
        position.left + this._calculateSingleLegendWidth(legendIndex, iconType);
      const isNeedBreakLine = predicatedLegendWidth >= this.paper.width;

      if (this.isHorizontal && isNeedBreakLine) {
        position.top += this._legendItemHeight + chartConst.LABEL_PADDING_TOP;
        position.left = this.basePosition.left;
      }

      if (this._showCheckbox) {
        this._renderCheckbox(position, {
          isChecked: checkboxData.checked,
          legendIndex,
          legendSet: this.legendSet
        });

        position.left += this._checkBoxWidth + labelPaddingLeft;
      }

      this._renderIcon(position, {
        legendColor,
        iconType,
        labelHeight,
        isUnselected,
        legendIndex,
        legendSet: this.legendSet
      });

      position.left += chartConst.LEGEND_ICON_WIDTH + labelPaddingLeft;

      this._renderLabel(position, {
        labelText: legendDatum.label,
        labelHeight,
        isUnselected,
        legendIndex,
        legendSet: this.legendSet
      });

      if (this.isHorizontal) {
        position.left += this.labelWidths[index] + chartConst.LEGEND_H_LABEL_RIGHT_PADDING;
      } else {
        position.left = this.basePosition.left;
        position.top += this._legendItemHeight + chartConst.LINE_MARGIN_TOP;
      }
    });
  }

  /**
   * @param {Array.<object>} legendData Array of legend item data
   * @param {number} sliceIndex slice index of
   * @returns {Array.<object>}
   * @private
   */
  _getLegendData(legendData, sliceIndex) {
    const positionTop = this.basePosition.top;
    const totalHeight = this.dimension.height;
    const chartHeight = this.paper.height;
    let resultLegendData = legendData;

    if (!this.isHorizontal && totalHeight + positionTop * 2 > chartHeight) {
      this._legendItemHeight = Math.max(legendData[0].labelHeight, chartConst.LEGEND_CHECKBOX_SIZE);
      const pageHeight = chartHeight - positionTop * 2;
      const singleItemHeight = this._legendItemHeight + chartConst.LINE_MARGIN_TOP;
      const visibleItemCount = Math.floor(pageHeight / singleItemHeight);

      resultLegendData = legendData.slice(
        (sliceIndex - 1) * visibleItemCount,
        sliceIndex * visibleItemCount
      );
    }

    return resultLegendData;
  }

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
  render(data) {
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

      const legendData = this._getLegendData(data.legendData, this._currentPageCount);

      this._renderLegendItems(legendData);

      if (!this.isHorizontal && legendData && legendData.length < data.legendData.length) {
        const legendHeight = this.paper.height - this.basePosition.top * 2;

        this.availablePageCount = Math.ceil(data.dimension.height / legendHeight);

        this._renderPaginationArea(this.basePosition, {
          width: data.dimension.width,
          height: legendHeight
        });
      }
    }

    return this.legendSet;
  }

  /**
   * @param {string} direction direction string of paginate 'next' or 'previous'
   * @private
   */
  _paginateLegendAreaTo(direction) {
    let pageNumber = this._currentPageCount;

    this._removeLegendItems();

    if (direction === 'next') {
      pageNumber += 1;
    } else {
      pageNumber -= 1;
    }

    this._renderLegendItems(this._getLegendData(this.originalLegendData, pageNumber));
  }

  _removeLegendItems() {
    this.legendSet.forEach(legendItem => {
      const events = legendItem.events || [];
      events.forEach(event => {
        event.unbind();
      });
      legendItem.remove();
    });
  }

  /**
   * @param {{top: number, left: number}} position legend area position
   * @param {{height: number, width: number}} dimension legend area dimension
   * @private
   */
  _renderPaginationArea(position, dimension) {
    const {
      LEGEND_PAGINATION_BUTTON_WIDTH,
      LEGEND_PAGINATION_BUTTON_PADDING_RIGHT,
      LEGEND_AREA_V_PADDING,
      LEGEND_AREA_H_PADDING
    } = chartConst;
    const controllerPositionTop = position.top + dimension.height - LEGEND_AREA_V_PADDING;
    const controllerPositionLeft = position.left - LEGEND_AREA_H_PADDING;
    const leftButtonPositionLeft = controllerPositionLeft + LEGEND_AREA_H_PADDING;
    const rightButtonPositionLeft = calculator.sum([
      leftButtonPositionLeft,
      LEGEND_PAGINATION_BUTTON_PADDING_RIGHT,
      LEGEND_PAGINATION_BUTTON_WIDTH
    ]);
    const lowerArrowPath = [
      'M',
      rightButtonPositionLeft + 5,
      ',',
      controllerPositionTop + PAGINATION_POSITION_PADDING + 4,
      'L',
      rightButtonPositionLeft + PAGINATION_POSITION_HALF_WIDTH + 5,
      ',',
      controllerPositionTop + PAGINATION_POSITION_HEIGHT + 4,
      'L',
      rightButtonPositionLeft + PAGINATION_POSITION_WIDTH + 5,
      ',',
      controllerPositionTop + PAGINATION_POSITION_PADDING + 4
    ].join('');
    const upperArrowPath = [
      'M',
      leftButtonPositionLeft + 5,
      ',',
      controllerPositionTop + PAGINATION_POSITION_HEIGHT + 4,
      'L',
      leftButtonPositionLeft + PAGINATION_POSITION_HALF_WIDTH + 5,
      ',',
      controllerPositionTop + PAGINATION_POSITION_PADDING + 4,
      'L',
      leftButtonPositionLeft + PAGINATION_POSITION_WIDTH + 5,
      ',',
      controllerPositionTop + PAGINATION_POSITION_HEIGHT + 4
    ].join('');

    const prevRect = this._renderPaginationRect({
      top: controllerPositionTop,
      left: leftButtonPositionLeft
    });
    const prevArrow = raphaelRenderUtil.renderLine(this.paper, upperArrowPath, '#555', 2);

    const nextRect = this._renderPaginationRect({
      top: controllerPositionTop,
      left: rightButtonPositionLeft
    });
    const nextArrow = raphaelRenderUtil.renderLine(this.paper, lowerArrowPath, '#555', 2);
    const prevButtonSet = this.paper.set();
    const nextButtonSet = this.paper.set();

    prevRect.className = 'tui-chart-icon';
    prevButtonSet.push(prevRect);
    prevButtonSet.push(prevArrow);

    nextRect.className = 'tui-chart-icon';
    nextButtonSet.push(nextRect);
    nextButtonSet.push(nextArrow);

    prevButtonSet.click(() => {
      if (this._currentPageCount > 1) {
        this._paginateLegendAreaTo('previous');
        this._currentPageCount -= 1;
      }
    });

    nextButtonSet.click(() => {
      if (this._currentPageCount < this.availablePageCount) {
        this._paginateLegendAreaTo('next');
        this._currentPageCount += 1;
      }
    });
  }

  /**
   * @param {object} position - position top, left
   * @returns {SVGElement} - svg element
   * @private
   */
  _renderPaginationRect(position) {
    const BUTTON_SIZE = chartConst.LEGEND_PAGINATION_BUTTON_WIDTH;
    const bound = {
      left: position.left,
      top: position.top,
      width: BUTTON_SIZE,
      height: BUTTON_SIZE
    };
    const rect = raphaelRenderUtil.renderRect(this.paper, bound, {
      fill: '#f4f4f4',
      rx: '1px',
      ry: '1px',
      stroke: 'none'
    });

    return rect;
  }

  /**
   * Make labels width.
   * @param {Array.<{chartType: ?string, label: string}>} legendData legend data
   * @param {object} theme theme object
   * @param {number} maxWidth user option legend max width size
   * @returns {Array.<number>} label widths
   */
  makeLabelWidths(legendData, theme, maxWidth) {
    return snippet.map(legendData, item => {
      let labelWidth = raphaelRenderUtil.getRenderedTextSize(
        item.label,
        theme.fontSize,
        theme.fontFamily
      ).width;
      if (maxWidth && labelWidth > maxWidth) {
        labelWidth = maxWidth;
      }

      return labelWidth + chartConst.LEGEND_LABEL_LEFT_PADDING;
    });
  }

  /**
   * Get rendered label height
   * @param {string} labelText label text
   * @param {object} theme theme object
   * @returns {number}
   */
  getRenderedLabelHeight(labelText, theme) {
    return raphaelRenderUtil.getRenderedTextSize(labelText, theme.fontSize, theme.fontFamily)
      .height;
  }

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
  _renderLabel(position, data) {
    const { eventBus, labelTheme } = this;
    const pos = {
      left: position.left,
      top: position.top + this._legendItemHeight / 2
    };
    const attributes = {
      fill: labelTheme.color,
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      opacity: data.isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1,
      'text-anchor': 'start'
    };
    const label = raphaelRenderUtil.renderText(this.paper, pos, data.labelText, attributes);

    label.data('index', data.legendIndex);

    label.node.style.userSelect = 'none';
    label.node.style.cursor = 'pointer';

    data.legendSet.push(label);

    label.click(() => {
      eventBus.fire('labelClicked', data.legendIndex);
    });
  }

  /**
   * Render checkbox
   * @param {object} position left, top
   * @param {object} data rendering data
   * @private
   */
  _renderCheckbox(position, data) {
    const { left } = position;
    const top = position.top + (this._legendItemHeight - this._checkBoxHeight) / 2;
    const checkboxPathSize = this._checkBoxWidth / 3;
    const checkboxPathHalpSize = this._checkBoxWidth / 5.7;
    const vPathString = renderUtil.oneLineTrim`
            M${this._checkBoxWidth * 0.25 + left}
            ,${this._checkBoxHeight * 0.5 + top}
            l${checkboxPathHalpSize}
            ,${checkboxPathHalpSize}
            l${checkboxPathSize}
            ,-${checkboxPathSize}
        `;

    const checkboxSet = this.paper.set();
    const checkboxElement = this.paper
      .rect(left, top, this._checkBoxWidth, this._checkBoxHeight, 0)
      .attr({
        fill: '#fff',
        stroke: '#aaa',
        'stroke-width': 1
      });
    checkboxElement.node.setAttribute('class', 'auto-shape-rendering');

    checkboxSet.push(checkboxElement);

    if (data.isChecked) {
      const checkElement = this.paper.path(vPathString).attr({
        stroke: '#555',
        'stroke-width': 2
      });
      checkElement.node.setAttribute('class', 'auto-shape-rendering');
      checkboxSet.push(checkElement);
    }

    checkboxSet.data('index', data.legendIndex);
    checkboxSet.click(() => {
      this.eventBus.fire('checkboxClicked', data.legendIndex);
    });

    checkboxSet.forEach(checkbox => {
      data.legendSet.push(checkbox);
    });
  }

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
  _renderIcon(position, data) {
    let icon;
    this.paper.setStart();

    if ((data.iconType === 'line' || data.iconType === 'radial') && this.paper.canvas.transform) {
      icon = this.paper.path(chartConst.LEGEND_LINE_ICON_PATH);

      icon.attr({
        stroke: data.legendColor,
        'stroke-width': 2,
        'stroke-opacity': data.isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1
      });
      icon.translate(position.left, position.top);
    } else {
      icon = raphaelRenderUtil.renderRect(
        this.paper,
        {
          left: position.left,
          top: position.top + (chartConst.LEGEND_CHECKBOX_SIZE - chartConst.LEGEND_ICON_HEIGHT) / 2,
          width: chartConst.LEGEND_ICON_WIDTH,
          height: chartConst.LEGEND_ICON_HEIGHT
        },
        {
          'stroke-width': 0,
          fill: data.legendColor,
          opacity: data.isUnselected ? UNSELECTED_LEGEND_LABEL_OPACITY : 1
        }
      );
    }

    icon.data('icon', data.iconType);
    icon.data('index', data.legendIndex);
    icon.click(() => {
      this.eventBus.fire('labelClicked', data.legendIndex);
    });

    data.legendSet.push(icon);
  }

  selectLegend(index, legendSet) {
    legendSet.forEach(element => {
      const indexData = element.data('index');
      const attributeName = element.data('icon') === 'line' ? 'stroke-opacity' : 'opacity';

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
  }

  /**
   * get checkbox area's width depends on checkbox visibility
   * @returns {number} - checkbox region's width
   * @private
   */
  _getCheckboxWidth() {
    return this._showCheckbox ? this._checkBoxWidth + chartConst.LEGEND_LABEL_LEFT_PADDING : 0;
  }

  /**
   * Get width of a label when parameter is given.
   * Otherwise, returns maximum width of labels
   * @param {number} [index] - legend index
   * @returns {number} - maximum label width  label width
   * @private
   */
  _getLabelWidth(index) {
    let labelWidth;
    if (index) {
      labelWidth = this.labelWidths[index] || 0;
    } else {
      labelWidth = arrayUtil.max(this.labelWidths);
    }

    return labelWidth;
  }

  /**
   * calulate a whole legend width before start rendering
   * @returns {number} - calculate label
   * @private
   */
  _calculateLegendWidth() {
    return this._calculateSingleLegendWidth();
  }

  /**
   * calculate a single legend width of index `legendIndex`
   * @param {number} legendIndex - index of legend label
   * @returns {number} - calculate single legend width
   * @private
   */
  _calculateSingleLegendWidth(legendIndex) {
    return (
      chartConst.LEGEND_AREA_H_PADDING +
      this._getCheckboxWidth() +
      getIconWidth() +
      this._getLabelWidth(legendIndex) +
      chartConst.LEGEND_AREA_H_PADDING
    );
  }

  /**
   * set component dimension by comparaing label height and icon height
   * @param {number} labelHeight - label height
   * @private
   */
  _setComponentDimensionsBaseOnLabelHeight(labelHeight) {
    this._legendItemHeight = Math.max(labelHeight, chartConst.LEGEND_CHECKBOX_SIZE);
    this._checkBoxWidth = this._checkBoxHeight = chartConst.LEGEND_CHECKBOX_SIZE;
  }
}

export default RaphaelLegendComponent;
