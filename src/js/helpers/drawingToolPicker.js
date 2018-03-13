'use strict';

var dom = require('../helpers/domHandler');
var snippet = require('tui-code-snippet');

/**
 * Get raphael paper
 * @param {HTMLElement} container container element
 * @param {{width:number, height:number}} dimension dimension
 * @returns {object}
 * @private
 */

/**
 * Renderers
 * @type {object}
 * @ignore
 */
var renderers = {
    DOM: function(container) {
        var paper = dom.create('DIV');
        dom.append(container, paper);

        return paper;
    }
};

var DrawingToolPicker = snippet.defineClass({
    /**
     * DrawingToolPicker initializer
     * @param {{width:number, height:number}} dimension dimension
     * @ignore
     */
    initDimension: function(dimension) {
        this.dimension = dimension;
    },

    /**
     * Get drawing tool paper
     * @param {HTMLElement} container container element
     * @param {string} rendererType component renderer type
     * @returns {HTMLElement|object}
     * @ignore
     */
    getPaper: function(container, rendererType) {
        var paper = this[rendererType + 'Paper'];
        var isNeedCreateNewPaper = snippet.isExisty(container)
            && paper && dom.findParentByClass(paper.canvas, 'tui-chart') !== container;

        if (!paper || isNeedCreateNewPaper) {
            paper = renderers[rendererType].call(this, container, this.dimension);

            if (rendererType !== 'DOM') {
                this[rendererType + 'Paper'] = paper;
            }
        }

        return paper;
    }
});

/**
 * Add renderer type
 * @param {string} componentType component renderer type
 * @param {function} callback callback function for get renderer's paper
 */
DrawingToolPicker.addRendererType = function(componentType, callback) {
    renderers[componentType] = callback;
};

module.exports = DrawingToolPicker;
