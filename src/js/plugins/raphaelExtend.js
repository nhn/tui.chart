'use strict';

var Raphael = window.Raphael;

if (!Raphael.fn.fixedText) {
    Raphael.fn.fixedText = function() {
        var text = this.text.apply(this, arguments);
        var attrs = arguments[3];

        if (attrs) {
            text.attr(attrs);
        }

        // for raphael's svg bug;
        if (Raphael.svg) {
            text.node.getElementsByTagName('tspan')[0].setAttribute('dy', 0);
        }

        return text;
    };
}
