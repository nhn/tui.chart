import Component from './component';
import { ChartState, ValueEdge, Series } from '@src/store/store';

import { CircleModel } from '@src/brushes/lineSeries';

import { Point, ClipRectAreaModel, LinePointsModel } from '@src/brushes/basic';

type DrawModels = LinePointsModel | ClipRectAreaModel | CircleModel;

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

  render({ layout, series, scale, theme, options }: ChartState) {
    this.rect = layout.plot;

    const { yAxis } = scale;

    const { pointOnColumn } = options.xAxis;

    const tickDistance = this.rect.width / series.line.seriesGroupCount;

    const lineSeriesModel = this.renderLinePointsModel(
      series.line.data,
      yAxis.limit,
      tickDistance,
      pointOnColumn,
      theme.series.colors
    );

    const seriesCircleModel = this.renderCircle(lineSeriesModel);

    const tooltipData = series.line.data.flatMap(({ name, data }, index) => {
      return data.map(value => ({
        label: name,
        color: theme.series.colors[index],
        value
      }));
    });

    this.models = [this.renderClipRectAreaModel(), ...lineSeriesModel];

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipData[index]
    }));
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
    seriesRawData: Series[],
    limit: ValueEdge,
    tickDistance: number,
    pointOnColumn: boolean,
    colors: string[]
  ): LinePointsModel[] {
    return seriesRawData.map(({ data }, seriesIndex) => {
      const points: Point[] = data.map((v, dataIndex) => {
        const valueRatio = (v - limit.min) / (limit.max - limit.min);

        const y = (1 - valueRatio) * this.rect!.height;
        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);

        return {
          x,
          y
        };
      });

      return {
        type: 'linePoints',
        lineWidth: 5,
        color: colors[seriesIndex],
        points
      };
    });
  }

  renderCircle(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color }) => {
      return points.map(({ x, y }) => ({
        type: 'circle',
        color,
        x,
        y,
        radius: 4
      }));
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
