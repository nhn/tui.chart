import Component from './component';
import { ChartState, Series, Axes } from '@t/store/store';
import {
  BulletSeriesModels,
  BulletModel,
  BulletResponderModel,
  BulletRectModel,
  MarkerResponderModel,
  RectResponderModel,
  BulletLineModel,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA, getAlpha } from '@src/helpers/color';
import {
  BulletChartOptions,
  BulletSeriesType,
  Size,
  RangeDataType,
  BoxTypeEventDetectType,
} from '@t/options';
import { isLabelAxisOnYAxis, getAxisName, getSizeKey } from '@src/helpers/axes';
import { TooltipData, TooltipTitleValues } from '@t/components/tooltip';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { RectDataLabel, LineDataLabel } from '@t/components/dataLabels';
import { BulletChartSeriesTheme, GroupedRect } from '@t/theme';
import { DEFAULT_BULLET_RANGE_OPACITY, boxDefault } from '@src/helpers/theme';
import { isNumber, omit, calculateSizeWithPercentString } from '@src/helpers/utils';
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

const DEFAULT_WIDTH_RATIO = 0.6;

function getRectSize(vertical: boolean, barWidth: number, barLength: number): Size {
  return {
    width: vertical ? barWidth : barLength,
    height: vertical ? barLength : barWidth,
  };
}

function getStartX(seriesIndex: number, tickDistance: number, barWidth: number) {
  return seriesIndex * tickDistance + (tickDistance - barWidth) / 2;
}

export function isBulletSeries(seriesName: string) {
  return seriesName === 'bullet';
}

export default class BulletSeries extends Component {
  models: BulletSeriesModels = { series: [] };

  drawModels!: BulletSeriesModels;

  responders!: (BulletResponderModel | MarkerResponderModel | RectResponderModel)[];

  activatedResponders: this['responders'] = [];

  theme!: Required<BulletChartSeriesTheme>;

  eventDetectType: BoxTypeEventDetectType = 'point';

  tooltipRectMap!: Record<string, (BulletResponderModel | MarkerResponderModel)[]>;

  vertical = false;

  initialize() {
    this.type = 'series';
    this.name = 'bullet';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
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

    const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
    const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
    const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
    const { tickDistance } = axes[labelAxisName];
    const { zeroPosition } = axes[valueAxisName];
    const { min, max } = scale[valueAxisName].limit;
    const bulletData = series.bullet.data;

    const renderOptions = {
      ratio: this.rect[valueSizeKey] / (max - min),
      tickDistance,
      zeroPosition,
      ...this.getBulletBarWidths(tickDistance),
    };

    const seriesModels = this.renderSeries(bulletData, renderOptions);
    this.models.series = seriesModels;

    if (!this.drawModels) {
      this.drawModels = {
        series: seriesModels.map((m) => {
          const model = { ...m };

          if ((m as BulletRectModel).modelType === 'bullet') {
            if (this.vertical) {
              (model as BulletRectModel).height = 0;
              model.y = m.y + (m as BulletRectModel).height;
            } else {
              (model as BulletRectModel).width = 0;
            }
          }

          return {
            ...model,
          };
        }),
      };
    }

    const tooltipData = this.makeTooltipModel(seriesModels);

    this.tooltipRectMap = this.makeTooltipRectMap(seriesModels, tooltipData);
    this.responders = this.getBulletSeriesResponders(
      seriesModels,
      tooltipData,
      axes,
      categories as string[]
    );

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(
        this.getDataLabels(seriesModels, this.vertical, this.rect[valueSizeKey])
      );
    }
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

