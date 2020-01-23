/**
 * @fileoverview Raphael render plugin.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */

import raphael from 'raphael';
import BarChart from './raphaelBarChart';
import Boxplot from './raphaelBoxplotChart';
import Bullet from './raphaelBulletChart';
import LineChart from './raphaelLineChart';
import AreaChart from './raphaelAreaChart';
import PieChart from './raphaelPieChart';
import RadialLineSeries from './raphaelRadialLineSeries';
import CoordinateTypeChart from './raphaelCoordinateTypeChart';
import BoxTypeChart from './raphaelBoxTypeChart';
import MapChart from './raphaelMapChart';
import legend from './raphaelLegendComponent';
import MapLegend from './raphaelMapLegend';
import CircleLegend from './raphaelCircleLegend';
import title from './raphaelTitleComponent';
import axis from './raphaelAxisComponent';
import RadialPlot from './raphaelRadialPlot';

export const pluginRaphael = {
  bar: BarChart,
  boxplot: Boxplot,
  bullet: Bullet,
  column: BarChart,
  line: LineChart,
  area: AreaChart,
  pie: PieChart,
  bubble: CoordinateTypeChart,
  scatter: CoordinateTypeChart,
  heatmap: BoxTypeChart,
  treemap: BoxTypeChart,
  map: MapChart,
  radial: RadialLineSeries,
  legend,
  mapLegend: MapLegend,
  circleLegend: CircleLegend,
  radialPlot: RadialPlot,
  title,
  axis
};

export const callback = function(container, dimension) {
  const paper = raphael(container, dimension.width, dimension.height);
  const rect = paper.rect(0, 0, dimension.width, dimension.height);

  if (paper.raphael.svg) {
    appendGlowFilterToDefs(paper);
    appendShadowFilterToDefs(paper);
  }

  paper.pushDownBackgroundToBottom = function() {
    rect.toBack();
  };

  paper.changeChartBackgroundColor = function(color) {
    rect.attr({
      fill: color
    });
  };

  paper.changeChartBackgroundOpacity = function(opacity) {
    rect.attr({
      'fill-opacity': opacity
    });
  };

  paper.resizeBackground = function(width, height) {
    rect.attr({
      width,
      height
    });
  };

  rect.attr({
    fill: '#fff',
    'stroke-width': 0
  });

  return paper;
};

/**
 * Append glow filter for series label
 * @param {object} paper Raphael paper object
 * @ignore
 */
function appendGlowFilterToDefs(paper) {
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  const feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
  const feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
  const feMorphology = document.createElementNS('http://www.w3.org/2000/svg', 'feMorphology');
  const feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
  const feMergeNodeColoredBlur = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'feMergeNode'
  );
  const feMergeNodeSourceGraphic = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'feMergeNode'
  );

  filter.id = 'glow';

  feFlood.setAttribute('result', 'flood');
  feFlood.setAttribute('flood-color', '#ffffff');
  feFlood.setAttribute('flood-opacity', '0.5');

  feComposite.setAttribute('in', 'flood');
  feComposite.setAttribute('result', 'mask');
  feComposite.setAttribute('in2', 'SourceGraphic');
  feComposite.setAttribute('operator', 'in');

  feMorphology.setAttribute('in', 'mask');
  feMorphology.setAttribute('result', 'dilated');
  feMorphology.setAttribute('operator', 'dilate');
  feMorphology.setAttribute('radius', '2');

  feGaussianBlur.setAttribute('in', 'dilated');
  feGaussianBlur.setAttribute('result', 'blurred');
  feGaussianBlur.setAttribute('stdDeviation', '1');

  feMergeNodeColoredBlur.setAttribute('in', 'blurred');
  feMergeNodeSourceGraphic.setAttribute('in', 'SourceGraphic');

  filter.appendChild(feFlood);
  filter.appendChild(feComposite);
  filter.appendChild(feMorphology);
  filter.appendChild(feGaussianBlur);

  filter.appendChild(feMerge);

  feMerge.appendChild(feMergeNodeColoredBlur);
  feMerge.appendChild(feMergeNodeSourceGraphic);

  paper.defs.appendChild(filter);
}

/**
 * Append shadow filter for series label
 * @param {object} paper Raphael paper object
 * @ignore
 */
function appendShadowFilterToDefs(paper) {
  const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  const feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
  const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
  const feBlend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');

  filter.setAttributeNS(null, 'id', 'shadow');
  filter.setAttributeNS(null, 'x', '-15%');
  filter.setAttributeNS(null, 'y', '-15%');
  filter.setAttributeNS(null, 'width', '180%');
  filter.setAttributeNS(null, 'height', '180%');
  feOffset.setAttributeNS(null, 'result', 'offOut');
  feOffset.setAttributeNS(null, 'in', 'SourceAlpha');
  feOffset.setAttributeNS(null, 'dx', '2');
  feOffset.setAttributeNS(null, 'dy', '2');
  feGaussianBlur.setAttributeNS(null, 'result', 'blurOut');
  feGaussianBlur.setAttributeNS(null, 'in', 'offOut');
  feGaussianBlur.setAttributeNS(null, 'stdDeviation', '2');
  feBlend.setAttributeNS(null, 'in', 'SourceGraphic');
  feBlend.setAttributeNS(null, 'in2', 'blurOut');
  feBlend.setAttributeNS(null, 'mode', 'normal');
  filter.appendChild(feOffset);
  filter.appendChild(feGaussianBlur);
  filter.appendChild(feBlend);
  paper.defs.appendChild(filter);
}
