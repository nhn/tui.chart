import Component from './component';
import {
  SectorModel,
  SectorResponderModel,
  GaugeSeriesModels,
  ClockHandModel,
  GaugeResponderModel,
  ClockHandResponderModel,
  CircleStyle,
} from '@t/components/series';
import { GaugeChartSeriesTheme, ClockHandSizeTheme } from '@t/theme';
import {
  isNumber,
  pick,
  isNull,
  isString,
  calculateSizeWithPercentString,
} from '@src/helpers/utils';
import { message } from '@src/message';
import { ChartState, CircularAxisData, Scale, SolidData } from '@t/store/store';
import { GaugeChartOptions, GaugeSeriesType, GaugeSeriesOptions } from '@t/options';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { RespondersThemeType } from '@src/helpers/responders';
import {
  getRadialPosition,
  calculateDegreeToRadian,
  calculateValidAngle,
  withinRadian,
  DEGREE_NEGATIVE_90,
  DEGREE_360,
  DEGREE_90,
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
  useClockHand: boolean;
};

type TooltipMap = {
  solid: SectorResponderModel[];
  clockHand: ClockHandResponderModel[];
};

const DETECTION_SIZE_MARGIN = 3;

export default class GaugeSeries extends Component {
  models: GaugeSeriesModels = { clockHand: [], solid: [], backgroundSolid: [] };

  drawModels!: GaugeSeriesModels;

  responders!: GaugeResponderModel[];

  activatedResponders: GaugeResponderModel[] = [];

  tooltipMap!: TooltipMap;

  theme!: Required<GaugeChartSeriesTheme>;

  circularAxis!: CircularAxisData;

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

