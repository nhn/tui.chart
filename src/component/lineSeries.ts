import Component from './component';
import { CircleModel } from '@t/components/series';
import { LineChartOptions, LineTypeSeriesOptions, Point, CoordinateDataType } from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, SeriesTheme, ValueEdge } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateYValue } from '@src/helpers/coordinate';

type DrawModels = LinePointsModel | ClipRectAreaModel | CircleModel;

interface RenderLineOptions {
  pointOnColumn: boolean;
  theme: SeriesTheme;
  options: LineTypeSeriesOptions;
}

type DatumType = CoordinateDataType | number;

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

  render(chartState: ChartState<LineChartOptions>) {
    const { layout, series, scale, theme, options, axes, categories = [] } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;

    const renderLineOptions: RenderLineOptions = {
      pointOnColumn,
      options: options.series || {},
      theme: theme.series,
    };

    this.rect = layout.plot;

    const lineSeriesModel = this.renderLinePointsModel(
      series.line.data,
      yAxis.limit,
      tickDistance,
      renderLineOptions,
      categories
    );

    const seriesCircleModel = this.renderCircleModel(lineSeriesModel);

    const tooltipDataArr = series.line.data.flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: DatumType, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.series.colors[index],
          value: getCoordinateYValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)],
        });
      });

      return tooltipData;
    });

    this.models = [this.renderClipRectAreaModel(), ...lineSeriesModel];

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
      name: 'hoveredDot',
    }));
  }

  renderClipRectAreaModel(): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: 0,
      height: this.rect.height,
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
        const value = getCoordinateYValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx);

        const valueRatio = getValueRatio(value, limit);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return {
        type: 'linePoints',
        lineWidth: 6,
        color: colors[seriesIndex],
        points,
        seriesIndex,
      };
    });
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color }, seriesIndex) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        name: 'dot',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
      }))
    );
  }

  onMousemove({ responders }: { responders: CircleModel[] }) {
    this.activatedResponders.forEach((responder: CircleModel) => {
      const index = this.models.findIndex((model) => model === responder);
      this.models.splice(index, 1);
    });

    responders.forEach((responder) => {
      this.models.push(responder);
    });

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
