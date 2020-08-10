import Component from './component';
import { RectModel, CircleModel, LinePointsModel } from '@t/components/series';
import { LabelModel } from '@t/components/axis';
import { ChartState } from '@t/store/store';
import { getRadialPosition, calculateDegreeToRadian } from '@src/helpers/sector';
import { Point, RadarPlotType, RadarChartOptions } from '@t/options';

type RadarPlotModelType = LinePointsModel[] | CircleModel[];

export type RadarPlotModels = {
  plot: RadarPlotModelType;
  dot: RectModel[];
  label: LabelModel[];
  categoryLabel: LabelModel[];
};

type RenderOptions = {
  type: RadarPlotType;
  labels: string[];
  categories: string[];
  center: Point;
  degree: number;
  seriesRadius: number;
};

export default class RadarPlot extends Component {
  models: RadarPlotModels = { plot: [], dot: [], label: [], categoryLabel: [] };

  initialize() {
    this.type = 'plot';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, axes, categories, options } = state;
    this.rect = layout.plot;

    const categoryLabels = categories ?? [];
    const { width, height } = this.rect;

    const renderOptions = {
      type: options.plot?.type ?? 'spiderweb',
      labels: axes.yAxis.labels!,
      categories: categoryLabels,
      degree: 360 / categoryLabels.length,
      center: {
        x: width / 2,
        y: height / 2,
      },
      seriesRadius: Math.min(width, height) / 2 - 50,
    };

    this.models.plot = this.renderPlot(renderOptions);
    this.models.label = [];
    this.models.dot = this.renderCategoryDot(renderOptions);
    this.models.categoryLabel = this.renderCategoryLabel(renderOptions);
  }

  renderPlot(renderOptions: RenderOptions): RadarPlotModelType {
    return renderOptions.type === 'spiderweb'
      ? this.makeLinePlot(renderOptions)
      : this.makeCirclePlot(renderOptions);
  }

  makeLinePlot(renderOptions: RenderOptions): LinePointsModel[] {
    const {
      degree,
      center: { x: centerX, y: centerY },
      categories,
      labels,
      seriesRadius,
    } = renderOptions;
    const radiusRange = labels.map((_, index) => ((index + 1) / labels.length) * seriesRadius);

    return radiusRange.map((radius) => {
      const points: Point[] = categories.map((_, index) =>
        getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index))
      );

      points.push(points[0]);

      return {
        type: 'linePoints',
        color: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1,
        points,
      };
    });
  }

  makeCirclePlot(renderOptions: RenderOptions): CircleModel[] {
    const { center, labels, seriesRadius } = renderOptions;
    const radiusRange = labels.map((_, index) => ((index + 1) / labels.length) * seriesRadius);

    return radiusRange.map((radius) => ({
      type: 'circle',
      color: 'rgba(0, 0, 0, 0)',
      style: ['radarPlot'],
      radius,
      ...center,
    }));
  }

  renderCategoryDot(renderOptions: RenderOptions): RectModel[] {
    const {
      degree,
      center: { x: centerX, y: centerY },
      categories,
      seriesRadius,
    } = renderOptions;

    return categories.map((_, index) => {
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        seriesRadius,
        calculateDegreeToRadian(degree * index)
      );

      return {
        type: 'rect',
        color: 'rgba(0, 0, 0, .5)',
        width: 4,
        height: 4,
        x: x - 2,
        y: y - 2,
        style: [],
      };
    });
  }

  renderCategoryLabel(renderOptions: RenderOptions): LabelModel[] {
    const {
      degree,
      center: { x: centerX, y: centerY },
      categories,
      seriesRadius,
    } = renderOptions;
    const radius = seriesRadius + 35;

    return categories.map((text, index) => ({
      type: 'label',
      style: ['default', { textAlign: 'center' }],
      text,
      ...getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index)),
    }));
  }
}
