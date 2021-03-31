import Component from './component';
import { Rect, TreemapChartOptions } from '@t/options';
import { ChartState, ScaleData, TreemapSeriesData } from '@t/store/store';
import {
  TreemapRectModel,
  TreemapRectResponderModel,
  TreemapSeriesModels,
} from '@t/components/series';
import { BoundMap, squarify } from '@src/helpers/squarifier';
import { getRGBA, hexToRGB } from '@src/helpers/color';
import { TooltipData } from '@t/components/tooltip';
import { getDeepestNode, RespondersThemeType } from '@src/helpers/responders';
import { getDataLabelsOptions } from '@src/helpers/dataLabels';
import { deepMergedCopy, first, isNumber, last } from '@src/helpers/utils';
import { getColorRatio, getSpectrumColor, makeDistances, RGB } from '@src/helpers/colorSpectrum';
import { RectDataLabel } from '@t/components/dataLabels';
import { TreemapChartSeriesTheme } from '@t/theme';
import { boxDefault } from '@src/helpers/theme';
import { SelectSeriesHandlerParams } from '@src/charts/chart';
import { message } from '@src/message';

export default class TreemapSeries extends Component {
  models: TreemapSeriesModels = { series: [], layer: [] };

  responders!: TreemapRectResponderModel[];

  theme!: Required<TreemapChartSeriesTheme>;

  activatedResponders: TreemapRectResponderModel[] = [];

  zoomable!: boolean;

  initialize() {
    this.type = 'series';
    this.name = 'treemap';
    this.eventBus.on('selectSeries', this.selectSeries);
    this.eventBus.on('showTooltip', this.showTooltip);
    this.eventBus.on('hideTooltip', this.onMouseoutComponent);
  }

  private getAllChildSeries(series: TreemapSeriesData[], parentId: string) {
    const allChildSeries: TreemapSeriesData[] = [];

    series.forEach((data) => {
      if (data.parentId === parentId) {
        allChildSeries.push(data);
        if (data.hasChild) {
          const res = this.getAllChildSeries(series, data.id);
          allChildSeries.push(...res);
        }
      }
    });

    return allChildSeries;
  }

  render(chartState: ChartState<TreemapChartOptions>) {
    const { layout, treemapSeries, colorValueScale, options, theme, treemapZoomId } = chartState;

    if (!treemapSeries) {
      throw new Error(message.noDataError(this.name));
    }

    const currentTreemapZoomId = treemapZoomId.cur;
    const series = this.getAllChildSeries(treemapSeries, currentTreemapZoomId);

    this.theme = theme.series.treemap as Required<TreemapChartSeriesTheme>;
    this.rect = layout.plot;
    this.selectable = this.getSelectableOption(options);
    this.models = this.renderTreemapSeries(series, options, colorValueScale, currentTreemapZoomId);
    this.zoomable = options.series?.zoomable ?? false;

    if (getDataLabelsOptions(options, this.name).visible) {
      const useTreemapLeaf = options.series?.dataLabels?.useTreemapLeaf ?? false;
      const dataLabelModel = this.makeDataLabel(useTreemapLeaf, currentTreemapZoomId);

      this.renderDataLabels(dataLabelModel);
    }

    this.responders = this.makeTreemapSeriesResponder(currentTreemapZoomId);
  }

