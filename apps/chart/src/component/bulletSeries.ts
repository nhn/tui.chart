import Component from './component';
import { ChartState, Series, Axes, LabelAxisData } from '@t/store/store';
import {
  BulletSeriesModels,
  BulletModel,
  BulletResponderModel,
  MarkerResponderModel,
  RectResponderModel,
  BulletLineModel,
  BulletRectModel,
  BulletRectResponderModel,
  ClipRectAreaModel,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { BulletChartOptions, BulletSeriesType, Size, BoxTypeEventDetectType } from '@t/options';
import { isLabelAxisOnYAxis, getAxisName, getSizeKey } from '@src/helpers/axes';
import { TooltipData, TooltipTitleValues } from '@t/components/tooltip';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { RectDataLabel, LineDataLabel } from '@t/components/dataLabels';
import { BulletChartSeriesTheme, GroupedRect } from '@t/theme';
import { DEFAULT_BULLET_RANGE_OPACITY } from '@src/helpers/theme';
import {
  isNumber,
  omit,
  calculateSizeWithPercentString,
  pick,
  isNull,
  deepCopyArray,
} from '@src/helpers/utils';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';
import { makeRectResponderModel } from '@src/helpers/responders';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  zeroPosition: number;
  rangeWidth: number;
  bulletWidth: number;
  markerWidth: number;
};

type BulletTooltipData = {
  range: TooltipData[];
  bullet: TooltipData[];
  marker: TooltipData[];
};

type BulletTooltipRectMap = Record<string, (BulletRectResponderModel | MarkerResponderModel)[]>;

const DEFAULT_WIDTH_RATIO = 0.6;
const MARKER_LINE_DETECTION_SIZE = 5;

function getRectSize(vertical: boolean, barWidth: number, barLength: number): Size {
  return {
    width: vertical ? barWidth : barLength,
    height: vertical ? barLength : barWidth,
  };
}

function getStartX(seriesIndex: number, tickDistance: number, barWidth: number) {
  return seriesIndex * tickDistance + (tickDistance - barWidth) / 2;
}

function makeBulletResponderModel(models: BulletSeriesModels, tooltipData: BulletTooltipData) {
  const { range, marker, bullet } = models;
  const { range: tooltipRange, marker: tooltipMarker, bullet: tooltipBullet } = tooltipData;

  return [
    ...range.map((m, index) => ({ ...m, data: tooltipRange[index] })),
    ...bullet.map((m, index) => ({
      ...m,
      data: tooltipBullet[index],
    })),
    ...marker.map((m, index) => ({
      ...m,
      detectionSize: MARKER_LINE_DETECTION_SIZE,
      data: tooltipMarker[index],
    })),
  ];
}

export default class BulletSeries extends Component {
  models: BulletSeriesModels = { range: [], bullet: [], marker: [] };

  drawModels!: BulletSeriesModels;

  responders!: BulletResponderModel[];

  activatedResponders: BulletResponderModel[] = [];

  theme!: Required<BulletChartSeriesTheme>;

  eventDetectType: BoxTypeEventDetectType = 'point';

  tooltipRectMap!: BulletTooltipRectMap;

  vertical = false;

  basePosition!: number;

  initialize() {
    this.type = 'series';
    this.name = 'bullet';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    const { clipRect } = this.drawModels;

    if (!clipRect) {
      return;
    }

    const offsetKey = this.vertical ? 'y' : 'x';
    const key = this.vertical ? 'height' : 'width';
    const current = clipRect[0];
    const target = this.models.clipRect![0];
    const offsetSize = current[key] + (target[key] - current[key]) * delta;

    current[key] = offsetSize;
    current[offsetKey] = Math.max(
      this.basePosition - (offsetSize * this.basePosition) / target[key],
      0
    );
  }

  render(state: ChartState<BulletChartOptions>): void {
    const { layout, axes, series, scale, legend, options, theme, categories } = state;

    if (!series.bullet) {
      throw new Error(message.noDataError(this.name));
    }

    this.setEventDetectType(series, options);

    this.theme = theme.series.bullet as Required<BulletChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);
    this.vertical = !!options?.series?.vertical;

