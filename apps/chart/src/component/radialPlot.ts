import Component from './component';
import { CircleModel, PolygonModel } from '@t/components/series';
import { ChartState, RadialAxes } from '@t/store/store';
import {
  getRadialPosition,
  calculateDegreeToRadian,
  DEGREE_NEGATIVE_90,
  DEGREE_360,
} from '@src/helpers/sector';
import { Point, RadarPlotType, RadarChartOptions } from '@t/options';
import { RadialPlotModels, RadialPlotModelType } from '@t/components/radialPlot';
import { LineModel } from '@t/components/axis';
import { range } from '@src/helpers/utils';
import { CircularAxisTheme } from '@t/theme';
import { ArcModel } from '@t/components/radialAxis';

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
  usingArcPlot: boolean;
  drawingStartAngle: number;
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
};

export default class RadarPlot extends Component {
  models: RadialPlotModels = { plot: [], line: [] };

  circularAxisTheme!: Required<CircularAxisTheme>;

  initialize() {
    this.type = 'plot';
    this.name = 'radialPlot';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, radialAxes, options, series, theme } = state;

    this.rect = layout.plot;
    this.circularAxisTheme = theme.circularAxis as Required<CircularAxisTheme>;

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
    const { centerX, centerY, radiusRanges, innerRadius, outerRadius } = radialAxes.verticalAxis;
    const {
      degree,
      totalAngle,
      labels,
      tickInterval,
      drawingStartAngle,
      startAngle,
      endAngle,
      clockwise,
    } = radialAxes.circularAxis;
    const usingArcPlot = totalAngle !== DEGREE_360;
    const lineCount = labels.length;

    return {
      type,
      categories,
      degree,
      centerX,
      centerY,
      initialRadius: innerRadius,
      radius: outerRadius,
      radiusRanges,
      lineCount,
      tickInterval,
      drawingStartAngle,
      usingArcPlot,
      startAngle,
      endAngle,
      clockwise,
    };
  }

  renderPlot(renderOptions: RenderOptions): RadialPlotModelType {
    const { type, usingArcPlot } = renderOptions;

    if (usingArcPlot) {
      return this.makeArc(renderOptions);
    }

    if (type === 'spiderweb') {
      return this.makeSpiderwebPlot(renderOptions);
    }

    return this.makeCirclePlot(renderOptions);
  }

  makeSpiderwebPlot(renderOptions: RenderOptions): PolygonModel[] {
    const { degree, centerX, centerY, categories, radiusRanges } = renderOptions;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

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
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return radiusRanges.map((radius) => ({
      type: 'circle',
      color: 'rgba(0, 0, 0, 0)',
      style: [{ strokeStyle, lineWidth }],
      radius,
      x: centerX,
      y: centerY,
    }));
  }

  makeArc(renderOptions: RenderOptions): ArcModel[] {
    const { centerX, centerY, radiusRanges, startAngle, endAngle, clockwise } = renderOptions;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return radiusRanges.map<ArcModel>((radius) => ({
      type: 'arc',
      borderWidth: lineWidth,
      borderColor: strokeStyle,
      x: centerX,
      y: centerY,
      angle: { start: startAngle, end: endAngle },
      drawingStartAngle: DEGREE_NEGATIVE_90,
      radius,
      clockwise,
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
      drawingStartAngle,
      clockwise,
    } = renderOptions;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return range(0, lineCount).reduce<LineModel[]>((acc, cur, index) => {
      const startDegree = drawingStartAngle + degree * index * (clockwise ? 1 : -1);
      const { x, y } = getRadialPosition(
        centerX,
        centerY,
        initialRadius,
        calculateDegreeToRadian(startDegree)
      );

      const { x: x2, y: y2 } = getRadialPosition(
        centerX,
        centerY,
        radius,
        calculateDegreeToRadian(startDegree)
      );

      return index % tickInterval === 0
        ? [
            ...acc,
            {
              type: 'line',
              x,
              y,
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
