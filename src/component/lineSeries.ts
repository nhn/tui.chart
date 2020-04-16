import Component from './component';
import { CircleModel } from '@t/components/series';
import { LineChartOptions, LineSeriesOptions, Point, CoordinateDataType } from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, SeriesTheme, ValueEdge } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { setSplineControlPoint } from '@src/helpers/calculator';
import { isNumber } from '@src/helpers/utils';
import { TooltipData } from '@t/components/tooltip';

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

  getValue(datum: number | CoordinateDataType) {
    if (isNumber(datum)) {
      return datum;
    }

    return Array.isArray(datum) ? datum[1] : datum.y;
  }

  getDataIndex(datum: CoordinateDataType | number, categories: string[], dataIndex: number) {
    if (isNumber(datum)) {
      return dataIndex;
    }

    const value = Array.isArray(datum) ? datum[0] : datum.x;

    return categories.findIndex(category => category === value);
  }

  render(chartState: ChartState<LineChartOptions>) {
    const { layout, series, scale, theme, options, categories = [] } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    this.rect = layout.plot;

    const { yAxis } = scale;

    const tickDistance = this.rect.width / categories.length; // 보여지는 카테고리의 길이 만큼이 되어야 함

    const renderLineOptions: RenderLineOptions = {
      pointOnColumn: options.xAxis?.pointOnColumn || false,
      options: options.series || {},
      theme: theme.series
    };

    const lineSeriesModel = this.renderLinePointsModel(
      series.line.data,
      yAxis.limit,
      tickDistance,
      renderLineOptions,
      categories
    );

    const seriesCircleModel = this.renderCircle(lineSeriesModel);

    const tooltipDataArr = series.line.data.flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: CoordinateDataType | number, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.series.colors[index],
          value: this.getValue(datum),
          category: categories[this.getDataIndex(datum, categories, dataIdx)]
        });
      });

      return tooltipData;
    });

    this.models = [this.renderClipRectAreaModel(), ...lineSeriesModel];

    this.responders = seriesCircleModel.map((m, index) => ({ ...m, data: tooltipDataArr[index] }));
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
    renderOptions: RenderLineOptions,
    categories: string[]
  ): LinePointsModel[] {
    const { pointOnColumn, theme, options } = renderOptions;
    const { colors } = theme;
    const { spline } = options;

    return seriesRawData.map(({ data }, seriesIndex) => {
      const points: Point[] = [];

      data.forEach((datum, idx) => {
        const value = this.getValue(datum);
        const dataIndex = this.getDataIndex(datum, categories, idx);

        const valueRatio = (value - limit.min) / (limit.max - limit.min);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return { type: 'linePoints', lineWidth: 6, color: colors[seriesIndex], points };
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
