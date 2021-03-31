import Component from './component';
import {
  SectorResponderModel,
  RadialBarResponderModel,
  RadialBarSectorModel,
  RadialBarSeriesModels,
} from '@t/components/series';
import { RadialBarChartSeriesTheme, GroupedSector } from '@t/theme';
import {
  isNumber,
  pick,
  isNull,
  calculateSizeWithPercentString,
  deepCopy,
} from '@src/helpers/utils';
import { message } from '@src/message';
import {
  ChartState,
  StackDataValues,
  ScaleData,
  CircularAxisData,
  VerticalAxisData,
} from '@t/store/store';
import {
  RadialBarChartOptions,
  RadialBarSeriesType,
  CircleTypeEventDetectType,
  RadialBarSeriesOptions,
} from '@t/options';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { RespondersThemeType, makeGroupedSectorResponderModel } from '@src/helpers/responders';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  withinRadian,
  getRadiusRanges,
  DEGREE_360,
  DEGREE_0,
  DEGREE_NEGATIVE_90,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getTotalAngle } from '@src/helpers/pieSeries';
import { RadialBarDataLabel } from '@t/components/dataLabels';
import { isAvailableShowTooltipInfo } from '@src/helpers/validation';
import { SelectSeriesInfo } from '@t/charts';

type RadiusRange = { inner: number; outer: number };

type RenderOptions = {
  clockwise: boolean;
  centerX: number;
  centerY: number;
  radiusRanges: RadiusRange[];
  angleRange: { start: number; end: number };
  totalAngle: number;
  scaleMaxLimitValue: number;
  startAngle: number;
};

export default class RadialBarSeries extends Component {
  models: RadialBarSeriesModels = {};

  drawModels!: RadialBarSeriesModels;

  responders!: RadialBarResponderModel[];

  activatedResponders: RadialBarResponderModel[] = [];

  eventDetectType: CircleTypeEventDetectType = 'point';

  tooltipSectorMap!: Record<number, SectorResponderModel[]>;

  theme!: Required<RadialBarChartSeriesTheme>;

  circularAxis!: CircularAxisData;

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    const {
      angle: { start: startAngle, total: totalAngle },
    } = this.circularAxis;
    let currentDegree: number;

