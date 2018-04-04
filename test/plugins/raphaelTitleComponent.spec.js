'use strict';

var RaphaelTitleComponent = require('../../src/js/plugins/raphaelTitleComponent');

describe('RaphaelTitleComponent', function() {
    var raphaelTitleComponent = new RaphaelTitleComponent();

    describe('getTitlePosition() ', function() {
        it('position should have a value with the align center state applied.', function() {
            var offset = {x: 0, y: 0};
            var titleSize = {
                width: 40,
                height: 10
            };
            var actual = raphaelTitleComponent.getTitlePosition(titleSize, 'center', 300, offset).left;

            expect(actual).toBe(150);
        });

        it('position should have a value with the align right state applied.', function() {
            var offset = {x: 0, y: 0};
            var titleSize = {
                width: 40,
                height: 10
            };
            var actual = raphaelTitleComponent.getTitlePosition(titleSize, 'right', 300, offset).left;

            expect(actual).toBe(240);
        });

        it('position should have a value with the align left state applied.', function() {
            var offset = {x: 0, y: 0};
            var titleSize = {
                width: 40,
                height: 10
            };
            var actual = raphaelTitleComponent.getTitlePosition(titleSize, 'left', 300, offset).left;

            expect(actual).toBe(10);
        });
    });
});
