import Component from './component';
import { SectorModel, SectorResponderModel } from '@t/components/series';
import { RadialBarChartSeriesTheme, GroupedSector } from '@t/theme';
import {
  isUndefined,
  isNumber,
  pick,
  isNull,
  calculateSizeWithPercentString,
} from '@src/helpers/utils';
import { message } from '@src/message';
import { ChartState, StackDataValues, ScaleData } from '@t/store/store';
import { RadialBarChartOptions, RadialBarSeriesType, CicleTypeEventDetectType } from '@t/options';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { RespondersThemeType } from '@src/helpers/responders';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  initSectorOptions,
  withinRadian,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getTotalAngle } from '@src/helpers/pieSeries';

type RadiusRange = { inner: number; outer: number };

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  drawingStartAngle: number;
  radiusRanges: RadiusRange[];
  angleRange: { start: number; end: number };
  totalAngle: number;
  scaleMaxLimitValue: number;
};

type RadialBarSeriesModels = Record<string, SectorModel[]>;

const PADDING = 4;

function getRadiusRanges(radiusRanges: number[], padding: number) {
  return radiusRanges.reduce<RadiusRange[]>((acc, cur, index) => {
    if (index) {
      acc.push({
        inner: cur + padding,
        outer: radiusRanges[index - 1] - padding,
      });
    }

    if (index === radiusRanges.length - 1) {
      acc.push({
        inner: padding,
        outer: cur - padding,
      });
    }

    return acc;
  }, [] as RadiusRange[]);
}

function makeGroupedSectorResponderModel(
  radiusRanges: number[],
  renderOptions: RenderOptions,
  categories: string[]
): SectorResponderModel[] {
  const {
    cx,
    cy,
    angleRange: { start, end },
    clockwise,
    drawingStartAngle,
  } = renderOptions;

  return getRadiusRanges(radiusRanges, 0).map(
    (radius, index) =>
      ({
        type: 'sector',
        x: cx,
        y: cy,
        degree: { start, end },
        radius,
        name: categories[index],
        clockwise,
        drawingStartAngle,
      } as SectorResponderModel)
  );
}

export default class RadialBarSeries extends Component {
  models: RadialBarSeriesModels = {};

  drawModels!: RadialBarSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  eventDetectType: CicleTypeEventDetectType = 'point';

  tooltipSectorMap!: Record<string, SectorResponderModel[]>;

  theme!: Required<RadialBarChartSeriesTheme>;

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    let currentDegree: number;

