'use strict';

/**
 * @fileoverview Test for Axis.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

var raphael = require('raphael');
var axisFactory = require('../../../src/js/components/axes/axis');
var dom = require('../../../src/js/helpers/domHandler');
var renderUtil = require('../../../src/js/helpers/renderUtil');

describe('Test for Axis', function() {
    var dataProcessor, axis;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        dataProcessor = jasmine.createSpyObj('dataProcessor',
            ['isValidAllSeriesDataModel', 'getCategories', 'isCoordinateType']);

        axis = new axisFactory.Axis({
            theme: {
                title: {
                    fontSize: 12
                },
                label: {
                    fontSize: 12
                },
                tickColor: 'black'
            },
            options: {
                title: {
                    text: 'Axis Title'
                }
            },
            chartTheme: {
                chart: {
                    background: '#fff',
                    opacity: 1
                }
            },
            dataProcessor: dataProcessor
        });
    });

    describe('_renderTitleArea()', function() {
        it('render title area', function() {
            var container = dom.create('div');
            var paper = raphael(container, 200, 200);
            spyOn(axis.graphRenderer, 'renderTitle');

            axis._renderTitleArea(paper, 200);

            expect(axis.graphRenderer.renderTitle).toHaveBeenCalled();
        });

        it('do not render title area, when has no title', function() {
            var container = dom.create('div');
            var paper = raphael(container, 200, 200);
            spyOn(axis.graphRenderer, 'renderTitle');

            delete axis.options.title;
            axis._renderTitleArea(paper, 200);

            expect(axis.graphRenderer.renderTitle).not.toHaveBeenCalled();
        });
    });

    describe('_renderAxisArea()', function() {
        it('divided이 true이면 _renderDividedAxis()를 수행하고 너비를 yAxis 너비만큼 늘려줍니다.', function() {
            var container = dom.create('DIV');

            spyOn(axis, '_renderNotDividedAxis');
            spyOn(axis, '_renderDividedAxis');

            axis.componentName = 'xAxis';
            axis.layout = {
                dimension: {
                    width: 300,
                    height: 50
                },
                position: {
                    top: 20
                }
            };
            axis.dimensionMap = {
                yAxis: {
                    width: 80
                }
            };
            axis.options.divided = true;
            axis.data = {
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            };

            axis._renderAxisArea(container);

            expect(axis._renderNotDividedAxis).not.toHaveBeenCalled();
            expect(axis._renderDividedAxis).toHaveBeenCalled();
        });

        it('divided이 true가 아니면 _renderNotDividedAxis()를 수행합니다.', function() {
            var container = dom.create('DIV');

            spyOn(axis, '_renderNotDividedAxis');
            spyOn(axis, '_renderDividedAxis');

            axis.componentName = 'xAxis';
            axis.layout = {
                dimension: {
                    width: 300,
                    height: 50
                },
                position: {
                    top: 20
                }
            };
            axis.dimensionMap = {
                yAxis: {
                    width: 80
                }
            };
            axis.data = {
                labels: ['label1', 'label2', 'label3'],
                tickCount: 4
            };

            axis._renderAxisArea(container);

            expect(axis._renderNotDividedAxis).toHaveBeenCalled();
            expect(axis._renderDividedAxis).not.toHaveBeenCalled();
        });
    });

    describe('_renderNormalLabels()', function() {
        it('"_renderNormalLabels()" method, the labelMargin option must be reflected in the label position.', function() {
            var labelPosition;

            spyOn(axis.graphRenderer, 'renderLabel');

            axis.layout = {position: {top: 20}};
            axis.options = {
                labelMargin: 30
            };
            axis._renderNormalLabels([0], ['abc'], 0, 0);

            labelPosition = axis.graphRenderer.renderLabel.calls.argsFor(0)[0].positionTopAndLeft;

            expect(labelPosition.top).toBe(67);
        });
    });

    describe('_renderRotationLabels()', function() {
        it('"_renderRotationLabels()" method, the labelMargin option must be reflected in the label position.', function() {
            var labelPosition;

            spyOn(axis.graphRenderer, 'renderRotatedLabel');

            axis.layout = {position: {top: 20}};
            axis.options = {
                labelMargin: 30
            };
            axis._renderRotationLabels([0], ['label1'], 0, 0);

            labelPosition = axis.graphRenderer.renderRotatedLabel.calls.argsFor(0)[0].positionTopAndLeft;

            expect(labelPosition.top).toBe(57);
        });
    });
});
