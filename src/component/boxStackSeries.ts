import BoxSeries, { SeriesRawData } from './boxSeries';
import { ColumnChartOptions, BarChartOptions, Point, Connector } from '@t/options';
import {
  ChartState,
  StackSeriesData,
  StackGroupData,
  StackDataType,
  BoxType,
  Stack,
  StackDataValues,
  PercentScaleType,
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { RectModel } from '@t/components/series';
import { first, last, deepCopyArray, includes } from '@src/helpers/utils';
import { LineModel } from '@t/components/axis';

type RenderOptions = {
  valueLabels: string[];
  stack: Stack;
  scaleType: PercentScaleType;
  tickDistance: number;
};

interface StackSeriesModelParamType {
  stackData: StackDataValues;
  renderOptions: RenderOptions;
  colors?: string[];
  stackGroupCount?: number;
  stackGroupIndex?: number;
}

function isGroupStack(rawData: StackDataType): rawData is StackGroupData {
  return !Array.isArray(rawData);
}

function totalOfPrevValues(values: number[], currentIndex: number, included = false) {
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

export default class BoxStackSeries extends BoxSeries {
  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, theme, axes, categories, stackSeries } = chartState;

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
    const renderOptions: RenderOptions = {
      valueLabels: labels,
      stack,
      scaleType,
      tickDistance,
    };

    this.basePosition = this.getBasePosition(labels, tickCount);

    const { seriesModels, connectorModels } = this.renderStackSeriesModel(
      seriesData,
      colors,
      renderOptions
    );

    const tooltipData: TooltipData[] = this.getTooltipData(seriesData, colors, categories);
    const rectModel = this.renderHighlightSeriesModel(seriesModels);

    this.models = [this.renderClipRectAreaModel(), ...seriesModels, ...connectorModels];
    this.drawModels = deepCopyArray(this.models);
    this.responders = rectModel.map((m, index) => ({
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
    const { tickDistance } = renderOptions;
    const columnWidth = (tickDistance - this.padding * 2) / stackGroupCount;

    stackData.forEach(({ values, total }, index) => {
      const seriesPos =
        index * tickDistance + this.padding + columnWidth * stackGroupIndex + this.hoverThickness;
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const barLength = this.getStackBarLength(value, ratio);
        const startPosition = this.getStackStartPosition(values, seriesIndex, ratio);

        seriesModels.push({
          type: 'rect',
          color: colors![seriesIndex],
          ...this.getAdjustedRect(seriesPos, startPosition, barLength, columnWidth),
        });
      });
    });

    return {
      seriesModels,
      connectorModels: this.makeConnectorSeriesModel(
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
    const {
      stack: { connector },
    } = renderOptions;
    const stackGroupData = stackSeries.stackData as StackGroupData;
    const seriesRawData = stackSeries.data;
    const stackGroupIds = Object.keys(stackGroupData);

    let rectModels: RectModel[] = [];
    let connectorModels: LineModel[] = [];

    stackGroupIds.forEach((groupId, groupIndex) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const stackModels = this.makeStackSeriesModel(
        stackGroupData[groupId],
        renderOptions,
        colors.splice(groupIndex, filtered.length),
        stackGroupIds.length,
        groupIndex
      );

      rectModels = [...rectModels, ...stackModels.seriesModels];

      if (connector) {
        connectorModels = [...connectorModels, ...stackModels.connectorModels];
      }
    });

    return {
      seriesModels: rectModels,
      connectorModels: connectorModels,
    };
  }

  makeConnectorSeriesModel(
    stackData: StackDataValues,
    renderOptions: RenderOptions,
    stackGroupCount = 1,
    stackGroupIndex = 0
  ) {
    const {
      tickDistance,
      stack: { connector },
    } = renderOptions;

    if (!connector) {
      return [];
    }

    const columnWidth = (tickDistance - this.padding * 2) / stackGroupCount;
    const connectorPoints: Array<Point[]> = [];

    stackData.forEach(({ values, total }, index) => {
      const seriesPos =
        index * tickDistance + this.padding + columnWidth * stackGroupIndex + this.hoverThickness;
      const points: Point[] = [];
      const ratio = this.getStackValueRatio(total, renderOptions);

      values.forEach((value, seriesIndex) => {
        const barLength = value * ratio;
        const startPosition = this.getStackStartPosition(values, seriesIndex, ratio);
        const { x, y } = this.getAdjustedRect(seriesPos, startPosition, barLength, columnWidth);

        points.push({ x: this.isBar ? x + barLength : x, y });
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

  getStackValueRatio(total: { positive: number; negative: number }, renderOptions: RenderOptions) {
    const {
      stack: { type: stackType },
      scaleType,
      valueLabels,
    } = renderOptions;
    let divisor = Number(last(valueLabels)) - Number(first(valueLabels));

    if (stackType === 'percent') {
      if (includes(['dualPercentStack', 'divergingPercentStack'], scaleType)) {
        divisor = (total.positive + Math.abs(total.negative)) * 2;
      } else {
        divisor = total.positive + Math.abs(total.negative);
      }
    }

    return this.getOffsetSize() / divisor;
  }

  getStackStartPosition(values: number[], currentIndex: number, ratio: number) {
    const basePosition = this.basePosition;
    const beforeValueSum = totalOfPrevValues(
      values,
      currentIndex,
      !this.isBar ? values[currentIndex] > 0 : values[currentIndex] < 0
    );

    return this.isBar
      ? beforeValueSum * ratio + basePosition + Number(this.axisThickness)
      : basePosition - beforeValueSum * ratio;
  }

  getStackBarLength(value: number, ratio: number) {
    return value < 0 ? Math.abs(value) * ratio : value * ratio;
  }
}