    Object.keys(this.models).forEach((category) => {
      const index = this.models[category].findIndex(({ clockwise, degree: { start, end } }) => {
        currentDegree = clockwise
          ? startAngle + totalAngle * delta
          : startAngle - totalAngle * delta;

        return withinRadian(clockwise, start, end, currentDegree);
      });

      this.syncEndAngle(index < 0 ? this.models[category].length : index, category);

      if (index !== -1) {
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

    const initialCategoryMap = categories.reduce((acc, category) => {
      if (!acc[category]) {
        acc[category] = [];
      }

      return acc;
    }, {});
    const seriesData = series.radialBar.data as Required<RadialBarSeriesType>[];
    this.circularAxis = radialAxes.circularAxis;
    const verticalAxisData = radialAxes.verticalAxis!;
    const renderOptions = this.makeRenderOptions(
      verticalAxisData,
      scale.circularAxis!,
      options?.series
    );
    const { categoryMap, seriesModels } = this.makeSeriesModelData(
      seriesData,
      stackSeries.radialBar.stackData as StackDataValues,
      renderOptions,
      initialCategoryMap
    );
    const tooltipData = this.makeTooltipData(seriesModels, categories);
    this.models = categoryMap;

    if (!this.drawModels) {
      this.initDrawModels(categoryMap);
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      const dataLabelData = seriesModels.reduce<RadialBarDataLabel[]>((acc, data) => {
        return [...acc, { ...data, type: 'sector', theme: this.theme.dataLabels }];
      }, []);

      this.renderDataLabels(dataLabelData);
    }

    this.tooltipSectorMap = this.makeTooltipSectorMap(seriesModels, tooltipData);

    this.responders = this.makeResponders(
      verticalAxisData.radius.ranges,
      seriesModels,
      renderOptions,
      categories,
      tooltipData
    );
  }

  private initDrawModels(categoryMap: Record<string, RadialBarSectorModel[]>) {
    this.drawModels = {};

    Object.keys(categoryMap).forEach((category) => {
      this.drawModels[category] = categoryMap[category].map((m) => ({
        ...m,
        degree: { ...m.degree, end: m.degree.start },
      }));
    });
  }

  private makeResponders(
    radiusRanges: number[],
    seriesModels: RadialBarSectorModel[],
    renderOptions: RenderOptions,
    categories: string[],
    tooltipData
  ): RadialBarResponderModel[] {
    return this.eventDetectType === 'grouped'
      ? makeGroupedSectorResponderModel(radiusRanges, renderOptions, categories)
      : seriesModels.map((m, index) => ({
          ...m,
          data: { ...tooltipData[index] },
        }));
  }

  private makeTooltipSectorMap(seriesModels: RadialBarSectorModel[], tooltipData: TooltipData[]) {
    return seriesModels.reduce((acc, cur, index) => {
      const categoryIndex = cur.index!;
      if (!acc[categoryIndex]) {
        acc[categoryIndex] = [];
      }

      acc[categoryIndex].push({
        ...cur,
        data: { ...tooltipData[index] },
      });

      return acc;
    }, {});
  }

  private setEventDetectType(options?: RadialBarChartOptions) {
    if (options?.series?.eventDetectType) {
      this.eventDetectType = options.series.eventDetectType;
    }
  }

  private getBarWidth(tickDistance: number, axisSize: number) {
    const { barWidth } = this.theme;
    const DEFAULT_PADDING = 5;

    return barWidth
      ? Math.min(tickDistance, calculateSizeWithPercentString(axisSize, barWidth))
      : tickDistance - DEFAULT_PADDING * 2;
  }

  private makeRenderOptions(
    {
      axisSize,
      centerX,
      centerY,
      tickDistance,
      radius: { ranges },
      angle: { start, end },
    }: VerticalAxisData,
    scale: ScaleData,
    options?: RadialBarSeriesOptions
  ): RenderOptions {
    const {
      limit: { max },
      stepSize,
    } = scale;
    const clockwise = options?.clockwise ?? true;
    const totalAngle = getTotalAngle(clockwise, start, end);
    const barWidth = this.getBarWidth(tickDistance, axisSize);
    const padding = (tickDistance - barWidth) / 2;
    const scaleMaxLimitValue = max + (totalAngle < DEGREE_360 ? DEGREE_0 : stepSize);

    return {
      clockwise,
      centerX,
      centerY,
      radiusRanges: getRadiusRanges(ranges, padding),
      angleRange: {
        start,
        end,
      },
      totalAngle,
      scaleMaxLimitValue,
      startAngle: start,
    };
  }

  private makeSeriesModelData(
    seriesData: RadialBarSeriesType[],
    stackSeriesData: StackDataValues,
    renderOptions: RenderOptions,
    initialCategoryMap: Record<string, RadialBarSectorModel[]>
  ): {
    seriesModels: RadialBarSectorModel[];
    categoryMap: Record<string, RadialBarSectorModel[]>;
  } {
    const {
      clockwise,
      centerX,
      centerY,
      radiusRanges,
      totalAngle,
      scaleMaxLimitValue,
      startAngle,
    } = renderOptions;
    const defaultStartDegree = startAngle;
    const { lineWidth, strokeStyle } = this.theme;
    const sectorModels: RadialBarSectorModel[] = [];
    const categories = Object.keys(initialCategoryMap);
    const categoryMap = deepCopy(initialCategoryMap);

    stackSeriesData.forEach(({ values }, categoryIndex) => {
      const { inner, outer } = radiusRanges[categoryIndex];
      values.forEach((value, seriesIndex) => {
        if (!isNull(value)) {
          const degree =
            Math.max((value / scaleMaxLimitValue) * totalAngle, 1) * (clockwise ? 1 : -1);
          const prevModel = sectorModels[sectorModels.length - 1];
          const startDegree = seriesIndex && prevModel ? prevModel.degree.end : defaultStartDegree;
          const endDegree = clockwise
            ? Math.min(startDegree + degree, DEGREE_360)
            : Math.max(startDegree + degree, DEGREE_0);
          const { name, color: seriesColor } = seriesData[
            seriesIndex
          ] as Required<RadialBarSeriesType>;
          const color = this.getSeriesColor(name, seriesColor);
          const sectorModel: RadialBarSectorModel = {
            type: 'sector',
            name,
            color: color!,
            x: centerX,
            y: centerY,
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
            totalAngle,
            seriesColor,
            seriesIndex,
            index: categoryIndex,
            drawingStartAngle: DEGREE_NEGATIVE_90,
          };

          categoryMap[categories[categoryIndex]].push(sectorModel);
          sectorModels.push(sectorModel);
        }
      });
    });

    return { seriesModels: sectorModels, categoryMap };
  }

  getSeriesColor(name: string, color: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![name];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);

    return selected
      ? getRGBA(color, active ? select.areaOpacity! : select.restSeries!.areaOpacity!)
      : getRGBA(color, areaOpacity);
  }

  makeTooltipData(seriesModels: RadialBarSectorModel[], categories: string[]): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesModels.forEach(({ seriesColor, name, value, index }) => {
      if (!isNull(value)) {
        tooltipData.push({
          label: name!,
          color: seriesColor!,
          value: value!,
          category: isNumber(index) ? categories[index] : '',
        });
      }
    });

    return tooltipData;
  }

