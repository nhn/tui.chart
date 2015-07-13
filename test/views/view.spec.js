var View = require('../../src/js/views/axisView.js');

describe('test View', function() {
    it('test renderSize', function() {
        var view = new View(),
            el = view.el,
            size = {width: 500, height: 300};
        view.renderSize(size);
        expect(el.style.width).toEqual('500px');
        expect(el.style.height).toEqual('300px');
    });
});