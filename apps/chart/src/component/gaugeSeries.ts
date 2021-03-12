import Component from './component';
import {
  SectorModel,
  SectorResponderModel,
  GaugeSeriesModels,
  ClockHandModel,
  GaugeResponderModel,
  ClockHandResponderModel,
} from '@t/components/series';
import { GaugeChartSeriesTheme, ClockHandTheme, PinTheme } from '@t/theme';
import {
  isNumber,
  pick,
  isNull,
  isString,
  calculateSizeWithPercentString,
} from '@src/helpers/utils';
import { message } from '@src/message';
import { ChartState, CircularAxisData, Scale, SolidData } from '@t/store/store';
import {
  GaugeChartOptions,
  GaugeSeriesType,
  GaugeSeriesOptions,
  GaugeSolidOptions,
} from '@t/options';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { RespondersThemeType } from '@src/helpers/responders';
import {
  getRadialPosition,
  calculateDegreeToRadian,
  getValidDegree,
  withinRadian,
  DEGREE_NEGATIVE_90,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getTotalAngle } from '@src/helpers/pieSeries';
import { isLabelAxisOnYAxis } from '@src/helpers/axes';
import { getScaleMaxLimitValue } from './radialPlot';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { DATA_LABEL_MARGIN } from '@src/store/gaugeAxes';
import { SelectSeriesInfo } from '@t/charts';

type RenderOptions = {
  clockwise: boolean;
  centerX: number;
  centerY: number;
  angleRange: { start: number; end: number };
  totalAngle: number;
  scaleMaxLimitValue: number;
  startAngle: number;
  categories: string[];
  drawingStartAngle: number;
  outerRadius: number;
  solidData: SolidData;
};

type TooltipMap = {
  sector: SectorResponderModel[];
  clockHand: ClockHandResponderModel[];
};

export default class GaugeSeries extends Component {
  models: GaugeSeriesModels = { clockHand: [], sector: [], backgroundSector: [] };

  drawModels!: GaugeSeriesModels;

  responders!: GaugeResponderModel[];

  activatedResponders: this['responders'] = [];

  tooltipMap!: TooltipMap;

  theme!: Required<GaugeChartSeriesTheme>;

  circularAxis!: CircularAxisData;

  solidData?: GaugeSolidOptions;

  initialize() {
    this.type = 'series';
    this.name = 'gauge';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    const { startAngle, totalAngle, clockwise } = this.circularAxis;
    const currentDegree = clockwise
      ? startAngle + totalAngle * delta
      : startAngle - totalAngle * delta;

    this.models.clockHand.forEach((model, index) => {
      const { x, y, animationDegree, handSize } = model;

      if (
        (clockwise && animationDegree < currentDegree) ||
        (!clockwise && animationDegree > currentDegree)
      ) {
        this.syncEndAngle(index);

        return;
      }

      const { x: x2, y: y2 } = getRadialPosition(
        x,
        y,
        handSize,
        calculateDegreeToRadian(getValidDegree(currentDegree))
      );
      this.drawModels.clockHand[index].x2 = x2;
      this.drawModels.clockHand[index].y2 = y2;
    });

    this.models.sector.forEach(() => {
      const index = this.models.sector.findIndex(({ animationDegree }) => {
        const { start, end } = animationDegree!;

        return withinRadian(clockwise, start, end, currentDegree);
      });

      this.syncSectorEndAngle(index < 0 ? this.models.sector.length : index);

      if (index !== -1) {
        this.drawModels.sector[index].degree.end = getValidDegree(currentDegree);
      }
    });
  }

  updateModels(current, target, delta: number) {
    const { totalAngle } = this.circularAxis;

    Object.keys(current).forEach((key) => {
      if (!current || !target) {
        return;
      }

      if (key[0] !== '_') {
        if (isNumber(current[key])) {
          current[key] = current[key] + (target[key] - current[key]) * delta;
        } else if (key === 'degree') {
          if (totalAngle < 360 && current.degree.end < 90) {
            current[key].end =
              360 + current[key].end - (360 - target[key].end + current[key].end) * delta;
          } else {
            current[key].end = current[key].end + (target[key].end - current[key].end) * delta;
          }
        } else {
          current[key] = target[key];
        }
      }
    });
  }

  update(delta: number) {
    this.models.clockHand.forEach((model, index) => {
      this.updateModels(this.drawModels.clockHand[index], model, delta);
    });

    this.models.sector.forEach((model, index) => {
      this.updateModels(this.drawModels.sector[index], model, delta);
    });
  }

