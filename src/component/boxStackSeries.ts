import BoxSeries, { isLeftBottomSide, SeriesDirection } from './boxSeries';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  ColumnChartOptions,
  BarChartOptions,
  Point,
  Connector,
} from '@t/options';
import {
  ChartState,
  StackSeriesData,
  StackGroupData,
  BoxType,
  Stack,
  StackDataValues,
  PercentScaleType,
  StackTotal,
  Legend,
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { RectModel, Nullable, StackTotalModel } from '@t/components/series';
import { LineModel } from '@t/components/axis';
import { deepCopyArray, includes, isNumber, hasNegative } from '@src/helpers/utils';
import { getLimitOnAxis } from '@src/helpers/axes';
import { isGroupStack, isPercentStack } from '@src/store/stackSeriesData';
import {
  calibrateBoxStackDrawingValue,
  sumValuesBeforeIndex,
} from '@src/helpers/boxSeriesCalculator';
import { RectDataLabel } from '@src/store/dataLabels';
import { getRGBA } from '@src/helpers/color';

type RenderOptions = {
  stack: Stack;
  scaleType: PercentScaleType;
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  hasNegativeValue: boolean;
  seriesDirection: SeriesDirection;
  padding: number;
  offsetSize: number;
};

function calibrateDrawingValue(
  values: number[],
  seriesIndex: number,
  renderOptions: RenderOptions
) {
  const { stack, min, max } = renderOptions;

  return isPercentStack(stack)
    ? values[seriesIndex]
    : calibrateBoxStackDrawingValue(values, seriesIndex, min, max);
}

function getDivisorForPercent(total: StackTotal, scaleType: PercentScaleType) {
  const { positive, negative } = total;
  let divisor = positive + Math.abs(negative);

  if (includes(['dualPercentStack', 'divergingPercentStack'], scaleType)) {
    divisor *= 2;
  }

  return divisor;
}

function getDirectionKeys(seriesDirection: SeriesDirection) {
  let result = ['positive', 'negative'];

  if (seriesDirection === SeriesDirection.POSITIVE) {
    result = ['positive'];
  } else if (seriesDirection === SeriesDirection.NEGATIVE) {
    result = ['negative'];
  }

  return result;
}

export default class BoxStackSeries extends BoxSeries {
  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const {
      layout,
      axes,
      categories,
      stackSeries,
      options,
      dataLabels,
      legend,
      yCenterAxis,
    } = chartState;

    if (!stackSeries[this.name]) {
      return;
    }

    this.rect = layout.plot;

    const seriesData = stackSeries[this.name] as StackSeriesData<BoxType>;
    const { labels } = axes[this.valueAxis];
    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels);
    const { stack, scaleType } = seriesData;
    this.visibleCenterYAxis = !!yCenterAxis?.visible;

    this.basePosition = this.getBasePosition(axes[this.valueAxis]);

    let offsetSize: number = this.getOffsetSize();

    if (diverging) {
      const [left, right] = this.getDivergingBasePosition(layout.yAxis!);

      this.basePosition = this.rect.width / 2;
      this.leftBasePosition = left;
      this.rightBasePosition = right;

      offsetSize = this.getOffsetSizeWithDiverging(layout.yAxis!.width);
    }

    const renderOptions: RenderOptions = {
      stack,
      scaleType,
      tickDistance,
      min,
      max,
      diverging,
      hasNegativeValue: hasNegative(labels),
      seriesDirection: this.getSeriesDirection(labels),
      padding: this.getPadding(tickDistance),
      offsetSize,
    };

    const { series, connector } = this.renderStackSeriesModel(seriesData, renderOptions, legend);
    const hoveredSeries = this.renderHoveredSeriesModel(series);
    const clipRect = this.renderClipRectAreaModel();

    const tooltipData: TooltipData[] = this.getTooltipData(seriesData, renderOptions, categories);

    this.models = {
      clipRect: [clipRect],
      series,
      connector,
    };

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: [
          {
            type: 'clipRectArea',
            width: this.isBar ? 0 : clipRect.width,
            height: this.isBar ? clipRect.height : 0,
            x: this.isBar ? 0 : clipRect.x,
            y: this.isBar ? clipRect.y : 0,
          },
        ],
        series: deepCopyArray(series),
        connector: deepCopyArray(connector),
      };
    }

    if (dataLabels.visible) {
      const dataLabelData = this.getDataLabels(series);
      const stackTotalData = this.getTotalDataLabels(seriesData, renderOptions);

      this.store.dispatch('appendDataLabels', [...dataLabelData, ...stackTotalData]);
    }

    this.responders = hoveredSeries.map((m, index) => ({
      ...m,
      data: tooltipData[index],
    }));
  }

  renderStackSeriesModel(
    seriesData: StackSeriesData<BoxType>,
    renderOptions: RenderOptions,
    legend: Legend
  ) {
    const { stackData } = seriesData;
    const colors = this.getSeriesColors(seriesData.data, legend);

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(seriesData, renderOptions, legend)
      : this.makeStackSeriesModel(stackData, renderOptions, colors);
  }

  makeStackSeriesModel(
    stackData: StackDataValues,
    renderOptions: RenderOptions,
    colors: string[],
    stackGroupCount = 1,
    stackGroupIndex = 0
  ) {
    const seriesModels: RectModel[] = [];
    const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);
    const { diverging } = renderOptions;
    const isLBSideWithDiverging = diverging && isLeftBottomSide(stackGroupIndex);

    stackData.forEach(({ values, total }, dataIndex) => {
      const seriesPos = this.getSeriesPosition(
        renderOptions,
        columnWidth,
        dataIndex,
        stackGroupIndex
      );
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const { barLength, dataPosition } = this.getStackRectInfo(
          values,
          seriesIndex,
          ratio,
          renderOptions,
          isLBSideWithDiverging
        );

        if (isNumber(barLength)) {
          seriesModels.push({
            type: 'rect',
            color: colors[seriesIndex],
            value,
            ...this.getAdjustedRect(seriesPos, dataPosition, barLength, columnWidth),
          });
        }
      });
    });

    return {
      series: seriesModels,
      connector: this.makeConnectorSeriesModel(
        stackData,
        renderOptions,
        stackGroupCount,
        stackGroupIndex
      ),
    };
  }

  makeStackGroupSeriesModel(
    stackSeries: StackSeriesData<BoxType>,
    renderOptions: RenderOptions,
    legend: Legend
  ) {
    const { stack } = renderOptions;
    const stackGroupData = stackSeries.stackData as StackGroupData;
    const seriesRawData = stackSeries.data;
    const stackGroupIds = Object.keys(stackGroupData);

    let seriesModels: RectModel[] = [];
    let connectorModels: LineModel[] = [];

    stackGroupIds.forEach((groupId, groupIndex) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const colors = this.getSeriesColors(filtered, legend);
      const { series, connector } = this.makeStackSeriesModel(
        stackGroupData[groupId],
        renderOptions,
        colors,
        stackGroupIds.length,
        groupIndex
      );

      seriesModels = [...seriesModels, ...series];

      if (stack.connector) {
        connectorModels = [...connectorModels, ...connector];
      }
    });

    return {
      series: seriesModels,
      connector: connectorModels,
    };
  }

  makeConnectorSeriesModel(
    stackData: StackDataValues,
    renderOptions: RenderOptions,
    stackGroupCount = 1,
    stackGroupIndex = 0
  ) {
    const {
      diverging,
      stack: { connector },
    } = renderOptions;

    if (!connector) {
      return [];
    }

    const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);
    const isLBSideWithDiverging = diverging && isLeftBottomSide(stackGroupIndex);
    const connectorPoints: Array<Point[]> = [];

    stackData.forEach(({ values, total }, index) => {
      const seriesPos = this.getSeriesPosition(renderOptions, columnWidth, index, stackGroupIndex);
      const points: Point[] = [];
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const { barLength, dataPosition } = this.getStackRectInfo(
          values,
          seriesIndex,
          ratio,
          renderOptions,
          isLBSideWithDiverging
        );

        if (isNumber(barLength)) {
          const { x, y } = this.getAdjustedRect(seriesPos, dataPosition, barLength!, columnWidth);
          const xPos = !isLBSideWithDiverging && this.isBar ? x + barLength! : x;
          const yPos = isLBSideWithDiverging && !this.isBar ? y + barLength! : y;

          points.push({ x: xPos!, y: yPos! });
        }
      });

      connectorPoints.push(points);
    });

    return this.makeConnectorModel(connectorPoints, connector, columnWidth);
  }

  private getTooltipData(
    seriesData: StackSeriesData<BoxType>,
    renderOptions: RenderOptions,
    categories?: string[]
  ): TooltipData[] {
    const seriesRawData = seriesData.data;
    const { stackData } = seriesData;
    const colors = seriesRawData.map(({ color }) => color);

    return isGroupStack(stackData)
      ? this.makeGroupStackTooltipData(seriesRawData, stackData, renderOptions, categories)
      : this.makeStackTooltipData(seriesRawData, stackData, colors, renderOptions, categories);
  }

  private makeGroupStackTooltipData(
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
    stackData: StackGroupData,
    renderOptions: RenderOptions,
    categories?: string[]
  ) {
    return Object.keys(stackData).flatMap((groupId) => {
      const colors = seriesRawData
        .filter(({ stackGroup }) => stackGroup === groupId)
        .map(({ color }) => color);

      return this.makeStackTooltipData(
        seriesRawData,
        stackData[groupId],
        colors,
        renderOptions,
        categories
      );
    });
  }

  private makeStackTooltipData(
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
    stackData: StackDataValues,
    colors: string[],
    renderOptions: RenderOptions,
    categories?: string[]
  ): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    stackData.forEach(({ values, total }, dataIndex) => {
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const barLength: Nullable<number> = this.getStackBarLength(
          values,
          seriesIndex,
          ratio,
          renderOptions
        );

        if (isNumber(barLength)) {
          tooltipData.push({
            label: seriesRawData[seriesIndex].name,
            color: colors[seriesIndex],
            value,
            category: categories?.[dataIndex],
          });
        }
      });
    });

    return tooltipData;
  }

  private makeConnectorModel(
    pointsForConnector: Array<Point[]>,
    connector: boolean | Required<Connector>,
    columnWidth: number
  ) {
    if (!connector || !pointsForConnector.length) {
      return [];
    }

    const { type: lineType, color: strokeStyle, width: lineWidth } = connector as Required<
      Connector
    >;
    const connectorModels: LineModel[] = [];
    const seriesDataCount = pointsForConnector.length;
    const seriesCount = pointsForConnector[0].length;

    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex += 1) {
      const points: Point[] = [];

      for (let dataIndex = 0; dataIndex < seriesDataCount; dataIndex += 1) {
        points.push(pointsForConnector[dataIndex][seriesIndex]);
      }

      points.forEach((point, index) => {
        const { x, y } = point;

        if (index < points.length - 1) {
          const { x: nextX, y: nextY } = points[index + 1];

          connectorModels.push({
            type: 'line',
            x: this.isBar ? x : x + columnWidth,
            y: this.isBar ? y + columnWidth : y,
            x2: nextX,
            y2: nextY,
            dashedPattern: lineType === 'dashed' ? [5, 5] : [],
            strokeStyle,
            lineWidth,
          });
        }
      });
    }

    return connectorModels;
  }

  private getStackValueRatio(total: StackTotal, renderOptions: RenderOptions) {
    const {
      stack: { type: stackType },
      scaleType,
      min,
      max,
      offsetSize,
    } = renderOptions;

    if (stackType === 'percent') {
      return this.getOffsetSize() / getDivisorForPercent(total, scaleType);
    }

    return this.getValueRatio(min, max, offsetSize);
  }

  private getStackBarLength(
    values: number[],
    seriesIndex: number,
    ratio: number,
    renderOptions: RenderOptions
  ): Nullable<number> {
    const value = calibrateDrawingValue(values, seriesIndex, renderOptions);

    return isNumber(value) ? this.getBarLength(value, ratio) : null;
  }

  private getStackColumnWidth(renderOptions: RenderOptions, stackGroupCount: number) {
    const { tickDistance, diverging, padding } = renderOptions;
    const divisor = diverging ? 1 : stackGroupCount;

    return (tickDistance - padding * 2) / divisor;
  }

  private getSeriesPosition(
    renderOptions: RenderOptions,
    columnWidth: number,
    dataIndex: number,
    stackGroupIndex: number
  ) {
    const { tickDistance, diverging, padding } = renderOptions;
    const groupIndex = diverging ? 0 : stackGroupIndex;

    return dataIndex * tickDistance + padding + columnWidth * groupIndex;
  }

  private getStackStartPosition(
    values: number[],
    currentIndex: number,
    ratio: number,
    renderOptions: RenderOptions,
    isLBSideWithDiverging: boolean
  ): number {
    const { stack, diverging, seriesDirection } = renderOptions;

    let startPos: number;

    if (diverging) {
      startPos = isLBSideWithDiverging
        ? this.calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio)
        : this.calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio);
    } else if (isPercentStack(stack)) {
      startPos = this.calcStartPositionWithPercent(values, currentIndex, renderOptions, ratio);
    } else if (seriesDirection === SeriesDirection.POSITIVE) {
      startPos = this.calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio);
    } else if (seriesDirection === SeriesDirection.NEGATIVE) {
      startPos = this.calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio);
    } else {
      startPos = this.calcStartPositionWithStack(values, currentIndex, renderOptions, ratio);
    }

    return startPos;
  }

  private calcStartPosOnLeftBottomSide(
    values: number[],
    currentIndex: number,
    renderOptions: RenderOptions,
    ratio: number
  ) {
    const { min, max, diverging } = renderOptions;
    const basePosition = diverging ? this.leftBasePosition : this.basePosition;
    const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
    const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);
    const collideEdge = totalOfValues < min;
    const usingValue = this.isBar ? totalOfValues : totalOfIndexBefore;
    const result = max < 0 ? Math.min(usingValue - max, 0) : usingValue;
    let pos: number;

    if (this.isBar) {
      pos = collideEdge ? 0 : basePosition - Math.abs(result) * ratio;
    } else {
      pos = basePosition + Math.abs(result) * ratio;
    }

    return pos;
  }

  private calcStartPosOnRightTopSide(
    values: number[],
    currentIndex: number,
    renderOptions: RenderOptions,
    ratio: number
  ) {
    const { min, max, diverging } = renderOptions;
    const basePosition = diverging ? this.rightBasePosition : this.basePosition;
    const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
    const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);
    const collideEdge = totalOfValues > max;
    const usingValue = this.isBar ? totalOfIndexBefore : totalOfValues;
    const result = min > 0 ? Math.max(usingValue - min, 0) : usingValue;
    let pos: number;

    if (this.isBar) {
      pos = basePosition + result * ratio;
    } else {
      pos = collideEdge ? 0 : basePosition - result * ratio;
    }

    return pos;
  }

  private calcStartPositionWithStack(
    values: number[],

    currentIndex: number,
    renderOptions: RenderOptions,
    ratio: number
  ) {
    return values[currentIndex] < 0
      ? this.calcStartPosOnLeftBottomSide(values, currentIndex, renderOptions, ratio)
      : this.calcStartPosOnRightTopSide(values, currentIndex, renderOptions, ratio);
  }

  private calcStartPositionWithPercent(
    values: number[],
    currentIndex: number,
    renderOptions: RenderOptions,
    ratio: number
  ): number {
    const basePosition = this.basePosition;
    const totalPrevValues = sumValuesBeforeIndex(
      values,
      currentIndex,
      this.isBar ? values[currentIndex] < 0 : values[currentIndex] > 0
    );

    return this.isBar
      ? totalPrevValues * ratio + basePosition
      : basePosition - totalPrevValues * ratio;
  }

  private getStackRectInfo(
    values: number[],
    seriesIndex: number,
    ratio: number,
    renderOptions: RenderOptions,
    isLBSideWithDiverging: boolean
  ) {
    const barLength: Nullable<number> = this.getStackBarLength(
      values,
      seriesIndex,
      ratio,
      renderOptions
    );
    const dataPosition: number = this.getStackStartPosition(
      values,
      seriesIndex,
      ratio,
      renderOptions,
      isLBSideWithDiverging
    );

    return {
      barLength,
      dataPosition,
    };
  }

  getDataLabels(seriesModels: RectModel[]) {
    return seriesModels.map((data) => this.makeDataLabel(data));
  }

  getTotalDataLabels(
    seriesData: StackSeriesData<BoxType>,
    renderOptions: RenderOptions
  ): RectDataLabel[] {
    const { stackData, stack } = seriesData;

    if (isPercentStack(stack)) {
      return [];
    }

    return isGroupStack(stackData)
      ? this.makeGroupTotalDataLabels(seriesData, renderOptions)
      : this.makeTotalDataLabels(stackData, renderOptions);
  }

  makeGroupTotalDataLabels(
    stackSeries: StackSeriesData<BoxType>,
    renderOptions: RenderOptions
  ): RectDataLabel[] {
    let dataLabels: RectDataLabel[] = [];

    const stackGroupData = stackSeries.stackData as StackGroupData;
    const stackGroupIds = Object.keys(stackGroupData);

    stackGroupIds.forEach((groupId, groupIndex) => {
      const totalDataLabels = this.makeTotalDataLabels(
        stackGroupData[groupId],
        renderOptions,
        stackGroupIds.length,
        groupIndex
      );

      dataLabels = [...dataLabels, ...totalDataLabels];
    });

    return dataLabels;
  }

  makeTotalDataLabels(
    stackData: StackDataValues,
    renderOptions: RenderOptions,
    stackGroupCount = 1,
    stackGroupIndex = 0
  ): RectDataLabel[] {
    const dataLabels: RectDataLabel[] = [];
    const { min, max, seriesDirection, diverging } = renderOptions;
    const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);

    stackData.forEach((data, dataIndex) => {
      const { total } = data;
      const seriesPos = this.getSeriesPosition(
        renderOptions,
        columnWidth,
        dataIndex,
        stackGroupIndex
      );
      const ratio = this.getStackValueRatio(total, renderOptions);
      const directionKeys = getDirectionKeys(seriesDirection);

      directionKeys.forEach((key) => {
        const value = total[key];

        if (!value) {
          return;
        }

        const barLength = this.makeBarLength(value, {
          min,
          max,
          ratio,
        })!;

        const dataPosition = this.getStartPosition(
          barLength,
          value,
          renderOptions,
          diverging && isLeftBottomSide(stackGroupIndex)
        );

        const stackTotal: StackTotalModel = {
          type: 'stackTotal',
          value,
          ...this.getAdjustedRect(seriesPos, dataPosition, barLength, columnWidth),
        };

        dataLabels.push(this.makeTotalDataLabel(stackTotal));
      });
    });

    return dataLabels;
  }

  makeTotalDataLabel(totalLabel: StackTotalModel): RectDataLabel {
    return {
      ...totalLabel,
      direction: this.getDataLabelDirection(totalLabel),
      plot: {
        x: 0,
        y: 0,
        size: this.rect[this.offsetSizeKey],
      },
    };
  }

  getSeriesColors(seriesRawData: BoxSeriesType<BoxSeriesDataType>[], legend: Legend): string[] {
    return seriesRawData.map(({ color, name }) => {
      const { active } = legend.data.find(({ label }) => label === name)!;

      return getRGBA(color, active ? 1 : 0.2);
    });
  }
}
