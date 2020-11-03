import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, PieSeriesModels, SectorResponderModel } from '@t/components/series';
import { getRGBA } from '@src/helpers/color';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  withinRadian,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import {
  getTotalAngle,
  isSemiCircle,
  getRadius,
  getDefaultRadius,
  getSemiCircleCenterY,
  makePieTooltipData,
  pieTooltipLabelFormatter,
} from '@src/helpers/pieSeries';
import { RadiusRange } from '@t/components/tooltip';

const PIE_HOVER_THICKNESS = 3;

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  drawingStartAngle: number;
  radiusRange: { inner: number; outer: number };
  angleRange: { start: number; end: number };
  totalAngle: number;
  defaultRadius?: number;
};

type RadiusRangeOption = {
  inner?: number | string;
  outer?: number | string;
};

type RadiusRangeMap = Record<string, RadiusRangeOption>;
type RenderOptionsMap = Record<string, RenderOptions>;

type CalculatedRadiusRangeParam = {
  alias: string;
  renderOptions: RenderOptions;
  radiusRangeMap: RadiusRangeMap;
  pieIndex: number;
  radiusRanges: RadiusRange[];
  totalPieAliasCount: number;
  innerRadius?: number;
};

function getCalculatedRadiusRange({
  alias,
  renderOptions,
  radiusRangeMap,
  pieIndex,
  radiusRanges,
  totalPieAliasCount,
}: CalculatedRadiusRangeParam) {
  const radiusRangeLength = Object.keys(radiusRangeMap).length;
  const { defaultRadius = 0 } = renderOptions;

  let { inner, outer } = renderOptions.radiusRange;

  if (!radiusRangeMap[alias]) {
    if (!radiusRangeLength) {
      const radius = defaultRadius / totalPieAliasCount;

      inner = pieIndex * radius;
      outer = (pieIndex + 1) * radius;
    } else {
      if (pieIndex && radiusRanges[pieIndex - 1].outer) {
        inner = radiusRanges[pieIndex - 1].outer;
      }

      if (radiusRanges[pieIndex + 1]?.inner) {
        outer = radiusRanges[pieIndex + 1].inner;
      } else if (pieIndex === totalPieAliasCount - 1) {
        outer = defaultRadius;
      } else {
        const radius =
          (defaultRadius -
            (radiusRanges[pieIndex - 1]?.outer ?? 0) -
            (radiusRanges[pieIndex + 1]?.inner ?? 0)) /
          (totalPieAliasCount - radiusRangeLength);

        outer = inner + radius;
      }
    }
  }

  return { inner, outer };
}

function getPieSeriesOpacityByDepth(
  originAlpha: number,
  depth: number,
  indexOfGroup: number,
  brightness = 0.85
) {
  const depthAlpha = Number((originAlpha * brightness ** depth).toFixed(2));

  return Number((depthAlpha ** (indexOfGroup + 1)).toFixed(2));
}

export default class PieSeries extends Component {
  models: PieSeriesModels = { series: [] };

  drawModels!: PieSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  alias!: string;

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    let currentDegree: number;
    const index = this.models.series.findIndex(
      ({ clockwise, degree: { start, end }, totalAngle }) => {
        currentDegree = clockwise ? totalAngle * delta : 360 - totalAngle * delta;

        return withinRadian(clockwise, start, end, currentDegree);
      }
    );

    this.syncEndAngle(index < 0 ? this.models.series.length : index);

