import Component from './component';
import {
  RectModel,
  ClipRectAreaModel,
  BoxSeriesModels,
  StackTotalModel,
  RectResponderModel,
  MouseEventType,
} from '@t/components/series';
import {
  ChartState,
  BoxType,
  ValueAxisData,
  CenterYAxisData,
  Series,
  Axes,
  Scale,
  LabelAxisData,
} from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  BarChartOptions,
  ColumnChartOptions,
  Rect,
  RangeDataType,
  BoxTypeEventDetectType,
  ColumnLineChartOptions,
  ColumnLineChartSeriesOptions,
  BoxSeriesOptions,
} from '@t/options';
import {
  first,
  hasNegative,
  deepCopyArray,
  last,
  hasNegativeOnly,
  hasPositiveOnly,
  isNull,
  isNumber,
  calculateSizeWithPercentString,
  omit,
} from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';
import { makeTickPixelPositions, makeLabelsFromLimit } from '@src/helpers/calculator';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { getDataInRange, isRangeData, isRangeValue } from '@src/helpers/range';
import { getLimitOnAxis, getValueAxisName } from '@src/helpers/axes';
import { calibrateDrawingValue } from '@src/helpers/boxSeries';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getBoxTypeSeriesPadding } from '@src/helpers/style';
import { makeRectResponderModel, RespondersThemeType } from '@src/helpers/responders';
import { RectDirection, RectDataLabel } from '@t/components/dataLabels';
import { BoxChartSeriesTheme, GroupedRect } from '@t/theme';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';
import { isAvailableSelectSeries, isAvailableShowTooltipInfo } from '@src/helpers/validation';
import { SelectSeriesInfo } from '@t/charts';

export enum SeriesDirection {
  POSITIVE,
  NEGATIVE,
  BOTH,
}

type RenderOptions = {
  tickDistance: number;
  min: number;
  max: number;
  diverging: boolean;
  ratio?: number;
  hasNegativeValue: boolean;
  seriesDirection: SeriesDirection;
  defaultPadding: number;
};

const BOX = {
  BAR: 'bar',
  COLUMN: 'column',
};

export function isLeftBottomSide(seriesIndex: number) {
  return !!(seriesIndex % 2);
}

function calculateBarLength(value: Exclude<BoxSeriesDataType, null>, min: number, max: number) {
  if (isRangeValue(value)) {
    let [start, end] = value;

    if (start < min) {
      start = min;
    }

    if (end > max) {
      end = max;
    }

    return end - start;
  }

  return calibrateDrawingValue(value, min, max);
}

export default class BoxSeries extends Component {
  models: BoxSeriesModels = { series: [] };

  drawModels!: BoxSeriesModels;

  responders!: RectResponderModel[];

  activatedResponders: RectResponderModel[] = [];

  isBar = true;

  valueAxis = 'xAxis';

  labelAxis = 'yAxis';

  anchorSizeKey = 'height';

  offsetSizeKey = 'width';

  basePosition = 0;

  leftBasePosition = 0;

  rightBasePosition = 0;

  isRangeData = false;

  offsetKey = 'x';

  eventDetectType: BoxTypeEventDetectType = 'point';

  tooltipRectMap!: RectResponderModel[][];

  theme!: Required<BoxChartSeriesTheme>;

  initialize({ name, stackChart }: { name: BoxType; stackChart: boolean }) {
    this.initializeFields(name);

    if (!stackChart) {
      this.eventBus.on('selectSeries', this.selectSeries);
      this.eventBus.on('showTooltip', this.showTooltip);
      this.eventBus.on('hideTooltip', this.onMouseoutComponent);
    }
  }

  initializeFields(name: BoxType) {
    this.type = 'series';
    this.name = name;
    this.isBar = name === BOX.BAR;
    this.offsetKey = this.isBar ? 'x' : 'y';
    this.valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    this.labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    this.anchorSizeKey = this.isBar ? 'height' : 'width';
    this.offsetSizeKey = this.isBar ? 'width' : 'height';
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    if (this.isRangeData) {
      this.initUpdateRangeData(delta);

      return;
    }

    this.initUpdateClipRect(delta);

    this.initUpdateConnector(delta);
  }

