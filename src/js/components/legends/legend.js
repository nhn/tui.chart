/**
 * @fileoverview  Legend component.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import LegendModel from './legendModel';
import pluginFactory from '../../factories/pluginFactory';
import predicate from '../../helpers/predicate';
import raphaelRenderUtil from '../../plugins/raphaelRenderUtil';
import snippet from 'tui-code-snippet';

const {
  LEGEND_ICON_HEIGHT,
  LINE_MARGIN_TOP,
  LEGEND_AREA_H_PADDING,
  PUBLIC_EVENT_PREFIX
} = chartConst;

class Legend {
  /**
   * Legend component.
   * @constructs Legend
   * @private
   * @param {object} params parameters
   *      @param {object} params.theme - axis theme
   *      @param {?Array.<string>} params.seriesTypes - series types
   *      @param {string} params.chart - chart type
   *      @param {object} params.dataProcessor - data processor
   *      @param {object} params.eventBus - chart event bus
   */
  constructor(params) {
    /**
     * legend theme
     * @type {object}
     */
    this.theme = params.theme;

    /**
     * options
     * @type {Object}
     */
    this.options = params.options || {};

    /**
     * chart type
     * @type {string}
     */
    this.chartType = params.chartType;

    /**
     * series types
     * @type {?Array.<string>}
     */
    this.seriesTypes = params.seriesTypes || [this.chartType];

    /**
     * event bus for transmitting message
     * @type {object}
     */
    this.eventBus = params.eventBus;

    /**
     * Legend view className
     */
    this.className = 'tui-chart-legend-area';

    /**
     * DataProcessor instance
     * @type {DataProcessor}
     */
    this.dataProcessor = params.dataProcessor;

    /**
     * legend model
     */
    this.legendModel = new LegendModel({
      theme: this.theme,
      labels: params.dataProcessor.getLegendLabels(),
      legendData: params.dataProcessor.getLegendData(),
      seriesTypes: this.seriesTypes,
      chartType: this.chartType
    });

    /**
     * layout bounds information for this components
     * @type {null|{dimension:{width:number, height:number}, position:{left:number, top:number}}}
     */
    this.layout = null;

    /**
     * Graph renderer
     * @type {object}
     */
    this.graphRenderer = pluginFactory.get(chartConst.COMPONENT_TYPE_RAPHAEL, 'legend');

    /**
     * Paper for rendering legend
     * @type {object}
     */
    this.paper = null;

    this.drawingType = chartConst.COMPONENT_TYPE_RAPHAEL;
  }

  /**
   * Preset components for setData
   * @param {object} theme theme object
   * @ignore
   */
  presetForChangeData(theme = this.theme) {
    this.theme = theme;

    this.legendModel = new LegendModel({
      theme: this.theme,
      labels: this.dataProcessor.getLegendLabels(),
      legendData: this.dataProcessor.getLegendData(),
      seriesTypes: this.seriesTypes,
      chartType: this.chartType
    });
  }

  /**
   * Set data for rendering.
   * @param {{
   *      layout: {
   *          dimension: {width: number, height: number},
   *          position: {left: number, top: number}
   *      }
   * }} data - bounds data
   * @private
   */
  _setDataForRendering(data) {
    if (data) {
      this.layout = data.layout;
      this.paper = data.paper;
    }
  }

  /**
   * Render legend component.
   * @param {object} data - bounds data
   */
  _render(data) {
    this._setDataForRendering(data);
    this.legendSet = this._renderLegendArea(data.paper);
  }

  /**
   * Render legend component and listen legend event.
   * @param {object} data - bounds data
   */
  render(data) {
    this._render(data);
    this._listenEvents();
  }

  /**
   * Rerender.
   * @param {object} data - bounds data
   */
  rerender(data) {
    this.legendSet.remove();

    this._render(data);
  }

  /**
   * Rerender, when resizing chart.
   * @param {object} data - bounds data
   */
  resize(data) {
    this.rerender(data);
  }

  /**
   * Get legend rendering data
   * @param {Array} legendData legned data
   * @param {number} labelHeight lebel height
   * @param {Array.<number>} labelWidths label widths
   * @returns {Array.<object>}
   * @private
   */
  _getLegendRenderingData(legendData, labelHeight, labelWidths) {
    const { maxWidth } = this.options;
    const colorByPoint =
      (predicate.isBarTypeChart(this.chartType) || predicate.isBoxplotChart(this.chartType)) &&
      this.dataProcessor.options.series.colorByPoint;

    return legendData.map((legendDatum, index) => {
      const checkbox =
        this.options.showCheckbox === false
          ? null
          : {
              checked: this.legendModel.isCheckedIndex(index)
            };
      let legendLabel = legendDatum.label;

      if (maxWidth) {
        legendLabel = raphaelRenderUtil.getEllipsisText(legendLabel, maxWidth, this.theme.label);
      }

      return {
        checkbox,
        iconType: legendDatum.chartType || 'rect',
        colorByPoint,
        index,
        theme: legendDatum.theme,
        label: legendLabel,
        labelHeight,
        labelWidth: labelWidths[index],
        isUnselected: this.legendModel.isUnselectedIndex(index)
      };
    });
  }

  /**
   * Render legend area.
   * @param {object} paper paper object
   * @returns {Array.<object>}
   * @private
   */
  _renderLegendArea(paper) {
    const legendData = this.legendModel.getData();
    const { graphRenderer } = this;
    const isHorizontal = predicate.isHorizontalLegend(this.options.align);
    const basePosition = this.layout.position;
    const labelWidths = graphRenderer.makeLabelWidths(
      legendData,
      this.theme.label,
      this.options.maxWidth
    );
    const labelTheme = legendData[0] ? legendData[0].theme : {};
    const labelHeight = graphRenderer.getRenderedLabelHeight('DEFAULT_TEXT', labelTheme) - 1;
    const labelCount = labelWidths.length;
    const legendItemHeight = Math.max(LEGEND_ICON_HEIGHT, labelHeight);
    const dimensionHeight = (LINE_MARGIN_TOP + legendItemHeight) * (isHorizontal ? 1 : labelCount);
    const { top } = basePosition;
    let { left } = basePosition;

    if (!predicate.isLegendAlignLeft(this.options.align)) {
      left += LEGEND_AREA_H_PADDING;
    }

    return graphRenderer.render({
      paper,
      legendData: this._getLegendRenderingData(legendData, labelHeight, labelWidths),
      isHorizontal,
      position: {
        left,
        top
      },
      dimension: {
        height: dimensionHeight,
        width: this.layout.dimension.width
      },
      labelTheme: this.theme.label,
      labelWidths,
      eventBus: this.eventBus
    });
  }

  /**
   * Fire onChangeCheckedLegends event.
   * @private
   */
  _fireChangeCheckedLegendsEvent() {
    this.eventBus.fire('changeCheckedLegends', this.legendModel.getCheckedIndexes());
  }

  /**
   * Fire changeCheckedLegends public event.
   * @private
   */
  _fireChangeCheckedLegendsPublicEvent() {
    this.eventBus.fire(
      `${PUBLIC_EVENT_PREFIX}changeCheckedLegends`,
      this.legendModel.getCheckedIndexes()
    );
  }

  /**
   * Fire selectLegend event.
   * @param {{chartType: string, index: number}} data data
   * @private
   */
  _fireSelectLegendEvent(data) {
    const index = this.legendModel.getSelectedIndex();
    const legendIndex = !snippet.isNull(index) ? data.seriesIndex : index;

    this.eventBus.fire('selectLegend', data.chartType, legendIndex);
  }

  /**
   * Fire selectLegend public event.
   * @param {{label: string, chartType: string, index: number}} data data
   * @private
   */
  _fireSelectLegendPublicEvent({ label, index, chartType }) {
    this.eventBus.fire(`${PUBLIC_EVENT_PREFIX}selectLegend`, {
      legend: label,
      chartType,
      index
    });
  }

  /**
   * Select legend.
   * @param {number} index index
   * @private
   */
  _selectLegend(index) {
    const data = this.legendModel.getDatum(index);

    this.legendModel.toggleSelectedIndex(index);

    if (
      !snippet.isNull(this.legendModel.getSelectedIndex()) &&
      !this.legendModel.isCheckedSelectedIndex()
    ) {
      this.legendModel.checkSelectedIndex();
      this._fireChangeCheckedLegendsEvent();
    }

    this.dataProcessor.selectLegendIndex = this.legendModel.getSelectedIndex();
    this.graphRenderer.selectLegend(this.dataProcessor.selectLegendIndex, this.legendSet);

    this._fireSelectLegendEvent(data);
    this._fireSelectLegendPublicEvent(data);
  }

  /**
   * Get checked indexes.
   * @returns {Array} checked indexes
   * @private
   */
  _getCheckedIndexes() {
    const checkedIndexes = [];

    this.legendModel.checkedWholeIndexes.forEach((checkbox, index) => {
      if (checkbox) {
        checkedIndexes.push(index);
      }
    });

    return checkedIndexes;
  }

  /**
   * Get checked indexes.
   * @returns {{column: ?Array.<string>, line: ?Array.<string>}} object data that whether series has checked or not
   * @ignore
   */
  getCheckedIndexes() {
    return this.legendModel.getCheckedIndexes();
  }

  /**
   * Check legend.
   * @private
   */
  _checkLegend() {
    const selectedData = this.legendModel.getSelectedDatum();

    if (!this.legendModel.isCheckedSelectedIndex()) {
      this.legendModel.updateSelectedIndex(null);
    }

    this._fireChangeCheckedLegendsEvent();
    this._fireChangeCheckedLegendsPublicEvent();

    if (selectedData) {
      this._fireSelectLegendEvent(selectedData);
    }
  }

  /**
   * On click event handler.
   * @param {number} index checkbox index
   * @private
   */
  _checkboxClick(index) {
    this.legendModel.toggleCheckedIndex(index);

    const checkedIndexes = this._getCheckedIndexes();

    if (checkedIndexes.length > 0) {
      this.legendModel.updateCheckedLegendsWith(checkedIndexes);
      this._checkLegend();
    } else {
      this.legendModel.toggleCheckedIndex(index);
    }
  }

  /**
   * On click event handler.
   * @param {number} index selected index
   * @private
   */
  _labelClick(index) {
    this._selectLegend(index);
  }

  /**
   * Listen legend events
   * @private
   */
  _listenEvents() {
    this.eventBus.on('checkboxClicked', this._checkboxClick, this);
    this.eventBus.on('labelClicked', this._labelClick, this);
  }
}

snippet.CustomEvents.mixin(Legend);

/**
 * Factory for Legend
 * @param {object} params parameter
 * @returns {object|null}
 * @ignore
 */
export default function legendFactory(params) {
  const {
    options,
    dataProcessor: { seriesTypes },
    chartOptions: { chartType }
  } = params;
  const isLegendVisible = snippet.isUndefined(options.visible) ? true : options.visible;
  let legend = null;

  if (isLegendVisible) {
    params.seriesTypes = seriesTypes;
    params.chartType = chartType;

    // @todo should extends additionalParams added when addComponents(), should grasp the omitted
    legend = new Legend(params);
  }

  return legend;
}

legendFactory.componentType = 'legend';
legendFactory.Legend = Legend;
