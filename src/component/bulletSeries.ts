import Component from './component';
import { ChartState } from '@t/store/store';
import {
  BulletSeriesModels,
  BulletModel,
  BulletResponderModel,
  BulletRectModel,
  MarkerResponderModel,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA, getAlpha } from '@src/helpers/color';
import { BulletChartOptions, BulletSeriesType, Size, RangeDataType } from '@t/options';
import { isLabelAxisOnYAxis, getAxisName, getSizeKey } from '@src/helpers/axes';
import { TooltipData, TooltipTemplateType } from '@t/components/tooltip';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { RectDataLabel, LineDataLabel } from '@t/components/dataLabels';
import { LineModel } from '@t/components/axis';
import { BulletChartSeriesTheme } from '@t/theme';
import { DEFAULT_BULLET_RANGE_OPACITY, boxDefault } from '@src/helpers/theme';
import { isNumber, omit } from '@src/helpers/utils';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  vertical: boolean;
  zeroPosition: number;
  rangeWidth: number;
  bulletWidth: number;
  markerWidth: number;
};

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

  responders!: (BulletResponderModel | MarkerResponderModel)[];

  activatedResponders: this['responders'] = [];

  theme!: Required<BulletChartSeriesTheme>;

  initialize() {
    this.type = 'series';
    this.name = 'bullet';
  }

  render(state: ChartState<BulletChartOptions>): void {
    const { layout, axes, series, scale, legend, options, theme } = state;

    if (!series.bullet) {
      throw new Error("There's no bullet data!");
    }

    this.theme = theme.series.bullet as Required<BulletChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const labelAxisOnYAxis = isLabelAxisOnYAxis(series, options);
    const { labelAxisName, valueAxisName } = getAxisName(labelAxisOnYAxis);
    const { valueSizeKey } = getSizeKey(labelAxisOnYAxis);
    const { tickDistance } = axes[labelAxisName];
    const { zeroPosition } = axes[valueAxisName];
    const { min, max } = scale[valueAxisName].limit;
    const vertical = !!options?.series?.vertical;
    const bulletData = series.bullet.data;

    const renderOptions = {
      ratio: this.rect[valueSizeKey] / (max - min),
      tickDistance,
      vertical,
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
            if (vertical) {
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

    const tooltipDataArr = this.makeTooltipModel(bulletData);

    this.responders = seriesModels.map((m, index) => {
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
        data: tooltipDataArr[index],
      };
    });

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(this.getDataLabels(seriesModels, vertical, this.rect[valueSizeKey]));
    }
  }

  private getDataLabels(
    seriesModels: BulletModel[],
    vertical: boolean,
    size: number
  ): (RectDataLabel | LineDataLabel)[] {
    const dataLabelsTheme = this.theme.dataLabels;

    return seriesModels
      .filter((m) => m.type === 'line' || (m as BulletRectModel).modelType !== 'range')
      .map((m) => {
        if (m.type === 'line') {
          const markerStyle = dataLabelsTheme.marker;

          return {
            ...m,
            theme: {
              ...markerStyle,
              color: markerStyle!.useSeriesColor ? m.strokeStyle : markerStyle!.color,
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
            ...omit(dataLabelsTheme, 'marker'),
            color: dataLabelsTheme.useSeriesColor ? m.color : dataLabelsTheme.color,
          },
        } as RectDataLabel;
      });
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getRespondersWithTheme(responders, 'hover'),
      name: this.name,
    });

    this.activatedResponders = responders.length ? [responders[responders.length - 1]] : [];

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', {
        models: this.getRespondersWithTheme(responders, 'select'),
        name: this.name,
      });
      this.eventBus.emit('needDraw');
    }
  }

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

        const markerModels: LineModel[] = this.makeMarkerModel(
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
    const { tickDistance, ratio, vertical, zeroPosition, rangeWidth } = renderOptions;

    return ranges.map((range, rangeIndex) => {
      const [start, end] = range;
      const barLength = (end - start) * ratio;
      const rangeStartX = getStartX(seriesIndex, tickDistance, rangeWidth);

      return {
        type: 'rect',
        name,
        color: this.getRangeColor(color, rangeIndex, name),
        x: vertical ? rangeStartX : start * ratio + zeroPosition,
        y: vertical ? zeroPosition - end * ratio : rangeStartX,
        ...getRectSize(vertical, rangeWidth, barLength),
        modelType: 'range',
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
    const { tickDistance, ratio, vertical, zeroPosition, bulletWidth } = renderOptions;

    const bulletLength = value * ratio;
    const bulletStartX = getStartX(seriesIndex, tickDistance, bulletWidth);

    return {
      type: 'rect',
      name,
      color,
      x: vertical ? bulletStartX : zeroPosition,
      y: vertical ? zeroPosition - bulletLength : bulletStartX,
      ...getRectSize(vertical, bulletWidth, bulletLength),
      thickness: borderWidth,
      borderColor: borderColor,
      modelType: 'bullet',
      value,
    };
  }

  makeMarkerModel(
    markers: number[],
    renderOptions: RenderOptions,
    seriesIndex: number,
    color: string,
    name: string
  ): LineModel[] {
    const { tickDistance, ratio, vertical, zeroPosition, markerWidth } = renderOptions;
    const markerStartX = getStartX(seriesIndex, tickDistance, markerWidth);
    const { markerLineWidth } = this.theme;

    return markers.map((marker) => {
      const dataPosition = marker * ratio;
      const x = vertical ? markerStartX : dataPosition + zeroPosition;
      const y = vertical ? zeroPosition - dataPosition : markerStartX;

      return {
        type: 'line',
        name,
        x,
        y,
        x2: vertical ? x + markerWidth : x,
        y2: vertical ? y : y + markerWidth,
        strokeStyle: color,
        lineWidth: markerLineWidth,
        value: marker,
      };
    });
  }

  makeTooltipModel(seriesData: BulletSeriesType[]): TooltipData[] {
    return seriesData.reduce<TooltipData[]>((acc, { markers, data, ranges, name, color }) => {
      const rangesData = ranges.map((range) => ({
        label: name,
        color: color!,
        value: [{ title: 'Range', value: range }],
        templateType: 'bullet' as TooltipTemplateType,
      }));

      const bulletData = {
        label: name,
        color: color!,
        value: data,
      };

      const markersData = markers.map((marker) => ({
        label: name,
        color: color!,
        value: [{ title: 'Marker', value: marker }],
        templateType: 'bullet' as TooltipTemplateType,
      }));

      return [...acc, ...rangesData, bulletData, ...markersData];
    }, []);
  }

  getBulletBarWidths(tickDistance: number) {
    const { barWidth: barThemeWidth, barWidthRatios } = this.theme;
    const { rangeRatio, bulletRatio, markerRatio } = barWidthRatios;
    const barWidth = isNumber(barThemeWidth) ? barThemeWidth : tickDistance * 0.6;

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
}
