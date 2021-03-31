import { StoreModule, ValueOf, ChartOptionsMap } from '@t/store/store';
import {
  LineChartOptions,
  AreaChartOptions,
  PlotLine,
  PlotBand,
  PlotRangeType,
  RangeDataType,
} from '@t/options';
import { extend } from './store';
import { rgba } from '@src/helpers/color';
import { isRangeValue } from '@src/helpers/range';
import { isString } from '@src/helpers/utils';
import { isExistPlotId } from '@src/helpers/plot';

type UsingVisiblePlotOptions = ValueOf<
  Omit<
    ChartOptionsMap,
    'radar' | 'pie' | 'treemap' | 'heatmap' | 'nestedPie' | 'radialBar' | 'gauge'
  >
>;

type UsingPlotLineBandOptions = ValueOf<
  Pick<ChartOptionsMap, 'area' | 'line' | 'lineArea' | 'columnLine'>
>;

function getOverlappingRange(ranges: PlotBand[]) {
  const overlappingRanges = ranges.reduce<RangeDataType<number>>(
    (acc, { range }) => {
      const [accStart, accEnd] = acc;
      const [start, end] = range as RangeDataType<number>;

      return [Math.min(accStart, start), Math.max(accEnd, end)];
    },
    [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  );

  return {
    range: overlappingRanges,
    color: ranges[0].color,
  };
}

function getCategoryIndex(value: string, categories: string[]) {
  return categories.findIndex((category) => category === String(value));
}

function getValidValue(value: string | number, categories: string[], isDateType = false): number {
  if (isDateType) {
    return Number(new Date(value));
  }

  if (isString(value)) {
    return getCategoryIndex(value, categories);
  }

  return value;
}

function makePlotLines(categories: string[], isDateType: boolean, plotLines: PlotLine[] = []) {
  return plotLines.map(({ value, color, opacity }) => ({
    value: getValidValue(value, categories, isDateType),
    color: rgba(color, opacity),
  }));
}

function makePlotBands(categories: string[], isDateType: boolean, plotBands: PlotBand[] = []) {
  return plotBands.flatMap(({ range, mergeOverlappingRanges = false, color: bgColor, opacity }) => {
    const color = rgba(bgColor, opacity);
    const rangeArray = (isRangeValue(range[0]) ? range : [range]) as PlotRangeType[];
    const ranges: PlotBand[] = rangeArray.map((rangeData) => ({
      range: rangeData.map((value) =>
        getValidValue(value, categories, isDateType)
      ) as RangeDataType<number>,
      color,
    }));

    return mergeOverlappingRanges ? getOverlappingRange(ranges) : ranges;
  });
}

const plot: StoreModule = {
  name: 'plot',
  state: ({ options }) => ({
    plot: {
      visible: (options as UsingVisiblePlotOptions)?.plot?.visible ?? true,
      lines: [],
      bands: [],
    },
  }),
  action: {
    setPlot({ state }) {
      const { series, options } = state;

      if (!(series.area || series.line)) {
        return;
      }

      const rawCategories = state.rawCategories as string[];
      const lineAreaOptions = options as LineChartOptions | AreaChartOptions;

      const lines: PlotLine[] = makePlotLines(
        rawCategories,
        !!options?.xAxis?.date,
        lineAreaOptions?.plot?.lines
      );

      const bands: PlotBand[] = makePlotBands(
        rawCategories,
        !!options?.xAxis?.date,
        lineAreaOptions?.plot?.bands
      );

      extend(state.plot, { lines, bands });
    },
    addPlotLine({ state }, { data }: { data: PlotLine }) {
      const lines = (state.options as UsingPlotLineBandOptions)?.plot?.lines ?? [];
      if (!isExistPlotId(lines, data)) {
        this.dispatch('updateOptions', { options: { plot: { lines: [...lines, data] } } });
      }
    },
    addPlotBand({ state }, { data }: { data: PlotBand }) {
      const bands = (state.options as UsingPlotLineBandOptions)?.plot?.bands ?? [];
      if (!isExistPlotId(bands, data)) {
        this.dispatch('updateOptions', { options: { plot: { bands: [...bands, data] } } });
      }
    },
    removePlotLine({ state }, { id }: { id: string }) {
      const lines = ((state.options as UsingPlotLineBandOptions)?.plot?.lines ?? []).filter(
        ({ id: lineId }) => lineId !== id
      );
      this.dispatch('updateOptions', { options: { plot: { lines } } });
    },
    removePlotBand({ state }, { id }: { id: string }) {
      const bands = ((state.options as UsingPlotLineBandOptions)?.plot?.bands ?? []).filter(
        ({ id: bandId }) => bandId !== id
      );
      this.dispatch('updateOptions', { options: { plot: { bands } } });
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

export default plot;
