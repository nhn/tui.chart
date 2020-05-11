import BoxSeries, { BoxType, SizeKey, SeriesRawData } from './boxSeries';
import { StackInfo, ColumnChartOptions, BarChartOptions, StackType } from '@t/options';
import { ChartState, SeriesData, StackGroupData, StackDataType, StackData } from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { BoxSeriesModel } from '@t/components/series';
import { first, last } from '@src/helpers/utils';

interface StackSeriesModelParamType {
  stackData: StackData;
  colors: string[];
  valueLabels: string[];
  tickDistance: number;
  stackGroup?: { count: number; index: number };
}

function isGroupStack(rawData: StackDataType): rawData is StackGroupData {
  return !Array.isArray(rawData);
}

export const STACK_TYPES = {
  NORMAL: 'normal',
  PERCENT: 'percent'
};

export default class BoxStackSeries extends BoxSeries {
  stack!: StackInfo;

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, series, theme, axes, categories } = chartState;

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    this.stack = series[this.name]!.stack!;

    const { colors } = theme.series;
    const seriesData = series[this.name]!;

    const valueLabels = axes[this.valueAxis].labels;
    const tickDistance = this.getTickDistance(axes[this.labelAxis].validTickCount);

    const seriesModels: BoxSeriesModel[] = this.renderSeriesModel(
      seriesData,
      colors,
      valueLabels,
      tickDistance
    );

    const tooltipData: TooltipData[] = this.getTooltipData(seriesData, colors, categories);

    const rectModel = super.renderRect(seriesModels);

    this.models = [super.renderClipRectAreaModel(), ...seriesModels];

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  renderSeriesModel(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ) {
    const stackData = seriesData.stackData!;

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(seriesData, [...colors], valueLabels, tickDistance)
      : this.makeStackSeriesModel({ stackData, colors, valueLabels, tickDistance });
  }

  makeStackSeriesModel({
    stackData,
    colors,
    valueLabels,
    tickDistance,
    stackGroup = {
      count: 1,
      index: 0
    }
  }: StackSeriesModelParamType): BoxSeriesModel[] {
    const seriesModels: BoxSeriesModel[] = [];
    const offsetAxisLength = this.plot[this.offsetSizeKey];
    const columnWidth = (tickDistance - this.padding * 2) / stackGroup.count;
    const stackType: StackType = this.stack.type;

    stackData.forEach(({ values, sum }, index) => {
      const seriesPos =
        index * tickDistance + this.padding + columnWidth * stackGroup.index + this.hoverThickness;

      values.forEach((value, seriesIndex) => {
        const color = colors[seriesIndex];
        const beforeValueSum = super.getTotalOfPrevValues(values, seriesIndex, !this.isBar);
        let barLength, startPosition;

        if (stackType === STACK_TYPES.PERCENT) {
          barLength = (value / sum) * offsetAxisLength;
          startPosition = (beforeValueSum / sum) * offsetAxisLength;
        } else {
          const offsetValue = Number(last(valueLabels)) - Number(first(valueLabels));
          const axisValueRatio = offsetAxisLength / offsetValue;

          barLength = value * axisValueRatio;
          startPosition = beforeValueSum * axisValueRatio;
        }

        seriesModels.push({
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition + this.hoverThickness + this.axisThickness : seriesPos,
          y: this.isBar ? seriesPos : offsetAxisLength - startPosition + this.hoverThickness
        });
      });
    });

    return seriesModels;
  }

  makeStackGroupSeriesModel(
    seriesRaw: SeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ): BoxSeriesModel[] {
    const stackGroupData = seriesRaw.stackData as StackGroupData;
    const seriesRawData = seriesRaw.data;
    const stackGroupIds = Object.keys(stackGroupData);
    let seriesModels: BoxSeriesModel[] = [];

    stackGroupIds.forEach((groupId, index) => {
      const filtered = seriesRawData.filter(({ stackGroup }) => stackGroup === groupId);

      seriesModels = [
        ...seriesModels,
        ...this.makeStackSeriesModel({
          stackData: stackGroupData[groupId],
          colors: colors.splice(index, filtered.length),
          valueLabels,
          tickDistance,
          stackGroup: {
            count: stackGroupIds.length,
            index
          }
        })
      ];
    });

    return seriesModels;
  }

  private getTooltipData(seriesData: SeriesData<BoxType>, colors: string[], categories?: string[]) {
    const seriesRawData = seriesData.data;
    const stackData = seriesData.stackData!;

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
}
