import dom from '../helpers/domHandler';
import snippet from 'tui-code-snippet';

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
const renderers = {
  DOM(container) {
    const paper = dom.create('DIV');
    dom.append(container, paper);

    return paper;
  }
};

class DrawingToolPicker {
  /**
   * DrawingToolPicker initializer
   * @param {{width:number, height:number}} dimension dimension
   * @ignore
   */
  initDimension(dimension) {
    this.dimension = dimension;
  }

  /**
   * Get drawing tool paper
   * @param {HTMLElement} container container element
   * @param {string} rendererType component renderer type
   * @returns {HTMLElement|object}
   * @ignore
   */
  getPaper(container, rendererType) {
    let paper = this[`${rendererType}Paper`];
    const isNeedCreateNewPaper =
      snippet.isExisty(container) &&
      paper &&
      dom.findParentByClass(paper.canvas, 'tui-chart') !== container;

    if (!paper || isNeedCreateNewPaper) {
      paper = renderers[rendererType].call(this, container, this.dimension);

      if (rendererType !== 'DOM') {
        this[`${rendererType}Paper`] = paper;
      }
    }

    return paper;
  }

  /**
   * Add renderer type
   * @param {string} componentType component renderer type
   * @param {function} callback callback function for get renderer's paper
   */
  static addRendererType(componentType, callback) {
    renderers[componentType] = callback;
  }
}

export default DrawingToolPicker;
