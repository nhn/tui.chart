import plot from '@src/store/plot';
import Store from '@src/store/store';
import { LineChartOptions, PlotRangeType } from '@t/options';
import { ChartState, StateFunc } from '@t/store/store';

const data = [
  { name: 'han', data: [1, 2], color: '#aaaaaa' },
  { name: 'cho', data: [4, 5], color: '#bbbbbb' },
];
describe('Plot Store', () => {
  describe('state', () => {
    const plotStateFunc = plot.state as StateFunc;

    it('should set true value for visible property of plot by default', () => {
      expect(plotStateFunc({ series: {}, options: {} })).toEqual({
        plot: {
          visible: true,
          lines: [],
          bands: [],
        },
      });
    });

    it('should set false value for visible property, if it is entered "visible: false" in option', () => {
      expect(plotStateFunc({ series: {}, options: { plot: { visible: false } } })).toEqual({
        plot: {
          visible: false,
          lines: [],
          bands: [],
        },
      });
    });
  });

  describe('lines options', () => {
    it('should set lines what caculated color and validated value', () => {
      const state = {
        plot: {},
        series: { line: { data } },
        options: {
          plot: {
            lines: [
              {
                value: 3,
                color: '#ff0000',
                opacity: 0.2,
              },
            ],
          },
        },
      } as ChartState<LineChartOptions>;
      const store = { state } as Store<LineChartOptions>;
      plot.action!.setPlot(store);

      expect(state.plot.lines).toEqual([
        {
          value: 3,
          color: 'rgba(255, 0, 0, 0.2)',
        },
      ]);
    });
  });

  describe('bands options', () => {
    it('should set bands what caculated color and validated value', () => {
      const state = {
        plot: {},
        series: { line: { data } },
        options: {
          plot: {
            bands: [
              {
                range: [1, 3],
                color: '#ff0000',
                opacity: 0.2,
              },
            ],
          },
        },
      } as ChartState<LineChartOptions>;

      const store = { state } as Store<LineChartOptions>;
      plot.action!.setPlot(store);

      expect(state.plot.bands).toEqual([
        {
          range: [1, 3],
          color: 'rgba(255, 0, 0, 0.2)',
        },
      ]);
    });

    it('should set each bands, if the range is input as an array', () => {
      const state = {
        plot: {},
        series: { line: { data } },
        options: {
          plot: {
            bands: [
              {
                range: [
                  [1, 3],
                  [2, 4],
                ] as PlotRangeType[],
                color: '#ff0000',
                opacity: 0.2,
              },
            ],
          },
        },
      } as ChartState<LineChartOptions>;

      const store = { state } as Store<LineChartOptions>;
      plot.action!.setPlot(store);

      expect(state.plot.bands).toEqual([
        {
          range: [1, 3],
          color: 'rgba(255, 0, 0, 0.2)',
        },
        {
          range: [2, 4],
          color: 'rgba(255, 0, 0, 0.2)',
        },
      ]);
    });

    it('should merge each ranges, if "mergeOverlappingRanges" is true', () => {
      const state = {
        plot: {},
        series: { line: { data } },
        options: {
          plot: {
            bands: [
              {
                range: [
                  [1, 3],
                  [2, 4],
                ] as PlotRangeType[],
                color: '#ff0000',
                opacity: 0.2,
                mergeOverlappingRanges: true,
              },
            ],
          },
        },
      } as ChartState<LineChartOptions>;

      const store = { state } as Store<LineChartOptions>;
      plot.action!.setPlot(store);

      expect(state.plot.bands).toEqual([
        {
          range: [1, 4],
          color: 'rgba(255, 0, 0, 0.2)',
        },
      ]);
    });

    it('should set category index, if it use categories', () => {
      const state = {
        plot: {},
        series: { line: { data } },
        options: {
          plot: {
            bands: [
              {
                range: [
                  ['Z', 'W'],
                  ['A', 'B'],
                ] as PlotRangeType[],
                color: '#ff0000',
                opacity: 0.2,
                mergeOverlappingRanges: true,
              },
            ],
          },
        },
        rawCategories: ['Z', 'A', 'W', 'B', 'E'],
      } as ChartState<LineChartOptions>;

      const store = { state } as Store<LineChartOptions>;
      plot.action!.setPlot(store);

      expect(state.plot.bands).toEqual([
        {
          range: [0, 3],
          color: 'rgba(255, 0, 0, 0.2)',
        },
      ]);
    });
  });
});
