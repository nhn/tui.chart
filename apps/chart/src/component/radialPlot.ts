import Component from './component';
import { CircleModel, PolygonModel, SectorModel } from '@t/components/series';
import { ChartState, RadialAxes, ScaleData, CircularAxisData, Scale } from '@t/store/store';
import {
  getRadialPosition,
  calculateDegreeToRadian,
  DEGREE_NEGATIVE_90,
  DEGREE_360,
  calculateValidAngle,
  DEGREE_0,
} from '@src/helpers/sector';
import {
  Point,
  RadarPlotType,
  RadarChartOptions,
  GaugeChartOptions,
  GaugePlotBand,
} from '@t/options';
import { RadialPlotModels, RadialPlotModelType } from '@t/components/radialPlot';
import { LineModel } from '@t/components/axis';
import { range } from '@src/helpers/utils';
import { CircularAxisTheme } from '@t/theme';
import { ArcModel } from '@t/components/radialAxis';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';

type RenderOptions = {
  type: RadarPlotType;
  categories: string[];
  centerX: number;
  centerY: number;
  centralAngle: number;
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

type GaugeRenderOptions = {
  centerX: number;
  centerY: number;
  clockwise: boolean;
  totalAngle: number;
  scaleMaxLimitValue: number;
  startAngle: number;
  outerRadius: number;
  bandWidth: number;
  bandMargin: number;
  hasCategoryAxis: boolean;
};

export function getScaleMaxLimitValue(scale: ScaleData, totalAngle: number) {
  const {
    limit: { max },
    stepSize,
  } = scale;

  return max + (totalAngle < DEGREE_360 ? DEGREE_0 : stepSize);
}

function findCategoryIndex(categories: string[], value: string) {
  return categories.findIndex((category) => category === value);
}

export default class RadarPlot extends Component {
  models: RadialPlotModels = { plot: [], line: [], band: [] };

  circularAxisTheme!: Required<CircularAxisTheme>;

  initialize(initParam: { name: 'radialPlot' | 'gauge' }) {
    this.type = 'plot';
    this.name = initParam?.name ?? 'radialPlot';
  }

  render(state: ChartState<RadarChartOptions>) {
    const { layout, radialAxes, options, series, theme, scale } = state;

    this.rect = layout.plot;
    this.circularAxisTheme = theme.circularAxis as Required<CircularAxisTheme>;

    const categories = (state.categories as string[]) ?? [];

    if (this.name === 'gauge') {
      const bandData = (options as GaugeChartOptions)?.plot?.bands ?? [];
      const hasCategoryAxis = !isLabelAxisOnYAxis({ series, categories });
      const renderOptions = this.makeRenderOptionsOnGauge(
        hasCategoryAxis,
        radialAxes.circularAxis,
        categories,
        scale
      );

      this.models.band = this.renderBands(bandData, renderOptions, categories);
    } else {
      const isRadarChart = !!series.radar;
      const plotType = options.plot?.type ?? (isRadarChart ? 'spiderweb' : 'circle');
      const renderOptions = this.makeRenderOptions(radialAxes, plotType, categories);

      this.models.plot = this.renderPlot(renderOptions);
      this.models.line = series.radialBar ? this.renderLine(renderOptions) : [];
    }
  }

  makeRenderOptionsOnGauge(
    hasCategoryAxis: boolean,
    circularAxis: CircularAxisData,
    categories: string[],
    scale: Scale
  ): GaugeRenderOptions {
    const {
      angle: { total, start },
      radius: { outer },
      clockwise,
      centerX,
      centerY,
    } = circularAxis;
    const { width: bandWidth, margin: bandMargin } = circularAxis.band!;

    return {
      centerX,
      centerY,
      clockwise,
      totalAngle: total,
      scaleMaxLimitValue: hasCategoryAxis
        ? categories.length
        : getScaleMaxLimitValue(scale.circularAxis!, total),
      startAngle: start,
      outerRadius: outer,
      bandWidth,
      bandMargin,
      hasCategoryAxis,
    };
  }

  makeRenderOptions(
    radialAxes: RadialAxes,
    type: RadarPlotType,
    categories: string[] = []
  ): RenderOptions {
    const {
      centerX,
      centerY,
      radius: { ranges, inner, outer },
    } = radialAxes.verticalAxis!;
    const {
      angle: { central, total, start, end, drawingStart },
      label: { labels },

      tickInterval,

      clockwise,
    } = radialAxes.circularAxis;
    const usingArcPlot = total !== DEGREE_360;
    const lineCount = labels.length;

    return {
      type,
      categories,
      centralAngle: central,
      centerX,
      centerY,
      initialRadius: inner,
      radius: outer,
      radiusRanges: ranges,
      lineCount,
      tickInterval,
      drawingStartAngle: drawingStart,
      usingArcPlot,
      startAngle: start,
      endAngle: end,
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
    const { centralAngle, centerX, centerY, categories, radiusRanges } = renderOptions;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return radiusRanges.map((radius) => {
      const points: Point[] = categories.map((_, index) =>
        getRadialPosition(centerX, centerY, radius, calculateDegreeToRadian(centralAngle * index))
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
      radius,
      x: centerX,
      y: centerY,
      borderColor: strokeStyle,
      borderWidth: lineWidth,
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
      centralAngle,
      tickInterval,
      drawingStartAngle,
      clockwise,
    } = renderOptions;
    const { strokeStyle, lineWidth } = this.circularAxisTheme;

    return range(0, lineCount).reduce<LineModel[]>((acc, cur, index) => {
      const startDegree = drawingStartAngle + centralAngle * index * (clockwise ? 1 : -1);
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

  renderBands(
    bands: GaugePlotBand[],
    renderOptions: GaugeRenderOptions,
    categories: string[]
  ): SectorModel[] {
    const sectors: SectorModel[] = [];
    const {
      centerX,
      centerY,
      clockwise,
      totalAngle,
      scaleMaxLimitValue,
      startAngle,
      outerRadius,
      bandWidth,
      bandMargin,
      hasCategoryAxis,
    } = renderOptions;

    bands.forEach(({ range: rangeData, color }, index) => {
      const value = hasCategoryAxis
        ? findCategoryIndex(categories, rangeData[1].toString()) -
          findCategoryIndex(categories, rangeData[0].toString())
        : Number(rangeData[1]) - Number(rangeData[0]);
      const degree = (value / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
      const validDegree = calculateValidAngle(degree);
      const prevModel = sectors[sectors.length - 1];
      const startDegree = index && prevModel ? prevModel.degree.end : startAngle;
      const endDegree = calculateValidAngle(startDegree + validDegree);

      sectors.push({
        type: 'sector',
        color,
        x: centerX,
        y: centerY,
        clockwise,
        degree: {
          start: startDegree,
          end: endDegree,
        },
        radius: {
          inner: outerRadius + bandMargin,
          outer: outerRadius + bandWidth,
        },
      });
    });

    return sectors;
  }
}
