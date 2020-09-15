import { StoreModule } from '@t/store/store';
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
import { UsingShowLineOptions } from '@t/components/plot';

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
      const { series, options, rawCategories } = state;

      if (!(series.area || series.line)) {
        return;
      }

      const lineAreaOptions = options as LineChartOptions | AreaChartOptions;

      const plotLines = lineAreaOptions?.plot?.lines ?? [];
      const plotBands = lineAreaOptions?.plot?.bands ?? [];

      const isDateType = !!options?.xAxis?.date;

      const lines: PlotLine[] = plotLines.map(({ value, color, opacity }) => ({
        value: getValidValue(value, rawCategories, isDateType),
        color: rgba(color, opacity),
        vertical: true,
      }));

      const bands: PlotBand[] = plotBands.flatMap(
        ({ range, mergeOverlappingRanges = false, color: bgColor, opacity }) => {
          const color = rgba(bgColor, opacity);

          if (isRangeValue(range[0])) {
            const ranges = (range as PlotRangeType[]).map((rangeData) =>
              rangeData.map((value) => getValidValue(value, rawCategories, isDateType))
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
        }
      );

      extend(state.plot, { lines, bands });
    },
  },
  observe: {
    updatePlot() {
      this.dispatch('setPlot');
    },
  },
};

export default plot;
