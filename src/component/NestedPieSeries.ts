import Component from './component';
import { PieChartOptions, PieSeriesType } from '@t/options';
import { ChartState } from '@t/store/store';
import { SectorModel, SectorResponderModel, NestedPieSeriesModels } from '@t/components/series';
import { getRGBA, getColorSpectrumBrightnessAlpha } from '@src/helpers/color';
import {
  getRadialAnchorPosition,
  makeAnchorPositionParam,
  withinRadian,
} from '@src/helpers/sector';
import { getActiveSeriesMap } from '@src/helpers/legend';
import { TooltipData, RadiusRange } from '@t/components/tooltip';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import {
  getTotalAngle,
  isSemiCircle,
  getRadius,
  getDefaultRadius,
  getSemiCircleCenterY,
  makePieTooltipData,
} from '@src/helpers/pieSeries';
import { deepCopy } from '@src/helpers/utils';

type RenderOptions = {
  clockwise: boolean;
  cx: number;
  cy: number;
  drawingStartAngle: number;
  radiusRange: { inner: number; outer: number };
  angleRange: { start: number; end: number };
  totalAngle: number;
  defaultRadius: number;
};

type RadiusRangeOption = {
  inner?: number | string;
  outer?: number | string;
};

type RadiusRangeMap = Record<string, RadiusRangeOption>;
type RenderOptionsMap = Record<string, RenderOptions>;

export default class NestedPieSeries extends Component {
  models!: NestedPieSeriesModels;