    const labelAxisOnYAxis = isLabelAxisOnYAxis({ series, options });
    const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis, series);
    const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
    const { tickDistance } = axes[labelAxisName];
    const { zeroPosition } = axes[valueAxisName];
    const { min, max } = scale[valueAxisName].limit;
    const bulletData = series.bullet.data;

    this.basePosition = zeroPosition ?? 0;

    const renderOptions = {
      ratio: this.rect[valueSizeKey] / (max - min),
      tickDistance,
      zeroPosition,
      ...this.getBulletBarWidths(tickDistance),
    };

    const rangeModels = this.renderRanges(bulletData, renderOptions);
    const bulletModels = this.renderBullet(bulletData, renderOptions);
    const markerModels = this.renderMarkers(bulletData, renderOptions);
    const clipRect = this.renderClipRectArea();

    this.models.clipRect = [clipRect];
    this.models.range = rangeModels;
    this.models.bullet = bulletModels;
    this.models.marker = markerModels;

    if (!this.drawModels) {
      this.drawModels = {
        clipRect: [this.makeInitialClipRectModel(clipRect)],
        range: deepCopyArray(rangeModels),
        bullet: deepCopyArray(bulletModels),
        marker: deepCopyArray(markerModels),
      };
    }

    const models = {
      range: rangeModels,
      bullet: bulletModels,
      marker: markerModels,
    };
    const tooltipData = this.makeTooltipModel(models);
    this.tooltipRectMap = this.makeTooltipRectMap(models, tooltipData);
    this.responders = this.getBulletSeriesResponders(
      models,
      tooltipData,
      axes,
      categories as string[]
    );

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(
        this.getDataLabels(
          [...rangeModels, ...bulletModels, ...markerModels],
          this.vertical,
          this.rect[valueSizeKey]
        )
      );
    }
  }

  protected renderClipRectArea(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height,
    };
  }

  protected makeInitialClipRectModel(clipRect: ClipRectAreaModel): ClipRectAreaModel {
    const width = this.vertical ? clipRect.width : 0;
    const height = this.vertical ? 0 : clipRect.height;
    const x = this.vertical ? clipRect.x : 0;
    const y = this.vertical ? 0 : clipRect.y;

    return { type: 'clipRectArea', width, height, x, y };
  }

  private getDataLabels(
    seriesModels: BulletModel[],
    vertical: boolean,
    size: number
  ): (RectDataLabel | LineDataLabel)[] {
    const { dataLabels: dataLabelTheme } = this.theme;
    const bulletLabelTheme = omit(dataLabelTheme, 'marker');
    const { useSeriesColor, color } = bulletLabelTheme;
    const { marker } = dataLabelTheme;

    return seriesModels
      .filter((m) => m.type === 'line' || (m as BulletRectModel).modelType !== 'range')
      .map((m) => {
        if (m.type === 'line') {
          return {
            ...m,
            x: vertical ? (m.x + m.x2) / 2 : m.x,
            theme: {
              ...marker,
              color: marker!.useSeriesColor ? m.strokeStyle : marker!.color,
            },
          } as LineDataLabel;
        }

        const isValueNegative = isNumber(m.value) && m?.value < 0;
        let direction = vertical ? 'top' : 'right';
        if (isValueNegative) {
          direction = vertical ? 'bottom' : 'left';
        }

        return {
          ...m,
          direction,
          plot: {
            x: 0,
            y: 0,
            size,
          },
          theme: {
            ...bulletLabelTheme,
            color: useSeriesColor ? m.color : color,
          },
        } as RectDataLabel;
      });
  }

  private setEventDetectType(series: Series, options?: BulletChartOptions) {
    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }
  }

  private getBulletSeriesResponders(
    models: BulletSeriesModels,
    tooltipData: BulletTooltipData,
    axes: Axes,
    categories: string[]
  ) {
    return this.eventDetectType === 'grouped'
      ? makeRectResponderModel(
          this.rect,
          (this.vertical ? axes.xAxis : axes.yAxis) as LabelAxisData,
          categories,
          this.vertical
        )
      : makeBulletResponderModel(models, tooltipData);
  }

  private makeTooltipRectMap(models: BulletSeriesModels, tooltipData: BulletTooltipData) {
    const result: BulletTooltipRectMap = {};

    Object.keys(models).forEach((seriesType) => {
      models[seriesType].forEach((m, index) => {
        const label = m.name;

        if (!result[label]) {
          result[label] = [];
        }

        const tooltipModel = { ...m, data: tooltipData[seriesType][index] };
        result[label].push(tooltipModel);
      });
    });

    return result;
  }

  private getBulletSeriesModelsFromRectResponders(
    responders: BulletResponderModel[]
  ): BulletResponderModel[] {
    if (!responders.length) {
      return [];
    }

    return this.tooltipRectMap[(responders[0] as RectResponderModel).label!] ?? [];
  }

  private getGroupedRect(responders: BulletResponderModel[], type: 'hover' | 'select') {
    const bulletSeriesModels = this.getBulletSeriesModelsFromRectResponders(responders);
    const { color, opacity } = this.theme[type].groupedRect as Required<GroupedRect>;

    return bulletSeriesModels.length
      ? responders.map((m) => ({
          ...m,
          color: getRGBA(color, opacity),
        }))
      : [];
  }

  private onMousemoveGroupedType(responders: BulletResponderModel[]) {
    const bulletSeriesModels = this.getBulletSeriesModelsFromRectResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: [
        ...this.getGroupedRect(responders, 'hover'),
        ...this.getRespondersWithTheme(bulletSeriesModels, 'hover'),
      ],
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = bulletSeriesModels;
  }

  onMousemove({ responders }) {
    if (this.eventDetectType === 'grouped') {
      this.onMousemoveGroupedType(responders);
    } else {
      this.eventBus.emit('renderHoveredSeries', {
        models: this.getRespondersWithTheme(responders, 'hover'),
        name: this.name,
      });

      this.activatedResponders = responders.length ? [responders[responders.length - 1]] : [];
    }

    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.name,
    });

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }: { responders: BulletResponderModel[] }) {
    if (this.selectable) {
      const models =
        this.eventDetectType === 'grouped'
          ? [
              ...this.getGroupedRect(responders, 'select'),
              ...this.getRespondersWithTheme(
                this.getBulletSeriesModelsFromRectResponders(responders),
                'select'
              ),
            ]
          : this.getRespondersWithTheme(responders, 'select');

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
    });

    this.eventBus.emit('needDraw');
  };

  filterBulletResponder(responders: BulletResponderModel[]) {
    return responders.filter((model) => (model as BulletRectModel)?.modelType === 'bullet');
  }

  renderRanges(
    bulletData: BulletSeriesType[],
    { tickDistance, ratio, zeroPosition, rangeWidth }: RenderOptions
  ): BulletRectModel[] {
    const rangeModels: BulletRectModel[] = [];

    bulletData.forEach(({ ranges, color, name }, seriesIndex) => {
      (ranges ?? []).forEach((range, rangeIndex) => {
        if (!isNull(range)) {
          const [start, end] = range;
          const barLength = (end - start) * ratio;
          const rangeStartX = getStartX(seriesIndex, tickDistance, rangeWidth);

          rangeModels.push({
            type: 'rect',
            name,
            color: this.getRangeColor(
              getRGBA(color!, this.getSeriesOpacity(name)),
              rangeIndex,
              name
            ),
            x: this.vertical ? rangeStartX : start * ratio + zeroPosition,
            y: this.vertical ? zeroPosition - end * ratio : rangeStartX,
            ...getRectSize(this.vertical, rangeWidth, barLength),
            modelType: 'range',
            seriesColor: color,
            tooltipColor: this.getRangeColor(color!, rangeIndex, name, true),
            value: range,
          });
        }
      });
    });

    return rangeModels;
  }

  renderBullet(
    bulletData: BulletSeriesType[],
    { tickDistance, ratio, zeroPosition, bulletWidth }: RenderOptions
  ): BulletRectModel[] {
    const { borderColor, borderWidth: thickness } = this.theme;

    return bulletData.reduce<BulletRectModel[]>((acc, { data, color, name }, seriesIndex) => {
      if (isNull(data)) {
        return [...acc];
      }
      const bulletLength = Math.max(Math.abs(data * ratio), 2);
      const bulletStartX = getStartX(seriesIndex, tickDistance, bulletWidth);
      const x = this.vertical ? bulletStartX : zeroPosition - (data < 0 ? bulletLength : 0);
      const y = this.vertical
        ? zeroPosition - bulletLength + (data < 0 ? bulletLength : 0)
        : bulletStartX;

      const bullet: BulletRectModel = {
        type: 'rect',
        name,
        color: getRGBA(color!, this.getSeriesOpacity(name)),
        x,
        y,
        thickness,
        borderColor,
        modelType: 'bullet',
        seriesColor: color,
        tooltipColor: color,
        value: data,
        ...getRectSize(this.vertical, bulletWidth, bulletLength),
      };

      return [...acc, bullet];
    }, []);
  }

  renderMarkers(
    bulletData: BulletSeriesType[],
    { tickDistance, ratio, zeroPosition, markerWidth }: RenderOptions
  ): BulletLineModel[] {
    const { markerLineWidth } = this.theme;
    const markerModels: BulletLineModel[] = [];

    bulletData.forEach(({ markers, color, name }, seriesIndex) => {
      const markerStartX = getStartX(seriesIndex, tickDistance, markerWidth);

      (markers ?? []).forEach((marker) => {
        if (!isNull(marker)) {
          const dataPosition = marker * ratio;
          const x = this.vertical ? markerStartX : dataPosition + zeroPosition;
          const y = this.vertical ? zeroPosition - dataPosition : markerStartX;

          markerModels.push({
            type: 'line',
            name,
            x,
            y,
            x2: this.vertical ? x + markerWidth : x,
            y2: this.vertical ? y : y + markerWidth,
            strokeStyle: getRGBA(color!, this.getSeriesOpacity(name)),
            lineWidth: markerLineWidth,
            seriesColor: color,
            tooltipColor: color,
            value: marker,
          });
        }
      });
    });

    return markerModels;
  }

  makeTooltipModel(seriesModels: BulletSeriesModels): BulletTooltipData {
    const { range, bullet, marker } = seriesModels;

    return {
      range: this.makeTooltipData<BulletRectModel>(range, 'Range'),
      bullet: this.makeTooltipData<BulletRectModel>(bullet, 'Actual'),
      marker: this.makeTooltipData<BulletLineModel>(marker, 'Marker'),
    };
  }

  makeTooltipData<T extends BulletRectModel | BulletLineModel>(
    data: T[],
    title: 'Range' | 'Actual' | 'Marker'
  ): TooltipData[] {
    return data.map((m) => {
      const { name, seriesColor, tooltipColor, value } = m;

      return {
        label: name!,
        color: getRGBA(seriesColor!, 1),
        value: [{ title, value, color: tooltipColor! }] as TooltipTitleValues,
        templateType: 'bullet',
      };
    });
  }

  getBulletBarWidths(tickDistance: number) {
    const { barWidth: barThemeWidth, barWidthRatios } = this.theme;
    const { rangeRatio, bulletRatio, markerRatio } = barWidthRatios;
    const barWidth = barThemeWidth
      ? calculateSizeWithPercentString(tickDistance, barThemeWidth)
      : tickDistance * DEFAULT_WIDTH_RATIO;

    return {
      rangeWidth: barWidth * rangeRatio!,
      bulletWidth: barWidth * bulletRatio!,
      markerWidth: barWidth * markerRatio!,
    };
  }

  getRangeColor(
    seriesColor: string,
    rangeIndex: number,
    seriesName: string,
    ignoreRestSeriesOpacity = false
  ) {
    const { rangeColors } = this.theme;
    const hasThemeRangeColor = Array.isArray(rangeColors) && rangeColors[rangeIndex];
    const color = hasThemeRangeColor ? rangeColors[rangeIndex] : seriesColor;
    const opacity = hasThemeRangeColor
      ? getAlpha(rangeColors[rangeIndex])
      : DEFAULT_BULLET_RANGE_OPACITY[rangeIndex];

    return getRGBA(color, opacity * this.getSeriesOpacity(seriesName, ignoreRestSeriesOpacity));
  }

  getSeriesOpacity(seriesName: string, ignoreRestSeriesOpacity = false) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![seriesName];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);
    const restOpacity = ignoreRestSeriesOpacity ? areaOpacity : select.restSeries!.areaOpacity!;
    const selectedOpacity = active ? select.areaOpacity! : restOpacity;

    return selected ? selectedOpacity : areaOpacity;
  }

  getRespondersWithTheme(responders: BulletResponderModel[], type: 'hover' | 'select') {
    const { color, borderColor, borderWidth: thickness } = this.theme[type];

    return (this.filterBulletResponder(responders) as BulletRectModel[]).map((model) => {
      return {
        ...model,
        color: color ?? model.tooltipColor,
        thickness,
        borderColor,
        style: [
          {
            ...pick(
              this.theme[type],
              'shadowBlur',
              'shadowColor',
              'shadowOffsetX',
              'shadowOffsetY'
            ),
          },
        ],
      };
    });
  }

  selectSeries = ({ seriesIndex, state }: SelectSeriesHandlerParams<BulletChartOptions>) => {
    if (!isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.bullet?.[seriesIndex];

    const model = this.filterBulletResponder(this.responders as BulletResponderModel[]).filter(
      ({ name: dataName }) => dataName === name
    );

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getRespondersWithTheme(model, 'select'),
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = ({ seriesIndex, state }: SelectSeriesHandlerParams<BulletChartOptions>) => {
    if (!isNumber(seriesIndex)) {
      return;
    }

    const { name } = state.series.bullet?.[seriesIndex];
    const models = this.filterBulletResponder(this.responders as BulletResponderModel[]).filter(
      ({ name: dataName }) => dataName === name
    );

    if (!models.length) {
      return;
    }

    this.onMousemove({ responders: models });
  };
}
