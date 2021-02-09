import legend from '@src/store/legend';
import { InitStoreState, Scale, StateFunc } from '@t/store/store';
import { deepMergedCopy } from '@src/helpers/utils';
import { LineChartOptions, NestedPieChartOptions } from '@t/options';
import Store from '@src/store/store';

describe('Legend Store', () => {
  it('should apply default options when legend options not exist', () => {
    const state = (legend.state as StateFunc)({
      options: { chart: { width: 300, height: 300 } },
      series: {
        line: [
          {
            name: 'test',
            data: [
              { x: 10, y: 5 },
              { x: 1, y: 2 },
              { x: 3, y: 5 },
            ],
            rawData: [
              { x: 10, y: 5 },
              { x: 1, y: 2 },
              { x: 3, y: 5 },
            ],
            color: '#aaaaaa',
          },
        ],
      },
    });

    expect(state.legend).toEqual({
      data: [
        {
          label: 'test',
          checked: true,
          active: true,
          width: 38,
          iconType: 'line',
          chartType: 'line',
          rowIndex: 0,
          columnIndex: 0,
        },
      ],
      useSpectrumLegend: false,
      useScatterChartIcon: false,
    });
  });

  it('should make legend layout properly when calling the setLegendLayout', () => {
    const dispatch = () => {};

    const fontTheme = {
      fontSize: 11,
      fontFamily: 'Arial',
      fontWeight: 'normal',
      color: '#333333',
    };

    const initStoreState = {
      series: {
        line: [
          { name: 'han', data: [1, 4], rawData: [1, 4], color: '#aaaaaa' },
          { name: 'cho', data: [5, 2], rawData: [5, 2], color: '#bbbbbb' },
        ],
      },
      options: {
        zoomable: false,
      },
    } as InitStoreState<LineChartOptions>;

    const state = {
      chart: { width: 300, height: 300 },
      layout: {
        plot: { width: 250, height: 250, x: 30, y: 10 },
        yAxis: { x: 10, y: 10, width: 30, height: 200 },
        xAxis: { x: 10, y: 10, width: 250, height: 30 },
      },
      scale: { yAxis: { limit: { min: 0, max: 5 }, stepSize: 1, stepCount: 1 } } as Scale,
      series: {
        line: {
          data: [
            { name: 'han', data: [1, 4] },
            { name: 'cho', data: [5, 2] },
          ],
        },
      },
      circleLegend: {},
      legend: {
        data: [
          {
            label: 'han',
            checked: true,
            active: true,
            width: 38,
            iconType: 'line',
            chartType: 'line',
            rowIndex: 0,
            columnIndex: 0,
          },
          {
            label: 'cho',
            checked: true,
            active: true,
            width: 38,
            iconType: 'line',
            chartType: 'line',
            rowIndex: 0,
            columnIndex: 0,
          },
        ],
        visible: true,
        useSpectrumLegend: false,
        useScatterChartIcon: false,
      },
      axes: {
        xAxis: {},
        yAxis: {},
      },
      categories: ['A', 'B'],
      options: {
        xAxis: { tick: { interval: 2 }, label: { interval: 3 } },
        yAxis: { tick: { interval: 4 }, label: { interval: 5 } },
        legend: {},
      },
      theme: {
        xAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        yAxis: { title: { ...fontTheme }, label: { ...fontTheme } },
        legend: { label: { ...fontTheme } },
      },
    };

    const store = { state, initStoreState } as Store<LineChartOptions>;

    legend.action!.setLegendLayout.call({ dispatch }, store);

    expect(state.legend).toEqual({
      align: 'right',
      data: [
        {
          active: true,
          chartType: 'line',
          checked: true,
          columnIndex: 0,
          iconType: 'line',
          label: 'han',
          rowIndex: 0,
          width: 38,
        },
        {
          active: true,
          chartType: 'line',
          checked: true,
          columnIndex: 0,
          iconType: 'line',
          label: 'cho',
          rowIndex: 1,
          width: 38,
        },
      ],
      height: 78,
      width: 94,
      showCheckbox: true,
      useScatterChartIcon: false,
      useSpectrumLegend: false,
      visible: true,
    });
  });

  describe('iconType', () => {
    const initStoreState = {
      options: { chart: { width: 300, height: 300 } },
      series: {},
    };

    const data = [
      {
        type: 'line',
        iconType: 'line',
      },
      {
        type: 'bar',
        iconType: 'rect',
      },
      {
        type: 'column',
        iconType: 'rect',
      },
      {
        type: 'area',
        iconType: 'rect',
      },
      {
        type: 'bubble',
        iconType: 'circle',
      },
      {
        type: 'scatter',
        iconType: 'circle',
      },
    ];

    data.forEach((datum) => {
      it(`${datum.type} chart return iconType ${datum.iconType}`, () => {
        const series = { [datum.type]: [{ name: 'han' }] };
        const state = (legend.state as StateFunc)(deepMergedCopy(initStoreState, { series }));

        expect(state.legend!.data.map(({ iconType }) => iconType)).toEqual([datum.iconType]);
      });
    });
  });

  describe('using pie donut', () => {
    it('should legend data properly for pie donut series', () => {
      const state = (legend.state as StateFunc)({
        options: { chart: { width: 300, height: 300 } },
        series: {
          pie: [
            {
              name: 'pie1',
              data: [
                { name: 'A', data: 50 },
                { name: 'B', data: 50 },
              ],
            },
            {
              name: 'pie2',
              data: [
                { name: 'C', data: 60 },
                { name: 'D', data: 40 },
              ],
            },
          ],
        },
      });

      expect(state.legend!.data).toEqual([
        {
          label: 'A',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
          chartType: 'pie',
          rowIndex: 0,
          columnIndex: 0,
        },
        {
          label: 'B',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
          chartType: 'pie',
          rowIndex: 0,
          columnIndex: 0,
        },
        {
          label: 'C',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
          chartType: 'pie',
          rowIndex: 0,
          columnIndex: 0,
        },
        {
          label: 'D',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
          chartType: 'pie',
          rowIndex: 0,
          columnIndex: 0,
        },
      ]);
    });

    it('should legend data properly for grouped pie donut series', () => {
      const state = (legend.state as StateFunc)({
        options: {
          chart: { width: 300, height: 300 },
          series: { grouped: true },
        } as NestedPieChartOptions,
        series: {
          pie: [
            {
              name: 'pie1',
              data: [
                { name: 'A', data: 50 },
                { name: 'B', data: 50 },
              ],
            },
            {
              name: 'pie2',
              data: [
                { name: 'A1', parentName: 'A', data: 30 },
                { name: 'A2', parentName: 'A', data: 20 },
                { name: 'B1', parentName: 'B', data: 40 },
                { name: 'B2', parentName: 'B', data: 10 },
              ],
            },
          ],
        },
      });

      expect(state.legend!.data).toEqual([
        {
          label: 'A',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
          chartType: 'pie',
          rowIndex: 0,
          columnIndex: 0,
        },
        {
          label: 'B',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
          chartType: 'pie',
          rowIndex: 0,
          columnIndex: 0,
        },
      ]);
    });
  });
});
