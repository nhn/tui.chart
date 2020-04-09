import Component from './component';
import { CircleModel } from '@t/components/series';
import { LineSeriesOptions, Point, SplinePoint } from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, SeriesTheme, ValueEdge } from '@t/store/store';
import { LineSeriesType } from '@t/options';

type DrawModels = LinePointsModel | ClipRectAreaModel | CircleModel;

interface RenderLineOptions {
  pointOnColumn: boolean;
  theme: SeriesTheme;
  options: LineSeriesOptions;
}

export default class LineSeries extends Component {
  models!: DrawModels[];

  responders!: CircleModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'lineSeries';
  }

  update(delta: number) {
    if (this.models[0].type === 'clipRectArea') {
      this.models[0].width = this.rect.width * delta;
    }
  }

  render(chartState: ChartState) {
    const { layout, series, scale, theme, options } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    this.rect = layout.plot;

    const { yAxis } = scale;

    const tickDistance = this.rect.width / series.line.seriesGroupCount;

    const renderLineOptions: RenderLineOptions = {
      pointOnColumn: options.xAxis?.pointOnColumn || false,
      options: options.series || {},
      theme: theme.series
    };

    const lineSeriesModel = this.renderLinePointsModel(
      series.line.data,
      yAxis.limit,
      tickDistance,
      renderLineOptions
    );

    const seriesCircleModel = this.renderCircle(lineSeriesModel);

    const tooltipData = series.line.data.flatMap(({ name, data }, index) => {
      return data.map((value, dataIdx) => ({
        label: name,
        color: theme.series.colors[index],
        value,
        category: chartState.categories[dataIdx]
      }));
    });

    this.models = [this.renderClipRectAreaModel(), ...lineSeriesModel];

    this.responders = seriesCircleModel.map((m, index) => ({ ...m, data: tooltipData[index] }));
  }

  renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: 0,
      height: this.rect.height
    };
  }

  renderLinePointsModel(
    seriesRawData: LineSeriesType[],
    limit: ValueEdge,
    tickDistance: number,
    renderOptions: RenderLineOptions
  ): LinePointsModel[] {
    const { pointOnColumn, theme, options } = renderOptions;
    const { colors } = theme;
    const { spline } = options;

    return seriesRawData.map(({ data }, seriesIndex) => {
      const points = data.map((v, dataIndex) => {
        const valueRatio = (v - limit.min) / (limit.max - limit.min);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        return { x, y };
      });

      return { type: 'linePoints', lineWidth: 6, color: colors[seriesIndex], points, spline };
    });
  }

  renderCircle(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color }) => {
      return points.map(({ x, y }) => ({ type: 'circle', color, x, y, radius: 7 }));
    });
  }

  onMousemove({ responders }: { responders: CircleModel[] }) {
    this.activatedResponders.forEach((responder: CircleModel) => {
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