    if (~index) {
      this.drawModels.series[index].degree.end = currentDegree!;
    }
  }

  syncEndAngle(index: number) {
    if (index < 1) {
      return;
    }

    for (let i = 0; i < index; i += 1) {
      const prevTargetEndDegree = this.models.series[i].degree.end;

      if (this.drawModels.series[i].degree.end !== prevTargetEndDegree) {
        this.drawModels.series[i].degree.end = prevTargetEndDegree;
      }
    }
  }

  initialize(param: { alias?: string }) {
    this.type = 'series';
    this.name = 'pie';
    this.alias = param?.alias ?? '';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, options, nestedPieSeries } = chartState;
    const categories = (chartState.categories as string[]) ?? [];

    if (!series.pie) {
      throw new Error("There's no pie data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    let seriesModel, tooltipDataModel;

    if (nestedPieSeries) {
      const { data } = nestedPieSeries[this.alias];

      const pieAlias = Object.keys(nestedPieSeries);
      const pieIndex = pieAlias.findIndex((alias) => alias === this.alias);
      const renderOptionsMap = this.getRenderOptionsMap(options, pieAlias);

      seriesModel = this.renderPieModel(data, renderOptionsMap[this.alias], pieIndex);
      tooltipDataModel = makePieTooltipData(data, categories?.[pieIndex]);
    } else {
      const pieData = series.pie?.data! as PieSeriesType[];
      const renderOptions = this.makeRenderOptions(options);

      seriesModel = this.renderPieModel(pieData, renderOptions);
      tooltipDataModel = makePieTooltipData(pieData, categories?.[0]);
    }

    this.models.series = seriesModel;

    if (!this.drawModels) {
      this.drawModels = {
        series: this.models.series.map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        })),
      };
    }

    if (getDataLabelsOptions(options, this.alias).visible) {
      const dataLabelData = seriesModel.map((m) => ({
        ...m,
        value: `${pieTooltipLabelFormatter(m.percentValue)}`,
      }));
      this.renderDataLabels(dataLabelData, this.alias);
    }

    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'sector',
      radius: m.radius,
      seriesIndex: index,
      data: { ...tooltipDataModel[index], percentValue: m.percentValue },
      color: getRGBA(m.color, 1),
    }));
  }

  getRadiusRangeMap(options: PieChartOptions, pieAlias: string[]) {
    return pieAlias.reduce<RadiusRangeMap>((acc, alias) => {
      const seriesOptions = this.getOptions(options, alias).series;

      if (seriesOptions?.radiusRange) {
        acc[alias] = seriesOptions?.radiusRange;
      }

      return acc;
    }, {} as RadiusRangeMap);
  }

  getRenderOptionsMap(options: PieChartOptions, pieAlias: string[]) {
    const renderOptionsMap = this.initRenderOptionsMap(options, pieAlias);
    const radiusRangeMap = this.getRadiusRangeMap(options, pieAlias);

    pieAlias.forEach((alias, pieIndex) => {
      const radiusRanges = Object.values(renderOptionsMap).map(({ radiusRange }) => radiusRange);

      renderOptionsMap[alias].radiusRange = getCalculatedRadiusRange({
        alias,
        renderOptions: renderOptionsMap[alias],
        radiusRangeMap,
        pieIndex,
        radiusRanges,
        totalPieAliasCount: pieAlias.length,
      });
    });

    return renderOptionsMap;
  }

  initRenderOptionsMap(options: PieChartOptions, pieAlias: string[]) {
    return pieAlias.reduce<RenderOptionsMap>(
      (acc, alias) => ({
        ...acc,
        [alias]: this.makeRenderOptions(this.getOptions(options, alias)),
      }),
      {} as RenderOptionsMap
    );
  }

  getOptions(chartOptions: PieChartOptions, alias?: string) {
    const options = { ...chartOptions };

    if (options?.series && alias) {
      options.series = {
        ...options.series,
        ...options.series[alias],
      };
    }

    return options;
  }

  makeRenderOptions(options: PieChartOptions): RenderOptions {
    const seriesOptions = options.series;
    const clockwise = seriesOptions?.clockwise ?? true;
    const startAngle = seriesOptions?.angleRange?.start ?? 0;
    const endAngle = seriesOptions?.angleRange?.end ?? 360;
    const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    const isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
    const { width, height } = this.rect;
    const defaultRadius = getDefaultRadius(this.rect, isSemiCircular);

    const innerRadius = getRadius(defaultRadius, seriesOptions?.radiusRange?.inner ?? 0);
    const outerRadius = getRadius(
      defaultRadius,
      seriesOptions?.radiusRange?.outer ?? (this.alias ? 0 : defaultRadius)
    );
    const cx = width / 2;
    const cy = isSemiCircular ? getSemiCircleCenterY(this.rect.height, clockwise) : height / 2;

    return {
      clockwise,
      cx,
      cy,
      drawingStartAngle: startAngle - 90,
      radiusRange: {
        inner: innerRadius,
        outer: outerRadius,
      },
      angleRange: {
        start: startAngle,
        end: endAngle,
      },
      totalAngle,
      defaultRadius,
    };
  }

  renderPieModel(
    seriesRawData: PieSeriesType[],
    renderOptions: RenderOptions,
    pieIndex?: number
  ): SectorModel[] {
    const sectorModels: SectorModel[] = [];
    const total = seriesRawData.reduce((sum, { data }) => sum + data, 0);
    const {
      clockwise,
      cx,
      cy,
      drawingStartAngle,
      radiusRange: { inner, outer },
      totalAngle,
    } = renderOptions;
    const defaultStartDegree = clockwise ? 0 : 360;

    seriesRawData.forEach((rawData, seriesIndex) => {
      const color = this.getSeriesColor(rawData, seriesRawData, pieIndex);

      const { data, name } = rawData;
      const degree = (data / total) * totalAngle * (clockwise ? 1 : -1);
      const percentValue = (data / total) * 100;
      const startDegree = seriesIndex
        ? sectorModels[seriesIndex - 1].degree.end
        : defaultStartDegree;
      const endDegree = clockwise
        ? Math.min(startDegree + degree, 360)
        : Math.max(startDegree + degree, 0);

      sectorModels.push({
        type: 'sector',
        name,
        color,
        x: cx,
        y: cy,
        degree: {
          start: startDegree,
          end: endDegree,
        },
        radius: {
          inner,
          outer,
        },
        value: data,
        style: [this.alias ? 'nested' : 'default'],
        clockwise,
        drawingStartAngle,
        totalAngle,
        percentValue,
      });
    });

    return sectorModels;
  }

  makeTooltipResponder(responders: SectorResponderModel[]) {
    return responders.map((responder) => ({
      ...responder,
      ...getRadialAnchorPosition(
        makeAnchorPositionParam('center', this.models.series[responder.seriesIndex])
      ),
    }));
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', {
      models: responders.map((m) => ({
        ...m,
        style: ['hover'],
        radius: { ...m.radius, outer: m.radius.outer + PIE_HOVER_THICKNESS },
      })),
      name: this.alias || this.name,
    });
    this.activatedResponders = this.makeTooltipResponder(responders);
    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.alias || this.name,
    });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', {
        models: responders,
        name: this.name,
        alias: this.alias,
      });
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.alias || this.name });
    this.eventBus.emit('renderHoveredSeries', { models: [], name: this.alias || this.name });

    this.eventBus.emit('needDraw');
  }

  getOpacity(rootParentName: string, parentName: string, pieIndex: number, indexOfGroup: number) {
    const active = this.activeSeriesMap![rootParentName ?? name];
    const alpha = active ? 1 : 0.3;

    return pieIndex && parentName
      ? getPieSeriesOpacityByDepth(alpha, pieIndex, indexOfGroup)
      : alpha;
  }

  getIndexOfGroup(seriesRawData: PieSeriesType[], parentName: string, name: string) {
    return seriesRawData
      .filter((datum) => parentName === datum.parentName)
      .findIndex((datum) => name === datum.name);
  }

  getSeriesColor(rawData: PieSeriesType, seriesRawData: PieSeriesType[], pieIndex?: number) {
    const { color, name } = rawData;
    const active = this.activeSeriesMap![name];
    let opacity = active ? 1 : 0.3;

    if (this.alias) {
      const { rootParentName, parentName } = rawData;
      const indexOfGroup = this.getIndexOfGroup(seriesRawData, parentName!, name);

      opacity = this.getOpacity(rootParentName!, parentName!, pieIndex!, indexOfGroup);
    }

    return getRGBA(color!, opacity);
  }
}
