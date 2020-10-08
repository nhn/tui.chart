import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, PieSeriesModels, SectorResponderModel } from '@t/components/series';
import { getRGBA, getColorSpectrumBrightnessAlpha } from '@src/helpers/color';
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
} from '@src/helpers/pieSeries';
import { RadiusRange } from '@t/components/tooltip';

export type RenderOptions = {
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
};

function getCalculatedRadiusRangeRenderOptions({
  alias,
  renderOptions,
  radiusRangeMap,
  pieIndex,
  radiusRanges,
  totalPieAliasCount,
}: CalculatedRadiusRangeParam) {
  const radiusRangeLength = Object.keys(radiusRangeMap).length;
  const { defaultRadius = 0 } = renderOptions;

  if (!radiusRangeMap[alias]) {
    if (!radiusRangeLength) {
      const radius = defaultRadius / totalPieAliasCount;

      renderOptions.radiusRange.inner = pieIndex * radius;
      renderOptions.radiusRange.outer = (pieIndex + 1) * radius;
    } else {
      if (pieIndex && radiusRanges[pieIndex - 1].outer) {
        renderOptions.radiusRange.inner = radiusRanges[pieIndex - 1].outer;
      }

      if (radiusRanges[pieIndex + 1]?.inner) {
        renderOptions.radiusRange.outer = radiusRanges[pieIndex + 1].inner;
      } else if (pieIndex === totalPieAliasCount - 1) {
        renderOptions.radiusRange.outer = defaultRadius;
      } else {
        const radius =
          (defaultRadius -
            (radiusRanges[pieIndex - 1]?.outer ?? 0) -
            (radiusRanges[pieIndex + 1]?.inner ?? 0)) /
          (totalPieAliasCount - radiusRangeLength);

        renderOptions.radiusRange.outer = renderOptions.radiusRange.inner + radius;
      }
    }
  }

  return renderOptions;
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
    this.selectable = this.getSelectableOption(options); // 셀렉터블 개선 필요

    let seriesModel;
    let tooltipDataModel;

    if (nestedPieSeries) {
      const { data } = nestedPieSeries[this.alias];

      const pieAlias = Object.keys(nestedPieSeries);
      const pieIndex = pieAlias.findIndex((alias) => alias === this.alias);
      const radiusRangeMap = this.getRadiusRangeMap(options, pieAlias);
      const renderOptionsMap = this.getRenderOptionsMap(options, pieAlias);
      const radiusRanges = Object.values(renderOptionsMap).map(({ radiusRange }) => radiusRange);

      const renderOptions = getCalculatedRadiusRangeRenderOptions({
        alias: this.alias,
        renderOptions: renderOptionsMap[this.alias],
        radiusRangeMap,
        pieIndex,
        radiusRanges,
        totalPieAliasCount: pieAlias.length,
      });

      seriesModel = this.renderPieModel(data, renderOptions, pieIndex);
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
      this.renderDataLabels(seriesModel, this.alias);
    }

    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'sector',
      radius: m.radius,
      style: ['hover'],
      seriesIndex: index,
      data: tooltipDataModel[index],
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
    return pieAlias.reduce<RenderOptionsMap>((acc, alias) => {
      acc[alias] = this.makeRenderOptions(options);

      return acc;
    }, {} as RenderOptionsMap);
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
    const seriesOptions = this.getOptions(options, this.alias).series;
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
      models: responders,
      name: this.alias ?? this.name,
    });
    this.activatedResponders = this.makeTooltipResponder(responders);

    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.alias ?? this.name,
    });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.eventBus.emit('renderSelectedSeries', { models: responders, name: this.name });
      this.eventBus.emit('needDraw');
    }
  }

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', {
      models: [],
      name: this.name,
    });

    this.eventBus.emit('needDraw');
  }

  getOpacity(rootParentName: string, parentName: string, pieIndex: number, indexOfGroup: number) {
    const active = this.activeSeriesMap![rootParentName ?? name];
    const alpha = active ? 1 : 0.3;

    return pieIndex && parentName
      ? getColorSpectrumBrightnessAlpha(alpha, pieIndex, indexOfGroup)
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
