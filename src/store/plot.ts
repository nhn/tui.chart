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
import { isString, isUndefined } from '@src/helpers/utils';

type UsingShowLineOptions = ValueOf<
  Omit<ChartOptionsMap, 'radar' | 'pie' | 'treemap' | 'heatmap' | 'nestedPie'>
>;

type UsingPlotLineBandOptions = ValueOf<
  Pick<ChartOptionsMap, 'area' | 'line' | 'lineArea' | 'columnLine'>
>;

function getOverlappingRange(range: RangeDataType<number>[]) {
  return range.reduce<RangeDataType<number>>(
    (acc, rangeData) => {
      const [accStart, accEnd] = acc;
      const [start, end] = rangeData;

      return [Math.min(accStart, start), Math.max(accEnd, end)];
    },
    [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
  );
}

function getCategoryIndex(value: string, categories: string[]) {
  return categories.findIndex((category) => category === String(value));
}

function getValidValue(value, categories: string[], isDateType = false): number {
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

    if (isRangeValue(range[0])) {
      const ranges = (range as PlotRangeType[]).map((rangeData) =>
        rangeData.map((value) => getValidValue(value, categories, isDateType))
      ) as RangeDataType<number>[];

      if (mergeOverlappingRanges) {
        return {
          color,
          range: getOverlappingRange(ranges),
        };
      }

      return ranges.map((rangeData) => ({
        range: rangeData,
        color,
      }));
    }

    return {
      color,
      range,
    };
  });
}
const plot: StoreModule = {
  name: 'plot',
  state: ({ options }) => ({
    plot: {
      showLine: (options as UsingShowLineOptions)?.plot?.showLine ?? true,
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
      if (
        !lines.some(
          ({ id: lineId }) => !isUndefined(lineId) && !isUndefined(data.id) && lineId === data.id
        )
      ) {
        this.dispatch('updateOptions', { plot: { lines: [...lines, data] } });
      }
    },
    addPlotBand({ state }, { data }: { data: PlotBand }) {
      const bands = (state.options as UsingPlotLineBandOptions)?.plot?.bands ?? [];
      if (
        !bands.some(
          ({ id: bandId }) => !isUndefined(bandId) && !isUndefined(data.id) && bandId === data.id
        )
      ) {
        this.dispatch('updateOptions', { plot: { bands: [...bands, data] } });
      }
    },
    removePlotLine({ state }, { id }: { id: string }) {
      const lines = ((state.options as UsingPlotLineBandOptions)?.plot?.lines ?? []).filter(
        ({ id: lineId }) => lineId !== id
      );
      this.dispatch('updateOptions', { plot: { lines } });
    },
    removePlotBand({ state }, { id }: { id: string }) {
      const bands = ((state.options as UsingPlotLineBandOptions)?.plot?.bands ?? []).filter(
        ({ id: bandId }) => bandId !== id
      );
      this.dispatch('updateOptions', { plot: { bands } });
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

export default plot;
