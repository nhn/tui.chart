import legend from '@src/store/legend';
import { StateFunc } from '@t/store/store';
import { deepMergedCopy } from '@src/helpers/utils';
import { PieDonutChartOptions } from '@t/options';

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
        },
      ],
      showCheckbox: true,
      useSpectrumLegend: false,
      visible: true,
      align: 'right',
      width: 38,
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
    it('shoulde legend data properly for pie donut series', () => {
      const state = (legend.state as StateFunc)({
        options: { chart: { width: 300, height: 300 } },
        series: {
          pieDonut: [
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
        },
        {
          label: 'B',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
        },
        {
          label: 'C',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
        },
        {
          label: 'D',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
        },
      ]);
    });

    it('shoulde legend data properly for grouped pie donut series', () => {
      const state = (legend.state as StateFunc)({
        options: {
          chart: { width: 300, height: 300 },
          series: { grouped: true },
        } as PieDonutChartOptions,
        series: {
          pieDonut: [
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
                { name: 'A1', parent: 'A', data: 30 },
                { name: 'A2', parent: 'A', data: 20 },
                { name: 'B1', parent: 'B', data: 40 },
                { name: 'B2', parent: 'B', data: 10 },
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
        },
        {
          label: 'B',
          checked: true,
          active: true,
          width: 35,
          iconType: 'rect',
        },
      ]);
    });
  });
});
