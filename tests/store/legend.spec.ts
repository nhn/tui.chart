import legend from '@src/store/legend';
import { StateFunc } from '@t/store/store';
import { deepMergedCopy } from '@src/helpers/utils';

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
});