  initUpdateRangeData(delta: number) {
    const { series } = this.drawModels;
    this.drawModels.clipRect = this.models.clipRect;

    const target = this.models.series;

    series.forEach((current, index) => {
      const targetModel = target[index];

      if (delta === 0) {
        current[this.offsetSizeKey] = 0;
      }

      const offsetSize =
        current[this.offsetSizeKey] +
        (targetModel[this.offsetSizeKey] - current[this.offsetSizeKey]) * delta;

      current[this.offsetSizeKey] = offsetSize;

      if (!this.isBar) {
        current[this.offsetKey] =
          targetModel[this.offsetKey] + targetModel[this.offsetSizeKey] - offsetSize;
      }
    });
  }

  initUpdateClipRect(delta: number) {
    const { clipRect } = this.drawModels;

    if (!clipRect) {
      return;
    }

    const current = clipRect[0];
    const key = this.offsetSizeKey;
    const target = this.models.clipRect![0];
    const offsetSize = current[key] + (target[key] - current[key]) * delta;

    current[key] = offsetSize;
    current[this.offsetKey] = Math.max(
      this.basePosition - (offsetSize * this.basePosition) / target[key],
      0
    );
  }

  initUpdateConnector(delta: number) {
    const { connector } = this.drawModels;

    if (!connector) {
      return;
    }

    const target = this.models.connector!;

    connector.forEach((current, index) => {
      const alpha = getAlpha(target[index].strokeStyle!) * delta;

      current.strokeStyle = getRGBA(current.strokeStyle!, alpha);
    });
  }

