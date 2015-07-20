/**
 * @fileoverview PlotView render plot area.
 * @author NHN Ent.
 *         FE Development Team <jiung.kang@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    plotTemplate = require('./plotTemplate.js');

/**
 * @classdesc PlotView render plot area.
 * @class
 * @augments View
 */
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

        View.call(this);
    },

    /**
     * Plot view renderer
     * @param {{width: number, height: number, top: number, right: number}} bound plot area bound
     * @returns {element}
     */
    render: function(bound) {
        this.renderDimension(bound.dimension);
        this.renderPosition(bound.position);
        this._renderLines(bound.dimension);

        return this.el;
    },

    /**
     * Plot line renderer
     * @param {{width: number, height: number}} dimension plot area dimension
     * @private
     */
    _renderLines: function(dimension) {
        var hPositions = this.model.makeHPixelPositions(dimension.width),
            vPositions = this.model.makeVPixelPositions(dimension.height),
            options = this.model.options,
            lineHtml = '';

        lineHtml += this._makeLineHtml(hPositions, dimension.height, 'vertical', 'left', 'height', options);
        lineHtml += this._makeLineHtml(vPositions, dimension.width, 'horizontal', 'bottom', 'width', options);

        this.el.innerHTML = lineHtml;

        if(options.backgroundColor) {
            this.el.style.backgroundColor = options.backgroundColor;
        }
    },

    /**
     * Makes line html
     * @param {array} positions
     * @param {number} size size or height
     * @param {string} className line className
     * @param {string} positionType position type (left or bottom)
     * @param {string} sizeType size type (size or height)
     * @returns {string}
     * @private
     */
    _makeLineHtml: function(positions, size, className, positionType, sizeType, options) {
        var lineHtml = ne.util.map(positions, function(position) {
            var cssTexts = [
                    [positionType, ':', position, 'px'].join(''),
                    [sizeType, ':', size, 'px'].join('')
                ], data;

            if(options.lineColor) {
                cssTexts.push(['background-color', options.lineColor].join(':'));
            }

            data = {className: className, cssText: cssTexts.join(';')};
            return plotTemplate.TPL_PLOT_LINE(data);
        }).join('');
        return lineHtml;
    }
});

module.exports = PlotView;