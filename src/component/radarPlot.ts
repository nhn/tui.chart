import Component from './component';
import { RectModel, CircleModel, PolygonModel } from '@t/components/series';
import { LabelModel } from '@t/components/axis';
import { ChartState, RadialAxisData } from '@t/store/store';
import { getRadialPosition, calculateDegreeToRadian } from '@src/helpers/sector';
import { Point, RadarPlotType, RadarChartOptions } from '@t/options';
import { RadarPlotModels, RadarPlotModelType } from '@t/components/radarPlot';
import { getRadialRadiusValues } from '@src/helpers/radar';

type RenderOptions = {
  type: RadarPlotType;
  categories: string[];
  centerX: number;
  centerY: number;
  degree: number;
  seriesRadius: number;
  radiusRange: number[];
};

const CATEGORY_LABEL_PADDING = 35;

export default class RadarPlot extends Component {
  models: RadarPlotModels = { plot: [], dot: [], label: [] };

  initialize() {
    this.type = 'plot';
    this.name = 'radar';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, axes, options } = state;
    this.rect = layout.plot;

    const categories = (state.categories as string[]) ?? [];
    const renderOptions = this.makeRenderOptions(axes.radialAxis!, options.plot?.type, categories);

    this.models = {
      plot: this.renderPlot(renderOptions),
      dot: this.renderCategoryDot(renderOptions),
      label: this.renderCategoryLabel(renderOptions),
    };
  }

  makeRenderOptions(
    radialAxis: RadialAxisData,
    type: RadarPlotType = 'spiderweb',
    categories: string[] = []
  ): RenderOptions {
    const { labels, axisSize, centerX, centerY } = radialAxis;

    return {
      type,
      categories,
      degree: 360 / categories.length,
      centerX,
      centerY,
      seriesRadius: axisSize,
      radiusRange: getRadialRadiusValues(labels, axisSize).slice(1, labels.length),
    };
  }

  renderPlot(renderOptions: RenderOptions): RadarPlotModelType {
    return renderOptions.type === 'spiderweb'
      ? this.makeSpiderwebPlot(renderOptions)
      : this.makeCirclePlot(renderOptions);
  }

  makeSpiderwebPlot(renderOptions: RenderOptions): PolygonModel[] {
    const { degree, centerX, centerY, categories, radiusRange } = renderOptions;

    return radiusRange.map((radius) => {
      const points: Point[] = categories.map((_, index) =>
        getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index))
      );

      return {
        type: 'polygon',
        color: 'rgba(0, 0, 0, 0.05)',
        lineWidth: 1,
        points,
      };
    });
  }

  makeCirclePlot(renderOptions: RenderOptions): CircleModel[] {
    const { centerX, centerY, radiusRange } = renderOptions;

    return radiusRange.map((radius) => ({
      type: 'circle',
      color: 'rgba(0, 0, 0, 0)',
      style: ['plot'],
      radius,
      x: centerX,
      y: centerY,
    }));
  }

  renderCategoryDot(renderOptions: RenderOptions): RectModel[] {
    const { degree, centerX, centerY, categories, seriesRadius } = renderOptions;

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
      };
    });
  }

  renderCategoryLabel(renderOptions: RenderOptions): LabelModel[] {
    const { degree, centerX, centerY, categories, seriesRadius } = renderOptions;
    const radius = seriesRadius + CATEGORY_LABEL_PADDING;

    return categories.map((text, index) => ({
      type: 'label',
      style: ['default', { textAlign: 'center' }],
      text,
      ...getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index)),
    }));
  }
}
