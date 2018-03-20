'use strict';

var RaphaelTitleComponent = require('../../src/js/plugins/raphaelTitleComponent');

describe('RaphaelTitleComponent', function() {
    var raphaelTitleComponent = new RaphaelTitleComponent();

    describe('getTitlePosition() ', function() {
        it('center', function() {
            var offset = {x: 0, y: 0};
            var titleSize = {
                width: 40,
                height: 10
            };
            var actual = raphaelTitleComponent.getTitlePosition(titleSize, 'center', 300, offset).left;

            expect(actual).toBe(150);
        });

        it('right', function() {
            var offset = {x: 0, y: 0};
            var titleSize = {
                width: 40,
                height: 10
            };
            var actual = raphaelTitleComponent.getTitlePosition(titleSize, 'right', 300, offset).left;

            expect(actual).toBe(240);
        });

        it('left', function() {
            var offset = {x: 0, y: 0};
            var titleSize = {
                width: 40,
                height: 10
            };
            var actual = raphaelTitleComponent.getTitlePosition(titleSize, 'left', 300, offset).left;

            expect(actual).toBe(30);
        });
    });
});
