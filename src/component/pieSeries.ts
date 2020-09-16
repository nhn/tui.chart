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
import { TooltipData } from '@t/components/tooltip';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import {
  getTotalAngle,
  isSemiCircle,
  getRadius,
  getDefaultRadius,
  getSemiCircleCenterY,
  makePieTooltipData,
} from '@src/helpers/pieSeries';

export type RadiusRange = { inner: number; outer: number };

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  drawingStartAngle: number;
  radiusRange: { inner: number; outer: number };
  angleRange: { start: number; end: number };
  totalAngle: number;
};

export default class PieSeries extends Component {
  models: PieSeriesModels = { series: [], selectedSeries: [] };

  drawModels!: PieSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

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

  initialize() {
    this.type = 'series';
    this.name = 'pie';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, options } = chartState;
    const categories = (chartState.categories as string[]) ?? [];

    if (!series.pie) {
      throw new Error("There's no pie data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);

    const pieData = series.pie?.data! as PieSeriesType[];
    const renderOptions = this.makeRenderOptions(options);

    const seriesModel = this.renderPieModel(pieData, renderOptions);

    const tooltipModel = makePieTooltipData(pieData, categories?.[0]);

    this.models.series = seriesModel;

    if (!this.drawModels) {
      this.drawModels = {
        series: this.models.series.map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        })),
        selectedSeries: [],
      };
    }

    if (getDataLabelsOptions(options, this.name).visible) {
      this.renderDataLabels(seriesModel);
    }

    this.responders = seriesModel.map((m, index) => ({
      ...m,
      type: 'sector',
      radius: m.radius,
      style: ['hover'],
      seriesIndex: index,
      data: tooltipModel[index],
    }));
  }

  makeRenderOptions(options: PieChartOptions): RenderOptions {
    const clockwise = options?.series?.clockwise ?? true;
    const startAngle = options?.series?.angleRange?.start ?? 0;
    const endAngle = options?.series?.angleRange?.end ?? 360;
    const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    const isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
    const { width, height } = this.rect;
    const defaultRadius = getDefaultRadius(this.rect, isSemiCircular);
    const innerRadius = getRadius(defaultRadius, options.series?.radiusRange?.inner ?? 0);
    const outerRadius = getRadius(
      defaultRadius,
      options.series?.radiusRange?.outer ?? defaultRadius
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
    };
  }

  renderPieModel(seriesRawData: PieSeriesType[], renderOptions: RenderOptions): SectorModel[] {
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

    seriesRawData.forEach(({ data, name, color: seriesColor }, seriesIndex) => {
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor!, active ? 1 : 0.3);
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
        style: ['default'],
        clockwise,
        drawingStartAngle,
        totalAngle,
      });
    });

    return sectorModels;
  }

  makeTooltipModel(seriesRawData: PieSeriesType[], categories: string[]): TooltipData[] {
    return seriesRawData.map(({ data, name, color }) => ({
      label: name,
      color: color!,
      value: data,
      category: categories.length ? categories[0] : '',
    }));
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
    this.eventBus.emit('renderHoveredSeries', { models: responders, name: this.name });
    this.activatedResponders = this.makeTooltipResponder(responders);

    this.eventBus.emit('seriesPointHovered', { models: this.activatedResponders, name: this.name });
    this.eventBus.emit('needDraw');
  }

  onClick({ responders }) {
    if (this.selectable) {
      this.drawModels.selectedSeries = responders;

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
}
