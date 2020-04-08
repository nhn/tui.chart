import Component from './component';
import { RectModel, BoxSeriesModel, ClipRectAreaModel } from '@t/components/series';
import { ChartState } from '@t/store/store';
import { BoxSeriesType, BarChartOptions, ColumnChartOptions } from '@t/options';

type DrawModels = BoxSeriesModel | ClipRectAreaModel | RectModel;

type SizeKey = 'width' | 'height';

enum SeriesType {
  BAR = 'bar',
  COLUMN = 'column'
}

function isBar(name) {
  return name === SeriesType.BAR;
}

export default class BoxSeries extends Component {
  models!: DrawModels[];

  responders!: RectModel[];

  activatedResponders: this['responders'] = [];

  padding = 15;

  isBar = true;

  name = SeriesType.BAR;

  initialize({ name }: { name: SeriesType }) {
    this.type = 'series';
    this.name = name;
    this.isBar = isBar(name);
    this.padding = this.isBar ? 15 : 24;
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
    const { layout, series, theme, axes, categories } = chartState;

    this.rect = layout.plot;

    const seriesRawData = series[this.name]!.data!;
    const colors = theme.series.colors;

    const valueAxis = this.isBar ? 'xAxis' : 'yAxis';
    const labelAxis = this.isBar ? 'yAxis' : 'xAxis';
    const anchorSizeKey = this.isBar ? 'height' : 'width';
    const offsetSizeKey = this.isBar ? 'width' : 'height';

    const maxValue = Number(axes[valueAxis].labels[axes[valueAxis].labels.length - 1]);
    const tickDistance = this.rect[anchorSizeKey] / axes[labelAxis].validTickCount;

    const seriesModels = this.renderBoxSeriesModel({
      seriesRawData,
      colors,
      maxValue,
      tickDistance,
      offsetSizeKey
    });

    this.models = [this.renderClipRectAreaModel(), ...seriesModels];

    const tooltipData = seriesRawData.flatMap(({ name, data }, index) => {
      return (data as (number | [number, number])[]).map((value, dataIdx) => ({
        label: name,
        color: theme.series.colors[index],
        value,
        category: categories?.[dataIdx]
      }));
    });

    const rectModel = this.renderRect(seriesModels);
    this.responders = rectModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
  }

  renderBoxSeriesModel({
    seriesRawData,
    colors,
    maxValue,
    tickDistance,
    offsetSizeKey
  }: {
    seriesRawData: BoxSeriesType[];
    colors: string[];
    maxValue: number;
    tickDistance: number;
    offsetSizeKey: SizeKey;
  }): BoxSeriesModel[] {
    const columnWidth = (tickDistance - this.padding * 2) / seriesRawData.length;
    const seriesModels: BoxSeriesModel[] = [];

    seriesRawData.forEach(({ data }, seriesIndex) => {
      const startPos = seriesIndex * columnWidth + this.padding;
      const color = colors[seriesIndex];

      data.forEach((value, index) => {
        const barLength = (value * this.rect[offsetSizeKey]) / maxValue;

        seriesModels.push({
          type: 'box',
          color,
          width: this.isBar ? barLength : columnWidth,
          height: this.isBar ? columnWidth : barLength,
          x: this.isBar ? 0 : startPos + index * tickDistance,
          y: this.isBar ? startPos + index * tickDistance : this.rect.height - barLength
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
      const { x, y, width, height } = data;

      return {
        type: 'rect',
        color: data.color,
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

    responders.forEach(responder => {
      this.models.push(responder);
    });

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
