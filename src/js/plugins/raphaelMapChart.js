/**
 * @fileoverview RaphaelPieCharts is graph renderer for map chart.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';
import dom from '../helpers/domHandler';
import renderUtil from '../helpers/renderUtil';
import snippet from 'tui-code-snippet';

const { browser } = snippet;
const IS_LTE_IE8 = browser.msie && browser.version <= 8;
const STROKE_COLOR = 'gray';
const ANIMATION_DURATION = 100;
const G_ID = 'tui-chart-series-group';
const FILL_COLOR_OF_NO_DATA = '#eee';

/**
 * @classdesc RaphaelMapCharts is graph renderer for map chart.
 * @class RaphaelMapChart
 * @private
 */
class RaphaelMapChart {
  /**
   * Render function of map chart.
   * @param {object} paper paper object
   * @param {object} data data
   *      @param {{width: number, height: number}} data.dimension series dimension
   *      @param {Array.<{code: string, path: string}>} data.map mapData
   *      @param {ColorSpectrum} data.colorSpectrum color model
   */
  render(paper, data) {
    const mapDimension = data.mapModel.getMapDimension();

    this.ratio = this._getDimensionRatio(data.layout.dimension, mapDimension);
    this.dimension = data.layout.dimension;
    this.position = data.layout.position;
    this.paper = paper;
    this.sectorSet = paper.set();
    this.sectors = this._renderMap(data, this.ratio);

    if (!IS_LTE_IE8) {
      this.g = createGElement(paper, this.sectorSet, G_ID);
    }

    this.overColor = data.theme.overColor;
  }

  /**
   * Get dimension ratio
   * @param {object} dimension dimension
   * @param {object} mapDimension map dimension
   * @returns {number}
   * @private
   */
  _getDimensionRatio(dimension, mapDimension) {
    return Math.min(dimension.height / mapDimension.height, dimension.width / mapDimension.width);
  }

  /**
   * Render map graph.
   * @param {object} data data
   *      @param {{width: number, height: number}} data.dimension series dimension
   *      @param {Array.<{code: string, path: string}>} data.map mapData
   *      @param {ColorSpectrum} data.colorSpectrum color model
   * @param {number} dimensionRatio dimension ratio of rendering by map
   * @returns {Array.<{sector: object, color: string, data: object}>} rendered map information
   * @private
   */
  _renderMap(data, dimensionRatio) {
    const { sectorSet, paper } = this;
    const { position } = data.layout;
    const { colorSpectrum } = data;

    return data.mapModel.getMapData().map((datum, index) => {
      const { ratio, path } = datum;
      const color = ratio ? colorSpectrum.getColor(ratio) : FILL_COLOR_OF_NO_DATA;
      const sector = raphaelRenderUtil.renderArea(paper, path, {
        fill: color,
        opacity: 1,
        stroke: STROKE_COLOR,
        'stroke-width': 0.2,
        'stroke-opacity': 1,
        transform: renderUtil.oneLineTrim`
                  s${dimensionRatio},${dimensionRatio},0,0
                  t${position.left / dimensionRatio},${position.top / dimensionRatio}
                `
      });

      sector.data('index', index);

      sectorSet.push(sector);

      return {
        sector,
        color,
        ratio
      };
    });
  }

  /**
   * Find sector index.
   * @param {{left: number, top: number}} position position
   * @returns {?number} found index
   */
  findSectorIndex(position) {
    const sector = this.paper.getElementByPoint(position.left, position.top);
    const foundIndex = sector && sector.data('index');
    const data = !snippet.isUndefined(foundIndex) && this.sectors[foundIndex];

    return data && !snippet.isUndefined(data.ratio) ? foundIndex : null;
  }

  /**
   * Change color.
   * @param {number} index index
   */
  changeColor(index) {
    const sector = this.sectors[index];
    const attributes = {
      stroke: '#ffffff',
      'stroke-width': 4
    };

    if (this.overColor) {
      attributes.fill = this.overColor;
    }

    sector.sector.animate(attributes, ANIMATION_DURATION, '>');
    sector.sector.node.setAttribute('filter', 'url(#shadow)');
    sector.sector.toFront();
  }

  /**
   * Restore color.
   * @param {number} index index
   */
  restoreColor(index) {
    const sector = this.sectors[index];

    sector.sector.animate(
      {
        fill: sector.color,
        stroke: STROKE_COLOR,
        'stroke-width': 0.2
      },
      ANIMATION_DURATION,
      '>'
    );
    sector.sector.node.setAttribute('filter', 'none');
  }

