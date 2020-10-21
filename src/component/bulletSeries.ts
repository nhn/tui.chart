import Component from './component';
import { ChartState } from '@t/store/store';
import {
  BulletSeriesModels,
  BulletModel,
  BulletResponderModel,
  MarkerModel,
  BulletRectModel,
  MarkerResponderModel,
} from '@t/components/series';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA } from '@src/helpers/color';
import { BulletChartOptions, BulletSeriesType, Size, RangeDataType } from '@t/options';
import { isLabelAxisOnYAxis, getAxisName, getSizeKey } from '@src/helpers/axes';
import { TooltipData, TooltipTemplateType } from '@t/components/tooltip';
import { BOX_HOVER_THICKNESS, getBoxSeriesPadding } from '@src/helpers/boxStyle';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { RectDataLabel, LineDataLabel } from '@t/components/dataLabels';

type RenderOptions = {
  ratio: number;
  tickDistance: number;
  vertical: boolean;
  zeroPosition: number;
  barWidth: number;
  bulletWidth: number;
  markerWidth: number;
};

const seriesOpacity = {
  INACTIVE: 0.2,
  ACTIVE: 1,
};

const RANGE_OPACITY = [0.5, 0.3, 0.1];

function getBarWidths(tickDistance: number, seriesLength: number) {
  const padding = getBoxSeriesPadding(tickDistance);

  const barWidth = Math.max(
    (tickDistance - padding * (2 + (seriesLength - 1))) / seriesLength,
    tickDistance * 0.6
  );

  return {
    barWidth,
    bulletWidth: barWidth / 2,
    markerWidth: barWidth * 0.8,
  };
}

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

  initialize() {
    this.type = 'series';
    this.name = 'bullet';
  }

  render(state: ChartState<BulletChartOptions>): void {
    const { layout, axes, series, scale, legend, options } = state;

    if (!series.bullet) {
      throw new Error("There's no bullet data!");
    }

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
      ...getBarWidths(tickDistance, bulletData.length),
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
        (model as BulletRectModel).thickness = BOX_HOVER_THICKNESS;
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
    return seriesModels
      .filter((m) => m.type === 'line' || (m as BulletRectModel).modelType !== 'range')
      .map((m) => {
        if (m.type === 'line') {
          return {
            ...m,
            x: (m.x + m.x2) / 2,
            y: (m.y + m.y2) / 2,
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
        } as RectDataLabel;
      });
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.filterBulletResponder(responders),
      name: this.name,
    });

    this.activatedResponders = responders.length ? [responders[responders.length - 1]] : [];

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });

    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', {
        models: this.filterBulletResponder(responders),
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
        const seriesColor = this.getSeriesColor(name, color!);

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

        const markerModels: MarkerModel[] = this.makeMarkerModel(
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
    const active = this.activeSeriesMap![name];
    const { tickDistance, ratio, vertical, zeroPosition, barWidth } = renderOptions;

    return ranges.map((range, rangeIndex) => {
      const [start, end] = range;
      const barLength = (end - start) * ratio;
      const rangeStartX = getStartX(seriesIndex, tickDistance, barWidth);

      return {
        type: 'rect',
        name,
        color: getRGBA(color, RANGE_OPACITY[rangeIndex] * (active ? 1 : 0.2)),
        x: vertical ? rangeStartX : start * ratio + zeroPosition,
        y: vertical ? zeroPosition - end * ratio : rangeStartX,
        ...getRectSize(vertical, barWidth, barLength),
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
  ): MarkerModel[] {
    const { tickDistance, ratio, vertical, zeroPosition, markerWidth } = renderOptions;
    const markerStartX = getStartX(seriesIndex, tickDistance, markerWidth);

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
        lineWidth: 1,
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

  getSeriesColor(name: string, seriesColor: string) {
    const active = this.activeSeriesMap![name];

    return getRGBA(seriesColor, active ? seriesOpacity.ACTIVE : seriesOpacity.INACTIVE);
  }
}