  makeTreemapSeriesResponder(treemapCurrentDepthParentId: string): TreemapRectResponderModel[] {
    const tooltipData: TooltipData[] = this.makeTooltipData();
    let { series } = this.models;

    if (this.zoomable) {
      series = series.filter(({ parentId }) => parentId === treemapCurrentDepthParentId);
    }

    return series.map<TreemapRectResponderModel>((m, idx) => ({
      ...m,
      data: tooltipData[idx],
      thickness: boxDefault.HOVER_THICKNESS,
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

  makeDataLabel(useTreemapLeaf: boolean, treemapCurrentDepthParentId: string): RectDataLabel[] {
    const series = useTreemapLeaf
      ? this.models.series.filter(({ hasChild }) => !hasChild)
      : this.models.series.filter(({ parentId }) => parentId === treemapCurrentDepthParentId);
    const dataLabelTheme = this.theme.dataLabels;

    return series.map((m) => ({
      ...m,
      type: 'treemapSeriesName',
      value: m.label,
      direction: 'left',
      plot: { x: 0, y: 0, size: 0 },
      theme: {
        ...dataLabelTheme,
        color: dataLabelTheme.useSeriesColor ? m.color : dataLabelTheme.color,
      },
    }));
  }

  getColor(treemapSeries: TreemapSeriesData, colors: string[]) {
    const { indexes } = treemapSeries;
    const colorIdx = first<number>(indexes)!;

    return colors[colorIdx];
  }

  getOpacity(treemapSeries: TreemapSeriesData) {
    const { indexes, depth } = treemapSeries;
    const idx = last<number>(indexes)!;

    return indexes.length === 1 ? 0 : Number((0.1 * depth + 0.05 * idx).toFixed(2));
  }

  renderTreemapSeries(
    seriesData: TreemapSeriesData[],
    options: TreemapChartOptions,
    colorValueScale: ScaleData,
    treemapCurrentDepthParentId: string
  ) {
    let layer: TreemapRectModel[] = [];
    const boundMap = this.makeBoundMap(seriesData, treemapCurrentDepthParentId, {
      ...this.rect,
      x: 0,
      y: 0,
    });

    const { colors, startColor, endColor, borderWidth, borderColor } = this.theme;
    let startRGB, distances;
    const useColorValue = options.series?.useColorValue ?? false;
    if (useColorValue && startColor && endColor) {
      startRGB = hexToRGB(startColor) as RGB;
      distances = makeDistances(startRGB, hexToRGB(endColor) as RGB);
    }

    const series: TreemapRectModel[] = Object.keys(boundMap).map((id) => {
      const treemapSeries = seriesData.find((item) => item.id === id)!;
      let colorRatio;
      if (useColorValue) {
        colorRatio = getColorRatio(colorValueScale.limit, treemapSeries.colorValue);
      }

      return {
        ...treemapSeries,
        ...boundMap[id],
        type: 'rect',
        colorRatio,
        color: useColorValue
          ? getSpectrumColor(colorRatio, distances, startRGB)
          : this.getColor(treemapSeries, colors!),
        opacity: useColorValue ? 0 : this.getOpacity(treemapSeries),
        thickness: borderWidth,
        borderColor: borderColor,
      };
    });

    if (!options.series?.useColorValue) {
      layer = series.map((m) => ({ ...m, color: getRGBA('#000000', m.opacity!) }));
    }

    return { series, layer };
  }

  getRespondersWithTheme(responders: TreemapRectResponderModel[], type: RespondersThemeType) {
    return responders.map((responder) =>
      deepMergedCopy(responder, {
        ...this.theme[type],
        style: ['shadow'],
      })
    );
  }

  onClick({ responders }) {
    if (responders.length) {
      if (this.zoomable) {
        const { id, hasChild } = responders[0];

        if (hasChild) {
          this.emitMouseEvent([]);
          this.store.dispatch('setTreemapZoomId', id);
          this.eventBus.emit('resetSelectedSeries');
        } else if (this.selectable) {
          this.eventBus.emit('renderSelectedSeries', {
            models: this.getRespondersWithTheme(responders, 'select'),
            name: this.name,
          });
        }
      } else if (this.selectable) {
        const deepestNode = getDeepestNode(responders);

        this.eventBus.emit('renderSelectedSeries', {
          models: this.getRespondersWithTheme(deepestNode, 'select'),
          name: this.name,
        });
      }
    }
  }

  onMouseoutComponent = () => {
    this.emitMouseEvent([]);
  };

  onMousemove({ responders }) {
    const deepestNode = getDeepestNode(responders);
    this.activatedResponders = deepestNode;
    this.emitMouseEvent(deepestNode);
  }

  emitMouseEvent(responders: TreemapRectResponderModel[]) {
    this.eventBus.emit('renderHoveredSeries', {
      models: this.getRespondersWithTheme(responders, 'hover'),
      name: this.name,
    });
    this.eventBus.emit('seriesPointHovered', {
      models: responders,
      name: this.name,
    });
    this.eventBus.emit('renderSpectrumTooltip', responders);
    this.eventBus.emit('needDraw');
  }

  selectSeries = ({ seriesIndex }: SelectSeriesHandlerParams<TreemapChartOptions>) => {
    if (!isNumber(seriesIndex)) {
      return;
    }

    const model = this.responders.find(({ indexes }) => last(indexes) === seriesIndex);

    if (!model) {
      throw new Error(message.SELECT_SERIES_API_INDEX_ERROR);
    }

    const models = this.getRespondersWithTheme([model], 'select');

    this.eventBus.emit('renderSelectedSeries', { models, name: this.name });
    this.eventBus.emit('needDraw');
  };

  showTooltip = ({ seriesIndex }: SelectSeriesHandlerParams<TreemapChartOptions>) => {
    if (!isNumber(seriesIndex)) {
      return;
    }

    const model = this.responders.find(({ indexes }) => last(indexes) === seriesIndex);

    if (model) {
      this.emitMouseEvent([model]);
    }
  };
}
