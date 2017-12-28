/**
 * @fileoverview Test for GroupTypeEventDetector.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var GroupTypeEventDetector = require('../../../src/js/components/mouseEventDetectors/groupTypeEventDetector');

describe('Test for GroupTypeEventDetector', function() {
    var groupTypeEventDetector, eventBus, tickBaseCoordinateModel;

    beforeEach(function() {
        eventBus = new snippet.CustomEvents();
        tickBaseCoordinateModel = jasmine.createSpyObj('tickBaseCoordinateModel', ['makeRange']);
        tickBaseCoordinateModel.data = [{}, {}, {}];
        groupTypeEventDetector = new GroupTypeEventDetector({
            chartType: 'chartType',
            eventBus: eventBus
        });
        groupTypeEventDetector.dimension = {width: 100, height: 100};
        groupTypeEventDetector.layout = {
            position: {top: 30, left: 40}
        };
        groupTypeEventDetector.tickBaseCoordinateModel = tickBaseCoordinateModel;
    });

    describe('_showTooltip()', function() {
        var foundData, onShowTooltip;

        beforeEach(function() {
            foundData = {
                indexes: {}
            };
            onShowTooltip = jasmine.createSpy('onShowTooltip');
            eventBus.on('showTooltip', onShowTooltip);
        });

        afterEach(function() {
            eventBus.off('showTooltip', onShowTooltip);
        });

        it('should not fire showTooltip event, when foundData index is bigger than model\'s data length', function() {
            foundData.indexes.groupIndex = 3;
            groupTypeEventDetector._showTooltip(foundData);

            expect(onShowTooltip).not.toHaveBeenCalled();
        });

        it('should fire showTooltip, when model has data at foundData.indexes.groupIndex', function() {
            foundData.indexes.groupIndex = 2;
            groupTypeEventDetector._showTooltip(foundData);

            expect(onShowTooltip).toHaveBeenCalled();
        });
    });

    describe('_isOuterPosition()', function() {
        var actual, layerX, layerY;

        it('should consider mouse is outside of detector, when layerX < position.left', function() {
            layerX = 20;
            layerY = 40;
            actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

            expect(actual).toBe(true);
        });

        it('should consider mouse is outside of detector, when layerX > position.left + dimension.width', function() {
            layerX = 150;
            layerY = 40;
            actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

            expect(actual).toBe(true);
        });

        it('should consider mouse is outside of detector, when layerY < position.top', function() {
            layerX = 40;
            layerY = 20;
            actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

            expect(actual).toBe(true);
        });

        it('should consider mouse is outside of detector, when layerX > position.top + dimension.height', function() {
            layerX = 40;
            layerY = 140;
            actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

            expect(actual).toBe(true);
        });

        it('should consider mouse is inside of detector', function() {
            layerX = 50;
            layerY = 50;
            actual = groupTypeEventDetector._isOuterPosition(layerX, layerY);

            expect(actual).toBe(false);
        });
    });
});
