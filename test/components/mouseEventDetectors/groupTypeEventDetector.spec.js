/**
 * @fileoverview Test for GroupTypeEventDetector.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import snippet from 'tui-code-snippet';
import GroupTypeEventDetector from '../../../src/js/components/mouseEventDetectors/groupTypeEventDetector';

describe('Test for GroupTypeEventDetector', () => {
  let groupTypeEventDetector, eventBus, tickBaseCoordinateModel;

  beforeEach(() => {
    eventBus = new snippet.CustomEvents();
    tickBaseCoordinateModel = jasmine.createSpyObj('tickBaseCoordinateModel', ['makeRange']);
    tickBaseCoordinateModel.data = [{}, {}, {}];
    groupTypeEventDetector = new GroupTypeEventDetector({
      chartType: 'chartType',
      eventBus
    });
    groupTypeEventDetector.dimension = { width: 100, height: 100 };
    groupTypeEventDetector.layout = {
      position: { top: 30, left: 40 }
    };
    groupTypeEventDetector.tickBaseCoordinateModel = tickBaseCoordinateModel;
  });

  describe('_showTooltip()', () => {
    let foundData, onShowTooltip;

    beforeEach(() => {
      foundData = {
        indexes: {}
      };
      onShowTooltip = jasmine.createSpy('onShowTooltip');
      eventBus.on('showTooltip', onShowTooltip);
    });

    afterEach(() => {
      eventBus.off('showTooltip', onShowTooltip);
    });

    it("should not fire showTooltip event, when foundData index is bigger than model's data length", () => {
      foundData.indexes.groupIndex = 3;
      groupTypeEventDetector._showTooltip(foundData);

      expect(onShowTooltip).not.toHaveBeenCalled();
    });

    it('should fire showTooltip, when model has data at foundData.indexes.groupIndex', () => {
      foundData.indexes.groupIndex = 2;
      groupTypeEventDetector._showTooltip(foundData);

      expect(onShowTooltip).toHaveBeenCalled();
    });
  });

  describe('_isOuterPosition()', () => {
    let layerX, layerY;

    it('should consider mouse is outside of detector, when layerX < position.left', () => {
      layerX = 20;
      layerY = 40;
      const actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

      expect(actual).toBe(true);
    });

    it('should consider mouse is outside of detector, when layerX > position.left + dimension.width', () => {
      layerX = 150;
      layerY = 40;
      const actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

      expect(actual).toBe(true);
    });

    it('should consider mouse is outside of detector, when layerY < position.top', () => {
      layerX = 40;
      layerY = 20;
      const actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

      expect(actual).toBe(true);
    });

    it('should consider mouse is outside of detector, when layerX > position.top + dimension.height', () => {
      layerX = 40;
      layerY = 140;
      const actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

      expect(actual).toBe(true);
    });

    it('should consider mouse is inside of detector', () => {
      layerX = 50;
      layerY = 50;
      const actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

      expect(actual).toBe(false);
    });
  });
});
