/**
 * @fileoverview Test for MouseEventDetectorBase.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var snippet = require('tui-code-snippet');
var MouseEventDetectorBase = require('../../../src/js/components/mouseEventDetectors/mouseEventDetectorBase');
var chartConst = require('../../../src/js/const');

describe('Test for MouseEventDetectorBase', function() {
    var mouseEventDetectorBase;

    beforeEach(function() {
        mouseEventDetectorBase = new MouseEventDetectorBase({
            eventBus: new snippet.CustomEvents()
        });
        mouseEventDetectorBase.positionMap = {
            series: {
                left: 50,
                top: 50
            }
        };
    });

    describe('_isChangedSelectData()', function() {
        it('should return true, when found no data', function() {
            var actual = mouseEventDetectorBase._isChangedSelectData({
                    chartType: 'column'
                }, null),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('should return true, if there is no previous data', function() {
            var actual = mouseEventDetectorBase._isChangedSelectData(null, {
                    chartType: 'line'
                }),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('should return true, if found data is not same to previous one', function() {
            var actual = mouseEventDetectorBase._isChangedSelectData({
                    chartType: 'column'
                }, {
                    chartType: 'line'
                }),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('should return true, if found data\'s groupIndex is not same to previous one', function() {
            var actual = mouseEventDetectorBase._isChangedSelectData({
                    indexes: {
                        groupIndex: 0
                    }
                }, {
                    indexes: {
                        groupIndex: 1
                    }
                }),
                expected = true;
            expect(actual).toBe(expected);
        });

        it('should return true, if found data\'s index is not same to previous one', function() {
            var actual = mouseEventDetectorBase._isChangedSelectData({
                    indexes: {
                        index: 0
                    }
                }, {
                    indexes: {
                        index: 1
                    }
                }),
                expected = true;
            expect(actual).toBe(expected);
        });
    });

    describe('_calculateLayerPosition()', function() {
        beforeEach(function() {
            mouseEventDetectorBase.mouseEventDetectorContainer = jasmine.createSpyObj('mouseEventDetectorContainer', ['getBoundingClientRect']);
        });

        it('should calulate layerX by subtract SERIES_EXPAND_SIZE and rect.left from clientX', function() {
            var actual;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450
            });

            actual = mouseEventDetectorBase._calculateLayerPosition(150);

            expect(actual.x).toBe(140);
        });

        it('should adjust limit, if clientX is less than container.left', function() {
            var actual;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450
            });
            mouseEventDetectorBase.expandSize = chartConst.SERIES_EXPAND_SIZE;

            actual = mouseEventDetectorBase._calculateLayerPosition(30);

            expect(actual.x).toBe(50);
        });

        it('should not adjust limit value, when checkLimit is false', function() {
            var clientX = 30;
            var checkLimit = false;
            var actual, clientY;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450
            });

            actual = mouseEventDetectorBase._calculateLayerPosition(clientX, clientY, checkLimit);

            expect(actual.x).toBe(20);
        });

        it('should adjust position, if clientX is less than event detector left', function() {
            var actual;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450
            });
            mouseEventDetectorBase.expandSize = chartConst.SERIES_EXPAND_SIZE;

            actual = mouseEventDetectorBase._calculateLayerPosition(480);

            expect(actual.x).toBe(430);
        });

        it('should not adjust position, if checkLimit is false even though clientX is less than event detector left.', function() {
            var clientX = 480;
            var checkLimit = false;
            var actual, clientY;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450
            });

            actual = mouseEventDetectorBase._calculateLayerPosition(clientX, clientY, checkLimit);

            expect(actual.x).toBe(470);
        });

        it('should return y when clientY is exist.', function() {
            var actual;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450,
                top: 50
            });

            actual = mouseEventDetectorBase._calculateLayerPosition(150, 150);

            expect(actual.y).toBe(140);
        });

        it('should not return y when no clientY.', function() {
            var actual;

            mouseEventDetectorBase.mouseEventDetectorContainer.getBoundingClientRect.and.returnValue({
                left: 50,
                right: 450,
                top: 50
            });

            actual = mouseEventDetectorBase._calculateLayerPosition(150);

            expect(actual.y).toBeUndefined();
        });
    });
});
