/**
 * @fileoverview BarTypeSeriesBase is base class for bar type series.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import chartConst from '../../const';
import labelHelper from './renderingLabelHelper';
import predicate from '../../helpers/predicate';
import calculator from '../../helpers/calculator';

import renderUtil from '../../helpers/renderUtil';
import raphaelRenderUtil from '../../plugins/raphaelRenderUtil';
import snippet from 'tui-code-snippet';

const { CHART_PADDING, LEGEND_LABEL_LEFT_PADDING } = chartConst;
const DEFAULT_BAR_SIZE_RATIO_BY_POINT_INTERVAL = 0.85;

class BarTypeSeriesBase {
  /**
   * Make series data.
   * @returns {object} add data
   * @private
   * @override
   */
  _makeSeriesData() {
    const groupBounds = this._makeBounds(this.layout.dimension);
    this.groupBounds = groupBounds;

    return {
      groupBounds,
      seriesDataModel: this._getSeriesDataModel(),
      isAvailable: () => groupBounds && groupBounds.length > 0
    };
  }

  /**
   * Get bar width option size.
   * @param {number} pointInterval point interval
   * @param {number} [optionBarWidth] barWidth option
   * @returns {number} option size
   * @private
   */
  _getBarWidthOptionSize(pointInterval, optionBarWidth) {
    let optionsSize = 0;

    if (optionBarWidth) {
      if (optionBarWidth / 2 >= pointInterval) {
        optionBarWidth = pointInterval * 2;
      } else if (optionBarWidth < 0) {
        optionBarWidth = 0;
      }
      optionsSize = optionBarWidth;
    }

    return optionsSize;
  }

  /**
   * Calculate difference between optionSize and barSize.
   * @param {number} barSize bar size
   * @param {number} optionSize option size
   * @param {number} itemCount item count
   * @returns {number} addition padding
   * @private
   */
  _calculateAdditionalPosition(barSize, optionSize, itemCount) {
    let additionalPosition = 0;

    if (optionSize && optionSize < barSize) {
      additionalPosition = barSize / 2 + ((barSize - optionSize) * itemCount) / 2;
    }

    return additionalPosition;
  }

  /**
   * Make base data for making bound.
   * @param {number} baseGroupSize base group size
   * @param {number} baseBarSize base bar size
   * @returns {undefined|{
   *      baseBarSize: number,
   *      groupSize: number,
   *      barSize: number,
   *      pointInterval: number,
   *      firstAdditionalPosition: number,
   *      basePosition: number
   * }}
   * @private
   */
  _makeBaseDataForMakingBound(baseGroupSize, baseBarSize) {
    const isStackType = predicate.isValidStackOption(this.options.stackType);
    const seriesDataModel = this._getSeriesDataModel();
    const groupSize = baseGroupSize / seriesDataModel.getGroupCount();
    const columnTopOffset = -this.layout.position.top + CHART_PADDING;
    const zeroToMin = this._getLimitDistanceFromZeroPoint(baseBarSize, this.limit).toMin;
    let positionValue, baseBounds;

    if (predicate.isColumnChart(this.chartType)) {
      positionValue = columnTopOffset;
    } else if (predicate.isBoxplotChart(this.chartType)) {
      positionValue = this.layout.position.top - CHART_PADDING;
    } else {
      positionValue = this.layout.position.left;
    }

    if (seriesDataModel.rawSeriesData.length > 0) {
      let itemCount;

      if (!isStackType) {
        itemCount = seriesDataModel.getFirstSeriesGroup().getSeriesItemCount();
      } else {
        itemCount = this.options.diverging ? 1 : this.dataProcessor.getStackCount(this.seriesType);
      }

      const pointInterval = groupSize / (itemCount + 1);
      const optionSize = this.options.barWidth || this.options.pointWidth;

      let barSize = pointInterval * DEFAULT_BAR_SIZE_RATIO_BY_POINT_INTERVAL;
      let basePosition = zeroToMin + positionValue;

      barSize = this._getBarWidthOptionSize(pointInterval, optionSize) || barSize;

      if (predicate.isColumnChart(this.chartType)) {
        basePosition = baseBarSize - basePosition;
      }

      if (predicate.isBoxplotChart(this.chartType) && zeroToMin) {
        basePosition -= zeroToMin * 2;
      }

      baseBounds = {
        baseBarSize,
        groupSize,
        barSize,
        pointInterval,
        basePosition,
        itemCount,
        firstAdditionalPosition: pointInterval
      };
    }

    return baseBounds;
  }

  /**
   * Render normal series label.
   * @param {object} paper paper
   * @returns {Array.<object>}
   * @private
   */
  _renderNormalSeriesLabel(paper) {
    const { graphRenderer } = this;
    const seriesDataModel = this._getSeriesDataModel();
    const boundsSet = this.seriesData.groupBounds;
    const labelTheme = this.theme.label;
    const selectedIndex = this.selectedLegendIndex;
    const groupLabels = seriesDataModel.map(seriesGroup =>
      seriesGroup.map(({ start, startLabel, endLabel }) => {
        const label = {
          end: this.decorateLabel(endLabel)
        };

        if (snippet.isExisty(start)) {
          label.start = this.decorateLabel(startLabel);
        }

        return label;
      })
    );

    let positionsSet;

    if (predicate.isBarChart(this.chartType)) {
      positionsSet = labelHelper.boundsToLabelPositionsForBarChart(
        seriesDataModel,
        boundsSet,
        labelTheme
      );
    } else {
      positionsSet = labelHelper.boundsToLabelPositionsForColumnChart(
        seriesDataModel,
        boundsSet,
        labelTheme
      );
    }

    return graphRenderer.renderSeriesLabel(
      paper,
      positionsSet,
      groupLabels,
      labelTheme,
      selectedIndex
    );
  }

  /**
   * Make sum values.
   * @param {Array.<number>} values values
   * @returns {number} sum result.
   * @private
   */
  _makeSumValues(values) {
    return renderUtil.formatValue({
      value: calculator.sum(values),
      formatFunctions: this.dataProcessor.getFormatFunctions(),
      chartType: this.chartType,
      areaType: 'series'
    });
  }

  /**
   * Make stackType label position.
   * @param {{width: number, height: number, left: number, top: number}} bound element bound
   * @returns {{left: number, top: number}} position
   * @private
   */
  _makeStackedLabelPosition({ top, left, width, height }) {
    return {
      left: left + width / 2,
      top: top + height / 2
    };
  }

  /**
   * Make labels html, when has stackType option.
   * @param {object} params parameters
   *      @param {number} params.groupIndex group index
   *      @param {Array.<object>} params.bounds bounds,
   * @returns {string} label positions
   * @private
   */
  _makeStackedLabelPositions(params) {
    const { seriesGroup } = params;
    const positions = seriesGroup.map((seriesItem, index) => {
      const bound = params.bounds[index];
      let position;

      if (bound && seriesItem) {
        position = this._makeStackedLabelPosition(bound.end);
      }

      return {
        end: position
      };
    });

    return positions;
  }

  getGroupLabels(seriesDataModel, sumPlusValues, sumMinusValues) {
    const isNormalStack = predicate.isNormalStack(this.options.stackType);

    return seriesDataModel.map(seriesGroup => {
      const labels = seriesGroup.map(seriesDatum => ({
        end: this.decorateLabel(seriesDatum.endLabel)
      }));

      if (isNormalStack) {
        sumPlusValues.push(calculator.sumPlusValues(seriesGroup.pluck('value')));

        const minusSum = calculator.sumMinusValues(seriesGroup.pluck('value'));
        if (minusSum < 0) {
          sumMinusValues.push(minusSum);
        }
      }

      return labels;
    });
  }

  getGroupPositions(seriesDataModel, groupBounds) {
    return seriesDataModel.map((seriesGroup, index) =>
      this._makeStackedLabelPositions({
        seriesGroup,
        bounds: groupBounds[index]
      })
    );
  }

  /**
   * Render series label, when has stackType option.
   * @param {object} paper paper
   * @returns {Array.<object>}
   * @private
   */
  _renderStackedSeriesLabel(paper) {
    const sumPlusValues = [];
    const sumMinusValues = [];
    const labelTheme = this.theme.label;
    const { groupBounds } = this.seriesData;
    const seriesDataModel = this._getSeriesDataModel();
    const groupPositions = this.getGroupPositions(seriesDataModel, groupBounds);
    const groupLabels = this.getGroupLabels(seriesDataModel, sumPlusValues, sumMinusValues);
    const isStacked = true;
    const isNormalStack = predicate.isNormalStack(this.options.stackType);
    const isBarChart = predicate.isBarChart(this.chartType);
    const dimensionType = isBarChart ? 'width' : 'height';
    const positionType = isBarChart ? 'left' : 'top';
    const direction = isBarChart ? 1 : -1;

    if (isNormalStack) {
      groupLabels.forEach((labels, index) => {
        const plusSumValue = sumPlusValues[index];
        let minusSumValue = sumMinusValues[index];

        if (minusSumValue < 0 && this.options.diverging) {
          minusSumValue *= -1;
        }

        labels.push({
          end: this.decorateLabel(renderUtil.formatToComma(plusSumValue))
        });

        if (sumMinusValues.length) {
          labels.push({
            end: this.decorateLabel(renderUtil.formatToComma(minusSumValue))
          });
        }
      });

      groupPositions.forEach((positions, index) => {
        const bounds = groupBounds[index];
        const lastBound = bounds[bounds.length - 1].end;
        const firstBound = bounds[Math.max(parseInt(bounds.length / 2, 10), 1) - 1].end;
        const plusEnd = this._makeStackedLabelPosition(lastBound);
        const minusEnd = this._makeStackedLabelPosition(firstBound);
        const plusLabel = sumPlusValues[index];
        const minusLabel = sumMinusValues[index];
        const plusLabelSize = raphaelRenderUtil.getRenderedTextSize(
          plusLabel,
          labelTheme.fontSize,
          labelTheme.fontFamily
        );
        const minusLabelSize = raphaelRenderUtil.getRenderedTextSize(
          minusLabel,
          labelTheme.fontSize,
          labelTheme.fontFamily
        );
        const lastBoundEndPosition = (lastBound[dimensionType] + plusLabelSize[dimensionType]) / 2;
        const firstBoundStartPosition =
          (firstBound[dimensionType] + minusLabelSize[dimensionType]) / 2;

        plusEnd[positionType] += (lastBoundEndPosition + LEGEND_LABEL_LEFT_PADDING) * direction;
        minusEnd[positionType] -= (firstBoundStartPosition + LEGEND_LABEL_LEFT_PADDING) * direction;

        positions.push({
          end: plusEnd
        });
        if (sumMinusValues.length) {
          positions.push({
            end: minusEnd
          });
        }
      });
    }

    return this.graphRenderer.renderSeriesLabel(
      paper,
      groupPositions,
      groupLabels,
      labelTheme,
      isStacked
    );
  }

  /**
   * Render series label.
   * @param {object} paper paper
   * @returns {Array.<object>}
   * @private
   */
  _renderSeriesLabel(paper) {
    if (this.options.stackType) {
      return this._renderStackedSeriesLabel(paper);
    }

    return this._renderNormalSeriesLabel(paper);
  }
}

BarTypeSeriesBase.mixin = function(func) {
  Object.assign(func.prototype, BarTypeSeriesBase.prototype);
};

export default BarTypeSeriesBase;
