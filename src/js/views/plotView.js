/**
 * @fileoverview PlotView render plot area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    plotTemplate = require('./plotTemplate.js')

var PlotView = ne.util.defineClass(View, {
    /**
     * constructor
     * @param {object} model plot model
     */
    init: function(model) {
        /**
         * Plot model
         * @type {Object}
         */
        this.model = model;

        /**
         * Plot view className
         * @type {string}
         */
        this.className = 'plot-area';

        View.prototype.init.call(this);
    },

    /**
     * Plot view renderer
     * @param {{width: number, height:number}} size plot area size
     * @returns {element}
     */
    render: function(size) {
        this.renderSize(size);
        this._renderLines(size);

        return this.el;
    },

    /**
     * Plot line renderer
     * @param {{width: number, height: number}} size plot area size
     * @private
     */
    _renderLines: function(size) {
        var hPositions = this.model.makeHPixelPositions(size.width),
            vPositions = this.model.makeVPixelPositions(size.height),
            lineHtml = '';

        lineHtml += this._makeLineHtml(hPositions, size.height, 'vertical', 'left', 'height');
        lineHtml += this._makeLineHtml(vPositions, size.width, 'horizontal', 'bottom', 'width');

        this.el.innerHTML = lineHtml;
    },

    /**
     * Makes line html
     * @param {array} positions
     * @param {number} width width or height
     * @param {string} className line className
     * @param {string} positionType position type (left or bottom)
     * @param {string} sizeType size type (width or height)
     * @returns {string}
     * @private
     */
    _makeLineHtml: function(positions, width, className, positionType, sizeType) {
        var lineHtml = ne.util.map(positions, function(position) {
            var cssText = [
                    [positionType, ':', position, 'px'].join(''),
                    [sizeType, ':', width, 'px'].join('')
                ].join(';'),
                data = {className: className, cssText: cssText};
            return plotTemplate.TPL_PLOT_LINE(data);
        }).join('');
        return lineHtml;
    }
});

module.exports = PlotView;