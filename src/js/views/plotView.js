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
     * Constructor
     * @param {object} model plot model
     * @param {object} theme plot theme
     */
    init: function(model, theme) {
        /**
         * Plot model
         * @type {Object}
         */
        this.model = model;

        this.theme = theme;

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
     * @returns {element} plot element
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
            theme = this.theme,
            lineHtml = '';

        lineHtml += this._makeLineHtml(hPositions, dimension.height, 'vertical', 'left', 'height', theme.lineColor);
        lineHtml += this._makeLineHtml(vPositions, dimension.width, 'horizontal', 'bottom', 'width', theme.lineColor);

        this.el.innerHTML = lineHtml;

        this.renderBackground(theme.background);
    },

    /**
     * Makes line html.
     * @param {array} positions positions
     * @param {number} size width or height
     * @param {string} className line className
     * @param {string} positionType position type (left or bottom)
     * @param {string} sizeType size type (size or height)
     * @param {string} lineColor line color
     * @returns {string} html
     * @private
     */
    _makeLineHtml: function(positions, size, className, positionType, sizeType, lineColor) {
        var template = plotTemplate.TPL_PLOT_LINE,
            lineHtml = ne.util.map(positions, function(position) {
            var cssTexts = [
                    this.concatStr(positionType, ':', position, 'px'),
                    this.concatStr(sizeType, ':', size, 'px')
                ], data;

            if (lineColor) {
                cssTexts.push(this.concatStr('background-color:', lineColor));
            }

            data = {className: className, cssText: cssTexts.join(';')};
            return template(data);
        }, this).join('');
        return lineHtml;
    }
});

module.exports = PlotView;