  makeTooltipResponder(responders: SectorResponderModel[]) {
    const categories: string[] = Object.keys(this.models);

    return responders.map((responder) => ({
      ...responder,
      ...getRadialAnchorPosition(
        makeAnchorPositionParam(
          'center',
          this.models[categories[responder.index!]].find(({ name }) => name === responder.name)!
        )
      ),
    }));
  }

  private getRadialBarSectorModelsFromResponders(responders: RadialBarResponderModel[]) {
    if (!responders.length) {
      return [];
    }

    return this.tooltipSectorMap[responders[0].index!] ?? [];
  }

  private getGroupedSector(responders: RadialBarResponderModel[], type: 'hover' | 'select') {
    const RadialBarSectorModels = this.getRadialBarSectorModelsFromResponders(responders);
    const { color, opacity } = this.theme[type].groupedSector as Required<GroupedSector>;

    return RadialBarSectorModels.length
      ? responders.map((m) => ({
          ...m,
          color: getRGBA(color, opacity),
        }))
      : [];
  }

  onMousemoveGroupedType(responders: RadialBarResponderModel[]) {
    const RadialBarSectorModels = this.getRadialBarSectorModelsFromResponders(responders);

    this.eventBus.emit('renderHoveredSeries', {
      models: this.getGroupedSector(responders, 'hover'),
      name: this.name,
      eventDetectType: this.eventDetectType,
    });

    this.activatedResponders = RadialBarSectorModels;
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
          ...this.getRadialBarSectorModelsFromResponders(responders),
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

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', { models: [], name: this.name });

    this.eventBus.emit('needDraw');
  };

  selectSeries = (info: SelectSeriesHandlerParams<RadialBarChartOptions>) => {
    const { index, seriesIndex } = info;
    const isAvailable =
      isNumber(index) && (this.eventDetectType === 'grouped' || isNumber(seriesIndex));

    if (!isAvailable) {
      return;
    }

    const models =
      this.eventDetectType === 'grouped'
        ? [
            ...this.getGroupedSector([this.responders[index!]], 'select'),
            ...this.getRadialBarSectorModelsFromResponders([this.responders[index!]]),
          ]
        : this.getResponderModelsWithTheme(
            [this.tooltipSectorMap[index!][seriesIndex!]],
            'select'
          ) ?? [];

    if (!models.length) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: models,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: SelectSeriesInfo) => {
    const { index, seriesIndex } = info;

    if (!isAvailableShowTooltipInfo(info, this.eventDetectType, 'radialBar')) {
      return;
    }

    const models =
      this.eventDetectType === 'grouped'
        ? this.getGroupedSector([this.responders[index!]], 'hover')
        : this.getResponderModelsWithTheme([this.tooltipSectorMap[index!][seriesIndex!]], 'hover');

    if (!models.length) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', {
      models,
      name: this.name,
      eventDetectType: this.eventDetectType,
    });
    this.activatedResponders =
      this.eventDetectType === 'grouped' ? this.tooltipSectorMap[index!] : models;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
