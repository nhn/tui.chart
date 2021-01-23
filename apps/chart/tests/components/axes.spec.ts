import Axis from '@src/component/axis';
import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';

let axis;

describe('yAxis', () => {
  beforeEach(() => {
    axis = new Axis({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });

    axis.initialize({ name: 'yAxis' });
  });

  describe('make model properly', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: false,
            tickDistance: 40,
            labelDistance: 40,
            tickInterval: 1,
            labelInterval: 1,
            viewLabels: [
              { text: '2', offsetPos: 0.5 },
              { text: '1', offsetPos: 80.5 },
            ],
            tickCount: 2,
          },
        },
        theme: {
          xAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          yAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
        },
      });
    });

    it('tick model', () => {
      expect(axis.models.tick).toEqual([
        {
          isYAxis: true,
          strokeStyle: '#333333',
          lineWidth: 1,
          type: 'tick',
          x: 10.5,
          y: 0.5,
          tickSize: -5,
        },
        {
          isYAxis: true,
          strokeStyle: '#333333',
          lineWidth: 1,
          type: 'tick',
          x: 10.5,
          y: 80.5,
          tickSize: -5,
        },
      ]);
    });

    it('label model', () => {
      expect(axis.models.label).toEqual([
        {
          style: [
            'default',
            { textAlign: 'left', fillStyle: '#333333', font: 'normal 11px Arial' },
          ],
          text: '2',
          type: 'label',
          x: 0.5,
          y: 0.5,
        },
        {
          style: [
            'default',
            { textAlign: 'left', fillStyle: '#333333', font: 'normal 11px Arial' },
          ],
          text: '1',
          type: 'label',
          x: 0.5,
          y: 80.5,
        },
      ]);
    });

    it('axisLine', () => {
      expect(axis.models.axisLine).toEqual([
        { type: 'line', x: 10.5, x2: 10.5, y: 0.5, y2: 80.5, lineWidth: 1, strokeStyle: '#333333' },
      ]);
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: false,
            tickDistance: 40,
            tickInterval: 2,
            labelInterval: 2,
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            viewLabels: [
              { text: '10', offsetPos: 0.5 },
              { text: '8', offsetPos: 16.5 },
              { text: '6', offsetPos: 32.5 },
              { text: '4', offsetPos: 48.5 },
              { text: '2', offsetPos: 64.5 },
            ],
            tickCount: 10,
          },
        },
        theme: {
          xAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          yAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
        },
      });
    });

    it('tick interval option apply the number of tick model', () => {
      expect(axis.models.tick).toHaveLength(5);
    });

    it('label interval option apply the number of label model', () => {
      expect(axis.models.label).toHaveLength(5);
    });
  });

  describe('using center y axis', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: true,
            tickDistance: 16,
            tickInterval: 1,
            labelInterval: 1,
            viewLabels: [
              { text: '5', offsetPos: 0.5 },
              { text: '4', offsetPos: 16.5 },
              { text: '3', offsetPos: 32.5 },
              { text: '2', offsetPos: 48.5 },
              { text: '1', offsetPos: 64.5 },
            ],
            tickCount: 6,
          },
          centerYAxis: {},
        },
      });
    });

    it('should have empty models', () => {
      expect(axis.models.axisLine).toHaveLength(0);
      expect(axis.models.tick).toHaveLength(0);
      expect(axis.models.label).toHaveLength(0);
    });
  });

  describe('using secondary y axis', () => {
    beforeEach(() => {
      axis.initialize({ name: 'secondaryYAxis' });

      axis.render({
        layout: { secondaryYAxis: { x: 80, y: 10, width: 20, height: 80 } },
        axes: {
          secondaryYAxis: {
            pointOnColumn: false,
            tickDistance: 16,
            labelDistance: 16,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['0', '1', '2', '3', '4', '5'],
            viewLabels: [
              { text: '5', offsetPos: 0.5 },
              { text: '4', offsetPos: 16.5 },
              { text: '3', offsetPos: 32.5 },
              { text: '2', offsetPos: 48.5 },
              { text: '1', offsetPos: 64.5 },
              { text: '0', offsetPos: 80.5 },
            ],
            tickCount: 6,
          },
        },
        theme: {
          xAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          yAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
        },
      });
    });

    const result = {
      axisLine: [
        {
          type: 'line',
          x: 0.5,
          x2: 0.5,
          y: 0.5,
          y2: 80.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
      ],
      tick: [
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 0.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 16.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 32.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 48.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 64.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
        {
          isYAxis: true,
          tickSize: 5,
          type: 'tick',
          x: 0.5,
          y: 80.5,
          lineWidth: 1,
          strokeStyle: '#333333',
        },
      ],
      label: [
        {
          style: [
            'default',
            {
              textAlign: 'right',
              fillStyle: '#333333',
              font: 'normal 11px Arial',
            },
          ],
          text: '5',
          type: 'label',
          x: 20.5,
          y: 0.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
              fillStyle: '#333333',
              font: 'normal 11px Arial',
            },
          ],
          text: '4',
          type: 'label',
          x: 20.5,
          y: 16.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
              fillStyle: '#333333',
              font: 'normal 11px Arial',
            },
          ],
          text: '3',
          type: 'label',
          x: 20.5,
          y: 32.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
              fillStyle: '#333333',
              font: 'normal 11px Arial',
            },
          ],
          text: '2',
          type: 'label',
          x: 20.5,
          y: 48.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
              fillStyle: '#333333',
              font: 'normal 11px Arial',
            },
          ],
          text: '1',
          type: 'label',
          x: 20.5,
          y: 64.5,
        },
        {
          style: [
            'default',
            {
              textAlign: 'right',
              fillStyle: '#333333',
              font: 'normal 11px Arial',
            },
          ],
          text: '0',
          type: 'label',
          x: 20.5,
          y: 80.5,
        },
      ],
    };

    ['axisLine', 'tick', 'label'].forEach((modelType) => {
      it(`should have ${modelType} models for rigth y axis`, () => {
        expect(axis.models[modelType]).toEqual(result[modelType]);
      });
    });
  });
});

