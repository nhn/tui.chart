import Component from './component';
import { RectModel, BoxSeriesModel, ClipRectAreaModel } from '@t/components/series';
import { ChartState } from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  BoxRangeDataType,
  BarChartOptions,
  ColumnChartOptions,
  StackOptionType
} from '@t/options';
import { first, last, pickProperty } from '@src/helpers/utils';

type DrawModels = BoxSeriesModel | ClipRectAreaModel | RectModel;

type SizeKey = 'width' | 'height';

enum SeriesType {
  BAR = 'bar',
  COLUMN = 'column'
}

export type StackDataType = Array<{ values: number[]; sum: number }>;

export enum StackType {
  NORMAL = 'normal',
  PERCENT = 'percent'
}

export function stackOption(ops): StackOptionType {
  const result = pickProperty(ops, ['stack']);

  if (!result) {
    return false;
  }

  return result as StackOptionType;
}

const PADDING = {
  TB: 15, // top & bottom
  LR: 24 // left & right
};

function isRangeData(value): value is BoxRangeDataType {
  return Array.isArray(value);
}

export default class BoxSeries extends Component {
  models!: DrawModels[];

  responders!: RectModel[];

  activatedResponders: this['responders'] = [];

  padding = PADDING.TB;

  isBar = true;

  name = SeriesType.BAR;

  stack: StackOptionType = false;

  initialize({ name }: { name: SeriesType }) {
    this.type = 'series';
    this.name = name;
    this.isBar = name === SeriesType.BAR;
    this.padding = this.isBar ? PADDING.TB : PADDING.LR;
  }

  update(delta: number) {
    if (this.models && this.models[0].type === 'clipRectArea') {
      if (this.isBar) {
        this.models[0].width = this.rect.width * delta;
      } else {
        this.models[0].y = this.rect.height - this.rect.height * delta;
        this.models[0].height = this.rect.height * delta;
      }
    }
  }

  render<T extends BarChartOptions | ColumnChartOptions>(chartState: ChartState<T>) {
    const { layout, series, theme, axes, categories, ops } = chartState;

    this.rect = layout.plot;
    this.stack = stackOption(ops);

    const seriesModels: BoxSeriesModel[] = this.createSeriesModel(series, theme, axes);

    const tooltipData = this.createTooltipData(series, theme, categories);

    const rectModel = this.renderRect(seriesModels);

    this.models = [this.renderClipRectAreaModel(), ...seriesModels];

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  createSeriesModel(series, theme, axes) {
    const colors = theme.series.colors;

    const valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    const labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    const anchorSizeKey = this.isBar ? 'height' : 'width';
    const offsetSizeKey = this.isBar ? 'width' : 'height';
    const tickDistance = this.rect[anchorSizeKey] / axes[labelAxis].validTickCount;

    if (this.stack) {
      return this.renderStackSeriesModel(
        series[this.name]!.stackData,
        colors,
        axes[valueAxis].labels,
        tickDistance,
        offsetSizeKey
      );
    }

    return this.renderBoxSeriesModel(
      series[this.name]!.data,
      colors,
      axes[valueAxis].labels,
      tickDistance,
      offsetSizeKey
    );
  }

  renderBoxSeriesModel(
    seriesRawData: BoxSeriesType<BoxSeriesDataType>[],
    colors: string[],
    valueLabels: string[],
    tickDistance: number,
    offsetSizeKey: SizeKey
  ): BoxSeriesModel[] {
    const minValue = Number(first(valueLabels));
    const offsetAxisLength = this.rect[offsetSizeKey];
    const axisValueRatio = offsetAxisLength / (Number(last(valueLabels)) - minValue);
    const columnWidth = (tickDistance - this.padding * 2) / seriesRawData.length;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const seriesPos = seriesIndex * columnWidth + this.padding;
      const color = colors[seriesIndex];

      return data.map((value, index) => {
        const dataStart = seriesPos + index * tickDistance;
        let startPosition = 0;

        if (isRangeData(value)) {
          const [start, end] = value;
          value = end - start;

          startPosition = (start - minValue) * axisValueRatio;
        }

        const barLength = value * axisValueRatio;

        return {
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition : dataStart,
          y: this.isBar ? dataStart : offsetAxisLength - barLength - startPosition
        };
      });
    });
  }

  renderStackSeriesModel(
    rawData: StackDataType,
    colors: string[],
    valueLabels: string[],
    tickDistance: number,
    offsetSizeKey: SizeKey
  ): BoxSeriesModel[] {
    const seriesModels: BoxSeriesModel[] = [];

    const minValue = Number(first(valueLabels));
    const offsetAxisLength = this.rect[offsetSizeKey];
    const axisValueRatio = offsetAxisLength / (Number(last(valueLabels)) - minValue);
    const stackGroupCount = 1;

    const columnWidth = (tickDistance - this.padding * 2) / stackGroupCount;

    rawData.forEach(({ values }, index) => {
      const seriesPos = index * tickDistance + this.padding;

      values.forEach((value, seriesIndex) => {
        const barLength = value * axisValueRatio;
        const color = colors[seriesIndex];
        const beforeValueSum = values.reduce((a, b, idx) => {
          const hasBefore = this.isBar ? idx < seriesIndex : idx <= seriesIndex;

          if (hasBefore) {
            return a + b;
          }

          return a;
        }, 0);

        const startPosition = beforeValueSum * axisValueRatio;

        seriesModels.push({
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition : seriesPos,
          y: this.isBar ? seriesPos : offsetAxisLength - startPosition
        });
      });
    });

    return seriesModels;
  }

  renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height
    };
  }

  renderRect(seriesModel): RectModel[] {
    return seriesModel.map(data => {
      const { x, y, width, height, color } = data;

      return {
        type: 'rect',
        color,
        x,
        y,
        width,
        height,
        offsetKey: this.isBar ? 'y' : 'x'
      };
    });
  }

  onMousemove({ responders }: { responders: RectModel[] }) {
    this.activatedResponders.forEach((responder: RectModel) => {
      const index = this.models.findIndex(model => model === responder);
      this.models.splice(index, 1);
    });

    this.models = [...this.models, ...responders];

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  createTooltipData(series, theme, categories) {
    const stackRawData = series[this.name].stackData;
    const seriesRawData = series[this.name].data;
    const colors = theme.series.colors;

    if (this.stack) {
      return stackRawData.flatMap(({ values }, index) => {
        return values.map((value, seriesIndex) => {
          return {
            label: seriesRawData[seriesIndex].name,
            color: colors[seriesIndex],
            value,
            category: categories[index]
          };
        });
      });
    }

    return seriesRawData.flatMap(({ name, data }, index) => {
      return data.map((value, dataIdx) => ({
        label: name,
        color: colors[index],
        value: this.tooltipValue(value),
        category: categories?.[dataIdx]
      }));
    });
  }

  tooltipValue(value) {
    return isRangeData(value) ? `${value[0]} ~ ${value[1]}` : value;
  }
}
