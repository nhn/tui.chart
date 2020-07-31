import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, PieSeriesModels, SectorResponderModel } from '@t/components/series';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { pick } from '@src/helpers/utils';
import { getRadialAnchorPosition } from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';

type RenderOptions = {
  radiusRange: [number, number] | null;
  startAngle: number;
  endAngle: number;
};
export default class PieSeries extends Component {
  models: PieSeriesModels = { series: [] };

  drawModels!: PieSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    const currentDegree = 360 * delta;
    const index = this.models.series.findIndex(
      ({ startDegree, endDegree }) => startDegree <= currentDegree && endDegree >= currentDegree
    );

    if (index < 0) {
      return;
    }

    if (index) {
      const targetEndDegree = this.models.series[index - 1].endDegree;

      if (this.drawModels.series[index - 1].endDegree !== targetEndDegree) {
        this.drawModels.series[index - 1].endDegree = targetEndDegree;
      }
    }

    this.drawModels.series[index].endDegree = currentDegree;
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

    const seriesModel = this.renderPieModel(pieData, {
      radiusRange: options.series?.radiusRange?.length === 2 ? options.series?.radiusRange : null,
      startAngle: options?.series?.startAngle ?? 0,
      endAngle: options?.series?.endAngle ?? 360,
    });
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
    const { radiusRange, startAngle, endAngle } = renderOptions;
    const { width, height } = this.rect;
    const radius = Math.min(width, height) / 2;
    const innerRadius = radiusRange ? (radius * radiusRange[0]) / radiusRange[1] : 0;

    seriesRawData.forEach(({ data, name, color: seriesColor }, seriesIndex) => {
      const active = this.activeSeriesMap![name];
      const color = getRGBA(seriesColor!, active ? 1 : 0.3);
      const degree = (data / total) * endAngle;
      const startDegree = seriesIndex ? sectorModels[seriesIndex - 1].endDegree : startAngle;

      sectorModels.push({
        type: 'sector',
        name,
        color,
        x: width / 2,
        y: height / 2,
        startDegree: startDegree,
        endDegree: startDegree + degree,
        radius: radius * 0.9,
        innerRadius,
        value: data,
        style: ['default'],
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
      ...getRadialAnchorPosition({
        anchor: 'center',
        ...pick(
          this.models.series[responder.seriesIndex],
          'x',
          'y',
          'radius',
          'innerRadius',
          'startDegree',
          'endDegree'
        ),
      }),
    }));
  }

  onMousemove({ responders }) {
    this.eventBus.emit('renderHoveredSeries', responders);
    this.activatedResponders = this.makeTooltipResponder(responders);

    this.eventBus.emit('seriesPointHovered', this.activatedResponders);
    this.eventBus.emit('needDraw');
  }
}
