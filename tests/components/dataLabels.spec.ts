import DataLabels from '@src/component/DataLabels';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { LineChartOptions } from '@t/options';

let dataLabels;
const style = {
  color: '#333333',
  font: 'normal 11px Arial',
  textStrokeColor: 'rgba(255, 255, 255, 0.5)',
};

describe('DataLabels', () => {
  beforeEach(() => {
    dataLabels = new DataLabels({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    dataLabels.render({
      layout: { plot: { x: 10, y: 10, width: 80, height: 80 } },
      dataLabels: [
        {
          style,
          text: '4000',
          textAlign: 'left' as CanvasTextAlign,
          textBaseline: 'middle' as CanvasTextBaseline,
          x: 20,
          y: 20,
        },
        {
          style,
          text: '7000',
          textAlign: 'right' as CanvasTextAlign,
          textBaseline: 'bottom' as CanvasTextBaseline,
          x: 40,
          y: 35,
        },
      ],
    });
  });

  it('data label model', () => {
    expect(dataLabels.models).toEqual([
      {
        type: 'label',
        text: '4000',
        x: 20,
        y: 21,
        style: [
          'default',
          {
            textAlign: 'left',
            textBaseline: 'middle',
            fillStyle: '#333333',
            font: 'normal 11px Arial',
          },
        ],
        stroke: ['stroke', { strokeStyle: 'rgba(255, 255, 255, 0.5)' }],
      },
      {
        type: 'label',
        text: '7000',
        x: 40,
        y: 36,
        style: [
          'default',
          {
            textAlign: 'right',
            textBaseline: 'bottom',
            fillStyle: '#333333',
            font: 'normal 11px Arial',
          },
        ],
        stroke: ['stroke', { strokeStyle: 'rgba(255, 255, 255, 0.5)' }],
      },
    ]);
  });
});
