/**
 * @fileoverview Test for RaphaelBulletChart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import RaphaelBulletChart from '../../src/js/plugins/raphaelBulletChart';
import raphael from 'raphael';

describe('RaphaelBulletChart', () => {
  const bound = { top: 10, left: 20, width: 0, height: 40 };
  const paperContainer = document.createElement('DIV');
  let bulletChart, seriesColor;

  beforeEach(() => {
    bulletChart = new RaphaelBulletChart();
    bulletChart.theme = {
      colors: ['yellow', 'red'],
      ranges: []
    };
    bulletChart.paper = raphael(paperContainer, 100, 100);
    seriesColor = 'yellow';
  });

  describe('_getRangeOpacity()', () => {
    it('should create object and put calculated opacity, when rangesOpacities is undefined', () => {
      bulletChart.maxRangeCount = 3;
      expect(bulletChart.rangeOpacities).toBeUndefined();

      bulletChart._getRangeOpacity(0);
      expect(bulletChart.rangeOpacities instanceof Object).toBe(true);
      expect(bulletChart.rangeOpacities[0]).toBe(0.75);
    });

    it('should store range opacities in object', () => {
      bulletChart.maxRangeCount = 3;
      expect(bulletChart.rangeOpacities).toBeUndefined();

      bulletChart._getRangeOpacity(1);
      bulletChart._getRangeOpacity(2);
      expect(bulletChart.rangeOpacities[0]).toBeUndefined();
      expect(bulletChart.rangeOpacities[1]).toBe(0.5);
      expect(bulletChart.rangeOpacities[2]).toBe(0.25);
    });

    it('should not store range opacity, when index is larger or same than max ranges count', () => {
      bulletChart.maxRangeCount = 3;
      bulletChart._getRangeOpacity(3);
      expect(bulletChart.rangeOpacities[3]).toBeUndefined();
    });

    it('should update opacity step, when maxRangeCount is changed', () => {
      spyOn(bulletChart, '_updateOpacityStep');
      bulletChart._updateOpacityStep.and.callThrough();

      bulletChart.maxRangeCount = 3;
      bulletChart._getRangeOpacity(0);
      bulletChart._getRangeOpacity(0);
      expect(bulletChart._updateOpacityStep.calls.count()).toBe(1);
    });

    it('should not update opacity step, when maxRangeCount is not changed', () => {
      spyOn(bulletChart, '_updateOpacityStep');
      bulletChart._updateOpacityStep.and.callThrough();

      bulletChart.maxRangeCount = 3;
      bulletChart._getRangeOpacity(0);
      bulletChart.maxRangeCount = 5;
      bulletChart._getRangeOpacity(0);
      expect(bulletChart._updateOpacityStep.calls.count()).toBe(2);
    });
  });

  describe('_updateOpacityStep()', () => {
    it('should reset range opacities', () => {
      bulletChart.rangeOpacities = { 0: 0.75 };
      bulletChart._updateOpacityStep(3);

      expect(bulletChart.rangeOpacities).toEqual({});
    });

    it('should update opacity step by maxRanges count', () => {
      bulletChart._updateOpacityStep(3);

      expect(bulletChart.opacityStep).toBe('0.25');
      expect(bulletChart.prevMaxRangeCount).toBe(3);
    });
  });

  describe('_renderActual()', () => {
    it('should render a actual bar', () => {
      document.body.appendChild(paperContainer);
      const rectElement = bulletChart._renderActual(bound, seriesColor);
      const svgRect = rectElement.getBBox();

      expect(rectElement.attrs.fill).toBe('yellow');
      expect(svgRect.x).toBe(20);
      expect(svgRect.y).toBe(10);
      expect(svgRect.width).toBe(0);
      expect(svgRect.height).toBe(40);

      document.body.removeChild(paperContainer);
    });
  });

  describe('_renderRange()', () => {
    beforeEach(() => {
      bulletChart.maxRangeCount = 1;
    });

    it('should render range bar at bound position', () => {
      document.body.appendChild(paperContainer);
      const rectElement = bulletChart._renderRange(bound, seriesColor, 0, null);
      const svgRect = rectElement.getBBox();

      expect(svgRect.x).toBe(20);
      expect(svgRect.y).toBe(10);
      expect(svgRect.width).toBe(0);
      expect(svgRect.height).toBe(40);

      document.body.removeChild(paperContainer);
    });

    it('should set color and opacity, if there is not costom theme', () => {
      const rangeElement = bulletChart._renderRange(bound, seriesColor, 0, null);

      expect(rangeElement.attrs.fill).toBe('yellow');
      expect(rangeElement.attrs.opacity).toBe(0.5);
    });

    it('should fill color if there is color value in costom theme', () => {
      const rangeTheme = { color: '#00ff00' };
      const rangeElement = bulletChart._renderRange(bound, seriesColor, 0, rangeTheme);

      expect(rangeElement.attrs.fill).toBe('#00ff00');
      expect(rangeElement.attrs.opacity).toBe(0.5);
    });

    it('should fill opacity if there is opacity value in costom theme', () => {
      const rangeTheme = { opacity: 0.75 };
      const rangeElement = bulletChart._renderRange(bound, seriesColor, 0, rangeTheme);

      expect(rangeElement.attrs.fill).toBe('yellow');
      expect(rangeElement.attrs.opacity).toBe(0.75);
    });

    it('should fill color and opacity if there are color and opacity in costom theme', () => {
      const rangeTheme = { color: '#00ff00', opacity: 0.75 };
      const rangeElement = bulletChart._renderRange(bound, seriesColor, 0, rangeTheme);

      expect(rangeElement.attrs.fill).toBe('#00ff00');
      expect(rangeElement.attrs.opacity).toBe(0.75);
    });
  });
});
