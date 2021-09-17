import BoxSeries, { isLeftBottomSide, SeriesDirection } from './boxSeries';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  ColumnChartOptions,
  BarChartOptions,
  Point,
  ColumnLineChartOptions,
  RangeDataType,
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
  CenterYAxisData,
} from '@t/store/store';
import { TooltipData } from '@t/components/tooltip';
import { RectModel, Nullable, StackTotalModel, RectResponderModel } from '@t/components/series';
import { LineModel } from '@t/components/axis';
import {
  deepCopyArray,
  includes,
  isNumber,
  hasNegative,
  calculateSizeWithPercentString,
} from '@src/helpers/utils';
import { getLimitOnAxis } from '@src/helpers/axes';
import { isGroupStack, isPercentStack } from '@src/store/stackSeriesData';
import { calibrateBoxStackDrawingValue, sumValuesBeforeIndex } from '@src/helpers/boxSeries';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getRGBA } from '@src/helpers/color';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { RectDataLabel } from '@t/components/dataLabels';
import { getBoxTypeSeriesPadding } from '@src/helpers/style';
import { getDataInRange } from '@src/helpers/range';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';
import { makeLabelsFromLimit } from '@src/helpers/calculator';

type RenderOptions = {
  stack: Stack;
  scaleType: PercentScaleType;
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  hasNegativeValue: boolean;
  seriesDirection: SeriesDirection;
  defaultPadding: number;
  offsetSize: number;
  centerYAxis?: CenterYAxisData;
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

function getStackSeriesDataInViewRange(
  stackSeriesData: StackSeriesData<BoxType>,
  viewRange?: RangeDataType<number>
): StackSeriesData<BoxType> {
  if (!viewRange) {
    return stackSeriesData;
  }

  const stackData = Array.isArray(stackSeriesData.stackData)
    ? getDataInRange(stackSeriesData.stackData, viewRange)
    : {
        ...Object.keys(stackSeriesData.stackData).reduce(
          (acc, name) => ({
            ...acc,
            [name]: getDataInRange(stackSeriesData.stackData[name], viewRange),
          }),
          {}
        ),
      };

  const data = stackSeriesData.data.map((seriesDatum) => ({
    ...seriesDatum,
    data: getDataInRange(seriesDatum.data, viewRange),
  }));

  return { ...stackSeriesData, data, stackData };
}

export default class BoxStackSeries extends BoxSeries {
  initialize({ name, stackChart }: { name: BoxType; stackChart: boolean }) {
    this.initializeFields(name);

    if (stackChart) {
      this.eventBus.on('selectSeries', this.selectSeries);
      this.eventBus.on('showTooltip', this.showTooltip);
      this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
  }

  render<T extends BarChartOptions | ColumnChartOptions | ColumnLineChartOptions>(
    chartState: ChartState<T>,
    computed
  ) {
    const { layout, series: seriesData, axes, stackSeries, legend, theme, scale } = chartState;
    const { viewRange } = computed;
    this.isShow = !!stackSeries[this.name];

    if (!this.isShow) {
      return;
    }

    const categories = (chartState.categories as string[]) ?? [];
    const options = this.getOptions(chartState.options);

    this.setEventDetectType(seriesData, options);

    this.theme = theme.series[this.name];
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const stackSeriesData = getStackSeriesDataInViewRange(stackSeries[this.name], viewRange);
    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!options.series?.diverging;

    const { limit, stepSize } = this.getScaleData(scale);
    const labels = makeLabelsFromLimit(limit, stepSize);
    const { min, max } = getLimitOnAxis(labels);

    const { stack, scaleType } = stackSeriesData;

    this.basePosition = this.getBasePosition(axes[this.valueAxis]);

    let offsetSize: number = this.getOffsetSize();

    const { centerYAxis } = axes;

    if (diverging) {
      const [left, right] = this.getDivergingBasePosition(centerYAxis!);

      this.basePosition = this.getOffsetSize() / 2;
      this.leftBasePosition = left;
      this.rightBasePosition = right;

      offsetSize = this.getOffsetSizeWithDiverging(centerYAxis!);
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
      defaultPadding: getBoxTypeSeriesPadding(tickDistance),
      offsetSize,
      centerYAxis,
    };

    const { series, connector } = this.renderStackSeriesModel(stackSeriesData, renderOptions);

    const clipRect = this.renderClipRectAreaModel();

    const tooltipData: TooltipData[] = this.getTooltipData(stackSeriesData, categories);

    this.models = {
      clipRect: [clipRect],
      series,
      connector,
    };

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: [this.initClipRect(clipRect)],
        series: deepCopyArray(series),
        connector: deepCopyArray(connector),
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      const dataLabelData = this.getDataLabels(series, renderOptions);
      const stackTotalData = this.getTotalDataLabels(stackSeriesData, renderOptions);

      this.renderDataLabels([...dataLabelData, ...stackTotalData]);
    }

    this.tooltipRectMap = this.makeTooltipRectMap(series, tooltipData);
    this.responders = this.getBoxSeriesResponders(series, tooltipData, axes, categories);
  }

  renderStackSeriesModel(seriesData: StackSeriesData<BoxType>, renderOptions: RenderOptions) {
    const { stackData } = seriesData;

    return isGroupStack(stackData)
      ? this.makeStackGroupSeriesModel(seriesData, renderOptions)
      : this.makeStackSeriesModel(stackData, renderOptions, seriesData.data);
  }

  makeStackSeriesModel(
    stackData: StackDataValues,
    renderOptions: RenderOptions,
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
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
        stackGroupIndex,
        stackGroupCount
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
        const { name, colorByCategories, color: rawColor } = seriesRawData[seriesIndex];
        const active = this.activeSeriesMap![name];
        const colorLength = rawColor.length || 1;
        const hexColor = colorByCategories ? rawColor[dataIndex % colorLength] : rawColor as string;
        const color = getRGBA(hexColor, active ? 1 : 0.2);

        seriesModels.push({
          type: 'rect',
          color,
          name,
          value,
          ...this.getAdjustedRect(seriesPos, dataPosition, barLength ?? 0, columnWidth),
          index: dataIndex,
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

  makeStackGroupSeriesModel(stackSeries: StackSeriesData<BoxType>, renderOptions: RenderOptions) {
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
        filtered,
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
      const seriesPos = this.getSeriesPosition(
        renderOptions,
        columnWidth,
        index,
        stackGroupIndex,
        stackGroupCount
      );
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

        const { x, y } = this.getAdjustedRect(seriesPos, dataPosition, barLength!, columnWidth);
        const xPos = !isLBSideWithDiverging && this.isBar ? x + barLength! : x;
        const yPos = isLBSideWithDiverging && !this.isBar ? y + barLength! : y;

        points.push({ x: xPos!, y: yPos! });
      });

      connectorPoints.push(points);
    });

    return this.makeConnectorModel(connectorPoints, connector, columnWidth);
  }

  private getTooltipData(
    seriesData: StackSeriesData<BoxType>,
    categories: string[]
  ): TooltipData[] {
    const seriesRawData = seriesData.data;
    const { stackData } = seriesData;
    const colors = seriesRawData.map(({ color }) => color) as string[];

    return isGroupStack(stackData)
      ? this.makeGroupStackTooltipData(seriesRawData, stackData, categories)
      : this.makeStackTooltipData(seriesRawData, stackData, colors, categories);
  }

  private makeGroupStackTooltipData(
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
    stackData: StackGroupData,
    categories: string[]
  ) {
    return Object.keys(stackData).flatMap((groupId) => {
      const rawDataWithSameGroupId = seriesRawData.filter(
        ({ stackGroup }) => stackGroup === groupId
      );
      const colors = rawDataWithSameGroupId.map(({ color }) => color) as string[];

      return this.makeStackTooltipData(
        rawDataWithSameGroupId,
        stackData[groupId],
        colors,
        categories
      );
    });
  }

  private makeStackTooltipData(
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
    stackData: StackDataValues,
    colors: string[],
    categories: string[]
  ): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    stackData.forEach(({ values }, dataIndex) => {
      values.forEach((value, seriesIndex) => {
        tooltipData.push({
          label: seriesRawData[seriesIndex].name,
          color: colors[seriesIndex],
          value,
          category: categories.length ? categories[dataIndex] : '',
        });
      });
    });

    return tooltipData;
  }

  private makeConnectorModel(
    pointsForConnector: Array<Point[]>,
    connector: boolean,
    columnWidth: number
  ) {
    if (!connector || !pointsForConnector.length) {
      return [];
    }

    const { color, lineWidth, dashSegments } = this.theme.connector;
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
            dashSegments,
            strokeStyle: color,
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
      return offsetSize / getDivisorForPercent(total, scaleType);
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
    const { tickDistance, diverging, defaultPadding } = renderOptions;
    const divisor = diverging ? 1 : stackGroupCount;
    const themeBarWidth = this.theme.barWidth;

    return themeBarWidth
      ? calculateSizeWithPercentString(tickDistance, themeBarWidth)
      : (tickDistance - defaultPadding * 2) / divisor;
  }

  private getSeriesPosition(
    renderOptions: RenderOptions,
    columnWidth: number,
    dataIndex: number,
    stackGroupIndex: number,
    stackGroupCount: number
  ) {
    const { tickDistance, diverging } = renderOptions;
    const groupIndex = diverging ? 0 : stackGroupIndex;
    const groupCount = diverging ? 1 : stackGroupCount;
    const padding = (tickDistance - columnWidth * groupCount) / 2;

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
      startPos = this.calcStartPositionWithPercent(values, currentIndex, ratio);
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
    const barLength = result * ratio;
    let pos: number;

    if (this.isBar) {
      pos = basePosition + barLength;
    } else {
      pos = collideEdge ? 0 : basePosition - barLength;
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

  getDataLabels(seriesModels: RectModel[], renderOptions: RenderOptions) {
    return seriesModels.map((data) => this.makeDataLabel(data, renderOptions.centerYAxis));
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
    const { min, max, seriesDirection, diverging, centerYAxis } = renderOptions;
    const columnWidth = this.getStackColumnWidth(renderOptions, stackGroupCount);

    stackData.forEach((data, dataIndex) => {
      const { total } = data;
      const seriesPos = this.getSeriesPosition(
        renderOptions,
        columnWidth,
        dataIndex,
        stackGroupIndex,
        stackGroupCount
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
          name: `totalLabel-${key}`,
          theme: this.theme.dataLabels.stackTotal!,
          ...this.getAdjustedRect(seriesPos, dataPosition, barLength, columnWidth),
        };

        dataLabels.push(this.makeTotalDataLabel(stackTotal, centerYAxis));
      });
    });

    return dataLabels;
  }

  makeTotalDataLabel(totalLabel: StackTotalModel, centerYAxis?: CenterYAxisData): RectDataLabel {
    return {
      ...totalLabel,
      direction: this.getDataLabelDirection(totalLabel, centerYAxis),
      plot: {
        x: 0,
        y: 0,
        size: this.getOffsetSize(),
      },
    };
  }

  onMousemoveGroupedType(responders: RectResponderModel[]) {
    const rectModels = this.getRectModelsFromRectResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: [...rectModels, ...this.getGroupedRect(responders, 'hover')],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = rectModels;
  }

  selectSeries = ({
    index,
    seriesIndex,
    state,
  }: SelectSeriesHandlerParams<BarChartOptions | ColumnChartOptions>) => {
    if (!isNumber(index) || !isNumber(seriesIndex)) {
      return;
    }

    const { stackSeries } = state;
    const stackSeriesData = stackSeries[this.name] as StackSeriesData<BoxType>;
    const { name } = stackSeriesData.data[seriesIndex];
    const model = this.tooltipRectMap[index].find(({ name: seriesName }) => seriesName === name);

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getRespondersWithTheme([model], 'select'),
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.eventBus.emit('needDraw');
  };
}
