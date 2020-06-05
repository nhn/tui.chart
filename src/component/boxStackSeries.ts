import BoxSeries, { SeriesRawData, isLeftBottomSide } from './boxSeries';
import { ColumnChartOptions, BarChartOptions, Point, Connector } from '@t/options';
import {
  ChartState,
  StackSeriesData,
  StackGroupData,
  BoxType,
  Stack,
  StackDataValues,
  PercentScaleType,
  StackTotal,
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { RectModel } from '@t/components/series';
import { deepCopyArray, includes } from '@src/helpers/utils';
import { LineModel } from '@t/components/axis';
import { getLimitOnAxis } from '@src/helpers/axes';
import { isGroupStack } from '@src/store/stackSeriesData';

type RenderOptions = {
  stack: Stack;
  scaleType: PercentScaleType;
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
};

function sumOfPrevValues(values: number[], currentIndex: number, included = false) {
  const curValue = values[currentIndex];

  return values.reduce((total, value, idx) => {
    const isPrev = included ? idx <= currentIndex : idx < currentIndex;
    const isSameSign = value * curValue >= 0;

    if (isPrev && isSameSign) {
      return total + value;
    }

    return total;
  }, 0);
}

function getDivisorForPercent(total: StackTotal, scaleType: PercentScaleType) {
  const { positive, negative } = total;
  let divisor = positive + Math.abs(negative);

  if (includes(['dualPercentStack', 'divergingPercentStack'], scaleType)) {
    divisor *= 2;
  }

  return divisor;
}

export default class BoxStackSeries extends BoxSeries {
  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, theme, axes, categories, stackSeries, options } = chartState;

    if (!stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    const seriesData = stackSeries[this.name] as StackSeriesData<BoxType>;
    const { stack, scaleType } = seriesData;
    const { colors } = theme.series;
    const { tickDistance } = axes[this.labelAxis];
    const { labels, tickCount } = axes[this.valueAxis];
    const diverging = !!options.series?.diverging;
    const { min, max } = getLimitOnAxis(labels, diverging);
    const renderOptions: RenderOptions = {
      stack,
      scaleType,
      tickDistance,
      min,
      max,
      diverging,
    };

    this.basePosition = this.getBasePosition(labels, tickCount);

    const { series, connector } = this.renderStackSeriesModel(seriesData, colors, renderOptions);
    const hoveredSeries = this.renderHighlightSeriesModel(series);
    const tooltipData: TooltipData[] = this.getTooltipData(seriesData, colors, categories);

    this.models = {
      clipRect: [this.renderClipRectAreaModel()],
      series,
      connector,
    };

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: this.models.clipRect,
        series: deepCopyArray(series),
        connector: deepCopyArray(connector),
      };
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
    const divergingSeries = diverging && isLeftBottomSide(stackGroupIndex);

    stackData.forEach(({ values, total }, index) => {
      const seriesPos = this.getSeriesPosition(renderOptions, columnWidth, index, stackGroupIndex);
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const barLength = this.getStackBarLength(value, ratio);
        const startPosition = this.getStackStartPosition(
          values,
          seriesIndex,
          ratio,
          divergingSeries
        );

        seriesModels.push({
          type: 'rect',
          color: colors![seriesIndex],
          ...this.getAdjustedRect(seriesPos, startPosition, barLength, columnWidth),
        });
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
    const divergingSeries = diverging && isLeftBottomSide(stackGroupIndex);
    const connectorPoints: Array<Point[]> = [];

    stackData.forEach(({ values, total }, index) => {
      const seriesPos = this.getSeriesPosition(renderOptions, columnWidth, index, stackGroupIndex);
      const points: Point[] = [];
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const barLength = value * ratio;
        const startPosition = this.getStackStartPosition(
          values,
          seriesIndex,
          ratio,
          divergingSeries
        );
        const { x, y } = this.getAdjustedRect(seriesPos, startPosition, barLength, columnWidth);

        const xPos = !divergingSeries && this.isBar ? x + barLength : x;
        const yPos = divergingSeries && !this.isBar ? y + barLength : y;

        points.push({ x: xPos, y: yPos });
      });

      connectorPoints.push(points);
    });

    return this.makeConnectorModel(connectorPoints, connector, columnWidth);
  }

  private getTooltipData(
    seriesData: StackSeriesData<BoxType>,
    colors: string[],
    categories?: string[]
  ) {
    const seriesRawData = seriesData.data;
    const { stackData } = seriesData;

    return isGroupStack(stackData)
      ? this.makeGroupStackTooltipData(seriesRawData, stackData, colors, categories)
      : this.makeStackTooltipData(seriesRawData, stackData, colors, categories);
  }

  private makeGroupStackTooltipData(
    seriesRawData: SeriesRawData,
    stackData: StackGroupData,
    colors: string[],
    categories?: string[]
  ) {
    return Object.keys(stackData).flatMap((groupId, groupIdx) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const groupColors = colors.splice(groupIdx, filtered.length);

      return this.makeStackTooltipData(seriesRawData, stackData[groupId], groupColors, categories);
    });
  }

  private makeStackTooltipData(
    seriesRawData: SeriesRawData,
    stackData: StackDataValues,
    colors: string[],
    categories?: string[]
  ) {
    return stackData.flatMap(({ values }, index) =>
      values.map((value, seriesIndex) => ({
        label: seriesRawData[seriesIndex].name,
        color: colors[seriesIndex],
        value,
        category: categories?.[index],
      }))
    );
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

  private getStackStartPosition(
    values: number[],
    currentIndex: number,
    ratio: number,
    divergingSeries: boolean
  ) {
    const basePosition = this.basePosition;

    if (divergingSeries) {
      const totalPrevValues = sumOfPrevValues(values, currentIndex, this.isBar);

      return this.isBar
        ? basePosition - totalPrevValues * ratio + this.axisThickness
        : basePosition + totalPrevValues * ratio;
    }

    const totalPrevValues = sumOfPrevValues(
      values,
      currentIndex,
      this.isBar ? values[currentIndex] < 0 : values[currentIndex] > 0
    );

    return this.isBar
      ? totalPrevValues * ratio + basePosition + this.axisThickness
      : basePosition - totalPrevValues * ratio;
  }

  private getStackBarLength(value: number, ratio: number) {
    return value < 0 ? Math.abs(value) * ratio : value * ratio;
  }

  private getStackColumnWidth(renderOptions: RenderOptions, stackGroupCount: number) {
    const { tickDistance, diverging } = renderOptions;
    const divisor = diverging ? 1 : stackGroupCount;

    return (tickDistance - this.padding * 2) / divisor;
  }

  private getSeriesPosition(
    renderOptions: RenderOptions,
    columnWidth: number,
    index: number,
    stackGroupIndex: number
  ) {
    const { tickDistance, diverging } = renderOptions;
    const groupIndex = diverging ? 0 : stackGroupIndex;

    return index * tickDistance + this.padding + columnWidth * groupIndex + this.hoverThickness;
  }
}
