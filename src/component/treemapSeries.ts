import Component from './component';
import { Rect, TreemapChartOptions } from '@t/options';
import { ChartState, TreemapSeriesData } from '@t/store/store';
import {
  TreemapRectModel,
  TreemapRectResponderModel,
  TreemapSeriesModels,
} from '@t/components/series';
import { BoundMap, squarify } from '@src/helpers/squarifier';
import { TREEMAP_ROOT_ID } from '@src/store/treemapSeriesData';
import { getRGBA } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getDeepestNode } from '@src/helpers/responders';
import { RectDataLabel, getDataLabelsOptions } from '@src/store/dataLabels';
import { BOX_HOVER_THICKNESS } from '@src/helpers/boxStyle';

export default class TreemapSeries extends Component {
  models: TreemapSeriesModels = { series: [], layer: [] };

  responders!: TreemapRectResponderModel[];

  activatedResponders: this['responders'] = [];

  depth = 0;

  initialize() {
    this.type = 'series';
    this.name = 'treemap';
  }

  render(chartState: ChartState<TreemapChartOptions>) {
    const { layout, treemapSeries, options } = chartState;

    if (!treemapSeries.length) {
      throw new Error("There's no tree map data");
    }

    this.rect = layout.plot;
    this.models = this.renderTreemapSeries(treemapSeries);

    if (getDataLabelsOptions(options, this.name).visible) {
      const useTreemapLeaf = options.series?.dataLabels?.useTreemapLeaf ?? false;
      const dataLabelModel = this.makeDataLabel(useTreemapLeaf);

      this.store.dispatch('appendDataLabels', { data: dataLabelModel, name: this.name });
    }

    this.responders = this.makeTreemapSeriesResponder();
  }

  makeTreemapSeriesResponder(): TreemapRectResponderModel[] {
    const tooltipData: TooltipData[] = this.makeTooltipData();

    return this.models.series.map<TreemapRectResponderModel>((m, idx) => ({
      ...m,
      data: tooltipData[idx],
      thickness: BOX_HOVER_THICKNESS,
      style: ['shadow'],
    }));
  }

  private makeTooltipData(): TooltipData[] {
    return this.models.series.map(({ label, data, color }) => ({
      label: label!,
      color,
      value: data as number,
    }));
  }

  makeBoundMap(
    series: TreemapSeriesData[],
    parentId: string,
    layout: Rect,
    boundMap: BoundMap = {}
  ) {
    const seriesItems = series.filter((item) => item.parentId === parentId);

    boundMap = { ...boundMap, ...squarify({ ...layout }, seriesItems) };

    seriesItems.forEach((seriesItem) => {
      boundMap = this.makeBoundMap(series, seriesItem.id, boundMap[seriesItem.id], boundMap);
    });

    return boundMap;
  }

  makeDataLabel(useTreemapLeaf: boolean): RectDataLabel[] {
    const series = useTreemapLeaf
      ? this.models.series.filter(({ hasChild }) => !hasChild)
      : this.models.series.filter(({ depth }) => depth === this.depth);

    return series.map((m) => ({
      ...m,
      type: 'treemapSeriesName',
      value: m.label,
      direction: 'left',
      plot: { x: 0, y: 0, size: 0 },
    }));
  }

  renderTreemapSeries(seriesData: TreemapSeriesData[]) {
    const boundMap = this.makeBoundMap(seriesData, TREEMAP_ROOT_ID, {
      ...this.rect,
      x: 0,
      y: 0,
    });

    const series: TreemapRectModel[] = Object.keys(boundMap).map((id) => ({
      ...seriesData.find((item) => item.id === id)!,
      ...boundMap[id],
      type: 'rect',
    }));

    const layer = series.map((m) => ({ ...m, color: getRGBA('#000000', m.opacity!) }));

    return { series, layer };
  }

  onMouseoutComponent() {
    this.emitMouseEvent([]);
  }

  onMousemove({ responders }) {
    const deepestNode = getDeepestNode(responders);
    this.activatedResponders = deepestNode;
    this.emitMouseEvent(deepestNode);
  }

  emitMouseEvent(responders: TreemapRectResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: responders,
      name: this.name,
    });
    this.eventBus.emit('seriesPointHovered', {
      models: responders,
      name: this.name,
    });
    this.eventBus.emit('needDraw');
  }
}