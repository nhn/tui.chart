import RaphaelAxisComponent from '../../src/js/plugins/raphaelAxisComponent';
import raphael from 'raphael';

describe('RaphaelAxisComponent', () => {
  const raphaelAxisComponent = new RaphaelAxisComponent();
  let container, paper, data;
  let positionWithoutOffset, positionWithOffset, positionDiff;

  beforeEach(() => {
    container = document.createElement('DIV');
    document.body.appendChild(container);
    paper = raphael(container, 1500, 1500);
    data = {
      text: 'title',
      theme: {
        fontSize: 12,
        fontFamily: 'Verdana'
      },
      rotationInfo: {},
      layout: {
        position: { top: 10, left: 10 },
        dimension: { width: 1000, height: 1000 }
      },
      set: paper.set(),
      offset: {},
      otherSideDimension: {
        width: 30
      },
      additionalWidth: 0
    };
    positionDiff = {};
  });

  afterEach(() => {
    document.body.removeChild(container);
    positionWithOffset = null;
    positionWithoutOffset = null;
  });

  describe('renderTicks() ', () => {
    beforeEach(() => {
      data.paper = paper;
      data.additionalSize = 0;
      raphaelAxisComponent.ticks = [];
    });

    it('position beyond the dimension in the vertical axis should not be added.', () => {
      data.isVertical = true;
      data.positions = [300, 900, 1200, 1500];
      raphaelAxisComponent.renderTicks(data);

      expect(raphaelAxisComponent.ticks.length).toBe(2);
    });
    it('position beyond the dimension in the horizontal axis should not be added.', () => {
      data.isVertical = false;
      data.positions = [200, 400, 800, 900, 1000, 1200];
      raphaelAxisComponent.renderTicks(data);

      expect(raphaelAxisComponent.ticks.length).toBe(5);
    });
    it('tick count should be calculated taking into account the width of the axis where the y-axis is centered', () => {
      data.positions = [200, 400, 800, 900, 1000, 1200];
      data.isDivided = true;
      raphaelAxisComponent.renderTicks(data);

      expect(raphaelAxisComponent.ticks.length).toBe(5);
    });
  });

  describe('calculatePosition() ', () => {
    it('should add offset when rotationInfo is empty object', () => {
      positionWithoutOffset = raphaelAxisComponent.calculatePosition(paper, data);

      data.offset = { x: 100, y: 100 };
      positionWithOffset = raphaelAxisComponent.calculatePosition(paper, data);

      positionDiff.x = positionWithOffset.left - positionWithoutOffset.left;
      positionDiff.y = positionWithOffset.top - positionWithoutOffset.top;

      expect(Math.round(positionDiff.x)).toBe(data.offset.x);
      expect(Math.round(positionDiff.y)).toBe(data.offset.y);
    });

    it('should not add offset when set rotationInfo.isCenter true', () => {
      data.rotationInfo.isCenter = true;
      positionWithoutOffset = raphaelAxisComponent.calculatePosition(paper, data);

      data.offset = { x: 100, y: 100 };
      positionWithOffset = raphaelAxisComponent.calculatePosition(paper, data);

      positionDiff.x = positionWithOffset.left - positionWithoutOffset.left;
      positionDiff.y = positionWithOffset.top - positionWithoutOffset.top;

      expect(positionDiff.x).toBe(0);
      expect(positionDiff.y).toBe(0);
    });

    it('should add offset when set rotationInfo.isPositionRight true', () => {
      data.rotationInfo.isPositionRight = true;
      positionWithoutOffset = raphaelAxisComponent.calculatePosition(paper, data);

      data.offset = { x: 100, y: 100 };
      positionWithOffset = raphaelAxisComponent.calculatePosition(paper, data);

      positionDiff.x = positionWithOffset.left - positionWithoutOffset.left;
      positionDiff.y = positionWithOffset.top - positionWithoutOffset.top;

      expect(Math.round(positionDiff.x)).toBe(data.offset.x);
      expect(Math.round(positionDiff.y)).toBe(data.offset.y);
    });

    it('should add offset when set rotationInfo.isVertical true', () => {
      data.rotationInfo.isVertical = true;
      positionWithoutOffset = raphaelAxisComponent.calculatePosition(paper, data);

      data.offset = { x: 100, y: 100 };
      positionWithOffset = raphaelAxisComponent.calculatePosition(paper, data);

      positionDiff.x = positionWithOffset.left - positionWithoutOffset.left;
      positionDiff.y = positionWithOffset.top - positionWithoutOffset.top;

      expect(positionDiff.x).toBe(data.offset.x);
      expect(positionDiff.y).toBe(data.offset.y);
    });
  });
});
