var View = require('../../src/js/views/axisView.js');

describe('test View', function() {
    var view = new View();
    it('test renderDimension', function() {
        var el = view.el,
            size = {width: 500, height: 300};
        view.renderDimension(size);
        expect(el.style.width).toEqual('500px');
        expect(el.style.height).toEqual('300px');
    });

    it('test renderPosition', function() {
        var el = view.el,
            position = {top: 50, right: 50};
        view.renderPosition(position);
        expect(el.style.top).toEqual('50px');
        expect(el.style.right).toEqual('50px');
    });

    it('test getRenderedLabelWidth', function() {
        var labelWidth = view.getRenderedLabelWidth('Label1', 12);
        expect(labelWidth).toBeGreaterThan(30);
    });

    it('test getRenderedLabelHeight', function() {
        var labelHeight = view.getRenderedLabelHeight('Label2', 12);
        expect(labelHeight).toBeGreaterThan(12);
    });

    it('test getRenderedLabelsMaxWidth', function() {
        var data = ['a', 'abcde', 'label1', 'I am a boy.'],
            maxWidth = view.getRenderedLabelsMaxWidth(data, 12);
        expect(maxWidth).toBeGreaterThan(50);
    });

    it('test getRenderedLabelsMaxHeight', function() {
        var data = ['a', 'abcde', 'label1', 'I am a boy.'],
            maxHeight = view.getRenderedLabelsMaxHeight(data, 12);
        expect(maxHeight).toBeGreaterThan(12);
    });
});