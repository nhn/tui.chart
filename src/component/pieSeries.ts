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
  getDefaultRadius,
  getSemiCircleCenterY,
  makePieTooltipData,
  pieTooltipLabelFormatter,
} from '@src/helpers/pieSeries';
import { RadiusRange } from '@t/components/tooltip';
import { calculateSizeWithPercentString, isNumber, isUndefined } from '@src/helpers/utils';
import { PieChartSeriesTheme, SelectSectorStyle } from '@t/theme';
import { pick } from '@src/helpers/utils';
import { RespondersThemeType } from '@src/helpers/responders';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';

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

  theme!: Required<PieChartSeriesTheme>;

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
    this.eventBus.on('selectSeries', this.selectSeries);
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, options, nestedPieSeries, theme } = chartState;
    const categories = (chartState.categories as string[]) ?? [];

    if (!series.pie) {
      throw new Error(message.noDataError(this.name));
    }

    const pieTheme = theme.series.pie as Required<PieChartSeriesTheme>;
    this.theme = this.alias ? pieTheme[this.alias] : pieTheme;
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
        theme: this.theme.dataLabels,
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

    const innerRadius = calculateSizeWithPercentString(
      defaultRadius,
      seriesOptions?.radiusRange?.inner ?? 0
    );
    const outerRadius = calculateSizeWithPercentString(
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
    const { lineWidth, strokeStyle } = this.theme;

    seriesRawData.forEach((rawData, seriesIndex) => {
      const color = this.alias
        ? this.getAliasSeriesColor(rawData, seriesRawData, pieIndex!)
        : this.getSeriesColor(rawData);
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
        style: [{ lineWidth, strokeStyle }],
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
      models: this.getResponderModelsWithTheme(responders, 'hover'),
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
        models: this.getResponderModelsWithTheme(responders, 'select'),
        name: this.name,
        alias: this.alias,
      });
      this.eventBus.emit('needDraw');
    }
  }

  getResponderModelsWithTheme(responders: SectorResponderModel[], type: RespondersThemeType) {
    const theme = this.theme[type];
    const lineWidth = theme.lineWidth!;
    const isSameLineWidth = this.theme.lineWidth === lineWidth;
    const thickness = isSameLineWidth ? 0 : lineWidth * 0.5;

    return responders.map((m) => ({
      ...m,
      color: theme?.color ?? m.color,
      style: [
        pick(
          theme,
          'lineWidth',
          'strokeStyle',
          'shadowBlur',
          'shadowColor',
          'shadowOffsetX',
          'shadowOffsetY'
        ),
      ],
      radius: {
        inner: Math.max(m.radius.inner - thickness, 0),
        outer: m.radius.outer + thickness,
      },
    }));
  }

  onMouseoutComponent() {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.alias || this.name });
    this.eventBus.emit('renderHoveredSeries', { models: [], name: this.alias || this.name });

    this.eventBus.emit('needDraw');
  }

  getOpacity(active: boolean, selectedState: boolean): number {
    const { select, areaOpacity } = this.theme;
    const {
      areaOpacity: selectedAreaOpacity,
      restSeries: { areaOpacity: restAreaOpacity },
    } = select as Required<SelectSectorStyle>;
    const selectThemeOpacity = active ? selectedAreaOpacity : restAreaOpacity!;

    return selectedState ? selectThemeOpacity : areaOpacity;
  }

  getIndexOfGroup(seriesRawData: PieSeriesType[], parentName: string, name: string) {
    return seriesRawData
      .filter((datum) => parentName === datum.parentName)
      .findIndex((datum) => name === datum.name);
  }

  getSeriesColor(rawData: PieSeriesType) {
    const { color, name } = rawData;
    const active = this.activeSeriesMap![name];
    const opacity = this.getOpacity(active, this.hasActiveSeries());

    return getRGBA(color!, opacity);
  }

  getAliasSeriesColor(rawData: PieSeriesType, seriesRawData: PieSeriesType[], pieIndex: number) {
    const { color, name } = rawData;
    const {
      select: { color: selectedColor },
    } = this.theme;
    const { rootParentName, parentName } = rawData;
    const indexOfGroup = this.getIndexOfGroup(seriesRawData, parentName!, name);
    const opacity = this.getAliasSeriesOpacity(
      rootParentName!,
      parentName!,
      pieIndex!,
      indexOfGroup,
      name
    );
    const active = this.activeSeriesMap![rootParentName ?? name];
    const seriesColor = active ? selectedColor ?? color! : color!;

    return getRGBA(seriesColor, opacity);
  }

  getAliasSeriesOpacity(
    rootParentName: string,
    parentName: string,
    pieIndex: number,
    indexOfGroup: number,
    name: string
  ) {
    const active = this.activeSeriesMap![rootParentName ?? name];
    const opacity = this.getOpacity(active, this.hasActiveSeries());

    return pieIndex && parentName
      ? getPieSeriesOpacityByDepth(opacity, pieIndex, indexOfGroup)
      : opacity;
  }

  hasActiveSeries() {
    return Object.values(this.activeSeriesMap!).some((elem) => !elem);
  }

  selectSeries = ({ index, alias }: SelectSeriesHandlerParams<PieChartOptions>) => {
    if (!isNumber(index) || (!isUndefined(alias) && alias !== this.alias)) {
      return;
    }

    const model = this.responders[index];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getResponderModelsWithTheme([model], 'select'),
      name: this.name,
      alias: this.alias,
    });
    this.eventBus.emit('needDraw');
  };
}