    Object.keys(this.models).forEach((category) => {
      const index = this.models[category].findIndex(
        ({ clockwise, degree: { start, end }, totalAngle }) => {
          currentDegree = clockwise ? totalAngle * delta : 360 - totalAngle * delta;

          return withinRadian(clockwise, start, end, currentDegree);
        }
      );

      this.syncEndAngle(index < 0 ? this.models[category].length : index, category);

      if (~index) {
        this.drawModels[category][index].degree.end = currentDegree!;
      }
    });
  }

  syncEndAngle(index: number, category: string) {
    if (index < 1) {
      return;
    }

    for (let i = 0; i < index; i += 1) {
      const prevTargetEndDegree = this.models[category][i].degree.end;

      if (this.drawModels[category][i].degree.end !== prevTargetEndDegree) {
        this.drawModels[category][i].degree.end = prevTargetEndDegree;
      }
    }
  }

  initialize() {
    this.type = 'series';
    this.name = 'radialBar';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  render(chartState: ChartState<RadialBarChartOptions>) {
    const { layout, series, legend, options, theme, stackSeries, scale, radialAxes } = chartState;
    const categories = (chartState.categories as string[]) ?? [];

    if (!series.radialBar || !stackSeries.radialBar) {
      throw new Error(message.noDataError(this.name));
    }

    this.theme = theme.series.radialBar as Required<RadialBarChartSeriesTheme>;
    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);
    this.setEventDetectType(options);

    const seriesData = series.radialBar.data as Required<RadialBarSeriesType>[];
    const renderOptions = this.makeRenderOptions(options, radialAxes.yAxis, scale.xAxis);
    const seriesModelData = this.makeSeriesModelData(
      seriesData,
      stackSeries.radialBar.stackData as StackDataValues,
      renderOptions,
      categories
    );
    const tooltipData = this.makeTooltipData(seriesModelData);
    const categoryMap = this.makeCategoryMap(seriesModelData);

    this.models = categoryMap;

    if (!this.drawModels) {
      this.drawModels = {};
      Object.keys(categoryMap).forEach((category) => {
        this.drawModels[category] = categoryMap[category].map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        }));
      });
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      const dataLabelData = seriesModelData.reduce((acc, data) => {
        return [...acc, { ...data, type: 'sectorBar', theme: this.theme.dataLabels }];
      }, []);

      this.renderDataLabels(dataLabelData);
    }

    this.tooltipSectorMap = this.makeTooltipSectorMap(seriesModelData, tooltipData);

    this.responders =
      this.eventDetectType === 'grouped'
        ? makeGroupedSectorResponderModel(radialAxes.yAxis.radiusRanges, renderOptions, categories)
        : seriesModelData.map((m, index) => ({
            ...m,
            data: { ...tooltipData[index], percentValue: m.percentValue },
          }));
  }

  makeTooltipSectorMap(seriesModels: SectorModel[], tooltipData: TooltipData[]) {
    return seriesModels.reduce((acc, cur, index) => {
      const category = cur.category!;

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({
        ...cur,
        data: { ...tooltipData[index], percentValue: cur.percentValue },
      });

      return acc;
    }, {});
  }

  protected setEventDetectType(options?: RadialBarChartOptions) {
    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }
  }

  makeCategoryMap(seriesModel: SectorModel[]): Record<string, SectorModel[]> {
    return seriesModel.reduce((acc, cur) => {
      const category = cur.category!;

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({ ...cur });

      return acc;
    }, {});
  }

  getBarWidth(tickDistance: number, axisSize: number) {
    const { barWidth } = this.theme;

    return barWidth
      ? Math.min(tickDistance, calculateSizeWithPercentString(axisSize, barWidth))
      : tickDistance - PADDING * 2;
  }

  makeRenderOptions(
    options: RadialBarChartOptions,
    { centerX, centerY, radiusRanges, tickDistance, axisSize }: any, // @TODO: change any type
    scale: ScaleData
  ) {
    const {
      limit: { max },
      stepSize,
    } = scale;
    const { clockwise, startAngle, endAngle } = initSectorOptions(options?.series);
    const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    const barWidth = this.getBarWidth(tickDistance, axisSize);
    const padding = (tickDistance - barWidth) / 2;

    return {
      clockwise,
      cx: centerX,
      cy: centerY,
      drawingStartAngle: startAngle - 90,
      radiusRanges: getRadiusRanges(radiusRanges, padding),
      angleRange: {
        start: startAngle,
        end: endAngle,
      },
      totalAngle,
      scaleMaxLimitValue: max + stepSize,
    };
  }

  makeSeriesModelData(
    seriesData: RadialBarSeriesType[],
    stackSeriesData: StackDataValues,
    renderOptions: RenderOptions,
    categories: string[]
  ): SectorModel[] {
    const {
      clockwise,
      cx,
      cy,
      drawingStartAngle,
      radiusRanges,
      totalAngle,
      scaleMaxLimitValue,
    } = renderOptions;
    const defaultStartDegree = clockwise ? 0 : 360;
    const { lineWidth, strokeStyle } = this.theme;
    const sectorModels: SectorModel[] = [];

    stackSeriesData.forEach(({ values }, categoryIndex) => {
      const { inner, outer } = radiusRanges[categoryIndex];
      values.forEach((value, seriesIndex) => {
        if (!isNull(value)) {
          const degree =
            Math.max((value / scaleMaxLimitValue) * totalAngle, 1) * (clockwise ? 1 : -1);
          const percentValue = (value / scaleMaxLimitValue) * 100;
          const prevModel = sectorModels[sectorModels.length - 1];
          const startDegree = seriesIndex && prevModel ? prevModel.degree.end : defaultStartDegree;
          const endDegree = clockwise
            ? Math.min(startDegree + degree, 360)
            : Math.max(startDegree + degree, 0);
          const { name, color: seriesColor } = seriesData[
            seriesIndex
          ] as Required<RadialBarSeriesType>;
          const color = this.getSeriesColor(name, seriesColor);

          sectorModels.push({
            type: 'sector',
            name,
            color: color!,
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
            value,
            style: [{ strokeStyle }],
            lineWidth,
            clockwise,
            drawingStartAngle,
            totalAngle,
            percentValue,
            category: categories[categoryIndex],
            seriesColor,
            seriesIndex,
          });
        }
      });
    });

    return sectorModels;
  }

  getSeriesColor(name: string, color: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![name];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);

    return selected
      ? getRGBA(color, active ? select.areaOpacity! : select.restSeries!.areaOpacity!)
      : getRGBA(color, areaOpacity);
  }

  makeTooltipData(seriesModels: SectorModel[]): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesModels.forEach(({ seriesColor, name, value, category }) => {
      if (!isNull(value)) {
        tooltipData.push({
          label: name!,
          color: seriesColor!,
          value: value!,
          category: category ?? '',
        });
      }
    });

    return tooltipData;
  }

  makeTooltipResponder(responders: SectorResponderModel[]) {
    return responders.map((responder) => ({
      ...responder,
      ...getRadialAnchorPosition(
        makeAnchorPositionParam(
          'center',
          this.models[responder.category!].find(({ name }) => name === responder.name)!
        )
      ),
    }));
  }

  private getSectorModelsFromResponders(responders: SectorResponderModel[]) {
    if (!responders.length) {
      return [];
    }

    return this.tooltipSectorMap[responders[0].name!] ?? [];
  }

  private getGroupedSector(responders: SectorResponderModel[], type: 'hover' | 'select') {
    const sectorModels = this.getSectorModelsFromResponders(responders);
    const { color, opacity } = this.theme[type].groupedSector as Required<GroupedSector>;

    return sectorModels.length
      ? responders.map((m) => ({
          ...m,
          color: getRGBA(color, opacity),
        }))
      : [];
  }

  onMousemoveGroupedType(responders: SectorResponderModel[]) {
    const sectorModels = this.getSectorModelsFromResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getGroupedSector(responders, 'hover'),
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = sectorModels;
  }

  onMousemove({ responders }) {
    if (this.eventDetectType === 'grouped') {
      this.onMousemoveGroupedType(responders);
    } else {
      this.eventBus.emit('renderHoveredSeries', {
        models: this.getResponderModelsWithTheme(responders, 'hover'),
        name: this.name,
      });
      this.activatedResponders = this.makeTooltipResponder(responders);
    }

    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      let models;
      if (this.eventDetectType === 'grouped') {
        models = [
          ...this.getGroupedSector(responders, 'select'),
          ...this.getSectorModelsFromResponders(responders),
        ];
      } else {
        models = this.getResponderModelsWithTheme(responders as SectorResponderModel[], 'select');
      }

      this.eventBus.emit('renderSelectedSeries', {
        models,
        name: this.name,
        eventDetectType: this.eventDetectType,
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
      lineWidth: lineWidth,
      style: [
        pick(theme, 'strokeStyle', 'shadowBlur', 'shadowColor', 'shadowOffsetX', 'shadowOffsetY'),
      ],
      radius: {
        inner: Math.max(m.radius.inner - thickness, 0),
        outer: m.radius.outer + thickness,
      },
    }));
  }

  selectSeries = ({ seriesIndex, name }: SelectSeriesHandlerParams<RadialBarChartOptions>) => {
    if (!isNumber(seriesIndex) || !isUndefined(name)) {
      return;
    }

    const model = this.responders[seriesIndex];

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: this.getResponderModelsWithTheme([model], 'select'),
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = ({ seriesIndex, name }: SelectSeriesHandlerParams<RadialBarChartOptions>) => {
    if (!isNumber(seriesIndex) || !isUndefined(name)) {
      return;
    }

    const models = [this.responders[seriesIndex]];

    if (!models.length) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getResponderModelsWithTheme(models, 'hover'),
      name: this.name,
    });

    this.activatedResponders = this.makeTooltipResponder(models);
    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.name,
    });

    this.eventBus.emit('needDraw');
  };

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', { models: [], name: this.name });

    this.eventBus.emit('needDraw');
  };
}
