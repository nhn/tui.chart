import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, PieSeriesModels, SectorResponderModel } from '@t/components/series';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  withinRadian,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';

function hasClockwiseSemiCircle(renderOptions: RenderOptions) {
  const { clockwise, startAngle, endAngle } = renderOptions;

  return (
    clockwise && ((startAngle >= -90 && endAngle <= 90) || (startAngle >= 90 && endAngle <= 180))
  );
}

function hasAntiClockwiseSemiCircle(renderOptions: RenderOptions) {
  const { clockwise, startAngle, endAngle } = renderOptions;

  return (
    !clockwise && ((startAngle >= -180 && endAngle <= 90) || (startAngle <= 90 && endAngle >= -90))
  );
}

type RenderOptions = {
  radiusRange: [number, number] | null;
  startAngle: number;
  endAngle: number;
  clockwise: boolean;
};
export default class PieSeries extends Component {
  models: PieSeriesModels = { series: [] };

  drawModels!: PieSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  totalAngle = 360;

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    let currentDegree: number;

    const index = this.models.series.findIndex(({ clockwise, startDegree, endDegree }) => {
      currentDegree = clockwise ? this.totalAngle * delta : 360 - this.totalAngle * delta;

      return withinRadian(clockwise, startDegree, endDegree, currentDegree);
    });

    if (index < 0) {
      return;
    }

    if (index) {
      const prevTargetEndDegree = this.models.series[index - 1].endDegree;

      if (this.drawModels.series[index - 1].endDegree !== prevTargetEndDegree) {
        this.drawModels.series[index - 1].endDegree = prevTargetEndDegree;
      }
    }

    this.drawModels.series[index].endDegree = currentDegree!;
  }

  initialize() {
    this.type = 'series';
    this.name = 'pieSeries';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, dataLabels, categories, options } = chartState;

    if (!series.pie) {
      throw new Error("There's no pie data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);

    const pieData = series.pie?.data!;
    const renderOptions = {
      radiusRange: options.series?.radiusRange?.length === 2 ? options.series?.radiusRange : null,
      startAngle: options?.series?.startAngle ?? 0,
      endAngle: options?.series?.endAngle ?? 360,
      clockwise: options?.series?.clockwise ?? true,
    };

    this.totalAngle = this.getTotalAngle(renderOptions);

    const seriesModel = this.renderPieModel(pieData, renderOptions);
    const tooltipModel = this.makeTooltipModel(pieData, categories);

    this.models.series = seriesModel;

    if (!this.drawModels) {
      this.drawModels = {
        series: this.models.series.map((m) => ({ ...m, endDegree: m.startDegree })),
      };
    }

    if (dataLabels?.visible) {
      this.store.dispatch('appendDataLabels', seriesModel);
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

  renderPieModel(seriesRawData: PieSeriesType[], renderOptions: RenderOptions): SectorModel[] {
    const sectorModels: SectorModel[] = [];
    const total = seriesRawData.reduce((sum, { data }) => sum + data, 0);
    const { radiusRange, startAngle, clockwise } = renderOptions;
    const rangeStartAngle = startAngle - 90;
    const isSemiCircular = this.isSemiCircle(renderOptions);
    const { width, height } = this.rect;
    const radius = isSemiCircular ? this.getSemiCicleRadius() : Math.min(width, height) / 2;
    const innerRadius = radiusRange ? (radius * radiusRange[0]) / radiusRange[1] : 0;
    const cx = width / 2;
    const cy = isSemiCircular ? this.getSemiCircleCenterY(clockwise) : height / 2;
    let startDegree = clockwise ? 0 : 360;

    seriesRawData.forEach(({ data, name, color: seriesColor }, seriesIndex) => {
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor!, active ? 1 : 0.3);
      const degree = (data / total) * this.totalAngle;

      if (seriesIndex) {
        startDegree = sectorModels[seriesIndex - 1].endDegree;
      }

      const endDegree = clockwise ? startDegree + degree : startDegree - degree;

      sectorModels.push({
        type: 'sector',
        name,
        color,
        x: cx,
        y: cy,
        startDegree,
        endDegree,
        radius: radius * 0.9,
        innerRadius,
        value: data,
        style: ['default'],
        clockwise,
        rangeStartAngle,
      });
    });

    return sectorModels;
  }

  makeTooltipModel(seriesRawData: PieSeriesType[], categories?: string[]): TooltipData[] {
    return seriesRawData.map(({ data, name, color }) => ({
      label: name,
      color: color!,
      value: data,
      category: categories ? categories[0] : '',
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
    this.eventBus.emit('renderHoveredSeries', responders);
    this.activatedResponders = this.makeTooltipResponder(responders);

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }

  getTotalAngle(renderOptions: RenderOptions) {
    const { clockwise, startAngle, endAngle } = renderOptions;
    const totalAngle = Math.abs(endAngle - startAngle);

    return totalAngle !== 360 && !clockwise ? 360 - totalAngle : totalAngle;
  }

  isSemiCircle(renderOptions: RenderOptions) {
    return (
      this.totalAngle <= 180 &&
      (hasClockwiseSemiCircle(renderOptions) || hasAntiClockwiseSemiCircle(renderOptions))
    );
  }

  getSemiCicleRadius() {
    return this.rect.height * 0.9;
  }

  getSemiCircleCenterY(clockwise: boolean) {
    return clockwise ? this.rect.height * 0.9 : this.rect.height * 0.1;
  }
}
