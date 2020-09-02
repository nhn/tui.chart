import { StoreModule, ValueOf, ChartOptionsMap } from '@t/store/store';
import { LineChartOptions, AreaChartOptions, PlotLine, PlotBand, PlotRangeType } from '@t/options';
import { extend } from './store';
import { rgba } from '@src/helpers/color';

type UsingShowLineOptions = ValueOf<Omit<ChartOptionsMap, 'radar' | 'pie'>>;

function isPlotRangeData(range: number | string | PlotRangeType) {
  return Array.isArray(range) && range.length === 2;
}

function getOverlappingRange(range: PlotRangeType[]) {
  const first = range[0];

  return range.reduce<PlotRangeType>((acc, rangeData, index) => {
    if (!index) {
      return acc;
    }

    let [accStart, accEnd] = acc;
    const [start, end] = rangeData;

    if (start < accStart) {
      accStart = start;
    }

    if (end > accEnd) {
      accEnd = end;
    }

    return [accStart, accEnd];
  }, first);
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

      const lineAreaOptions = options as LineChartOptions | AreaChartOptions;

      const plotLines = lineAreaOptions?.plot?.lines ?? [];
      const plotBands = lineAreaOptions?.plot?.bands ?? [];

      const lines: PlotLine[] = plotLines.map(({ value, color, opacity }) => ({
        value,
        color: rgba(color, opacity),
        vertical: true,
      }));

      const bands: PlotBand[] = plotBands.flatMap(
        ({ range, mergeOverlappingRanges = false, color: bgColor, opacity }) => {
          const color = rgba(bgColor, opacity);

          if (isPlotRangeData(range[0])) {
            const rangeData = range as PlotRangeType[];

            if (mergeOverlappingRanges) {
              return {
                color,
                range: getOverlappingRange(rangeData),
              };
            }

            return rangeData.map((dataRangeData) => ({
              range: dataRangeData,
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
