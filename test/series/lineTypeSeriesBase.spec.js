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
    var series, makeSeriesLabelHtml;

    beforeAll(function() {
        // 브라우저마다 렌더된 너비, 높이 계산이 다르기 때문에 일관된 결과가 나오도록 처리함
        spyOn(renderUtil, 'getRenderedLabelWidth').and.returnValue(50);
        spyOn(renderUtil, 'getRenderedLabelHeight').and.returnValue(20);
        makeSeriesLabelHtml = jasmine.createSpy('makeSeriesLabelHtml').and.returnValue('<div></div>');
    });

    beforeEach(function() {
        series = new LineTypeSeriesBase();
        series.makeSeriesLabelHtml = makeSeriesLabelHtml;
    });

    describe('_makePositions()', function() {
        it('라인차트의 position 정보를 생성합니다.', function () {
            var bounds;
            series.percentValues = [[0.25, 0.5, 0.4]];
            series.data = {
                aligned: false
            };
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
            series.data = {
                aligned: true
            };
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
        it('라인차트에서 series label은 전달하는 formattedValues의 value숫자 만큼 렌더링 됩니다.', function() {
            var elLabelArea = dom.create('div');
            series.options = {
                showLabel: true
            };
            series.theme = {
                label: {}
            };

            series._renderSeriesLabel({
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
            }, elLabelArea);

            expect(elLabelArea.childNodes.length).toBe(2);
        });
    });
});
