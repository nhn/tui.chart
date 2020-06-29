import BoxSeries, {
  isLeftBottomSide,
  SeriesDirection,
  RenderOptions as BoxRenderOptions,
} from './boxSeries';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  ColumnChartOptions,
  BarChartOptions,
  Point,
  Connector,
  DataLabels,
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
  AxisData,
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { RectModel, Nullable } from '@t/components/series';
import { deepCopyArray, includes, isNumber, hasNegative } from '@src/helpers/utils';
import { LineModel } from '@t/components/axis';
import { getLimitOnAxis } from '@src/helpers/axes';
import { isGroupStack, isPercentStack } from '@src/store/stackSeriesData';
import { AxisType } from './axis';
import {
  calibrateBoxStackDrawingValue,
  sumValuesBeforeIndex,
} from '@src/helpers/boxSeriesCalculator';
import { DataLabel, DataLabelOption } from '@t/components/dataLabels';
import { getDataLabelsOptions } from '@src/store/dataLabels';

type RenderOptions = {
  stack: Stack;
  scaleType: PercentScaleType;
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  hasNegativeValue: boolean;
  seriesDirection: SeriesDirection;
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
  makeStackRenderOptions(
    axes: Partial<Record<AxisType, AxisData>>,
    options: BarChartOptions | ColumnChartOptions,
    { stack, scaleType }: StackSeriesData<BoxType>
  ): RenderOptions {
    const { labels } = axes[this.valueAxis];
    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels, diverging);

    return {
      stack,
      scaleType,
      tickDistance,
      min,
      max,
      diverging,
      hasNegativeValue: hasNegative(labels),
      seriesDirection: this.getSeriesDirection(labels),
    };
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, theme, axes, categories, stackSeries, options } = chartState;

    if (!stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    const seriesData = stackSeries[this.name] as StackSeriesData<BoxType>;
    const { colors } = theme.series;
    const renderOptions = this.makeStackRenderOptions(axes, options, seriesData);

    this.basePosition = this.getBasePosition(axes[this.valueAxis]);

    const { series, connector } = this.renderStackSeriesModel(seriesData, colors, renderOptions);
    const hoveredSeries = this.renderHoveredSeriesModel(series);
    const clipRect = this.renderClipRectAreaModel();

    const tooltipData: TooltipData[] = this.getTooltipData(
      seriesData,
      colors,
      renderOptions,
      categories
    );

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

    if (options.series?.dataLabels?.visible) {
      const dataLabelData = this.getDataLabels(series, options.series?.dataLabels);
      const stackTotalData = this.getTotalDataLabels(
        seriesData,
        renderOptions,
        options.series?.dataLabels
      );

      this.store.dispatch('appendDataLabels', [...dataLabelData, ...stackTotalData]);
    }

    this.responders = hoveredSeries.map((m, index) => ({
      ...m,
      data: tooltipData[index],
    }));
  }

  renderStackSeriesModel(
    seriesData: StackSeriesData<BoxType>,
    colors: string[],
    renderOptions: RenderOptions
  ) {
    const { stackData } = seriesData;

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(seriesData, [...colors], renderOptions)
      : this.makeStackSeriesModel(stackData, renderOptions, colors);
  }

  makeStackSeriesModel(
    stackData: StackDataValues,
    renderOptions: RenderOptions,
    colors?: string[],
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
            color: colors![seriesIndex],
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
    colors: string[],
    renderOptions: RenderOptions
  ) {
    const { stack } = renderOptions;
    const stackGroupData = stackSeries.stackData as StackGroupData;
    const seriesRawData = stackSeries.data;
    const stackGroupIds = Object.keys(stackGroupData);

    let seriesModels: RectModel[] = [];
    let connectorModels: LineModel[] = [];

    stackGroupIds.forEach((groupId, groupIndex) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const { series, connector } = this.makeStackSeriesModel(
        stackGroupData[groupId],
        renderOptions,
        colors.splice(groupIndex, filtered.length),
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
    colors: string[],
    renderOptions: RenderOptions,
    categories?: string[]
  ): TooltipData[] {
    const seriesRawData = seriesData.data;
    const { stackData } = seriesData;

    return isGroupStack(stackData)
      ? this.makeGroupStackTooltipData(seriesRawData, stackData, colors, renderOptions, categories)
      : this.makeStackTooltipData(seriesRawData, stackData, colors, renderOptions, categories);
  }

  private makeGroupStackTooltipData(
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
    stackData: StackGroupData,
    colors: string[],
    renderOptions: RenderOptions,
    categories?: string[]
  ) {
    return Object.keys(stackData).flatMap((groupId, groupIdx) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const groupColors = colors.splice(groupIdx, filtered.length);

      return this.makeStackTooltipData(
        seriesRawData,
        stackData[groupId],
        groupColors,
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
      diverging,
    } = renderOptions;

    if (stackType === 'percent') {
      return this.getOffsetSize() / getDivisorForPercent(total, scaleType);
    }

    return this.getValueRatio(min, max, diverging);
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
    const { tickDistance, diverging } = renderOptions;
    const divisor = diverging ? 1 : stackGroupCount;

    return (tickDistance - this.padding * 2) / divisor;
  }

  private getSeriesPosition(
    renderOptions: RenderOptions,
    columnWidth: number,
    dataIndex: number,
    stackGroupIndex: number
  ) {
    const { tickDistance, diverging } = renderOptions;
    const groupIndex = diverging ? 0 : stackGroupIndex;

    return dataIndex * tickDistance + this.padding + columnWidth * groupIndex + this.hoverThickness;
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
    const basePosition = this.basePosition;
    const { min, max } = renderOptions;
    const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
    const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);
    const collideEdge = totalOfValues < min;
    const usingValue = this.isBar ? totalOfValues : totalOfIndexBefore;
    const result = max < 0 ? Math.min(usingValue - max, 0) : usingValue;

    if (this.isBar) {
      return collideEdge
        ? this.hoverThickness + this.axisThickness
        : basePosition - Math.abs(result) * ratio + this.axisThickness;
    }

    return basePosition + Math.abs(result) * ratio;
  }

  private calcStartPosOnRightTopSide(
    values: number[],
    currentIndex: number,
    renderOptions: RenderOptions,
    ratio: number
  ) {
    const basePosition = this.basePosition;
    const { min, max } = renderOptions;
    const totalOfIndexBefore = sumValuesBeforeIndex(values, currentIndex, false);
    const totalOfValues = sumValuesBeforeIndex(values, currentIndex, true);
    const collideEdge = totalOfValues > max;
    const usingValue = this.isBar ? totalOfIndexBefore : totalOfValues;
    const result = min > 0 ? Math.max(usingValue - min, 0) : usingValue;

    if (this.isBar) {
      return basePosition + result * ratio + this.axisThickness;
    }

    return collideEdge ? this.hoverThickness + this.axisThickness : basePosition - result * ratio;
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
      ? totalPrevValues * ratio + basePosition + this.axisThickness
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

  getDataLabels(seriesModels: RectModel[], dataLabelOptions: DataLabels) {
    const options = getDataLabelsOptions(dataLabelOptions, 'stack');

    return seriesModels.map((data) =>
      this.isBar
        ? this.makeBarLabelInfo(data, options, true)
        : this.makeColumnLabelInfo(data, options, true)
    );
  }

  getTotalDataLabels(
    seriesData: StackSeriesData<BoxType>,
    renderOptions: RenderOptions,
    dataLabelOptions: DataLabels
  ): DataLabel[] {
    const { stackData } = seriesData;
    const options = getDataLabelsOptions(dataLabelOptions, 'stack');

    if (!options.stackTotal?.visible) {
      return [];
    }

    return isGroupStack(stackData)
      ? this.makeGroupTotalDataLabels(seriesData, renderOptions, options)
      : this.makeTotalDataLabels(stackData, renderOptions, options);
  }

  makeGroupTotalDataLabels(
    stackSeries: StackSeriesData<BoxType>,
    renderOptions: RenderOptions,
    dataLabelOptions: DataLabelOption
  ): DataLabel[] {
    let dataLabels: DataLabel[] = [];

    const stackGroupData = stackSeries.stackData as StackGroupData;
    const stackGroupIds = Object.keys(stackGroupData);

    stackGroupIds.forEach((groupId, groupIndex) => {
      const totalDataLabels = this.makeTotalDataLabels(
        stackGroupData[groupId],
        renderOptions,
        dataLabelOptions,
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
    dataLabelOptions: DataLabelOption,
    stackGroupCount = 1,
    stackGroupIndex = 0
  ): DataLabel[] {
    const dataLabels: DataLabel[] = [];
    const { min, max, diverging, hasNegativeValue, seriesDirection } = renderOptions;
    const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);

    stackData.forEach(({ total }, dataIndex) => {
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

        const barLength = this.makeBarLength(value, {
          min,
          max,
          ratio,
        } as BoxRenderOptions)!;

        const dataPosition = this.getStartPosition(barLength, value, 0, {
          diverging,
          hasNegativeValue,
        } as BoxRenderOptions);

        const rect = {
          value,
          ...this.getAdjustedRect(seriesPos, dataPosition, barLength, columnWidth),
        } as RectModel;

        const labelInfo = this.isBar
          ? this.makeBarLabelInfo(rect, { ...dataLabelOptions, anchor: 'end' })
          : this.makeColumnLabelInfo(rect, { ...dataLabelOptions, anchor: 'end' });

        dataLabels.push(labelInfo);
      });
    });

    return dataLabels;
  }
}
