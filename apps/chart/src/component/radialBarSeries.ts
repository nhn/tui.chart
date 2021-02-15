import Component from './component';
import { SectorModel, SectorResponderModel } from '@t/components/series';
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
  CicleTypeEventDetectType,
  RadialBarSeriesOptions,
} from '@t/options';
import { SelectSeriesHandlerParams, SelectSeriesInfo } from '@src/charts/chart';
import { RespondersThemeType } from '@src/helpers/responders';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  withinRadian,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getTotalAngle } from '@src/helpers/pieSeries';
import { RadialBarDataLabel } from '@t/components/dataLabels';
import { isAvailableShowTooltipInfo } from '@src/helpers/validation';

type RadiusRange = { inner: number; outer: number };

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  radiusRanges: RadiusRange[];
  angleRange: { start: number; end: number };
  totalAngle: number;
  scaleMaxLimitValue: number;
  startAngle: number;
};

type RadialBarSeriesModels = Record<string, SectorModel[]>;

const PADDING = 5;

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
        index,
      } as SectorResponderModel)
  );
}

export default class RadialBarSeries extends Component {
  models: RadialBarSeriesModels = {};

  drawModels!: RadialBarSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  eventDetectType: CicleTypeEventDetectType = 'point';

  tooltipSectorMap!: Record<number, SectorResponderModel[]>;

  theme!: Required<RadialBarChartSeriesTheme>;

  circularAxis!: CircularAxisData;

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    const { startAngle, totalAngle } = this.circularAxis;
    let currentDegree: number;

    Object.keys(this.models).forEach((category) => {
      const index = this.models[category].findIndex(({ clockwise, degree: { start, end } }) => {
        currentDegree = clockwise
          ? startAngle + totalAngle * delta
          : startAngle - totalAngle * delta;

        return withinRadian(clockwise, start, end, currentDegree);
      });

      this.syncEndAngle(index < 0 ? this.models[category].length : index, category);

      if (index > -1) {
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
    const renderOptions = this.makeRenderOptions(
      radialAxes.verticalAxis,
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
      this.drawModels = {};
      Object.keys(categoryMap).forEach((category) => {
        this.drawModels[category] = categoryMap[category].map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        }));
      });
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      const dataLabelData = seriesModels.reduce<RadialBarDataLabel[]>((acc, data) => {
        return [...acc, { ...data, type: 'sector', theme: this.theme.dataLabels }];
      }, []);

      this.renderDataLabels(dataLabelData);
    }

    this.tooltipSectorMap = this.makeTooltipSectorMap(seriesModels, tooltipData);

    this.responders =
      this.eventDetectType === 'grouped'
        ? makeGroupedSectorResponderModel(
            radialAxes.verticalAxis.radiusRanges,
            renderOptions,
            categories
          )
        : seriesModels.map((m, index) => ({
            ...m,
            data: { ...tooltipData[index] },
          }));
  }

  private makeTooltipSectorMap(seriesModels: SectorModel[], tooltipData: TooltipData[]) {
    return seriesModels.reduce((acc, cur, index) => {
      const categoryIndex = cur.categoryIndex!;
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

    return barWidth
      ? Math.min(tickDistance, calculateSizeWithPercentString(axisSize, barWidth))
      : tickDistance - PADDING * 2;
  }

  private makeRenderOptions(
    {
      centerX,
      centerY,
      radiusRanges,
      tickDistance,
      axisSize,
      startAngle,
      endAngle,
    }: VerticalAxisData,
    scale: ScaleData,
    options?: RadialBarSeriesOptions
  ) {
    const {
      limit: { max },
      stepSize,
    } = scale;
    const clockwise = options?.clockwise ?? true;
    const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    const barWidth = this.getBarWidth(tickDistance, axisSize);
    const padding = (tickDistance - barWidth) / 2;
    const scaleMaxLimitValue = max + (totalAngle < 360 ? 0 : stepSize);

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
      scaleMaxLimitValue,
      startAngle,
    };
  }

  private makeSeriesModelData(
    seriesData: RadialBarSeriesType[],
    stackSeriesData: StackDataValues,
    renderOptions: RenderOptions,
    initialCategoryMap: Record<string, SectorModel[]>
  ): {
    seriesModels: SectorModel[];
    categoryMap: Record<string, SectorModel[]>;
  } {
    const {
      clockwise,
      cx,
      cy,
      radiusRanges,
      totalAngle,
      scaleMaxLimitValue,
      startAngle,
    } = renderOptions;
    const defaultStartDegree = startAngle;
    const { lineWidth, strokeStyle } = this.theme;
    const sectorModels: SectorModel[] = [];
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
            ? Math.min(startDegree + degree, 360)
            : Math.max(startDegree + degree, 0);
          const { name, color: seriesColor } = seriesData[
            seriesIndex
          ] as Required<RadialBarSeriesType>;
          const color = this.getSeriesColor(name, seriesColor);
          const sectorModel: SectorModel = {
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
            totalAngle,
            seriesColor,
            seriesIndex,
            categoryIndex,
            drawingStartAngle: -90,
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

  makeTooltipData(seriesModels: SectorModel[], categories: string[]): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesModels.forEach(({ seriesColor, name, value, categoryIndex }) => {
      if (!isNull(value)) {
        tooltipData.push({
          label: name!,
          color: seriesColor!,
          value: value!,
          category: isNumber(categoryIndex) ? categories[categoryIndex] : '',
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
          this.models[categories[responder.categoryIndex!]].find(
            ({ name }) => name === responder.name
          )!
        )
      ),
    }));
  }

  private getSectorModelsFromResponders(responders: SectorResponderModel[]) {
    if (!responders.length) {
      return [];
    }

    return this.tooltipSectorMap[responders[0].index!] ?? [];
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
            ...this.getSectorModelsFromResponders([this.responders[index!]]),
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
