import { Series, StoreModule, TreemapSeriesData } from '@t/store/store';
import { extend } from '@src/store/store';
import { TreemapSeriesType } from '@t/options';
import { last } from '@src/helpers/utils';

const TREEMAP_ID_PREFIX = '__TOAST_UI_TREEMAP';
export const TREEMAP_ROOT_ID = `${TREEMAP_ID_PREFIX}_ROOT`;

function makeTreeModel(
  series: TreemapSeriesType,
  indexes: number[],
  depth: number,
  parentId?: string
) {
  const idx = last(indexes);
  const id = parentId ? `${parentId}_${idx}` : `${TREEMAP_ID_PREFIX}_${idx}`;
  const { colorValue } = series;

  const models = [
    {
      label: series.label,
      hasChild: !!series.children,
      id,
      indexes,
      parentId: parentId ? parentId : TREEMAP_ROOT_ID,
      depth,
      data: series.data ?? 0,
      colorValue,
    },
  ] as TreemapSeriesData[];

  if (series.children) {
    series.children.forEach((child, childIdx) => {
      models.push(...makeTreeModel(child, [...indexes, childIdx], depth + 1, id));
    });
  }

  return models;
}

function fillData(treemapSeries: TreemapSeriesData[]) {
  treemapSeries.forEach(({ parentId, data }) => {
    if (parentId !== TREEMAP_ROOT_ID) {
      treemapSeries.find(({ id }) => id === parentId)!.data += data;
    }
  });
}

function fillRatio(treemapSeries: TreemapSeriesData[]) {
  const rootTotal = treemapSeries
    .filter(({ parentId }) => parentId === TREEMAP_ROOT_ID)
    .reduce((acc, { data }) => acc + data, 0);

  treemapSeries.forEach((series) => {
    const total =
      series.parentId === TREEMAP_ROOT_ID
        ? rootTotal
        : treemapSeries.find(({ id }) => id === series.parentId)!.data;

    series.ratio = series.data / total;
  });
}

function makeTreemapSeries(series: Series) {
  if (!series.treemap) {
    return [];
  }

  const treemapSeries = series.treemap.data
    .map((data, idx) => makeTreeModel(data, [idx], 0))
    .flatMap((s) => s)
    .sort((a, b) => b.depth - a.depth);

  fillData(treemapSeries);
  fillRatio(treemapSeries);

  return treemapSeries;
}

const treemapSeriesData: StoreModule = {
  name: 'treemapSeriesData',
  state: () => ({
    treemapSeries: [],
  }),
  action: {
    setTreemapSeriesData({ state }) {
      extend(state.treemapSeries, makeTreemapSeries(state.series));
    },
  },
  observe: {
    updateTreemapSeriesData() {
      this.dispatch('setTreemapSeriesData');
    },
  },
};

export default treemapSeriesData;
