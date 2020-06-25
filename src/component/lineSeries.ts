import Component from './component';
import { CircleModel, CircleResponderModel } from '@t/components/series';
import {
  LineChartOptions,
  LineTypeSeriesOptions,
  Point,
  CoordinateDataType,
  DataLabels,
} from '@t/options';
import { ClipRectAreaModel, LinePointsModel } from '@t/components/series';
import { ChartState, Legend, ValueEdge } from '@t/store/store';
import { LineSeriesType } from '@t/options';
import { getValueRatio, setSplineControlPoint } from '@src/helpers/calculator';
import { TooltipData } from '@t/components/tooltip';
import { getCoordinateDataIndex, getCoordinateYValue } from '@src/helpers/coordinate';
import { getRGBA } from '@src/helpers/color';
import { deepCopyArray, includes } from '@src/helpers/utils';
import { getDataLabelsOptions } from '@src/store/dataLabels';
import { labelStyle } from '@src/brushes/basic';

type DrawModels = LinePointsModel | ClipRectAreaModel | CircleModel;

interface LineSeriesDrawModels {
  rect: ClipRectAreaModel[];
  series: LinePointsModel[];
  hoveredSeries: CircleModel[];
}

interface RenderLineOptions {
  pointOnColumn: boolean;
  options: LineTypeSeriesOptions;
  tickDistance: number;
}

type DatumType = CoordinateDataType | number;

export default class LineSeries extends Component {
  models: LineSeriesDrawModels = { rect: [], series: [], hoveredSeries: [] };

  drawModels!: LineSeriesDrawModels;

  responders!: CircleResponderModel[];

  activatedResponders: this['responders'] = [];

  initialize() {
    this.type = 'series';
    this.name = 'lineSeries';
  }

  initUpdate(delta: number) {
    this.drawModels.rect[0].width = this.models.rect[0].width * delta;
  }

  render(chartState: ChartState<LineChartOptions>) {
    const { layout, series, scale, options, axes, categories = [], legend } = chartState;
    if (!series.line) {
      throw new Error("There's no line data!");
    }

    const { yAxis } = scale;
    const { tickDistance, pointOnColumn } = axes.xAxis!;

    const renderLineOptions: RenderLineOptions = {
      pointOnColumn,
      options: options.series || {},
      tickDistance,
    };

    this.rect = layout.plot;

    const lineSeriesModel = this.renderLinePointsModel(
      series.line.data,
      yAxis.limit,
      renderLineOptions,
      categories,
      legend
    );

    const seriesCircleModel = this.renderCircleModel(lineSeriesModel);

    const tooltipDataArr = series.line.data.flatMap(({ data, name, color }) => {
      const tooltipData: TooltipData[] = [];

      data.forEach((datum: DatumType, dataIdx) => {
        tooltipData.push({
          label: name,
          color,
          value: getCoordinateYValue(datum),
          category: categories[getCoordinateDataIndex(datum, categories, dataIdx)],
        });
      });

      return tooltipData;
    });

    this.models = {
      rect: [this.renderClipRectAreaModel()],
      series: lineSeriesModel,
      hoveredSeries: [],
    };

    if (!this.drawModels) {
      this.drawModels = {
        rect: [this.renderClipRectAreaModel(true)],
        series: deepCopyArray(lineSeriesModel),
        hoveredSeries: [],
      };
    }

    const dataLabelOptions = options.series?.dataLabels;

    if (dataLabelOptions && dataLabelOptions.visible) {
      const dataLabelData = this.getDataLabels(lineSeriesModel, dataLabelOptions);

      this.store.dispatch('appendDataLabels', dataLabelData);
    }

    this.responders = seriesCircleModel.map((m, index) => ({
      ...m,
      data: tooltipDataArr[index],
    }));
  }

  renderClipRectAreaModel(isDrawModel?: boolean): ClipRectAreaModel {
    return {
      type: 'clipRectArea',
      x: 0,
      y: 0,
      width: isDrawModel ? 0 : this.rect.width,
      height: this.rect.height,
    };
  }

  renderLinePointsModel(
    seriesRawData: LineSeriesType[],
    limit: ValueEdge,
    renderOptions: RenderLineOptions,
    categories: string[],
    legend: Legend
  ): LinePointsModel[] {
    const { pointOnColumn, options, tickDistance } = renderOptions;
    const { spline } = options;

    return seriesRawData.map(({ data, name, color: seriesColor }, seriesIndex) => {
      const points: Point[] = [];
      const { active } = legend.data.find(({ label }) => label === name)!;
      const color = getRGBA(seriesColor, active ? 1 : 0.3);

      data.forEach((datum, idx) => {
        const value = getCoordinateYValue(datum);
        const dataIndex = getCoordinateDataIndex(datum, categories, idx);

        const valueRatio = getValueRatio(value, limit);

        const x = tickDistance * dataIndex + (pointOnColumn ? tickDistance / 2 : 0);
        const y = (1 - valueRatio) * this.rect.height;

        points.push({ x, y, value });
      });

      if (spline) {
        setSplineControlPoint(points);
      }

      return {
        type: 'linePoints',
        lineWidth: 6,
        color,
        points,
        seriesIndex,
      };
    });
  }

  renderCircleModel(lineSeriesModel: LinePointsModel[]): CircleModel[] {
    return lineSeriesModel.flatMap(({ points, color }, seriesIndex) =>
      points.map(({ x, y }) => ({
        type: 'circle',
        x,
        y,
        radius: 7,
        color,
        style: ['default', 'hover'],
        seriesIndex,
      }))
    );
  }

  onMousemove({ responders }: { responders: CircleResponderModel[] }) {
    this.drawModels.hoveredSeries = [...responders];

    this.activatedResponders = responders;

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);

    this.eventBus.emit('needDraw');
  }

  getDataLabels(seriesModels: LinePointsModel[], dataLabelOptions: DataLabels) {
    const { font, fillStyle } = labelStyle['default'];

    const options: Required<DataLabels> = getDataLabelsOptions(dataLabelOptions, {
      visible: false,
      anchor: 'center',
      align: 'center',
      offset: 3,
      style: {
        font,
        color: fillStyle,
        textBgColor: 'rgba(255, 255, 255, 0)',
        textStrokeColor: 'rgba(255, 255, 255, 1)',
      },
    });

    return seriesModels.flatMap((m) => {
      const { points } = m;

      return points.map((point) => this.makeLinePointLabelInfo(point, options));
    });
  }

  makeLinePointLabelInfo(point: Point, dataLabelOptions: Required<DataLabels>) {
    const {
      anchor,
      align,
      offset,
      style: { font, color, textBgColor, textStrokeColor },
      formatter,
    } = dataLabelOptions;

    const text = formatter(point.value!);
    let { x, y } = point;

    let textAlign = 'center';
    let textBaseline = 'middle';

    if (anchor === 'end') {
      textBaseline = 'bottom';
    } else if (anchor === 'start') {
      textBaseline = 'top';
    }

    if (includes(['top', 'end'], align)) {
      y -= offset;
      textBaseline = 'bottom';
    } else if (includes(['bottom', 'start'], align)) {
      y += offset;
      textBaseline = 'top';
    } else if (align === 'left') {
      x -= offset;
      textAlign = 'end';
    } else if (align === 'right') {
      x += offset;
      textAlign = 'start';
    }

    const style = { font, fillStyle: color, textAlign, textBaseline };

    return {
      x,
      y,
      text,
      style,
      bgColor: textBgColor,
      textStrokeColor,
    };
  }
}
