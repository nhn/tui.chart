/**
 * @fileoverview Test for LineTypeSeriesBase.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var LineTypeSeriesBase = require('../../src/js/series/lineTypeSeriesBase'),
    dom = require('../../src/js/helpers/domHandler'),
    renderUtil = require('../../src/js/helpers/renderUtil');

describe('LineTypeSeriesBase', function() {
    var series;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
    });

    beforeEach(function() {
        series = new LineTypeSeriesBase();
    });

    describe('_makePositions()', function() {
        it('라인차트의 position 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.25, 0.5, 0.4]];
            bounds = series.makePositions({
                width: 300,
                height: 200
            });
            expect(bounds).toEqual([
                [
                    {
                        top: 150,
                        left: 60
                    },
                    {
                        top: 100,
                        left: 160
                    },
                    {
                        top: 120,
                        left: 260
                    }
                ]
            ]);
        });

        it('aligned 옵션이 true이면 tick라인에 맞춰 시작 left와 step이 변경됩니다.', function () {
            var bounds;
            series.percentValues = [[0.25, 0.5, 0.4]];
            series.aligned = true;
            bounds = series.makePositions({
                width: 300,
                height: 200
            });
            expect(bounds).toEqual([
                [
                    {
                        top: 150,
                        left: 10
                    },
                    {
                        top: 100,
                        left: 160
                    },
                    {
                        top: 120,
                        left: 310
                    }
                ]
            ]);
        });
    });

    describe('_renderSeriesLabel()', function() {
        it('라인차트에서 series label을 렌더링 하면 label은 dot위치 상단에 중앙(상하,좌우)정렬하여 위치하게 됩니다.', function() {
            var container = dom.create('div'),
                children;

            series.options = {
                showLabel: true
            };
            series.theme = {
                label: {}
            };
            series._renderSeriesLabel({
                container: container,
                groupPositions: [
                    [
                        {
                            top: 50,
                            left: 50
                        },
                        {
                            top: 70,
                            left: 150
                        }
                    ]
                ],
                dimension: {
                    width: 100,
                    height: 100
                },
                formattedValues: [
                    ['1.5', '2.2']
                ]
            });
            children = container.firstChild.childNodes;
            expect(children[0].style.left).toBe('25px');
            expect(children[0].style.top).toBe('25px');
            expect(children[0].innerHTML).toBe('1.5');

            expect(children[1].style.left).toBe('125px');
            expect(children[1].style.top).toBe('45px');
            expect(children[1].innerHTML).toBe('2.2');
        });
    });
});
