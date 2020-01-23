/**
 * @fileoverview RaphaelCircleLegend is graph renderer for circleLegend.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphaelRenderUtil from './raphaelRenderUtil';

/**
 * @classdesc RaphaelCircleLegend is graph renderer for circleLegend.
 * @class RaphaelCircleLegend
 * @private
 */
class RaphaelCircleLegend {
  /**
   * Render circle and label.
   * @param {object} paper paper object
   * @param {{width: number, height: number}} layout - layout of circle legend area
   * @param {number} maxRadius - pixel type maximum radius
   * @param {Array.<number>} radiusRatios - radius ratios
   * @param {Array.<string>} labels - circle legend labels
   * @returns {Array.<object>}
   * @private
   */
  render(paper, layout, maxRadius, radiusRatios, labels) {
    const left = layout.position.left + layout.dimension.width / 2;
    const circleLegendSet = paper.set();

    radiusRatios.forEach((ratio, index) => {
      const radius = maxRadius * ratio;
      const top = layout.position.top + layout.dimension.height - radius;
      const circle = raphaelRenderUtil.renderCircle(
        paper,
        {
          left,
          top
        },
        radius,
        {
          fill: 'none',
          opacity: 1,
          stroke: '#888',
          'stroke-width': 1
        }
      );

      circleLegendSet.push(circle);

      circleLegendSet.push(
        raphaelRenderUtil.renderText(
          paper,
          {
            left,
            top: top - radius - 5
          },
          labels[index]
        )
      );
    });

    return circleLegendSet;
  }
}

export default RaphaelCircleLegend;
