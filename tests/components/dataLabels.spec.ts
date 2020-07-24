import DataLabels from '@src/component/DataLabels';
import Store from '@src/store/store';
import EventEmitter from '@src/eventEmitter';
import { LineChartOptions } from '@t/options';

let dataLabels;

describe('DataLabels', () => {
  beforeEach(() => {
    dataLabels = new DataLabels({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    dataLabels.render({
      layout: { plot: { x: 10, y: 10, width: 80, height: 80 } },
      dataLabels: {
        visible: true,
        data: [
          {
            type: 'point',
            text: '4000',
            textAlign: 'left' as CanvasTextAlign,
            textBaseline: 'middle' as CanvasTextBaseline,
            x: 20,
            y: 20,
          },
          {
            type: 'point',
            text: '7000',
            textAlign: 'right' as CanvasTextAlign,
            textBaseline: 'bottom' as CanvasTextBaseline,
            x: 40,
            y: 35,
          },
        ],
      },
    });
  });

  it('data label model', () => {
    expect(dataLabels.models).toEqual([
      {
        type: 'dataLabel',
        dataLabelType: 'point',
        text: '4000',
        x: 20,
        y: 21,
        textAlign: 'left',
        textBaseline: 'middle',
        opacity: 1,
      },
      {
        type: 'dataLabel',
        dataLabelType: 'point',
        text: '7000',
        x: 40,
        y: 36,
        textAlign: 'right',
        textBaseline: 'bottom',
        opacity: 1,
      },
    ]);
  });
});