  syncEndAngle(index: number) {
    if (
      this.models.clockHand[index].x2 !== this.drawModels.clockHand[index].x2 ||
      this.models.clockHand[index].y2 !== this.drawModels.clockHand[index].y2
    ) {
      this.drawModels.clockHand[index].x2 = this.models.clockHand[index].x2;
      this.drawModels.clockHand[index].y2 = this.models.clockHand[index].y2;
    }
  }

  syncSectorEndAngle(index: number) {
    if (index < 1) {
      return;
    }

    for (let i = 0; i < index; i += 1) {
      const prevTargetEndDegree = this.models.sector[i].degree.end;

      if (this.drawModels.sector[i].degree.end !== prevTargetEndDegree) {
        this.drawModels.sector[i].degree.end = prevTargetEndDegree;
      }
    }
  }

  render(chartState: ChartState<GaugeChartOptions>) {
    const { layout, series, legend, options, theme, scale, radialAxes } = chartState;
    const categories = (chartState.categories as string[]) ?? [];

    if (!series.gauge) {
      throw new Error(message.noDataError(this.name));
    }

    this.theme = theme.series.gauge as Required<GaugeChartSeriesTheme>;
    this.rect = layout.plot;
    this.circularAxis = radialAxes.circularAxis;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const seriesData = series.gauge.data as Required<GaugeSeriesType>[];
    const hasCategoryAxis = !isLabelAxisOnYAxis({ series, categories });

    const renderOptions = this.makeRenderOptions(
      hasCategoryAxis,
      categories,
      scale,
      options?.series
    );

    const clockHandModels = this.renderClockHands(seriesData, renderOptions);
    let sectorModels: SectorModel[] = [];
    this.models.clockHand = !renderOptions.solidData.clockHand ? [] : clockHandModels;

    if (renderOptions.solidData.visible) {
      sectorModels = this.renderSectors(seriesData, renderOptions);

      this.models.backgroundSector = this.renderBackgroundSector(renderOptions);
      this.models.sector = sectorModels;
    }

    const tooltipData = this.makeTooltipData(clockHandModels);

    if (!this.drawModels) {
      this.initDrawModels();
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      const { value, name, x, y, seriesData: data } = clockHandModels[0];

      this.renderDataLabels([
        {
          type: 'point',
          theme: this.theme.dataLabels,
          value,
          name,
          x,
          y: y + DATA_LABEL_MARGIN,
          data,
        },
      ]);
    }

    this.tooltipMap = this.makeTooltipMap(tooltipData, renderOptions);

    this.responders = this.getResponders(clockHandModels, sectorModels, tooltipData);
  }

  private initDrawModels() {
    const { startAngle } = this.circularAxis;

    this.drawModels = {
      clockHand: this.models.clockHand.map((m) => {
        const { x: x2, y: y2 } = getRadialPosition(
          m.x,
          m.y,
          m.handSize,
          calculateDegreeToRadian(startAngle)
        );

        return { ...m, x2, y2, testDegree: 0 };
      }),
      backgroundSector: this.models.backgroundSector,
      sector: this.models.sector.map((m) => ({
        ...m,
        degree: { ...m.degree, end: m.degree.start },
      })),
    };
  }

  private getResponders(
    clockHandModels: ClockHandModel[],
    sectorModels: SectorModel[],
    tooltipData: TooltipData[]
  ) {
    const clockHandResponders = !this.circularAxis.solidData!.clockHand
      ? []
      : clockHandModels.map((m, index) => ({
          ...m,
          detectionSize: m.baseLine + 3,
          data: { ...tooltipData[index] },
        }));

    return sectorModels.length
      ? [
          ...sectorModels.map((m, index) => ({
            ...m,
            data: { ...tooltipData[index] },
          })),
          ...clockHandResponders,
        ]
      : clockHandResponders;
  }

  private getHandSize(size: number[] | string[] | number | string, index = 0) {
    const maxClockHandSize = this.circularAxis.maxClockHandSize!;
    let handSize;

    if (size) {
      if (Array.isArray(size)) {
        handSize = calculateSizeWithPercentString(maxClockHandSize, size[index]);
      } else {
        handSize = calculateSizeWithPercentString(maxClockHandSize, size);
      }
    } else {
      handSize = maxClockHandSize;
    }

    return handSize;
  }

