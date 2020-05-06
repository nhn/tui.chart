import Component from './component';
import { AreaPointsModel, CircleModel, LinePointsModel } from '@t/components/series';
import {
  AreaChartOptions,
  AreaSeriesType,
  LineSeriesType,
  LineTypeSeriesOptions,
  Point,
  RangeDataType
} from '@t/options';
import { ClipRectAreaModel } from '@t/components/series';
import { ChartState, SeriesTheme, ValueEdge } from '@t/store/store';
import { setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';

type DrawModels = LinePointsModel | AreaPointsModel | ClipRectAreaModel | CircleModel;

interface RenderOptions {
  pointOnColumn: boolean;
  theme: SeriesTheme;
  options: LineTypeSeriesOptions;
}

type DatumType = number | RangeDataType;

export default class AreaSeries extends Component {
  models!: DrawModels[];

  responders!: CircleModel[];

  activatedResponders: this['responders'] = [];

  linePointsModel!: LinePointsModel[];

  initialize() {
    this.type = 'series';
    this.name = 'lineSeries';
  }

  update(delta: number) {
    if (this.models[0].type === 'clipRectArea') {
      this.models[0].width = this.rect.width * delta;
    }
  }

  render(chartState: ChartState<AreaChartOptions>) {
    const { layout, series, scale, theme, options, axes, categories = [] } = chartState;
    if (!series.area) {
      throw new Error("There's no area data!");
    }

    this.rect = layout.plot;

    const { yAxis } = scale;

    const tickDistance = this.rect.width / categories.length;

    const bottomYPoint = layout.xAxis.y - layout.xAxis.height + 10; // padding

    const renderOptions: RenderOptions = {
      pointOnColumn: axes.xAxis.pointOnColumn,
      options: options.series || {},
      theme: theme.series
    };

    const areaData = series.area.data;

    this.linePointsModel = this.makeLinePointsModel(
      areaData,
      yAxis.limit,
      tickDistance,
      renderOptions,
      categories
    );

    const areaSeriesModel = this.makeAreaPointsModel(this.linePointsModel, bottomYPoint);
    const seriesCircleModel = this.makeCircleModel(this.linePointsModel);
    const tooltipDataArr = this.makeTooltipData(areaData, renderOptions, categories);

    this.models = [this.renderClipRectAreaModel(), ...areaSeriesModel];

    this.responders = seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex]
    }));
  }

  makeTooltipData(areaData: AreaSeriesType[], { theme }: RenderOptions, categories: string[]) {
    return areaData.flatMap(({ data, name }, index) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: DatumType, dataIdx) => {
        tooltipData.push({
          label: name,
          color: theme.colors[index],
          value: getCoordinateValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)]
        });
      });

      return tooltipData;
    });
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

  makeLinePointsModel(
    seriesRawData: LineSeriesType[],
    limit: ValueEdge,
    tickDistance: number,
    { pointOnColumn, theme: { colors }, options: { spline } }: RenderOptions,
    categories: string[]
  ): LinePointsModel[] {
    return seriesRawData.map(({ data }, seriesIndex) => {
      const points: Point[] = [];

      data.forEach((datum, idx) => {
        const value = getCoordinateValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx);

        const valueRatio = (value - limit.min) / (limit.max - limit.min);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return { type: 'linePoints', lineWidth: 6, color: colors[seriesIndex], points, seriesIndex };
    });
  }

  makeAreaPointsModel(linePointsModel: LinePointsModel[], bottomYPoint: number): AreaPointsModel[] {
    return linePointsModel.map(m => ({
      ...m,
      type: 'areaPoints',
      lineWidth: 0,
      color: 'rgba(0, 0, 0, 0)', // make area border transparent
      bottomYPoint,
      fillColor: m.color
    }));
  }

  makeCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color, seriesIndex }) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex
      }))
    );
  }

  applyAreaOpacity(opacity: number) {
    this.models.forEach(model => {
      if (model.type === 'areaPoints') {
        model.fillColor = getRGBA(model.fillColor, opacity);
        model.color = getRGBA(model.color, opacity);
      }
    });
  }

  clearLinePointsModel() {
    this.models = this.models.filter(model => model.type !== 'linePoints');
  }

  onMousemove({ responders }: { responders: CircleModel[] }) {
    if (this.activatedResponders.length) {
      this.clearLinePointsModel();
      this.applyAreaOpacity(1);

      this.activatedResponders.forEach((responder: CircleModel) => {
        const index = this.models.findIndex(model => model === responder);

        this.models.splice(index, 1);
      });
    }

    if (responders.length) {
      this.applyAreaOpacity(0.5);
      responders.forEach(responder => {
        const seriesModel = this.linePointsModel.find(
          model => model.seriesIndex === responder.seriesIndex
        )!;

        this.models.push(seriesModel);
        this.models.push(responder);
      });
    }

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }
}
