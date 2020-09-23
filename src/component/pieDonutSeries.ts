import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, SectorResponderModel, PieDonutSeriesModels } from '@t/components/series';
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

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  drawingStartAngle: number;
  radiusRange: { inner: number; outer: number };
  angleRange: { start: number; end: number };
  totalAngle: number;
};

export default class PieDonutSeries extends Component {
  models!: PieDonutSeriesModels;

  drawModels!: PieDonutSeriesModels;

  responders!: SectorResponderModel[];

  activatedResponders: this['responders'] = [];

  pieAlias!: string[];

  initUpdate(delta: number) {
    if (!this.drawModels) {
      return;
    }

    let currentDegree: number;

    this.pieAlias.forEach((alias) => {
      this.models[alias].forEach(({ clockwise, totalAngle, degree: { start, end } }, index) => {
        currentDegree = clockwise ? totalAngle * delta : 360 - totalAngle * delta;

        if (withinRadian(clockwise, start, end, currentDegree)) {
          this.syncEndAngle(index, alias);

          this.drawModels[alias][index].degree.end = currentDegree!;
        }
      });
    });
  }

  syncEndAngle(index: number, alias: string) {
    for (let i = 0; i < index; i += 1) {
      const {
        degree: { end },
      } = this.models[alias][i];

      const prevTargetEndDegree = end;

      if (this.drawModels[alias][i].degree.end !== prevTargetEndDegree) {
        this.drawModels[alias][i].degree.end = prevTargetEndDegree;
      }
    }
  }

  initialize() {
    this.type = 'series';
    this.name = 'pieDonut';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, categories, options, nestedPieSeries } = chartState;

    if (!series.pieDonut) {
      throw new Error("There's no pie donut data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options);
    this.pieAlias = Object.keys(nestedPieSeries);

    const seriesModels = {};
    const tooltipDataModels = {};

    this.pieAlias.forEach((alias, pieIndex) => {
      const renderOptions = this.makeRenderOptions(options, alias);
      const { data } = nestedPieSeries[alias];

      seriesModels[alias] = this.renderPieModel(data, renderOptions, alias, pieIndex);
      tooltipDataModels[alias] = makePieTooltipData(data, categories?.[pieIndex]);

      if (getDataLabelsOptions(options, alias).visible) {
        this.renderDataLabels(seriesModels[alias], alias);
      }
    });

    this.models = { ...seriesModels, selectedSeries: [] };

    if (!this.drawModels) {
      const drawModels = {};

      this.pieAlias.forEach((alias) => {
        drawModels[alias] = this.models[alias].map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        }));
      });

      this.drawModels = { ...drawModels, selectedSeries: [] };
    }

    this.responders = this.makeResponderModels(seriesModels, tooltipDataModels);
  }

  makeResponderModels(
    seriesModels: Record<string, SectorModel[]>,
    tooltipDataModels: Record<string, TooltipData[]>
  ): SectorResponderModel[] {
    return this.pieAlias.flatMap((alias) =>
      seriesModels[alias].map((m, index) => ({
        ...m,
        radius: m.radius,
        style: ['hover'],
        seriesIndex: index,
        data: tooltipDataModels[alias][index],
      }))
    );
  }

  makeRenderOptions(options: PieChartOptions, alias: string): RenderOptions {
    const seriesOptions = options?.series?.[alias];
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
      seriesOptions?.radiusRange?.outer ?? defaultRadius
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

  getOpacity(rootParent: string, parent: string, pieIndex: number) {
    const active = this.activeSeriesMap![rootParent ?? name];
    const alpha = active ? 1 : 0.3;

    return pieIndex && parent ? Number((alpha * 0.8 ** pieIndex).toFixed(2)) : alpha;
  }

  renderPieModel(
    seriesRawData: PieSeriesType[],
    renderOptions: RenderOptions,
    alias: string,
    pieIndex: number
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

    seriesRawData.forEach(({ data, name, color: seriesColor, rootParent, parent }, seriesIndex) => {
      const opacity = this.getOpacity(rootParent!, parent!, pieIndex);
      const color = getRGBA(seriesColor!, opacity);
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
        style: ['nested'],
        clockwise,
        drawingStartAngle,
        totalAngle,
        alias,
      });
    });

    return sectorModels;
  }

  makeTooltipResponder(responders: SectorResponderModel[]) {
    return responders.map((responder) => {
      const { alias, seriesIndex } = responder;

      return {
        ...responder,
        ...getRadialAnchorPosition(
          makeAnchorPositionParam('center', this.models[alias!][seriesIndex])
        ),
      };
    });
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