  private renderClockHands(
    seriesData: Required<GaugeSeriesType>[],
    renderOptions: RenderOptions
  ): ClockHandModel[] {
    const {
      centerX,
      centerY,
      totalAngle,
      clockwise,
      scaleMaxLimitValue,
      categories,
      drawingStartAngle,
    } = renderOptions;
    const seriesModels: ClockHandModel[] = [];
    const { size, baseLine, color: clockHandColor } = this.theme.clockHand as ClockHandTheme;
    const { radius, color: pinColor, borderWidth, borderColor } = this.theme.pin as PinTheme;

    seriesData.forEach(({ name, data, color }) => {
      const seriesColor = this.getSeriesColor(name, color);
      data.forEach((value, index) => {
        const val = isString(value)
          ? categories.findIndex((category) => category === value)
          : value;
        const degree =
          drawingStartAngle + (val / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
        const validDegree = getValidDegree(degree);
        const handSize = this.getHandSize(size, index);

        const { x: x2, y: y2 } = getRadialPosition(
          centerX,
          centerY,
          handSize,
          calculateDegreeToRadian(validDegree)
        );

        seriesModels.push({
          type: 'clockHand',
          color: clockHandColor ?? seriesColor,
          name,
          value,
          x: centerX,
          y: centerY,
          x2,
          y2,
          pin: {
            radius,
            color: pinColor ?? seriesColor,
            borderColor: borderColor ?? getRGBA(seriesColor, 0.1),
            borderWidth: borderWidth ? borderWidth + radius : 0,
          },
          degree: validDegree,
          animationDegree: degree,
          baseLine,
          handSize,
          seriesData: data,
          index,
        });
      });
    });

    return seriesModels;
  }

  private renderBackgroundSector(renderOptions: RenderOptions): SectorModel[] {
    const { centerX, centerY, startAngle, totalAngle, clockwise, solidData } = renderOptions;
    const { color } = this.theme.solid.backgroundSector!;

    return [
      {
        type: 'sector',
        color: color!,
        x: centerX,
        y: centerY,
        clockwise,
        degree: {
          start: startAngle,
          end: startAngle + totalAngle,
        },
        radius: solidData.radiusRange,
      },
    ];
  }

  private renderSectors(
    seriesData: Required<GaugeSeriesType>[],
    renderOptions: RenderOptions
  ): SectorModel[] {
    const sectors: SectorModel[] = [];

    const {
      centerX,
      centerY,
      clockwise,
      totalAngle,
      scaleMaxLimitValue,
      startAngle,
      categories,
      solidData,
    } = renderOptions;

    const { radiusRange } = solidData;
    const { lineWidth, strokeStyle } = this.theme.solid!;

    seriesData.forEach(({ name, data, color }, index) => {
      const seriesColor = this.getSeriesColor(name, color);
      const value = data[0];
      const val = isString(value) ? categories.findIndex((category) => category === value) : value;
      const degree = (val / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
      const validDegree = getValidDegree(degree);
      const startDegree = startAngle;
      const endDegree = startDegree + degree;
      const animationStartDegree = startAngle;
      const animationEndDegree = animationStartDegree + validDegree;

      sectors.push({
        type: 'sector',
        color: seriesColor,
        x: centerX,
        y: centerY,
        clockwise,
        degree: {
          start: startDegree,
          end: endDegree,
        },
        radius: radiusRange,
        animationDegree: {
          start: animationStartDegree,
          end: animationEndDegree,
        },
        drawingStartAngle: DEGREE_NEGATIVE_90,
        style: [{ strokeStyle }],
        lineWidth,
        index,
      });
    });

    return sectors;
  }

  private makeTooltipMap(tooltipData: TooltipData[], renderOptions: RenderOptions): TooltipMap {
    const { clockHand, sector } = this.models;
    const {
      solidData: { clockHand: clockHandVisible },
    } = renderOptions;

    return tooltipData.reduce<TooltipMap>(
      (acc, data, index) => {
        if (clockHandVisible) {
          acc.clockHand.push({
            ...clockHand[index],
            detectionSize: clockHand[index].baseLine + 3,
            data,
          });
        }

        if (sector[index]) {
          acc.sector.push({
            ...sector[index],
            data,
          });
        }

        return acc;
      },
      { sector: [] as SectorResponderModel[], clockHand: [] as ClockHandResponderModel[] }
    );
  }

  private makeRenderOptions(
    hasCategoryAxis: boolean,
    categories: string[],
    scale: Scale,
    options?: GaugeSeriesOptions
  ): RenderOptions {
    const {
      centerX,
      centerY,
      startAngle,
      endAngle,
      drawingStartAngle,
      outerRadius,
      solidData,
    } = this.circularAxis;
    const clockwise = options?.clockwise ?? true;
    const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);

    return {
      clockwise,
      centerX,
      centerY,
      angleRange: { start: startAngle, end: endAngle },
      totalAngle,
      scaleMaxLimitValue: hasCategoryAxis
        ? categories.length
        : getScaleMaxLimitValue(scale.circularAxis!, totalAngle),
      startAngle,
      categories,
      drawingStartAngle,
      outerRadius,
      solidData: solidData!,
    };
  }

  getSeriesColor(name: string, color: string) {
    const { select, areaOpacity } = this.theme;
    const active = this.activeSeriesMap![name];
    const selected = Object.values(this.activeSeriesMap!).some((elem) => !elem);

    return selected
      ? getRGBA(color, active ? select.areaOpacity! : select.restSeries!.areaOpacity!)
      : getRGBA(color, areaOpacity);
  }

  makeTooltipData(seriesModels: ClockHandModel[]): TooltipData[] {
    const tooltipData: TooltipData[] = [];

    seriesModels.forEach(({ color, name, value }) => {
      if (!isNull(value)) {
        tooltipData.push({
          label: name!,
          color,
          value: value!,
        });
      }
    });

    return tooltipData;
  }

  makeTooltipResponder(responders: SectorResponderModel[]) {
    return responders.map((responder) => ({ ...responder }));
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getResponderModelsWithTheme(responders, 'hover'),
      name: this.name,
    });
    this.activatedResponders = this.makeTooltipResponder(responders);

    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  }

  getResponderModels(responders: GaugeResponderModel[]) {
    const { clockHand, sector } = this.tooltipMap;
    const models: GaugeResponderModel[] = [];

    responders.forEach((responder) => {
      const index = responder.index!;

      if (clockHand[index]) {
        models.push(clockHand[index]);
      }

      if (sector[index]) {
        models.push(sector[index]);
      }
    });

    return models;
  }

  onClick({ responders }) {
    if (this.selectable) {
      const models = this.getResponderModelsWithTheme(
        this.getResponderModels(responders),
        'select'
      );
      this.eventBus.emit('renderSelectedSeries', {
        models,
        name: this.name,
      });
      this.eventBus.emit('needDraw');
    }
  }

  getResponderModelsWithSolidTheme(responder: SectorResponderModel, type: RespondersThemeType) {
    const solidTheme = this.theme[type].solid!;
    const lineWidth = solidTheme.lineWidth!;
    const isSameLineWidth = this.theme.solid === lineWidth;
    const thickness = isSameLineWidth ? 0 : lineWidth * 0.5;

    return {
      ...responder,
      color: solidTheme.color ?? responder.color,
      lineWidth,
      style: [
        pick(
          solidTheme,
          'strokeStyle',
          'shadowBlur',
          'shadowColor',
          'shadowOffsetX',
          'shadowOffsetY'
        ),
      ],
      radius: {
        inner: Math.max(responder.radius.inner - thickness, 0),
        outer: responder.radius.outer + thickness,
      },
    };
  }

  getResponderWithClockHandTheme(responder: ClockHandResponderModel, type: RespondersThemeType) {
    const { clockHand, pin } = this.theme[type];
    const { size, baseLine, color: clockHandColor } = clockHand!;
    const { radius, color: pinColor, borderWidth, borderColor } = pin!;
    const pinRadius = radius ?? responder.pin.radius;

    return {
      ...responder,
      color: clockHandColor ?? responder.color,
      pin: {
        radius: pinRadius,
        color: pinColor ?? responder.pin.color,
        borderColor: borderColor ?? getRGBA(responder.pin.borderColor, 0.3),
        borderWidth: borderWidth ? borderWidth + pinRadius : 0,
      },
      baseLine: baseLine ?? responder.baseLine,
      handSize: size ? this.getHandSize(size, responder.index) : responder.handSize,
    };
  }

  getResponderModelsWithTheme(
    responders: (SectorResponderModel | ClockHandResponderModel)[],
    type: RespondersThemeType
  ) {
    return responders.map((m) =>
      m?.type === 'sector'
        ? this.getResponderModelsWithSolidTheme(m, type)
        : this.getResponderWithClockHandTheme(m, type)
    );
  }

  onMouseoutComponent = () => {
    this.eventBus.emit('seriesPointHovered', { models: [], name: this.name });
    this.eventBus.emit('renderHoveredSeries', { models: [], name: this.name });

    this.eventBus.emit('needDraw');
  };

  selectSeries = (info: SelectSeriesHandlerParams<GaugeChartOptions>) => {
    const { index } = info;

    if (!isNumber(index)) {
      return;
    }

    const model: GaugeResponderModel =
      this.tooltipMap.clockHand[index] ?? this.tooltipMap.sector[index];
    const models =
      this.getResponderModelsWithTheme(this.getResponderModels([model]), 'select') ?? [];

    if (!models.length) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    this.eventBus.emit('renderSelectedSeries', {
      models: models,
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  };

  showTooltip = (info: SelectSeriesInfo) => {
    const { index } = info;

    const models = this.getResponderModelsWithTheme([this.tooltipMap.clockHand[index!]], 'hover');

    if (!models.length) {
      return;
    }

    this.eventBus.emit('renderHoveredSeries', {
      models,
      name: this.name,
    });
    this.activatedResponders = models;

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  };
}