describe('xAxis', () => {
  beforeEach(() => {
    axis = new Axis({
      store: {} as Store<LineChartOptions>,
      eventBus: new EventEmitter(),
    });
    axis.initialize({ name: 'xAxis' });
  });

  describe('make model properly', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 80, height: 10 } },
        axes: {
          xAxis: {
            pointOnColumn: false,
            tickDistance: 80,
            tickInterval: 1,
            labelInterval: 1,
            viewLabels: [
              { text: '1', offsetPos: 0.5 },
              { text: '2', offsetPos: 80.5 },
            ],
            tickCount: 2,
            labelDistance: 80,
            offsetY: 10.5,
          },
        },
        theme: {
          xAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          yAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
        },
      });
    });

    it('tick model', () => {
      expect(axis.models.tick).toEqual([
        {
          isYAxis: false,
          lineWidth: 1,
          strokeStyle: '#333333',
          type: 'tick',
          x: 0.5,
          y: 0.5,
          tickSize: 5,
        },
        {
          isYAxis: false,
          lineWidth: 1,
          strokeStyle: '#333333',
          type: 'tick',
          x: 80.5,
          y: 0.5,
          tickSize: 5,
        },
      ]);
    });

    it('label model', () => {
      expect(axis.models.label).toEqual([
        {
          style: [
            'default',
            { textAlign: 'center', fillStyle: '#333333', font: 'normal 11px Arial' },
          ],
          text: '1',
          type: 'label',
          x: 0.5,
          y: 10.5,
        },
        {
          style: [
            'default',
            { textAlign: 'center', fillStyle: '#333333', font: 'normal 11px Arial' },
          ],
          text: '2',
          type: 'label',
          x: 80.5,
          y: 10.5,
        },
      ]);
    });

    it('axisLine', () => {
      expect(axis.models.axisLine).toEqual([
        { type: 'line', x: 0.5, x2: 80.5, y: 0.5, y2: 0.5, lineWidth: 1, strokeStyle: '#333333' },
      ]);
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 100, height: 10 } },
        axes: {
          xAxis: {
            tickInterval: 2,
            labelInterval: 2,
            viewLabels: [
              { text: '1', offsetPos: 0.5 },
              { text: '3', offsetPos: 16.5 },
              { text: '5', offsetPos: 32.5 },
              { text: '7', offsetPos: 48.5 },
              { text: '9', offsetPos: 64.5 },
            ],
            tickCount: 10,
          },
        },
        theme: {
          xAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          yAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
        },
      });
    });

    it('tick interval option apply the number of tick model', () => {
      expect(axis.models.tick).toHaveLength(5);
    });

    it('label interval option apply the number of label model', () => {
      expect(axis.models.label).toHaveLength(5);
    });
  });

  describe('using center y axis', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 80, height: 10 } },
        axes: {
          xAxis: {
            tickInterval: 1,
            viewLabels: [
              { text: '1', offsetPos: 0.5 },
              { text: '2', offsetPos: 16.5 },
              { text: '3', offsetPos: 32.5 },
              { text: '4', offsetPos: 48.5 },
              { text: '5', offsetPos: 64.5 },
            ],
            tickCount: 5,
          },
          centerYAxis: {},
        },
      });
    });

    it('should have empty models', () => {
      expect(axis.models.axisLine).toHaveLength(0);
      expect(axis.models.tick).toHaveLength(0);
      expect(axis.models.label).toHaveLength(0);
    });
  });
});