  /**
   * Scale map sector paths
   * @param {number} changedRatio changed ratio of map
   * @param {object} position position
   * @param {number} mapRatio mapdimension ratio by dimansion
   * @param {object} limitPosition limit position
   * @param {object} mapDimension map dimension
   */
  scaleMapPaths(changedRatio, position, mapRatio, limitPosition, mapDimension) {
    const transformList = this.g.transform.baseVal;
    const zoom = this.paper.canvas.createSVGTransform();
    const matrix = this.paper.canvas.createSVGMatrix();
    const raphaelMatrix = this.paper.raphael.matrix();
    const transformMatrix = transformList.numberOfItems
      ? transformList.getItem(0).matrix
      : {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0
        };
    const maxRight = mapDimension.width - this.dimension.width;
    const maxTop = mapDimension.height - this.dimension.height;
    const previousTranslateX = transformMatrix.e / transformMatrix.a;
    const previousTranslateY = transformMatrix.f / transformMatrix.d;
    const currentLimitRight = -maxRight / transformMatrix.a;
    const currentLimitTop = -maxTop / transformMatrix.d;

    raphaelMatrix.scale(
      changedRatio,
      changedRatio,
      position.left * mapRatio - previousTranslateX * changedRatio,
      position.top * mapRatio - previousTranslateY * changedRatio
    );
    const transformX = raphaelMatrix.e / raphaelMatrix.a + previousTranslateX;
    const transformY = raphaelMatrix.f / raphaelMatrix.d + previousTranslateY;

    if (transformX >= 0) {
      raphaelMatrix.e = -previousTranslateX * raphaelMatrix.a;
    } else if (transformX < currentLimitRight) {
      raphaelMatrix.e = currentLimitRight - previousTranslateX;
    }

    if (transformY >= 0) {
      raphaelMatrix.f = -previousTranslateY * raphaelMatrix.a;
    } else if (transformY < currentLimitTop) {
      raphaelMatrix.f = currentLimitTop - previousTranslateY;
    }

    matrix.a = raphaelMatrix.a;
    matrix.b = raphaelMatrix.b;
    matrix.c = raphaelMatrix.c;
    matrix.d = raphaelMatrix.d;
    matrix.e = raphaelMatrix.e;
    matrix.f = raphaelMatrix.f;

    zoom.setMatrix(matrix);
    transformList.appendItem(zoom);
    transformList.initialize(transformList.consolidate());
  }

  /**
   * Scale map sector paths
   * @param {object} distances drag distance for moving
   * @param {object} mapDimension map dimension
   */
  moveMapPaths(distances, mapDimension) {
    const matrix = this.paper.canvas.createSVGMatrix();
    const raphaelMatrix = this.paper.raphael.matrix();
    const transformList = this.g.transform.baseVal;
    const translate = this.paper.canvas.createSVGTransform();
    const maxRight = mapDimension.width - this.dimension.width;
    const maxTop = mapDimension.height - this.dimension.height;
    const transformMatrix = transformList.numberOfItems
      ? transformList.getItem(0).matrix
      : {
          a: 1,
          b: 0,
          c: 0,
          d: 1,
          e: 0,
          f: 0
        };

    raphaelMatrix.translate(distances.x, distances.y);
    this._translateXForRaphaelMatrix({
      raphaelMatrix,
      transformMatrix,
      maxRight
    });
    this._translateYForRaphaelMatrix({
      raphaelMatrix,
      transformMatrix,
      maxTop
    });

    matrix.a = raphaelMatrix.a;
    matrix.b = raphaelMatrix.b;
    matrix.c = raphaelMatrix.c;
    matrix.d = raphaelMatrix.d;
    matrix.e = raphaelMatrix.e;
    matrix.f = raphaelMatrix.f;

    translate.setMatrix(matrix);
    transformList.appendItem(translate);
    transformList.initialize(transformList.consolidate());
  }

  _translateXForRaphaelMatrix({ raphaelMatrix, transformMatrix, maxRight }) {
    const currentTranslateX = raphaelMatrix.e / raphaelMatrix.a;
    const translateX = currentTranslateX + transformMatrix.e / transformMatrix.a;

    if (translateX >= 0 && currentTranslateX > 0) {
      raphaelMatrix.e = 0;
    } else if (
      translateX < 0 &&
      translateX < -maxRight / transformMatrix.a &&
      currentTranslateX < 0
    ) {
      raphaelMatrix.e = 0;
    }
  }

  _translateYForRaphaelMatrix({ raphaelMatrix, transformMatrix, maxTop }) {
    const currentTranslateY = raphaelMatrix.f / raphaelMatrix.d;
    const translateY = currentTranslateY + transformMatrix.f / transformMatrix.d;

    if (translateY >= 0 && currentTranslateY > 0) {
      raphaelMatrix.f = 0;
    } else if (
      translateY < 0 &&
      translateY < -maxTop / transformMatrix.d &&
      currentTranslateY < 0
    ) {
      raphaelMatrix.f = 0;
    }
  }

  /**
   * Render series labels
   * @param {object} paper Raphael paper
   * @param {Array.<object>} labelData label data
   * @param {object} labelTheme label theme
   * @returns {Array.<object>}
   */
  renderSeriesLabels(paper, labelData, labelTheme) {
    const attributes = {
      'font-size': labelTheme.fontSize,
      'font-family': labelTheme.fontFamily,
      'font-weight': labelTheme.fontWeight,
      fill: labelTheme.color,
      'text-anchor': 'middle',
      opacity: 0,
      transform: renderUtil.oneLineTrim`
                s${this.ratio},${this.ratio},0,0
                t${this.position.left / this.ratio},${this.position.top / this.ratio}
            `
    };
    const set = paper.set();

    labelData.forEach(labelDatum => {
      const { position } = labelDatum;
      const label = raphaelRenderUtil.renderText(
        paper,
        position,
        labelDatum.name || labelDatum.code,
        attributes
      );

      set.push(label);

      label.node.style.userSelect = 'none';
      label.node.style.cursor = 'default';
      label.node.setAttribute('filter', 'url(#glow)');

      if (!IS_LTE_IE8) {
        self.g.appendChild(label.node);
      }
    });

    return set;
  }
}

/**
 * Create and append sector set
 * @param {object} paper Raphael paper
 * @param {Array.<object>} sectorSet sectorSet
 * @param {string} id ID string
 * @returns {object}
 * @ignore
 */
function createGElement(paper, sectorSet, id) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.id = id;

  sectorSet.forEach(sector => {
    dom.append(g, sector.node);
  });

  paper.canvas.appendChild(g);

  return g;
}

export default RaphaelMapChart;
