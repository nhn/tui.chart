import BoxSeries, { SeriesRawData } from './boxSeries';
import { ColumnChartOptions, BarChartOptions, Point, Connector } from '@t/options';
import {
  ChartState,
  StackSeriesData,
  StackGroupData,
  StackDataType,
  StackData,
  BoxType,
  Stack
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { RectModel } from '@t/components/series';
import { first, last } from '@src/helpers/utils';
import { LineModel } from '@t/components/axis';

interface StackSeriesModelParamType {
  stack: Stack;
  stackData: StackData;
  colors: string[];
  valueLabels: string[];
  tickDistance: number;
  stackGroupCount?: number;
  stackGroupIndex?: number;
}

function isGroupStack(rawData: StackDataType): rawData is StackGroupData {
  return !Array.isArray(rawData);
}

function totalOfPrevValues(values: number[], currentIndex: number, included = false) {
  return values.reduce((total, value, idx) => {
    const isPrev = included ? idx <= currentIndex : idx < currentIndex;

    if (isPrev) {
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
    const { colors } = theme.series;
    const valueLabels = axes[this.valueAxis].labels;
    const { tickDistance } = axes[this.labelAxis];

    const { seriesModels, connectorModels } = this.renderStackSeriesModel(
      seriesData,
      colors,
      valueLabels,
      tickDistance
    );

    const tooltipData: TooltipData[] = this.getTooltipData(seriesData, colors, categories);

    const rectModel = super.renderHilightSeriesModel(seriesModels);

    this.models = [super.renderClipRectAreaModel(), ...seriesModels, ...connectorModels];

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  renderStackSeriesModel(
    seriesData: StackSeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ) {
    const { stack, stackData } = seriesData;

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(seriesData, [...colors], valueLabels, tickDistance)
      : this.makeStackSeriesModel({ stack, stackData, colors, valueLabels, tickDistance });
  }

  makeStackSeriesModel({
    stack,
    stackData,
    colors,
    valueLabels,
    tickDistance,
    stackGroupCount = 1,
    stackGroupIndex = 0
  }: StackSeriesModelParamType) {
    const seriesModels: RectModel[] = [];
    const columnWidth = (tickDistance - this.padding * 2) / stackGroupCount;
    const connectorPoints: Array<Point[]> = [];

    stackData.forEach(({ values, sum }, index) => {
      const seriesPos =
        index * tickDistance + this.padding + columnWidth * stackGroupIndex + this.hoverThickness;
      const points: Point[] = [];

      values.forEach((value, seriesIndex) => {
        const beforeValueSum = totalOfPrevValues(values, seriesIndex, !this.isBar);
        const divisor =
          stack.type === 'percent' ? sum : Number(last(valueLabels)) - Number(first(valueLabels));
        const offsetAxisLength = this.plot[this.offsetSizeKey];
        const barLength = (value * offsetAxisLength) / divisor;
        const startPosition = (beforeValueSum * offsetAxisLength) / divisor;

        const x = this.isBar ? startPosition + this.hoverThickness + this.axisThickness : seriesPos;
        const y = this.isBar ? seriesPos : offsetAxisLength - startPosition + this.hoverThickness;

        seriesModels.push({
          type: 'rect',
          color: colors[seriesIndex],
          x,
          y,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength
        });

        if (stack.connector) {
          points.push({ x: this.isBar ? x + barLength : x, y });
        }
      });

      if (stack.connector) {
        connectorPoints.push(points);
      }
    });

    return {
      seriesModels,
      connectorModels: this.makeConnectorModel(connectorPoints, stack.connector, columnWidth)
    };
  }

  makeStackGroupSeriesModel(
    stackSeries: StackSeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ) {
    const stack = stackSeries.stack;
    const stackGroupData = stackSeries.stackData as StackGroupData;
    const seriesRawData = stackSeries.data;
    const stackGroupIds = Object.keys(stackGroupData);

    let rectModels: RectModel[] = [];
    let connectorModels: LineModel[] = [];

    stackGroupIds.forEach((groupId, groupIndex) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);
      const stackModels = this.makeStackSeriesModel({
        stack,
        stackData: stackGroupData[groupId],
        colors: colors.splice(groupIndex, filtered.length),
        valueLabels,
        tickDistance,
        stackGroupCount: stackGroupIds.length,
        stackGroupIndex: groupIndex
      });

      rectModels = [...rectModels, ...stackModels.seriesModels];

      if (stack.connector) {
        connectorModels = [...connectorModels, ...stackModels.connectorModels];
      }
    });

    return {
      seriesModels: rectModels,
      connectorModels: connectorModels
    };
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
    stackData: StackData,
    colors: string[],
    categories?: string[]
  ) {
    return stackData.flatMap(({ values }, index) =>
      values.map((value, seriesIndex) => ({
        label: seriesRawData[seriesIndex].name,
        color: colors[seriesIndex],
        value,
        category: categories?.[index]
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
            lineWidth
          });
        }
      });
    }

    return connectorModels;
  }
}
