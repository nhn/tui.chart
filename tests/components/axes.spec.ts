import Axis from '@src/component/axis';
import Store from '@src/store/store';
import { LineChartOptions } from '@t/options';
import EventEmitter from '@src/eventEmitter';
import axes from '@src/store/axes';

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
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2'],
            tickCount: 2,
          },
        },
      });
    });

    it('tick model', () => {
      expect(axis.models.tick).toEqual([
        { isYAxis: true, type: 'tick', x: 10.5, y: 0.5, direction: 'left' },
        { isYAxis: true, type: 'tick', x: 10.5, y: 80.5, direction: 'left' },
      ]);
    });

    it('label model', () => {
      expect(axis.models.label).toEqual([
        {
          style: ['default', { textAlign: 'left' }],
          text: '2',
          type: 'label',
          x: 0.5,
          y: 20.5,
        },
        {
          style: ['default', { textAlign: 'left' }],
          text: '1',
          type: 'label',
          x: 0.5,
          y: 100.5,
        },
      ]);
    });

    it('axisLine', () => {
      expect(axis.models.axisLine).toEqual([{ type: 'line', x: 10.5, x2: 10.5, y: 0.5, y2: 80.5 }]);
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      axis.render({
        layout: { yAxis: { x: 10, y: 10, width: 10, height: 80 } },
        axes: {
          yAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 2,
            labelInterval: 2,
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            tickCount: 10,
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
            labels: ['1', '2', '3', '4', '5'],
            tickCount: 6,
          },
        },
        yCenterAxis: {
          visible: true,
          xAxisHalfSize: 35,
          secondStartX: 45,
          yAxisLabelAnchorPoint: 5,
          yAxisHeight: 80,
        },
      });
    });

    it('should have two axis lines', () => {
      expect(axis.models.axisLine).toHaveLength(2);
    });

    it('should have tick models pointing to the left and right respectively', () => {
      const tickModel = axis.models.tick;
      const ticksToLeft = tickModel.filter(({ direction }) => direction === 'left');
      const ticksToRight = tickModel.filter(({ direction }) => direction === 'right');

      expect(tickModel).toHaveLength(12);
      expect(ticksToLeft).toHaveLength(6);
      expect(ticksToRight).toHaveLength(6);
    });

    it('should be text alignment center', () => {
      const labelModel = axis.models.label;
      const isAlignCenter = labelModel.every(({ style }) => style[1].textAlign === 'center');

      expect(isAlignCenter).toBeTruthy();
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
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2'],
            tickCount: 2,
          },
        },
      });
    });

    it('tick model', () => {
      expect(axis.models.tick).toEqual([
        { isYAxis: false, type: 'tick', x: 0.5, y: 0.5, direction: 'bottom' },
        { isYAxis: false, type: 'tick', x: 80.5, y: 0.5, direction: 'bottom' },
      ]);
    });

    it('label model', () => {
      expect(axis.models.label).toEqual([
        {
          style: ['default', { textAlign: 'center' }],
          text: '1',
          type: 'label',
          x: 20.5,
          y: 10.5,
        },
        {
          style: ['default', { textAlign: 'center' }],
          text: '2',
          type: 'label',
          x: 100.5,
          y: 10.5,
        },
      ]);
    });

    it('axisLine', () => {
      expect(axis.models.axisLine).toEqual([{ type: 'line', x: 0.5, x2: 80.5, y: 0.5, y2: 0.5 }]);
    });
  });

  describe('interval', () => {
    beforeEach(() => {
      axis.render({
        layout: { xAxis: { x: 10, y: 10, width: 80, height: 10 } },
        axes: {
          xAxis: {
            pointOnColumn: true,
            tickDistance: 40,
            tickInterval: 2,
            labelInterval: 2,
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            tickCount: 10,
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
            pointOnColumn: false,
            tickDistance: 20,
            tickInterval: 1,
            labelInterval: 1,
            labels: ['1', '2', '3', '4', '5'],
            tickCount: 5,
          },
        },
        yCenterAxis: {
          visible: true,
          xAxisHalfSize: 35,
          secondStartX: 45,
          yAxisLabelAnchorPoint: 5,
          yAxisHeight: 80,
        },
      });
    });

    it('should have two axis lines', () => {
      expect(axis.models.axisLine).toHaveLength(2);
    });

    it('should have tick models pointing to the left and right respectively', () => {
      expect(axis.models.tick).toHaveLength(10);
    });

    it('should have diverging labels', () => {
      const labelModel = axis.models.label;
      const divergingLabels = labelModel.map(({ text }) => text);

      expect(divergingLabels).toEqual(['5', '4', '3', '2', '1', '1', '2', '3', '4', '5']);
    });
  });
});