        return {
          ...m,
          direction: vertical ? 'top' : 'right',
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
    if (series.line) {
      this.eventDetectType = 'grouped';
    }

    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }
  }

  private getBulletSeriesResponders(
    seriesModels: BulletModel[],
    tooltipData: TooltipData[],
    axes: Axes,
    categories: string[]
  ) {
    return this.eventDetectType === 'grouped'
      ? makeRectResponderModel(
          this.rect,
          this.vertical ? axes.xAxis : axes.yAxis,
          categories,
          this.vertical
        )
      : seriesModels.map((m, index) => {
          const model = { ...m };

          if ((m as BulletRectModel).modelType === 'bullet') {
            (model as BulletRectModel).color = getRGBA((m as BulletRectModel).color, 1);
            (model as BulletRectModel).style = ['shadow'];
            (model as BulletRectModel).thickness = boxDefault.HOVER_THICKNESS;
          }

          if (m.type === 'line') {
            (model as MarkerResponderModel).detectionSize = 5;
            (model as MarkerResponderModel).strokeStyle = getRGBA(m.strokeStyle!, 1);
          }

          return {
            ...model,
            data: tooltipData[index],
          };
        });
  }

  private makeTooltipRectMap(seriesModels: BulletModel[], tooltipData: TooltipData[]) {
    return seriesModels.reduce<Record<string, (BulletResponderModel | MarkerResponderModel)[]>>(
      (acc, cur, dataIndex) => {
        const label = cur.name!;
        const tooltipModel = { ...cur, data: tooltipData[dataIndex] };
        if (!acc[label]) {
          acc[label] = [];
        }
        acc[label].push(tooltipModel);

        return acc;
      },
      {}
    );
  }

  private getBulletSereisModelsFromRectResponders(responders: RectResponderModel[]) {
    if (!responders.length) {
      return [];
    }

    return this.tooltipRectMap[responders[0].label!] ?? [];
  }

  private getGroupedRect(responders: RectResponderModel[], type: 'hover' | 'select') {
    const bulletSereisModels = this.getBulletSereisModelsFromRectResponders(responders);
    const { color, opacity } = this.theme[type].groupedRect as Required<GroupedRect>;

    return bulletSereisModels.length
      ? responders.map((m) => ({
          ...m,
          color: getRGBA(color, opacity),
        }))
      : [];
  }

  private onMousemoveGroupedType(responders: RectResponderModel[]) {
    const bulletSereisModels = this.getBulletSereisModelsFromRectResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getGroupedRect(responders, 'hover'),
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = bulletSereisModels;
  }

  onMousemove({ responders }) {
    if (this.eventDetectType === 'grouped') {
      this.onMousemoveGroupedType(responders as RectResponderModel[]);
    } else {
      this.eventBus.emit('renderHoveredSeries', {
        models: this.getRespondersWithTheme(responders, 'hover'),
        name: this.name,
      });

      this.activatedResponders = responders.length ? [responders[responders.length - 1]] : [];
    }

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      const models =
        this.eventDetectType === 'grouped'
          ? [
              ...this.getGroupedRect(responders as RectResponderModel[], 'select'),
              ...this.getBulletSereisModelsFromRectResponders(responders as RectResponderModel[]),
            ]
          : this.getRespondersWithTheme(responders, 'select');

      this.eventBus.emit('renderSelectedSeries', {
        models,
        name: this.name,
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

  renderSeries(bulletData: BulletSeriesType[], renderOptions: RenderOptions): Array<BulletModel> {
    return bulletData.reduce<BulletModel[]>(
      (acc, { data, ranges, markers, name, color }, seriesIndex) => {
        const seriesColor = getRGBA(color!, this.getSeriesOpacity(name));

        const rangeModels: BulletRectModel[] = this.makeRangeModel(
          ranges,
          renderOptions,
          seriesIndex,
          seriesColor,
          name
        );

        const bulletModel: BulletRectModel = this.makeBulletModel(
          data,
          renderOptions,
          seriesIndex,
          seriesColor,
          name
        );

        const markerModels: BulletLineModel[] = this.makeMarkerModel(
          markers,
          renderOptions,
          seriesIndex,
          seriesColor,
          name
        );

        return [...acc, ...rangeModels, bulletModel, ...markerModels];
      },
      []
    );
  }

  makeRangeModel(
    ranges: RangeDataType<number>[],
    renderOptions: RenderOptions,
    seriesIndex: number,
    color: string,
    name: string
  ): BulletRectModel[] {
    const { tickDistance, ratio, zeroPosition, rangeWidth } = renderOptions;

    return ranges.map((range, rangeIndex) => {
      const [start, end] = range;
      const barLength = (end - start) * ratio;
      const rangeStartX = getStartX(seriesIndex, tickDistance, rangeWidth);

      return {
        type: 'rect',
        name,
        color: this.getRangeColor(color, rangeIndex, name),
        x: this.vertical ? rangeStartX : start * ratio + zeroPosition,
        y: this.vertical ? zeroPosition - end * ratio : rangeStartX,
        ...getRectSize(this.vertical, rangeWidth, barLength),
        modelType: 'range',
        seriesColor: color,
        value: range,
      };
    });
  }

  makeBulletModel(
    value: number,
    renderOptions: RenderOptions,
    seriesIndex: number,
    color: string,
    name: string
  ): BulletRectModel {
    const { borderColor, borderWidth } = this.theme;
    const { tickDistance, ratio, zeroPosition, bulletWidth } = renderOptions;

    const bulletLength = value * ratio;
    const bulletStartX = getStartX(seriesIndex, tickDistance, bulletWidth);

    return {
      type: 'rect',
      name,
      color,
      x: this.vertical ? bulletStartX : zeroPosition,
      y: this.vertical ? zeroPosition - bulletLength : bulletStartX,
      ...getRectSize(this.vertical, bulletWidth, bulletLength),
      thickness: borderWidth,
      borderColor: borderColor,
      modelType: 'bullet',
      seriesColor: color,
      value,
    };
  }

  makeMarkerModel(
    markers: number[],
    renderOptions: RenderOptions,
    seriesIndex: number,
    color: string,
    name: string
  ): BulletLineModel[] {
    const { tickDistance, ratio, zeroPosition, markerWidth } = renderOptions;
    const markerStartX = getStartX(seriesIndex, tickDistance, markerWidth);
    const { markerLineWidth } = this.theme;

    return markers.map((marker) => {
      const dataPosition = marker * ratio;
      const x = this.vertical ? markerStartX : dataPosition + zeroPosition;
      const y = this.vertical ? zeroPosition - dataPosition : markerStartX;

      return {
        type: 'line',
        name,
        x,
        y,
        x2: this.vertical ? x + markerWidth : x,
        y2: this.vertical ? y : y + markerWidth,
        strokeStyle: color,
        lineWidth: markerLineWidth,
        seriesColor: color,
        value: marker,
      };
    });
  }

  makeTooltipModel(seriesModels: BulletModel[]): TooltipData[] {
    return seriesModels.reduce<TooltipData[]>((acc, cur) => {
      let tooltipData: TooltipData;

      const { type, name, seriesColor, value } = cur;

      if (type === 'rect') {
        const { color, modelType, value } = cur as BulletRectModel;

        if (modelType === 'bullet') {
          tooltipData = {
            label: name!,
            color: color,
            value: [{ title: 'Actual', value, color }] as TooltipTitleValues,
            templateType: 'bullet',
          };
        } else {
          tooltipData = {
            label: name!,
            color: seriesColor!,
            value: [{ title: 'Range', value, color }] as TooltipTitleValues,
            templateType: 'bullet',
          };
        }
      } else {
        const { strokeStyle } = cur as BulletLineModel;

        tooltipData = {
          label: name!,
          color: seriesColor!,
          value: [{ title: 'Marker', value, color: strokeStyle }] as TooltipTitleValues,
          templateType: 'bullet',
        };
      }

      return [...acc, tooltipData];
    }, []);
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

  getRangeColor(seriesColor: string, rangeIndex: number, seriesName: string) {
    const { rangeColors } = this.theme;
    const hasThemeRangeColor = Array.isArray(rangeColors) && rangeColors[rangeIndex];
    const color = hasThemeRangeColor ? rangeColors[rangeIndex] : seriesColor;
    const opacity = hasThemeRangeColor
      ? getAlpha(rangeColors[rangeIndex])
      : DEFAULT_BULLET_RANGE_OPACITY[rangeIndex];

    return getRGBA(color, opacity * this.getSeriesOpacity(seriesName));
  }

  getSeriesOpacity(seriesName: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![seriesName];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);
    const selectedOpacity = active ? select.areaOpacity! : select.restSeries!.areaOpacity!;

    return selected ? selectedOpacity : areaOpacity;
  }

  getRespondersWithTheme(responders: BulletResponderModel[], type: 'hover' | 'select') {
    const {
      color,
      borderColor,
      borderWidth,
      shadowBlur,
      shadowColor,
      shadowOffsetX,
      shadowOffsetY,
    } = this.theme[type];

    return (this.filterBulletResponder(responders) as BulletRectModel[]).map((model) => ({
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