  protected setEventDetectType(series: Series, options?: BarChartOptions | ColumnChartOptions) {
    if (series.line) {
      this.eventDetectType = 'grouped';
    }

    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }
  }

  protected getOptions(
    chartOptions: BarChartOptions | ColumnChartOptions | ColumnLineChartOptions
  ) {
    const options = { ...chartOptions };

    if (options?.series && (options.series as ColumnLineChartSeriesOptions).column) {
      options.series = {
        ...options.series,
        ...(options.series as ColumnLineChartSeriesOptions).column,
      };
    }

    return options;
  }

  render<T extends BarChartOptions | ColumnChartOptions | ColumnLineChartOptions>(
    chartState: ChartState<T>,
    computed
  ) {
    const { layout, series, axes, stackSeries, legend, theme, scale } = chartState;

    this.isShow = !(stackSeries && stackSeries[this.name]);

    if (!this.isShow) {
      return;
    }

    const categories = (chartState.categories as string[]) ?? [];
    const options = this.getOptions(chartState.options);

    this.setEventDetectType(series, options);

    this.theme = theme.series[this.name];
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);
    this.valueAxis = getValueAxisName(options, this.name, this.isBar ? 'xAxis' : 'yAxis');

    const seriesData = series[this.name].data.map((seriesDatum) => ({
      ...seriesDatum,
      data: getDataInRange(seriesDatum.data, computed.viewRange),
    }));

    if (axes.centerYAxis) {
      this.valueAxis = 'centerYAxis';
    }

    const { tickDistance } = axes[this.labelAxis];
    const diverging = !!(options.series as BoxSeriesOptions)?.diverging;
    const { limit, stepSize } = this.getScaleData(scale);
    const labels = makeLabelsFromLimit(limit, stepSize);
    const { min, max } = getLimitOnAxis(labels);

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
      min,
      max,
      tickDistance,
      diverging,
      ratio: this.getValueRatio(min, max, offsetSize),
      hasNegativeValue: hasNegative(labels),
      seriesDirection: this.getSeriesDirection(labels),
      defaultPadding: getBoxTypeSeriesPadding(tickDistance),
    };

    const seriesModels: RectModel[] = this.renderSeriesModel(seriesData, renderOptions);

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, renderOptions, categories);

    const clipRect = this.renderClipRectAreaModel();

    this.models = {
      clipRect: [clipRect],
      series: seriesModels,
    };

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: [this.initClipRect(clipRect)],
        series: deepCopyArray(seriesModels),
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      const dataLabelData = seriesModels.reduce<RectDataLabel[]>((acc, data) => {
        return isRangeValue(data.value)
          ? [...acc, ...this.makeDataLabelRangeData(data)]
          : [...acc, this.makeDataLabel(data, centerYAxis)];
      }, []);

      this.renderDataLabels(dataLabelData);
    }

    this.tooltipRectMap = this.makeTooltipRectMap(seriesModels, tooltipData);
    this.responders = this.getBoxSeriesResponders(seriesModels, tooltipData, axes, categories);
  }

  protected getScaleData(scale: Scale) {
    return scale[this.valueAxis === 'centerYAxis' ? 'xAxis' : this.valueAxis];
  }

  protected getBoxSeriesResponders(
    seriesModels: RectModel[],
    tooltipData: TooltipData[],
    axes: Axes,
    categories: string[]
  ) {
    const hoveredSeries = this.renderHoveredSeriesModel(seriesModels);

    return this.eventDetectType === 'grouped'
      ? makeRectResponderModel(
          this.rect,
          (this.isBar ? axes.yAxis : axes.xAxis) as LabelAxisData,
          categories,
          !this.isBar
        )
      : hoveredSeries.map((m, index) => ({
          ...m,
          data: tooltipData[index],
        }));
  }

  protected makeTooltipRectMap(seriesModels: RectModel[], tooltipDataArr: TooltipData[]) {
    return seriesModels.reduce<RectResponderModel[][]>((acc, cur, dataIndex) => {
      const index = cur.index!;
      const tooltipModel = { ...cur, data: tooltipDataArr[dataIndex] };
      if (!acc[index]) {
        acc[index] = [];
      }
      acc[index].push(tooltipModel);

      return acc;
    }, []);
  }

  protected renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height,
    };
  }

  protected initClipRect(clipRect: ClipRectAreaModel): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      width: this.isBar ? 0 : clipRect.width,
      height: this.isBar ? clipRect.height : 0,
      x: this.isBar ? 0 : clipRect.x,
      y: this.isBar ? clipRect.y : 0,
    };
  }

  renderSeriesModel(
    seriesData: BoxSeriesType<number | (RangeDataType<number> & number)>[],
    renderOptions: RenderOptions
  ): RectModel[] {
    const { tickDistance, diverging } = renderOptions;
    const seriesLength = seriesData.length;
    const validDiverging = diverging && seriesData.length === 2;
    const columnWidth = this.getColumnWidth(renderOptions, seriesLength, validDiverging);
    const seriesModels: RectModel[] = [];
    const padding = (tickDistance - columnWidth * (validDiverging ? 1 : seriesLength)) / 2;

    seriesData.forEach(({ data, color: seriesColor, name, colorByCategories }, seriesIndex) => {
      const seriesPos = (diverging ? 0 : seriesIndex) * columnWidth + padding;
      const isLBSideWithDiverging = diverging && isLeftBottomSide(seriesIndex);
      const colorLength = colorByCategories ? seriesColor.length : 1;

      this.isRangeData = isRangeData(data);

      data.forEach((value, index) => {
        const dataStart = seriesPos + index * tickDistance;
        const barLength = this.makeBarLength(value, renderOptions);
        const color = this.getSeriesColor(
          name,
          colorByCategories ? seriesColor[index % colorLength] : (seriesColor as string)
        );

        if (isNumber(barLength)) {
          const startPosition = this.getStartPosition(
            barLength,
            value,
            renderOptions,
            isLBSideWithDiverging
          );

          seriesModels.push({
            type: 'rect',
            color,
            value,
            ...this.getAdjustedRect(dataStart, startPosition, barLength, columnWidth),
            name,
            index,
          });
        }
      });
    });

    return seriesModels;
  }

  protected renderHoveredSeriesModel(seriesModel: RectModel[]): RectModel[] {
    return seriesModel.map((data) => {
      return this.makeHoveredSeriesModel(data);
    });
  }

  makeHoveredSeriesModel(data: RectModel): RectModel {
    const { x, y, width, height, color, index } = data!;

    return {
      type: 'rect',
      color: getRGBA(color, 1),
      x,
      y,
      width,
      height,
      index,
    };
  }

  getRectModelsFromRectResponders(responders: RectResponderModel[]) {
    if (!responders.length) {
      return [];
    }

    return this.tooltipRectMap[responders[0].index!] ?? [];
  }

  protected getGroupedRect(responders: RectResponderModel[], type: 'hover' | 'select') {
    const rectModels = this.getRectModelsFromRectResponders(responders);
    const { color, opacity } = this.theme[type].groupedRect as Required<GroupedRect>;

    return rectModels.length
      ? responders.map((m) => ({
          ...m,
          color: getRGBA(color, opacity),
        }))
      : [];
  }

  onMousemoveGroupedType(responders: RectResponderModel[]) {
    const rectModels = this.getRectModelsFromRectResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getGroupedRect(responders, 'hover'),
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = rectModels;
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    if (this.eventDetectType === 'grouped') {
      this.onMousemoveGroupedType(responders as RectResponderModel[]);
    } else {
      this.eventBus.emit('renderHoveredSeries', {
        models: this.getRespondersWithTheme(responders, 'hover'),
        name: this.name,
        eventDetectType: this.eventDetectType,
      });
      this.activatedResponders = responders;
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  private makeTooltipData(
    seriesData: BoxSeriesType<BoxSeriesDataType>[],
    renderOptions: RenderOptions,
    categories: string[]
  ): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesData.forEach(({ data, name, color, colorByCategories }) => {
      data.forEach((value, dataIndex) => {
        if (!isNull(value)) {
          const barLength = this.makeBarLength(value, renderOptions);

          if (isNumber(barLength)) {
            tooltipData.push({
              label: name,
              color: colorByCategories ? color[dataIndex] : (color as string),
              value: this.getTooltipValue(value),
              category: categories.length ? categories[dataIndex] : '',
            });
          }
        }
      });
    });

    return tooltipData;
  }

  private getTooltipValue(value: Exclude<BoxSeriesDataType, null>): string | number {
    return isRangeValue(value) ? `${value[0]} ~ ${value[1]}` : value;
  }

  protected getBasePosition({ labels, tickCount, zeroPosition }: ValueAxisData): number {
    const valueLabels = this.isBar ? labels : [...labels].reverse();
    const tickPositions = makeTickPixelPositions(this.getOffsetSize(), tickCount);
    const seriesDirection = this.getSeriesDirection(valueLabels);

    return zeroPosition
      ? zeroPosition
      : this.getTickPositionIfNotZero(tickPositions, seriesDirection);
  }

  getDivergingBasePosition(centerYAxis: CenterYAxisData) {
    let leftZeroPosition: number, rightZeroPosition: number;

    if (centerYAxis) {
      leftZeroPosition = centerYAxis.xAxisHalfSize;
      rightZeroPosition = centerYAxis.secondStartX;
    } else {
      const divergingZeroPosition = this.getOffsetSize() / 2;

      leftZeroPosition = rightZeroPosition = divergingZeroPosition;
    }

    return [leftZeroPosition, rightZeroPosition];
  }

  protected getOffsetSize(): number {
    return this.rect[this.offsetSizeKey];
  }

  getValueRatio(min: number, max: number, size: number) {
    return size / (max - min);
  }

  makeBarLength(
    value: BoxSeriesDataType,
    renderOptions: Pick<RenderOptions, 'min' | 'max' | 'ratio'>
  ) {
    if (isNull(value)) {
      return null;
    }
    const { min, max, ratio } = renderOptions;
    const calculatedValue = calculateBarLength(value, min, max);

    return Math.max(this.getBarLength(calculatedValue, ratio!), 2);
  }

  protected getBarLength(value: number, ratio: number) {
    return value < 0 ? Math.abs(value) * ratio : value * ratio;
  }

  getStartPositionWithRangeValue(
    value: RangeDataType<number>,
    barLength: number,
    renderOptions: RenderOptions
  ) {
    const { min, ratio } = renderOptions;
    let [start] = value;

    if (start < min) {
      start = min;
    }
    const startPosition = (start - min) * ratio!;

    return this.isBar ? startPosition : this.getOffsetSize() - startPosition - barLength;
  }

  getStartPosition(
    barLength: number,
    value: Exclude<BoxSeriesDataType, null>,
    renderOptions: RenderOptions,
    isLBSideWithDiverging: boolean
  ): number {
    const { diverging, seriesDirection } = renderOptions;
    let startPos: number;

    if (isRangeValue(value)) {
      startPos = this.getStartPositionWithRangeValue(value, barLength, renderOptions);
    } else if (diverging) {
      startPos = isLBSideWithDiverging
        ? this.getStartPosOnLeftBottomSide(barLength, diverging)
        : this.getStartPosOnRightTopSide(barLength, diverging);
    } else if (seriesDirection === SeriesDirection.POSITIVE) {
      startPos = this.getStartPosOnRightTopSide(barLength);
    } else if (seriesDirection === SeriesDirection.NEGATIVE) {
      startPos = this.getStartPosOnLeftBottomSide(barLength);
    } else {
      startPos =
        value < 0
          ? this.getStartPosOnLeftBottomSide(barLength)
          : this.getStartPosOnRightTopSide(barLength);
    }

    return startPos;
  }

  private getStartPosOnRightTopSide(barLength: number, diverging = false) {
    let pos: number;

    if (diverging) {
      pos = this.isBar ? this.rightBasePosition : this.rightBasePosition - barLength;
    } else {
      pos = this.isBar ? this.basePosition : this.basePosition - barLength;
    }

    return pos;
  }

  private getStartPosOnLeftBottomSide(barLength: number, diverging = false) {
    let pos: number;

    if (diverging) {
      pos = this.isBar ? this.leftBasePosition - barLength : this.leftBasePosition;
    } else {
      pos = this.isBar ? this.basePosition - barLength : this.basePosition;
    }

    return pos;
  }

  protected getAdjustedRect(
    seriesPosition: number,
    dataPosition: number,
    barLength: number,
    columnWidth: number
  ): Rect {
    return {
      x: this.isBar ? dataPosition : seriesPosition,
      y: this.isBar ? seriesPosition : dataPosition,
      width: this.isBar ? barLength : columnWidth,
      height: this.isBar ? columnWidth : barLength,
    };
  }

  getColumnWidth(renderOptions: RenderOptions, seriesLength: number, validDiverging = false) {
    const { tickDistance, defaultPadding } = renderOptions;
    seriesLength = validDiverging ? 1 : seriesLength;
    const themeBarWidth = this.theme.barWidth;

    return themeBarWidth
      ? calculateSizeWithPercentString(tickDistance, themeBarWidth)
      : (tickDistance - defaultPadding * 2) / seriesLength;
  }

  protected getSeriesDirection(labels: string[]) {
    let result = SeriesDirection.BOTH;

    if (hasPositiveOnly(labels)) {
      result = SeriesDirection.POSITIVE;
    } else if (hasNegativeOnly(labels)) {
      result = SeriesDirection.NEGATIVE;
    }

    return result;
  }

  protected getTickPositionIfNotZero(tickPositions: number[], direction: SeriesDirection) {
    if (!tickPositions.length) {
      return 0;
    }
    const firstTickPosition = Number(first(tickPositions));
    const lastTickPosition = Number(last(tickPositions));

    if (direction === SeriesDirection.POSITIVE) {
      return this.isBar ? firstTickPosition : lastTickPosition;
    }

    if (direction === SeriesDirection.NEGATIVE) {
      return this.isBar ? lastTickPosition : firstTickPosition;
    }

    return 0;
  }

  makeDataLabel(rect: RectModel, centerYAxis?: CenterYAxisData): RectDataLabel {
    const { dataLabels } = this.theme;

    return {
      ...rect,
      direction: this.getDataLabelDirection(rect, centerYAxis),
      plot: { x: 0, y: 0, size: this.getOffsetSize() },
      theme: {
        ...omit(dataLabels, 'stackTotal'),
        color: dataLabels.useSeriesColor ? rect.color : dataLabels.color,
      },
    };
  }

  makeDataLabelRangeData(rect: RectModel): RectDataLabel[] {
    const { dataLabels } = this.theme;

    return (rect.value as RangeDataType<number>).reduce<RectDataLabel[]>(
      (acc, value, index) => [
        ...acc,
        {
          ...rect,
          value,
          direction: this.getDataLabelRangeDataDirection(index % 2 === 0),
          plot: { x: 0, y: 0, size: this.getOffsetSize() },
          theme: {
            ...omit(dataLabels, 'stackTotal'),
            color: dataLabels.useSeriesColor ? rect.color : dataLabels.color,
          },
        },
      ],
      []
    );
  }

  getDataLabelRangeDataDirection(isEven: boolean) {
    let direction: RectDirection;

    if (this.isBar) {
      direction = isEven ? 'left' : 'right';
    } else {
      direction = isEven ? 'bottom' : 'top';
    }

    return direction;
  }

  getDataLabelDirection(
    rect: RectModel | StackTotalModel,
    centerYAxis?: CenterYAxisData
  ): RectDirection {
    let direction: RectDirection;

    if (this.isBar) {
      const basePos = centerYAxis ? this.leftBasePosition : this.basePosition;
      direction = rect.x < basePos ? 'left' : 'right';
    } else {
      direction = rect.y >= this.basePosition ? 'bottom' : 'top';
    }

    return direction;
  }

  getOffsetSizeWithDiverging(centerYAxis: CenterYAxisData) {
    return centerYAxis ? centerYAxis.xAxisHalfSize : this.getOffsetSize() / 2;
  }

  onClick({ responders }: MouseEventType) {
    if (this.selectable) {
      let models;
      if (this.eventDetectType === 'grouped') {
        models = [
          ...this.getGroupedRect(responders as RectResponderModel[], 'select'),
          ...this.getRectModelsFromRectResponders(responders as RectResponderModel[]),
        ];
      } else {
        models = this.getRespondersWithTheme(responders as RectResponderModel[], 'select');
      }

      this.eventBus.emit('renderSelectedSeries', {
        models,
        name: this.name,
        eventDetectType: this.eventDetectType,
      });
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.eventBus.emit('needDraw');
  };

  getRespondersWithTheme(responders: RectResponderModel[], type: RespondersThemeType) {
    const {
      color,
      borderColor,
      borderWidth,
      shadowBlur,
      shadowColor,
      shadowOffsetX,
      shadowOffsetY,
    } = this.theme[type];

    return responders.map((model) => ({
      ...model,
      color: color ?? model.color,
      thickness: borderWidth,
      borderColor,
      style: [
        {
          shadowBlur,
          shadowColor,
          shadowOffsetX,
          shadowOffsetY,
        },
      ],
    }));
  }

  getSeriesColor(name: string, color: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![name];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);

    return selected
      ? getRGBA(color, active ? select.areaOpacity! : select.restSeries!.areaOpacity!)
      : getRGBA(color, areaOpacity);
  }

  selectSeries = (info: SelectSeriesHandlerParams<BarChartOptions | ColumnChartOptions>) => {
    const { index, seriesIndex } = info;

    if (!isAvailableSelectSeries(info, 'column')) {
      return;
    }

    const model = this.tooltipRectMap[seriesIndex!][index!];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getRespondersWithTheme([model], 'select'),
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: SelectSeriesInfo) => {
    const { index, seriesIndex } = info;

    if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'column')) {
      return;
    }

    const models =
      this.eventDetectType === 'grouped'
        ? this.getGroupedRect([this.responders[index!]], 'hover')
        : this.getRespondersWithTheme([this.tooltipRectMap[index!][seriesIndex!]], 'hover');

    if (!models.length) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', {
      models,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.activatedResponders =
      this.eventDetectType === 'grouped' ? this.tooltipRectMap[index!] : models;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
