/**
 * @fileoverview PlotView render plot area.
 * @author NHN Ent.
 *         FE Development Team <dl_javascript@nhnent.com>
 */

'use strict';

var View = require('./view.js'),
    plotTemplate = require('./plotTemplate.js');

/**
 * @classdesc PlotView render plot area.
 * @class
 * @augments View
 */
var PlotView = ne.util.defineClass(View, /** @lends PlotView.prototype */ {
    /**
     * PlotView render plot area.
     * @constructs PlotView
     * @extends View
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
        this.className = 'ne-chart-plot-area';

        View.call(this);
    },

    /**
     * Plot view renderer
     * @param {{width: number, height: number, top: number, right: number}} bound plot area bound
     * @returns {HTMLElement} plot element
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

        lineHtml += this._makeLineHtml({
            positions: hPositions,
            size: dimension.height,
            className: 'vertical',
            positionType: 'left',
            sizeType: 'height',
            lineColor: theme.lineColor
        });
        lineHtml += this._makeLineHtml({
            positions: vPositions,
            size: dimension.width,
            className: 'horizontal',
            positionType: 'bottom',
            sizeType: 'width',
            lineColor: theme.lineColor
        });

        this.el.innerHTML = lineHtml;

        this.renderBackground(theme.background);
    },

    /**
     * To make html of plot line.
     * @param {object} params parameters
     *      @param {array.<object>} params.positions positions
     *      @param {number} params.size width or height
     *      @param {string} params.className line className
     *      @param {string} params.positionType position type (left or bottom)
     *      @param {string} params.sizeType size type (size or height)
     *      @param {string} params.lineColor line color
     * @returns {string} html
     * @private
     */
    _makeLineHtml: function(params, positions) {
        var template = plotTemplate.TPL_PLOT_LINE,
            lineHtml = ne.util.map(params.positions, function(position) {
                var cssTexts = [
                        this.concatStr(params.positionType, ':', position, 'px'),
                        this.concatStr(params.sizeType, ':', params.size, 'px')
                    ], data;

                if (params.lineColor) {
                    cssTexts.push(this.concatStr('background-color:', params.lineColor));
                }

                data = {className: params.className, cssText: cssTexts.join(';')};
                return template(data);
            }, this).join('');
        return lineHtml;
    }
});

module.exports = PlotView;