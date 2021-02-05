import Component from './component';
import { CircleModel, PolygonModel } from '@t/components/series';
import { ChartState } from '@t/store/store';
import { getRadialPosition, calculateDegreeToRadian } from '@src/helpers/sector';
import { Point, RadarPlotType, RadarChartOptions } from '@t/options';
import { RadarPlotModels, RadarPlotModelType } from '@t/components/radialPlot';
import { LineModel } from '@t/components/axis';
import { range } from '@src/helpers/utils';
import { AxisTheme } from '@t/theme';

type RenderOptions = {
  type: RadarPlotType;
  categories: string[];
  centerX: number;
  centerY: number;
  degree: number;
  radius: number;
  radiusRanges: number[];
  lineCount: number;
  tickInterval: number;
};

export default class RadarPlot extends Component {
  models: RadarPlotModels = { plot: [], line: [] };

  circularAxisTheme!: Required<AxisTheme>;

  initialize() {
    this.type = 'plot';
    this.name = 'radialPlot';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, radialAxes, options, series, theme } = state;

    this.rect = layout.plot;
    this.circularAxisTheme = theme.radialAxis as Required<AxisTheme>;
    const isRadarChart = !!series.radar;

    const categories = (state.categories as string[]) ?? [];
    const plotType = options.plot?.type ?? isRadarChart ? 'spiderweb' : 'circle';
    const renderOptions = this.makeRenderOptions(radialAxes, plotType, categories);
    // @TODO: 테마 적용 필요

    this.models = {
      plot: this.renderPlot(renderOptions),
      line: series.radialBar ? this.renderLine(renderOptions) : [],
    };
  }

  makeRenderOptions(
    radialAxes: any, // @TODO: type정의 필요
    type: RadarPlotType,
    categories: string[] = []
  ): RenderOptions {
    const { axisSize, centerX, centerY, radiusRanges } = radialAxes.yAxis;
    const { totalAngle, labels, tickInterval } = radialAxes.circularAxis;
    const lineCount = labels.length;

    return {
      type,
      categories,
      degree: totalAngle / lineCount,
      centerX,
      centerY,
      radius: axisSize,
      radiusRanges,
      lineCount,
      tickInterval,
    };
  }

  renderPlot(renderOptions: RenderOptions): RadarPlotModelType {
    return renderOptions.type === 'spiderweb'
      ? this.makeSpiderwebPlot(renderOptions)
      : this.makeCirclePlot(renderOptions);
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

  renderLine(renderOptions: RenderOptions): LineModel[] {
    const { centerX, centerY, radius, lineCount, degree, tickInterval } = renderOptions;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return range(0, lineCount).reduce((acc, cur, index) => {
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
              x: centerX,
              y: centerY,
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
