import Component from './component';
import { RectModel, ClipRectAreaModel } from '@t/components/series';
import { ChartState, ChartType, SeriesData, BoxType } from '@t/store/store';
import {
  BoxSeriesType,
  BoxSeriesDataType,
  RangeDataType,
  BarChartOptions,
  ColumnChartOptions,
  Rect
} from '@t/options';
import { first, last, includes } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';

type DrawModels = ClipRectAreaModel | RectModel;

export type SeriesRawData = BoxSeriesType<BoxSeriesDataType>[];

const BOX = {
  BAR: 'bar',
  COLUMN: 'column'
};

const PADDING = {
  TB: 15, // top & bottom
  LR: 24 // left & right
};

function isRangeData(value): value is RangeDataType {
  return Array.isArray(value);
}

export function isBoxSeries(seriesName: ChartType): seriesName is BoxType {
  return includes(Object.values(BOX), seriesName);
}

export default class BoxSeries extends Component {
  models!: DrawModels[];

  responders!: RectModel[];

  activatedResponders: this['responders'] = [];

  padding = PADDING.TB;

  isBar = true;

  name = BOX.BAR;

  valueAxis = 'xAxis';

  labelAxis = 'yAxis';

  anchorSizeKey = 'height';

  offsetSizeKey = 'width';

  hoverThickness = 4;

  axisThickness = 1;

  plot!: Rect;

  initialize({ name }: { name: BoxType }) {
    this.type = 'series';
    this.name = name;
    this.isBar = name === BOX.BAR;
    this.padding = this.isBar ? PADDING.TB : PADDING.LR;
    this.valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    this.labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    this.anchorSizeKey = this.isBar ? 'height' : 'width';
    this.offsetSizeKey = this.isBar ? 'width' : 'height';
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
    const { layout, series, theme, axes, categories, stackSeries } = chartState;

    if (stackSeries && stackSeries[this.name]) {
      return;
    }

    this.plot = layout.plot;
    this.rect = this.makeSeriesRect(layout.plot);

    const { colors } = theme.series;
    const seriesData = series[this.name]!;
    const valueLabels = axes[this.valueAxis].labels;
    const { tickDistance } = axes[this.labelAxis];

    const seriesModels: RectModel[] = this.renderSeriesModel(
      seriesData,
      colors,
      valueLabels,
      tickDistance
    );

    const tooltipData: TooltipData[] = this.makeTooltipData(seriesData, colors, categories);

    const rectModel = this.renderRect(seriesModels);

    this.models = [this.renderClipRectAreaModel(), ...seriesModels];

    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  protected makeSeriesRect(layout: Rect) {
    const { x, y, width, height } = layout;

    return {
      x: x - this.hoverThickness,
      y: y - this.hoverThickness,
      width: width + (this.hoverThickness + this.axisThickness) * 2,
      height: height + (this.hoverThickness + this.axisThickness) * 2
    };
  }

  renderSeriesModel(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    valueLabels: string[],
    tickDistance: number
  ): RectModel[] {
    const seriesRawData = seriesData.data;
    const minValue = Number(first(valueLabels));
    const offsetAxisLength = this.plot[this.offsetSizeKey];
    const axisValueRatio = offsetAxisLength / (Number(last(valueLabels)) - minValue);
    const columnWidth = (tickDistance - this.padding * 2) / seriesRawData.length;

    return seriesRawData.flatMap(({ data }, seriesIndex) => {
      const seriesPos = seriesIndex * columnWidth + this.padding;
      const color = colors[seriesIndex];

      return data.map((value, index) => {
        const dataStart = seriesPos + index * tickDistance + this.hoverThickness;
        let startPosition = 0;

        if (isRangeData(value)) {
          const [start, end] = value;
          value = end - start;

          startPosition = (start - minValue) * axisValueRatio;
        }

        const barLength = value * axisValueRatio;

        return {
          type: 'rect',
          color,
          width: this.isBar ? barLength - this.axisThickness : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? startPosition + this.hoverThickness + this.axisThickness : dataStart,
          y: this.isBar
            ? dataStart
            : offsetAxisLength - barLength - startPosition + this.hoverThickness
        } as RectModel;
      });
    });
  }

  protected renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: this.rect.width,
      height: this.rect.height
    };
  }

  protected renderRect(seriesModel): RectModel[] {
    return seriesModel.map(data => {
      const { x, y, width, height, color } = data;
      const shadowOffset = this.hoverThickness / 2;
      const style = [
        {
          shadowColor: 'rgba(0, 0, 0, 0.3)',
          shadowOffsetX: shadowOffset,
          shadowOffsetY: this.isBar ? shadowOffset : -1 * shadowOffset,
          shadowBlur: this.hoverThickness + shadowOffset
        }
      ];

      return {
        type: 'rect',
        color,
        x,
        y,
        width,
        height,
        style,
        thickness: this.hoverThickness
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

  private makeTooltipData(
    seriesData: SeriesData<BoxType>,
    colors: string[],
    categories?: string[]
  ): TooltipData[] {
    const seriesRawData = seriesData.data;

    return seriesRawData.flatMap(({ name, data }, index) =>
      data.map((value, dataIdx) => ({
        label: name,
        color: colors[index],
        value: this.getTooltipValue(value),
        category: categories?.[dataIdx]
      }))
    );
  }

  private getTooltipValue(value) {
    return isRangeData(value) ? `${value[0]} ~ ${value[1]}` : value;
  }

  protected getTotalOfPrevValues(values, currentIndex, included = false) {
    return values.reduce((a, b, idx) => {
      const isPrev = included ? idx <= currentIndex : idx < currentIndex;

      if (isPrev) {
        return a + b;
      }

      return a;
    }, 0);
  }
}