    const {
      angle: { start: startAngle, total: totalAngle },
      clockwise,
    } = this.circularAxis;
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
        calculateDegreeToRadian(calculateValidAngle(currentDegree))
      );
      this.drawModels.clockHand[index].x2 = x2;
      this.drawModels.clockHand[index].y2 = y2;
    });

    this.models.solid.forEach(() => {
      const index = this.models.solid.findIndex(({ animationDegree }) => {
        const { start, end } = animationDegree!;

        return withinRadian(clockwise, start, end, currentDegree);
      });

      this.syncSectorEndAngle(index < 0 ? this.models.solid.length : index);

      if (index !== -1) {
        this.drawModels.solid[index].degree.end = calculateValidAngle(currentDegree);
      }
    });
  }

  updateModels(current, target, delta: number) {
    const {
      angle: { total },
    } = this.circularAxis;

    Object.keys(current).forEach((key) => {
      if (!current || !target) {
        return;
      }

      if (key[0] !== '_') {
        if (isNumber(current[key])) {
          current[key] = current[key] + (target[key] - current[key]) * delta;
        } else if (key === 'degree') {
          if (total < DEGREE_360 && current.degree.end < DEGREE_90) {
            current[key].end =
              DEGREE_360 +
              current[key].end -
              (DEGREE_360 - target[key].end + current[key].end) * delta;
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

    this.models.solid.forEach((model, index) => {
      this.updateModels(this.drawModels.solid[index], model, delta);
    });
  }

  syncEndAngle(index: number) {
    const model = this.models.clockHand[index];
    const drawModel = this.drawModels.clockHand[index];

    if (model.x2 !== drawModel.x2 || model.y2 !== drawModel.y2) {
      drawModel.x2 = model.x2;
      drawModel.y2 = model.y2;
    }
  }

  syncSectorEndAngle(index: number) {
    if (!index) {
      return;
    }

    for (let i = 0; i < index; i += 1) {
      const prevTargetEndDegree = this.models.solid[i].degree.end;

      if (this.drawModels.solid[i].degree.end !== prevTargetEndDegree) {
        this.drawModels.solid[i].degree.end = prevTargetEndDegree;
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
    this.models.clockHand = renderOptions.useClockHand ? clockHandModels : [];

    const solidModels: SectorModel[] = this.renderSolidModels(
      seriesData,
      clockHandModels,
      renderOptions
    );

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

    this.responders = this.getResponders(
      clockHandModels,
      solidModels,
      tooltipData,
      renderOptions.useClockHand
    );
  }

  private renderSolidModels(
    seriesData: Required<GaugeSeriesType>[],
    clockHandModels: ClockHandModel[],
    renderOptions: RenderOptions
  ) {
    let solidModels: SectorModel[] = [];
    this.models.clockHand = renderOptions.useClockHand ? clockHandModels : [];

    if (renderOptions.solidData.visible) {
      solidModels = this.renderSectors(seriesData, renderOptions);

      this.models.backgroundSolid = this.renderBackgroundSolid(renderOptions);
      this.models.solid = solidModels;
    }

    return solidModels;
  }

  private initDrawModels() {
    const {
      angle: { start },
    } = this.circularAxis;

    this.drawModels = {
      clockHand: this.models.clockHand.map((m) => {
        const { x: x2, y: y2 } = getRadialPosition(
          m.x,
          m.y,
          m.handSize,
          calculateDegreeToRadian(start)
        );

        return { ...m, x2, y2, testDegree: 0 };
      }),
      backgroundSolid: this.models.backgroundSolid,
      solid: this.models.solid.map((m) => ({
        ...m,
        degree: { ...m.degree, end: m.degree.start },
      })),
    };
  }

  private getResponders(
    clockHandModels: ClockHandModel[],
    sectorModels: SectorModel[],
    tooltipData: TooltipData[],
    useClockHand = true
  ) {
    const clockHandResponders = !useClockHand
      ? []
      : clockHandModels.map((m, index) => ({
          ...m,
          detectionSize: m.baseLine + DETECTION_SIZE_MARGIN,
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

  private getHandSize(size: ClockHandSizeTheme, index = 0) {
    const maxClockHandSize = this.circularAxis.maxClockHandSize!;

    if (size) {
      return Array.isArray(size)
        ? calculateSizeWithPercentString(maxClockHandSize, size[index])
        : calculateSizeWithPercentString(maxClockHandSize, size);
    }

    return maxClockHandSize;
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
    const { size, baseLine, color: clockHandColor } = this.theme.clockHand;
    const { radius, color: pinColor, borderWidth, borderColor } = this.theme.pin;

    seriesData.forEach(({ name, data, color }, seriesIndex) => {
      const seriesColor = this.getSeriesColor(name, color);
      data.forEach((value, index) => {
        const val = isString(value)
          ? categories.findIndex((category) => category === value)
          : value;
        const degree =
          drawingStartAngle + (val / scaleMaxLimitValue) * totalAngle * (clockwise ? 1 : -1);
        const validDegree = calculateValidAngle(degree);
        const handSize = this.getHandSize(size!, index);

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
            radius: radius!,
            color: pinColor ?? seriesColor,
            style: [
              {
                strokeStyle: borderColor ?? getRGBA(seriesColor, 0.1),
                lineWidth: borderWidth ? borderWidth + radius! : 0,
              },
            ],
          },
          degree: validDegree,
          animationDegree: degree,
          baseLine: baseLine!,
          handSize,
          seriesData: data,
          index,
          seriesIndex,
        });
      });
    });

    return seriesModels;
  }

  private renderBackgroundSolid(renderOptions: RenderOptions): SectorModel[] {
    const { centerX, centerY, startAngle, totalAngle, clockwise, solidData } = renderOptions;
    const { color } = this.theme.solid.backgroundSolid!;

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
      const validDegree = calculateValidAngle(degree);
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
    const { clockHand, solid } = this.models;
    const { useClockHand } = renderOptions;

    return tooltipData.reduce<TooltipMap>(
      (acc, data, index) => {
        if (useClockHand) {
          acc.clockHand.push({
            ...clockHand[index],
            detectionSize: clockHand[index].baseLine + 3,
            data,
          });
        }

        if (solid[index]) {
          acc.solid.push({
            ...solid[index],
            data,
          });
        }

        return acc;
      },
      { solid: [] as SectorResponderModel[], clockHand: [] as ClockHandResponderModel[] }
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
      solidData,
      angle: { start, end, drawingStart },
      radius: { outer },
    } = this.circularAxis;
    const solid = this.circularAxis.solidData!;
    const clockwise = options?.clockwise ?? true;
    const totalAngle = getTotalAngle(clockwise, start, end);

    return {
      clockwise,
      centerX,
      centerY,
      angleRange: { start, end },
      totalAngle,
      scaleMaxLimitValue: hasCategoryAxis
        ? categories.length
        : getScaleMaxLimitValue(scale.circularAxis!, totalAngle),
      startAngle: start,
      categories,
      drawingStartAngle: drawingStart,
      outerRadius: outer,
      useClockHand: solid.visible ? solid.clockHand : true,
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
    return seriesModels.reduce<TooltipData[]>(
      (acc, { color, name, value, index, seriesIndex }) =>
        isNull(value) ? acc : [...acc, { label: name!, color, value: value!, index, seriesIndex }],
      []
    );
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getResponderModelsWithTheme(this.getResponderModels(responders), 'hover'),
      name: this.name,
    });
    this.activatedResponders = responders.map((responder) => ({ ...responder }));

    this.eventBus.emit('seriesPointHovered', {
      models: this.activatedResponders,
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  }

  getResponderModels(responders: GaugeResponderModel[]) {
    const { clockHand, solid } = this.tooltipMap;

    return responders.reduce<GaugeResponderModel[]>((acc, responder) => {
      const index = responder.index!;
      const clockHandModel = clockHand[index] ? [clockHand[index]] : [];
      const solidModel = solid[index] ? [solid[index]] : [];

      return [...acc, ...clockHandModel, ...solidModel];
    }, []);
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
    const pinStyle = [
      {
        strokeStyle:
          borderColor ?? getRGBA((responder.pin.style[0] as CircleStyle).strokeStyle!, 0.3),
        lineWidth: borderWidth ? borderWidth + pinRadius : 0,
      },
    ];

    return {
      ...responder,
      color: clockHandColor ?? responder.color,
      pin: {
        radius: pinRadius,
        color: pinColor ?? responder.pin.color,
        style: pinStyle,
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
      this.tooltipMap.clockHand[index] ?? this.tooltipMap.solid[index];

    if (!model) {
      return;
    }
    const models = this.getResponderModelsWithTheme(this.getResponderModels([model]), 'select');

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
