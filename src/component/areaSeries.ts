import Component from './component';
import { AreaPointsModel, CircleModel } from '@t/components/series';
import {
  AreaChartOptions,
  AreaSeriesType,
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

type DrawModels = AreaPointsModel | ClipRectAreaModel | CircleModel;

interface RenderOptions {
  pointOnColumn: boolean;
  theme: SeriesTheme;
  options: LineTypeSeriesOptions;
  BottomYPoint: number;
}

type DatumType = number | RangeDataType;

export default class AreaSeries extends Component {
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

  render(chartState: ChartState<AreaChartOptions>) {
    const { layout, series, scale, theme, options, axes, categories = [] } = chartState;
    if (!series.area) {
      throw new Error("There's no area data!");
    }

    this.rect = layout.plot;

    const { yAxis } = scale;

    const tickDistance = this.rect.width / categories.length;

    const renderOptions: RenderOptions = {
      pointOnColumn: axes.xAxis.pointOnColumn,
      BottomYPoint: layout.xAxis.y - layout.xAxis.height + 10, // padding
      options: options.series || {},
      theme: theme.series
    };

    const areaData = series.area.data;

    const areaSeriesModel = this.makeAreaPointsModel(
      areaData,
      yAxis.limit,
      tickDistance,
      renderOptions,
      categories
    );

    const seriesCircleModel = this.makeCircleModel(areaSeriesModel);

    const tooltipDataArr = this.makeTooltipData(areaData, renderOptions, categories);

    this.models = [this.renderClipRectAreaModel(), ...areaSeriesModel];

    // 이 circle이 어느 areaSeries에 속하는지도 알아야. seriesIndex. dataIndex
    this.responders = seriesCircleModel.map((m, dataIndex) => ({
      ...m,
      data: tooltipDataArr[dataIndex]
    }));
  }

  makeTooltipData(areaData: AreaSeriesType[], renderOptions: RenderOptions, categories: string[]) {
    const { theme } = renderOptions;

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

  makeAreaPointsModel(
    seriesRawData: AreaSeriesType[],
    limit: ValueEdge,
    tickDistance: number,
    renderOptions: RenderOptions,
    categories: string[]
  ): AreaPointsModel[] {
    const { pointOnColumn, theme, options, BottomYPoint } = renderOptions;
    const { colors } = theme;
    const { spline } = options;

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

      return {
        type: 'areaPoints',
        lineWidth: 0,
        color: colors[seriesIndex],
        points,
        BottomYPoint,
        fillColor: colors[seriesIndex],
        seriesIndex
      };
    });
  }

  makeCircleModel(lineSeriesModel: AreaPointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color, seriesIndex }) => {
      return points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex
      }));
    });
  }

  activatedIndex = {
    dataIndex: [],
    seriesIndex: []
  };

  onMousemove({ responders }: { responders: CircleModel[] }) {
    // index로 관리
    this.activatedResponders.forEach((responder: CircleModel) => {
      const index = this.models.findIndex(model => model === responder);
      const { seriesIndex } = this.models[index];
      const mom = this.models.find(
        model => model.type === 'areaPoints' && model.seriesIndex === seriesIndex
      );
      mom.fillColor = getRGBA(mom.fillColor, 0.5);
      mom.color = getRGBA(mom.color, 0.5);
      mom.lineWidth = 7;
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
