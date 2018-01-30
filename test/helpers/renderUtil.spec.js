/**
 * @fileoverview Test for renderUtil.
 * @author NHN Ent.
 *         FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

var renderUtil = require('../../src/js/helpers/renderUtil.js'),
    dom = require('../../src/js/helpers/domHandler.js');

describe('Test for renderUtil', function() {
    describe('concatStr()', function() {
        it('should concatenate strings. ex) concatStr("a", "b", "c") ---> "abc"', function() {
            var result = renderUtil.concatStr();
            expect(result).toBe('');

            result = renderUtil.concatStr('a', 'b', 'c');
            expect(result).toBe('abc');
        });
    });

    describe('makeFontCssText()', function() {
        it('should make serialized string using css attribute object', function() {
            var result = renderUtil.makeFontCssText({
                fontSize: 12,
                fontFamily: 'Verdana',
                color: 'blue'
            });

            expect(result).toBe('font-size:12px;font-family:Verdana;color:blue');
        });
    });

    describe('_createSizeCheckEl()', function() {
        it('should make HTML Element for checking run time font size.', function() {
            var actual = renderUtil._createSizeCheckEl();

            expect(actual.className).toBe('tui-chart-size-check-element');
            expect(actual.firstChild.nodeName).toBe('SPAN');
        });
    });

    describe('_getRenderedLabelsMaxSize()', function() {
        it('should pick the largest value from execution result', function() {
            var actual = renderUtil._getRenderedLabelsMaxSize(['label1', 'label12'], {}, function(label) {
                return label.length;
            });
            expect(actual).toBe(7);
        });
    });

    describe('renderDimension()', function() {
        it('should set dimension of received element.', function() {
            var el = dom.create('DIV'),
                size = {width: 500, height: 300};
            renderUtil.renderDimension(el, size);
            expect(el.style.width).toBe('500px');
            expect(el.style.height).toBe('300px');
        });
    });

    describe('renderPosition()', function() {
        it('should set position of received element.', function() {
            var el = dom.create('DIV'),
                position = {top: 50, left: 50};
            renderUtil.renderPosition(el, position);
            expect(el.style.top).toBe('50px');
            expect(el.style.left).toBe('50px');
        });
    });

    describe('renderBackground()', function() {
        it('should set background styel to element.', function() {
            var el = dom.create('DIV');
            renderUtil.renderBackground(el, 'red');
            expect(el.style.backgroundColor).toBe('red');
        });
    });

    describe('renderTitle()', function() {
        it('should render title by setting title text, theme style, class name.', function() {
            var elTitle = renderUtil.renderTitle('Test title', {fontSize: 12, background: 'orange'}, 'test-title');
            expect(elTitle.innerHTML).toBe('Test title');
            expect(elTitle.style.fontSize).toBe('12px');
            expect(elTitle.style.backgroundColor).toBe('orange');
            expect(elTitle.className).toBe('test-title');
        });
    });

    describe('makeMouseEventDetectorName()', function() {
        it('should make custom event name', function() {
            var actual = renderUtil.makeMouseEventDetectorName('prefix', 'value', 'suffix'),
                expected = 'prefixValueSuffix';
            expect(actual).toBe(expected);
        });
    });

    describe('formatValue()', function() {
        it('should format values using formatFunction.', function() {
            var formatFunctions = [function(value) {
                    return '00' + value;
                }],
                actual = renderUtil.formatValue({
                    value: 3,
                    formatFunctions: formatFunctions
                }),

                expected = '003';
            expect(actual).toEqual(expected);
        });

        it('legendName argument is present, it should be returned.', function() {
            var spy = jasmine.createSpy('spy');
            renderUtil.formatValue({
                value: 3,
                formatFunctions: [spy],
                legendName: 'newLegend'
            });
            expect(spy.calls.mostRecent().args[4]).toBe('newLegend');
        });
    });

    describe('formatValues()', function() {
        it('should format values from format values', function() {
            var formatFunctions = [
                    function(value) {
                        return '00' + value;
                    }, function(value) {
                        return value + '%';
                    }
                ],
                actual = renderUtil.formatValues([10, 20, 30, 40], formatFunctions),
                expected = ['0010%', '0020%', '0030%', '0040%'];

            expect(actual).toEqual(expected);
        });
    });

    describe('formatToDecimal()', function() {
        it('should round 1.1111 to 2 decimal places', function() {
            var result = renderUtil.formatToDecimal(1.1111, 2);
            expect(result).toBe('1.11');
        });

        it('should append a decimal place to 1, when format "1.0" to 1 decimal place.', function() {
            var result = renderUtil.formatToDecimal(1, 1);
            expect(result).toBe('1.0');
        });
    });

    describe('formatToComma()', function() {
        it('should format 1000 to "1,000".', function() {
            var result = renderUtil.formatToComma(1000);
            expect(result).toBe('1,000');
        });

        it('should format 100000 to "100,000"', function() {
            var result = renderUtil.formatToComma(100000);
            expect(result).toBe('100,000');
        });

        it('should format 1000000 to "1,000,000".', function() {
            var result = renderUtil.formatToComma(1000000);
            expect(result).toBe('1,000,000');
        });

        it('should format -1000000 to "-1,000,000".', function() {
            var result = renderUtil.formatToComma(-1000000);
            expect(result).toBe('-1,000,000');
        });

        it('should not format, if number digits is less than 4', function() {
            var result = renderUtil.formatToComma(900);
            expect(result).toBe(900);
        });

        it('should not format, if number is negative and digits is less than 4', function() {
            var result = renderUtil.formatToComma(-900);
            expect(result).toBe(-900);
        });

        it('should format integer part, when number is float type', function() {
            var result = renderUtil.formatToComma(1000.123);
            expect(result).toBe('1,000.123');
        });
    });

    describe('generateClipRectId()', function() {
        var id;

        beforeEach(function() {
            id = renderUtil.generateClipRectId();
            id = Number(id.slice(20)); // 'clipRectForAnimation'.length
        });

        it('should create unique clipRectId, by increase suffix id', function() {
            var result = renderUtil.generateClipRectId();
            var expected = 'clipRectForAnimation' + (id + 1);

            expect(result).toBe(expected);
        });
    });

    describe('getDefaultSeriesTopAreaHeight()', function() {
        var seriesTheme = {
            fontSize: 11
        };

        it('should return 0, when chart type is not included in bar type or line type', function() {
            var result = renderUtil.getDefaultSeriesTopAreaHeight('chart', seriesTheme);

            expect(result).toBe(0);
        });

        it('should not return 0, when chart type is combo', function() {
            var result = renderUtil.getDefaultSeriesTopAreaHeight('combo', seriesTheme);

            expect(result).toBe(16);
        });

        it('should not return 0, when chart type is bar type', function() {
            var result = renderUtil.getDefaultSeriesTopAreaHeight('bar', seriesTheme);

            expect(result).toBe(16);
        });

        it('should not return 0, when chart type is column type', function() {
            var result = renderUtil.getDefaultSeriesTopAreaHeight('column', seriesTheme);

            expect(result).toBe(16);
        });

        it('should not return 0, when chart type is line type', function() {
            var result = renderUtil.getDefaultSeriesTopAreaHeight('line', seriesTheme);

            expect(result).toBe(16);
        });

        it('should not return 0, when chart type is area type', function() {
            var result = renderUtil.getDefaultSeriesTopAreaHeight('area', seriesTheme);

            expect(result).toBe(16);
        });
    });
});