  drawModels!: NestedPieSeriesModels;

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
    this.name = 'nestedPie';
  }

  render(chartState: ChartState<PieChartOptions>) {
    const { layout, series, legend, categories, options, nestedPieSeries } = chartState;

    if (!series.nestedPie) {
      throw new Error("There's no pie donut data");
    }

    this.rect = layout.plot;
    this.activeSeriesMap = getActiveSeriesMap(legend);
    this.selectable = this.getSelectableOption(options); // @TODO: Nested Pie Series 개선되면서 각각의 옵션 적용가능 하도록 수정
    this.pieAlias = Object.keys(nestedPieSeries);

    const seriesModels = {} as NestedPieSeriesModels;
    const tooltipDataModels = {};

    const radiusRangeMap = this.getRadiusRangeMap(options);
    const renderOptionsMap = this.getRenderOptionsMap(options);
    const radiusRanges = Object.values(renderOptionsMap).map(({ radiusRange }) => radiusRange);

    this.pieAlias.forEach((alias, pieIndex) => {
      const { data } = nestedPieSeries[alias];
      const renderOptions = this.getCalculatedRadiusRangeRenderOptions(
        alias,
        renderOptionsMap[alias],
        radiusRangeMap,
        pieIndex,
        radiusRanges
      );

      seriesModels[alias] = this.renderPieModel(data, renderOptions, alias, pieIndex);
      tooltipDataModels[alias] = makePieTooltipData(data, categories?.[pieIndex]);

      if (getDataLabelsOptions(options, alias).visible) {
        this.renderDataLabels(seriesModels[alias], alias);
      }
    });

    this.models = seriesModels;

    if (!this.drawModels) {
      const drawModels = {} as NestedPieSeriesModels;

      this.pieAlias.forEach((alias) => {
        drawModels[alias] = this.models[alias].map((m) => ({
          ...m,
          degree: { ...m.degree, end: m.degree.start },
        }));
      });

      this.drawModels = deepCopy(drawModels);
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
        color: getRGBA(m.color, 1),
      }))
    );
  }

  private getCalculatedRadiusRangeRenderOptions(
    alias: string,
    renderOptions: RenderOptions,
    radiusRangeMap: RadiusRangeMap,
    pieIndex: number,
    radiusRanges: RadiusRange[]
  ) {
    const pieAliasLength = this.pieAlias.length;
    const radiusRangeLength = Object.keys(radiusRangeMap).length;
    const { defaultRadius } = renderOptions;

    if (!radiusRangeMap[alias]) {
      if (!radiusRangeLength) {
        const radius = defaultRadius / pieAliasLength;

        renderOptions.radiusRange.inner = pieIndex * radius;
        renderOptions.radiusRange.outer = (pieIndex + 1) * radius;
      } else {
        if (pieIndex && radiusRanges[pieIndex - 1].outer) {
          renderOptions.radiusRange.inner = radiusRanges[pieIndex - 1].outer;
        }

        if (radiusRanges[pieIndex + 1]?.inner) {
          renderOptions.radiusRange.outer = radiusRanges[pieIndex + 1].inner;
        } else if (pieIndex === pieAliasLength - 1) {
          renderOptions.radiusRange.outer = defaultRadius;
        } else {
          const radius =
            (defaultRadius -
              (radiusRanges[pieIndex - 1]?.outer ?? 0) -
              (radiusRanges[pieIndex + 1]?.inner ?? 0)) /
            (pieAliasLength - radiusRangeLength);

          renderOptions.radiusRange.outer = renderOptions.radiusRange.inner + radius;
        }
      }
    }

    return renderOptions;
  }

  private getOptions(chartOptions: PieChartOptions, alias?: string) {
    const options = { ...chartOptions };

    if (options?.series && alias) {
      options.series = {
        ...options.series,
        ...options.series[alias],
      };
    }

    return options;
  }

  private getRadiusRangeMap(options: PieChartOptions) {
    return this.pieAlias.reduce<RadiusRangeMap>((acc, alias) => {
      const seriesOptions = this.getOptions(options, alias).series;

      if (seriesOptions?.radiusRange) {
        acc[alias] = seriesOptions?.radiusRange;
      }

      return acc;
    }, {} as RadiusRangeMap);
  }

  private getRenderOptionsMap(options: PieChartOptions) {
    return this.pieAlias.reduce<RenderOptionsMap>((acc, alias) => {
      acc[alias] = this.makeRenderOptions(options, alias);

      return acc;
    }, {} as RenderOptionsMap);
  }

  makeRenderOptions(options: PieChartOptions, alias: string): RenderOptions {
    const seriesOptions = this.getOptions(options, alias).series;
    const clockwise = seriesOptions?.clockwise ?? true;
    const startAngle = seriesOptions?.angleRange?.start ?? 0;
    const endAngle = seriesOptions?.angleRange?.end ?? 360;
    const totalAngle = getTotalAngle(clockwise, startAngle, endAngle);
    const isSemiCircular = isSemiCircle(clockwise, startAngle, endAngle);
    const { width, height } = this.rect;
    const defaultRadius = getDefaultRadius(this.rect, isSemiCircular);

    const innerRadius = getRadius(defaultRadius, seriesOptions?.radiusRange?.inner ?? 0);
    const outerRadius = getRadius(defaultRadius, seriesOptions?.radiusRange?.outer ?? 0);

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

  getOpacity(rootParentName: string, parentName: string, pieIndex: number, indexOfGroup: number) {
    const active = this.activeSeriesMap![rootParentName ?? name];
    const alpha = active ? 1 : 0.3;

    return pieIndex && parentName
      ? getColorSpectrumBrightnessAlpha(alpha, pieIndex, indexOfGroup)
      : alpha;
  }

  getIndexOfGroup(seriesRawData: PieSeriesType[], parentName: string, name: string) {
    return seriesRawData
      .filter((datum) => parentName === datum.parentName)
      .findIndex((datum) => name === datum.name);
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

    seriesRawData.forEach(
      ({ data, name, color: seriesColor, rootParentName, parentName }, dataIndex) => {
        const indexOfGroup = this.getIndexOfGroup(seriesRawData, parentName!, name);
        const opacity = this.getOpacity(rootParentName!, parentName!, pieIndex, indexOfGroup);
        const color = getRGBA(seriesColor!, opacity);
        const degree = (data / total) * totalAngle * (clockwise ? 1 : -1);
        const startDegree = dataIndex ? sectorModels[dataIndex - 1].degree.end : defaultStartDegree;
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
      }
    );

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
      this.eventBus.emit('renderSelectedSeries', { models: responders, name: this.name });
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
