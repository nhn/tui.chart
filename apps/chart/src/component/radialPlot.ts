import Component from './component';
import { CircleModel, PolygonModel } from '@t/components/series';
import { ChartState, RadialAxes } from '@t/store/store';
import { getRadialPosition, calculateDegreeToRadian } from '@src/helpers/sector';
import { Point, RadarPlotType, RadarChartOptions } from '@t/options';
import { RadialPlotModels, RadialPlotModelType } from '@t/components/radialPlot';
import { LineModel } from '@t/components/axis';
import { range } from '@src/helpers/utils';
import { RadialAxisTheme } from '@t/theme';

type RenderOptions = {
  type: RadarPlotType;
  categories: string[];
  centerX: number;
  centerY: number;
  degree: number;
  initialRadius: number;
  radius: number;
  radiusRanges: number[];
  lineCount: number;
  tickInterval: number;
};

export default class RadarPlot extends Component {
  models: RadialPlotModels = { plot: [], line: [] };

  radialAxisTheme!: Required<RadialAxisTheme>;

  initialize() {
    this.type = 'plot';
    this.name = 'radialPlot';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, radialAxes, options, series, theme } = state;

    this.rect = layout.plot;
    this.radialAxisTheme = theme.radialAxis as Required<RadialAxisTheme>;

    const isRadarChart = !!series.radar;
    const categories = (state.categories as string[]) ?? [];
    const plotType = options.plot?.type ?? (isRadarChart ? 'spiderweb' : 'circle');
    const renderOptions = this.makeRenderOptions(radialAxes, plotType, categories);

    this.models = {
      plot: this.renderPlot(renderOptions),
      line: series.radialBar ? this.renderLine(renderOptions) : [],
    };
  }

  makeRenderOptions(
    radialAxes: RadialAxes,
    type: RadarPlotType,
    categories: string[] = []
  ): RenderOptions {
    const { centerX, centerY, radiusRanges, innerRadius, outerRadius } = radialAxes.yAxis;
    const { totalAngle, labels, tickInterval } = radialAxes.radialAxis;
    const lineCount = labels.length;

    return {
      type,
      categories,
      degree: totalAngle / lineCount,
      centerX,
      centerY,
      initialRadius: innerRadius,
      radius: outerRadius,
      radiusRanges,
      lineCount,
      tickInterval,
    };
  }

  renderPlot(renderOptions: RenderOptions): RadialPlotModelType {
    return renderOptions.type === 'spiderweb'
      ? this.makeSpiderwebPlot(renderOptions)
      : this.makeCirclePlot(renderOptions);
  }

  makeSpiderwebPlot(renderOptions: RenderOptions): PolygonModel[] {
    const { degree, centerX, centerY, categories, radiusRanges } = renderOptions;
    const { strokeStyle, lineWidth } = this.radialAxisTheme;

    return radiusRanges.map((radius) => {
      const points: Point[] = categories.map((_, index) =>
        getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(degree * index))
      );

      return {
        type: 'polygon',
        color: strokeStyle,
        lineWidth,
        points,
      };
    });
  }

  makeCirclePlot(renderOptions: RenderOptions): CircleModel[] {
    const { centerX, centerY, radiusRanges } = renderOptions;
    const { strokeStyle, lineWidth } = this.radialAxisTheme;

    return radiusRanges.map((radius) => ({
      type: 'circle',
      color: 'rgba(0, 0, 0, 0)',
      style: [{ strokeStyle, lineWidth }],
      radius,
      x: centerX,
      y: centerY,
    }));
  }

  renderLine(renderOptions: RenderOptions): LineModel[] {
    const {
      centerX,
      centerY,
      initialRadius,
      radius,
      lineCount,
      degree,
      tickInterval,
    } = renderOptions;
    const { strokeStyle, lineWidth } = this.radialAxisTheme;

    return range(0, lineCount).reduce<LineModel[]>((acc, cur, index) => {
      const { x: x1, y: y1 } = getRadialPosition(
        centerX,
        centerY,
        initialRadius,
        calculateDegreeToRadian(degree * index)
      );

      const { x: x2, y: y2 } = getRadialPosition(
        centerX,
        centerY,
        radius,
        calculateDegreeToRadian(degree * index)
      );

      return index % tickInterval === 0
        ? [
            ...acc,
            {
              type: 'line',
              x: x1,
              y: y1,
              x2,
              y2,
              strokeStyle,
              lineWidth,
            },
          ]
        : acc;
    }, []);
  }
}
