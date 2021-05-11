import { circle, line, rect } from '@src/brushes/basic';
import { linePoints, areaPoints } from '@src/brushes/lineSeries';
import { tick } from '@src/brushes/axis';
import { circleLegend } from '@src/brushes/circleLegend';
import { legend } from '@src/brushes/legend';
import { label, bubbleLabel } from '@src/brushes/label';
import { resetButton, backButton } from '@src/brushes/resetButton';
import { sector } from '@src/brushes/sector';
import { spectrumLegend, spectrumTooltip } from '@src/brushes/spectrumLegend';
import { CircleStyleName } from '@t/brushes';
import '@src/css/chart.css';

import {
  AreaPointsModel,
  CircleModel,
  CircleStyle,
  LinePointsModel,
  StyleProp,
  ClockHandModel,
} from '@t/components/series';
import {
  withKnobs,
  number,
  radios,
  optionsKnob as options,
  boolean,
  text,
} from '@storybook/addon-knobs';
import { setSplineControlPoint } from '@src/helpers/calculator';
import { LineModel, TickModel, LabelModel } from '@t/components/axis';
import { Point } from '@t/options';
import { polygon } from '@src/brushes/polygon';
import { scatterSeries } from '@src/brushes/scatterSeries';
import { getRadialPosition, calculateDegreeToRadian } from '@src/helpers/sector';
import { clockHand } from '@src/brushes/gauge';

export default {
  title: 'etc/brushes',
  decorators: [withKnobs],
};

type BezierOptions = 'basic' | 'bezier';

function getLinePointsModel(bezier: BezierOptions) {
  const model = [
    { x: 50, y: 100 },
    { x: 200, y: 50 },
    { x: 350, y: 200 },
    { x: 500, y: 150 },
  ];

  if (bezier === 'bezier') {
    setSplineControlPoint(model);
  }

  return model;
}

function getAreaPointsModel(bezier: BezierOptions) {
  const model = [
    { x: 50, y: 100 },
    { x: 200, y: 50 },
    { x: 350, y: 200 },
    { x: 500, y: 150 },
    { x: 500, y: 250 },
    { x: 50, y: 250 },
  ];

  if (bezier === 'bezier') {
    setSplineControlPoint(model);
  }

  return model;
}

const linePointsModel = (lineWidth: number, color: string, bezier: BezierOptions) =>
  ({
    color,
    lineWidth,
    points: getLinePointsModel(bezier),
    seriesIndex: 0,
    type: 'linePoints',
  } as LinePointsModel);

const circleModel = (
  point: Point,
  radius: number,
  color: string,
  style: StyleProp<CircleStyle, CircleStyleName>
) =>
  ({
    color,
    radius,
    style,
    seriesIndex: 0,
    type: 'circle',
    ...point,
  } as CircleModel);

const areaPointsModel = (fillColor: string, bezier: BezierOptions) =>
  ({
    fillColor,
    points: getAreaPointsModel(bezier),
    type: 'areaPoints',
  } as AreaPointsModel);

function setup() {
  const el = document.createElement('div');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const ratio = window.devicePixelRatio;
  const width = 1000;
  const height = 600;

  el.style.width = `${width}px`;
  el.style.height = `${height}px`;

  el.appendChild(canvas);

  canvas.width = width * ratio;
  canvas.height = height * ratio;

  ctx.scale(ratio, ratio);

  return { canvas, ctx, el };
}

export const lineBrush = () => {
  const { ctx, el } = setup();
  const lineWidth = number('lineWidth', 1, {
    range: true,
    min: 1,
    max: 10,
    step: 1,
  });
  const isDashed = boolean('dashed', false);

  const lineModel: LineModel = {
    type: 'line',
    x: 100,
    y: 100,
    x2: 200,
    y2: 200,
    lineWidth,
    dashSegments: isDashed ? [5, 5] : [],
  };
  line(ctx, lineModel);

  return el;
};

export const tickBrush = () => {
  const { ctx, el } = setup();
  const isYAxis = boolean('isYAxis', false);

  const tickModel: TickModel = {
    type: 'tick',
    x: 100,
    y: 100,
    isYAxis,
    tickSize: isYAxis ? -5 : 5,
    strokeStyle: '#333333',
    lineWidth: 2,
  };
  tick(ctx, tickModel);

  return el;
};

export const labelBrush = () => {
  const { ctx, el } = setup();

  const textBaseline = radios(
    'textBaseLine',
    {
      middle: 'middle',
      bottom: 'bottom',
      top: 'top',
      alphabetic: 'alphabetic',
      hanging: 'hanging',
    },
    'middle'
  );
  const textAlign = radios('align', { center: 'center', left: 'left', right: 'right' }, 'center');
  const font = text('font', 'normal 20px Arial');
  const labelModel: LabelModel = {
    type: 'label',
    x: 100,
    y: 100,
    text: 'HAYag',
    style: ['default', { textAlign, textBaseline, font }],
  };

  label(ctx, labelModel);
  label(ctx, {
    type: 'label',
    x: 200,
    y: 100,
    text: 'Stroke Text',
    style: ['default', { textAlign, textBaseline, font, fillStyle: '#ffffff' }],
    stroke: ['stroke', { lineWidth: 5, strokeStyle: '#9c27b0' }],
  } as LabelModel);

  return el;
};

export const linePointsBrush = () => {
  const { ctx, el } = setup();
  const color = radios('color', { green: 'green', blue: 'blue', red: 'red' }, 'green');
  const lineWidth = number('line width', 3, {
    range: true,
    min: 1,
    max: 10,
    step: 1,
  });
  const bezier = radios('bezier', { basic: 'basic', bezier: 'bezier' }, 'basic');

  linePoints(ctx, linePointsModel(lineWidth, color, bezier));

  return el;
};

export const circleBrush = () => {
  const { ctx, el } = setup();
  const color = radios('color', { green: 'green', blue: 'blue', red: 'red' }, 'green');
  const radius = number('radius', 15, {
    range: true,
    min: 15,
    max: 40,
    step: 5,
  });
  const styleName = options('style name', { default: 'default', hover: 'hover' }, 'default', {
    display: 'multi-select',
  });

  const strokeStyle = radios('strokeStyle', { black: 'black', red: 'red' }, 'black');
  const lineWidth = number('lineWidth', 1, {
    range: true,
    min: 1,
    max: 10,
    step: 1,
  });
  const shadowOffsetY = number('shadowOffsetY', 1, {
    range: true,
    min: 1,
    max: 10,
    step: 1,
  });
  const shadowBlur = number('shadowBlur', 1, {
    range: true,
    min: 1,
    max: 10,
    step: 1,
  });
  const shadowColor = radios('shadowColor', { black: 'black', red: 'red' }, 'black');

  const styleObj = [
    ...styleName,
    {
      strokeStyle,
      lineWidth,
      shadowColor,
      shadowBlur,
      shadowOffsetY,
    },
  ] as StyleProp<CircleStyle, CircleStyleName>;

  circle(ctx, circleModel({ x: 100, y: 100 }, 50, '#a79aff', ['default']));
  circle(ctx, circleModel({ x: 100, y: 300 }, radius, color, styleObj));

  return el;
};

export const areaPointsBrush = () => {
  const { ctx, el } = setup();

  const fillColor = radios('fillColor', { green: 'green', blue: 'blue', red: 'red' }, 'green');
  const bezier = radios('bezier', { basic: 'basic', bezier: 'bezier' }, 'basic');

  areaPoints(ctx, areaPointsModel(fillColor, bezier));

  return el;
};

export const rectBrush = () => {
  const { ctx, el } = setup();

  const color = radios('color', { green: 'green', blue: 'blue', red: 'red' }, 'green');

  rect(ctx, { type: 'rect', x: 300, y: 50, height: 200, width: 100, color });
  rect(ctx, {
    type: 'rect',
    x: 150,
    y: 50,
    height: 200,
    width: 100,
    color,
    thickness: 10,
    style: [
      {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 1,
        shadowOffsetY: -1,
        shadowBlur: 10,
      },
    ],
  });

  return el;
};

export const sectorBrush = () => {
  const { ctx, el } = setup();

  sector(ctx, {
    type: 'sector',
    x: 100,
    y: 150,
    radius: { inner: 0, outer: 50 },
    degree: { start: 0, end: 90 },
    color: '#ff8787',
    clockwise: true,
    drawingStartAngle: -90,
  });

  sector(ctx, {
    type: 'sector',
    x: 350,
    y: 150,
    radius: { inner: 50, outer: 100 },
    degree: { start: 90, end: 180 },
    color: '#00bcd4',
    clockwise: false,
    drawingStartAngle: -90,
  });

  return el;
};

export const polygonBrush = () => {
  const { ctx, el } = setup();

  polygon(ctx, {
    type: 'polygon',
    color: '#d54062',
    lineWidth: 6,
    points: [
      { x: 100, y: 100 },
      { x: 150, y: 150 },
      { x: 100, y: 200 },
      { x: 50, y: 150 },
    ],
  });

  polygon(ctx, {
    type: 'polygon',
    color: '#ffa36c',
    lineWidth: 1,
    points: [
      { x: 300, y: 100 },
      { x: 380, y: 150 },
      { x: 380, y: 220 },
      { x: 300, y: 270 },
      { x: 220, y: 220 },
      { x: 220, y: 150 },
    ],
  });

  return el;
};

export const circleLegendBrush = () => {
  const { ctx, el } = setup();

  circleLegend(ctx, {
    type: 'circleLegend',
    x: 150,
    y: 150,
    radius: 50,
    value: 19222220304,
  });

  circleLegend(ctx, {
    type: 'circleLegend',
    x: 350,
    y: 150,
    radius: 100,
    value: 10,
  });

  return el;
};

export const legendBrush = () => {
  const { ctx, el } = setup();

  legend(ctx, {
    type: 'legend',
    align: 'right',
    showCheckbox: true,
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: 'normal',
    color: '#333333',
    data: [
      {
        label: 'circle-checked-active',
        viewLabel: 'circle-checked-active',
        color: '#ff4250',
        checked: true,
        active: true,
        x: 100,
        y: 100,
        iconType: 'circle',
        chartType: 'scatter',
        useScatterChartIcon: false,
        rowIndex: 0,
        columnIndex: 0,
      },
      {
        label: 'circle-checked-inactive',
        viewLabel: 'circle-checked-inactive',
        color: '#ff4250',
        checked: true,
        active: false,
        x: 100,
        y: 120,
        iconType: 'circle',
        chartType: 'scatter',
        useScatterChartIcon: false,
        rowIndex: 1,
        columnIndex: 0,
      },
      {
        label: 'circle-unchecked-active',
        viewLabel: 'circle-unchecked-active',
        color: '#ff4250',
        checked: false,
        active: true,
        x: 100,
        y: 140,
        iconType: 'circle',
        chartType: 'scatter',
        useScatterChartIcon: false,
        rowIndex: 2,
        columnIndex: 0,
      },
    ],
  });

  legend(ctx, {
    type: 'legend',
    align: 'right',
    showCheckbox: false,
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: 'normal',
    color: '#333333',
    data: [
      {
        label: 'circle-unchecked-active-hideCheckbox',
        viewLabel: 'circle-unchecked-active-hideCheckbox',
        color: '#510a32',
        checked: false,
        active: true,
        x: 100,
        y: 160,
        iconType: 'circle',
        chartType: 'scatter',
        useScatterChartIcon: false,
        rowIndex: 0,
        columnIndex: 0,
      },
    ],
  });

  legend(ctx, {
    type: 'legend',
    align: 'right',
    showCheckbox: true,
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: 'normal',
    color: '#333333',
    data: [
      {
        label: 'line-checked-active',
        viewLabel: 'line-checked-active',
        color: '#f9d423',
        checked: true,
        active: true,
        x: 100,
        y: 180,
        iconType: 'line',
        chartType: 'line',
        rowIndex: 0,
        columnIndex: 0,
        useScatterChartIcon: false,
      },
      {
        label: 'line-checked-inactive',
        viewLabel: 'line-checked-inactive',
        color: '#f9d423',
        checked: true,
        active: false,
        x: 100,
        y: 200,
        iconType: 'line',
        chartType: 'line',
        rowIndex: 1,
        columnIndex: 0,
        useScatterChartIcon: false,
      },
    ],
  });

  legend(ctx, {
    type: 'legend',
    align: 'right',
    showCheckbox: true,
    fontFamily: 'Arial',
    fontSize: 11,
    fontWeight: 'normal',
    color: '#333333',
    data: [
      {
        label: 'rect-checked-active',
        viewLabel: 'rect-checked-active',
        color: '#83af9b',
        checked: true,
        active: true,
        x: 100,
        y: 220,
        iconType: 'rect',
        chartType: 'area',
        rowIndex: 0,
        columnIndex: 0,
        useScatterChartIcon: false,
      },
      {
        label: 'rect-checked-inactive',
        viewLabel: 'rect-checked-inactive',
        color: '#83af9b',
        checked: true,
        active: false,
        x: 100,
        y: 240,
        iconType: 'rect',
        chartType: 'area',
        rowIndex: 1,
        columnIndex: 0,
        useScatterChartIcon: false,
      },
    ],
  });

  return el;
};

export const resetButtonBrush = () => {
  const { ctx, el } = setup();

  resetButton(ctx, {
    type: 'resetButton',
    x: 100,
    y: 100,
  });

  backButton(ctx, {
    type: 'backButton',
    x: 200,
    y: 100,
  });

  return el;
};

export const spectrumLegendVerticalBrush = () => {
  const { ctx, el } = setup();

  const labels = ['0', '100', '200', '300', '400', '500'];
  const startColor = '#FFE98A';
  const endColor = '#D74177';
  const width = 800;
  const height = 100;
  const params = { width, height, labels, startColor, endColor, verticalAlign: true };
  const tooltipParams = {
    width,
    height,
    labels,
    color: '#e8857f',
    text: '300',
    colorRatio: 0.4,
    verticalAlign: true,
  };

  spectrumLegend(ctx, { type: 'spectrumLegend', x: 10, y: 100, align: 'top', ...params });
  spectrumLegend(ctx, { type: 'spectrumLegend', x: 10, y: 400, align: 'bottom', ...params });

  spectrumTooltip(ctx, { type: 'spectrumTooltip', x: 170, y: 100, align: 'top', ...tooltipParams });
  spectrumTooltip(ctx, {
    type: 'spectrumTooltip',
    x: 170,
    y: 400,
    align: 'bottom',
    ...tooltipParams,
  });

  return el;
};

export const spectrumLegendHorizontalBrush = () => {
  const { ctx, el } = setup();

  const labels = ['0', '100', '200', '300', '400', '500'];
  const startColor = '#FFE98A';
  const endColor = '#D74177';
  const width = 100;
  const height = 500;
  const params = { width, height, labels, startColor, endColor, verticalAlign: false };
  const tooltipParams = {
    width,
    height,
    labels,
    color: '#e8857f',
    text: '300',
    colorRatio: 0.4,
    verticalAlign: false,
  };

  spectrumLegend(ctx, { type: 'spectrumLegend', x: 10, y: 10, align: 'left', ...params });
  spectrumLegend(ctx, { type: 'spectrumLegend', x: 300, y: 10, align: 'right', ...params });

  spectrumTooltip(ctx, { type: 'spectrumTooltip', x: 10, y: 108, align: 'left', ...tooltipParams });
  spectrumTooltip(ctx, {
    type: 'spectrumTooltip',
    x: 300,
    y: 108,
    align: 'right',
    ...tooltipParams,
  });

  return el;
};

export const scatterSeriesBrush = () => {
  const { ctx, el } = setup();

  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'star',
    x: 150,
    y: 10,
    borderColor: '#ff6600',
    fillColor: '#dd6699',
    borderWidth: 1.5,
    size: 12,
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'circle',
    x: 10,
    y: 10,
    borderColor: '#ff6600',
    borderWidth: 1.5,
    size: 12,
    fillColor: '#dd6699',
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'rect',
    x: 30,
    y: 10,
    borderColor: '#ff6600',
    borderWidth: 1,
    size: 10,
    fillColor: '#dd6699',
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'triangle',
    x: 50,
    y: 10,
    borderColor: '#ff6600',
    fillColor: '#dd6699',
    borderWidth: 1.5,
    size: 12,
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'diamond',
    x: 70,
    y: 10,
    borderColor: '#ff6600',
    fillColor: '#dd6699',
    borderWidth: 1.5,
    size: 12,
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'pentagon',
    x: 90,
    y: 10,
    borderColor: '#ff6600',
    fillColor: '#dd6699',
    borderWidth: 1.5,
    size: 12,
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'hexagon',
    x: 110,
    y: 10,
    borderColor: '#ff6600',
    fillColor: '#dd6699',
    borderWidth: 1.5,
    size: 12,
  });
  scatterSeries(ctx, {
    type: 'scatterSeries',
    iconType: 'cross',
    x: 130,
    y: 10,
    borderColor: '#ff6600',
    fillColor: '#dd6699',
    borderWidth: 1.5,
    size: 12,
  });

  return el;
};

export const bubbleLabelBrush = () => {
  const { ctx, el } = setup();
  const font = 'normal 14px Arial';
  const style = [
    {
      shadowBlur: 5,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      shadowColor: 'rgba(0,0,0,0.2)',
    },
  ];

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    bubble: {
      x: 50,
      y: 50,
      width: 80,
      height: 50,
      radius: 10,
      lineWidth: 1,
      fill: '#ff9800',
      strokeStyle: '#6b4309',
      style,
    },
    label: {
      x: 50,
      y: 75,
      text: 'Start',
      style: [{ textAlign: 'start', textBaseline: 'middle', font }],
    },
  });

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    bubble: {
      x: 200,
      y: 50,
      width: 80,
      height: 50,
      radius: 10,
      lineWidth: 1,
      fill: '#dd6699',
      strokeStyle: '#ff6600',
      style,
    },
    label: {
      x: 240,
      y: 75,
      text: 'Center',
      style: [{ textAlign: 'center', textBaseline: 'middle', font }],
    },
  });

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    bubble: {
      x: 350,
      y: 50,
      width: 80,
      height: 50,
      radius: 10,
      lineWidth: 2,
      fill: '#f9d423',
      strokeStyle: '#5a4c05',
      style,
    },
    label: {
      x: 430,
      y: 75,
      text: 'Right',
      style: [{ textAlign: 'right', textBaseline: 'middle', font }],
    },
  });

  const centerX = 200;
  const centerY = 300;
  const width = 200;
  const height = 50;
  const halfWidth = 100;
  const halfHeight = 25;

  const { x, y } = getRadialPosition(centerX, centerY, 0, calculateDegreeToRadian(315));

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    radian: calculateDegreeToRadian(315, 0),
    rotationPosition: { x, y },
    bubble: {
      x: x - halfWidth,
      y: y - halfHeight,
      width,
      height,
      fill: '#f9d423',
      strokeStyle: '#5a4c05',
      style,
    },
    label: {
      x,
      y,
      text: 'Rotation Center Label',
      style: [{ textAlign: 'center', textBaseline: 'middle', font }],
    },
  });

  const { x: x2, y: y2 } = getRadialPosition(centerX, centerY, 50, calculateDegreeToRadian(315));

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    radian: calculateDegreeToRadian(315, 0),
    rotationPosition: { x: x2, y: y2 },
    bubble: {
      x: x2 - halfWidth,
      y: y2 - halfHeight,
      width,
      height,
      fill: '#f9d423',
      strokeStyle: '#5a4c05',
      style,
    },
    label: {
      x: x2 - halfWidth,
      y: y2,
      text: 'Rotation Left Label',
      style: [{ textAlign: 'left', textBaseline: 'middle', font }],
    },
  });

  const { x: x3, y: y3 } = getRadialPosition(centerX, centerY, 100, calculateDegreeToRadian(315));

  bubbleLabel(ctx, {
    type: 'bubbleLabel',
    radian: calculateDegreeToRadian(315, 0),
    rotationPosition: { x: x3, y: y3 },
    bubble: {
      x: x3 - halfWidth,
      y: y3 - halfHeight,
      width,
      height,
      fill: '#f9d423',
      strokeStyle: '#5a4c05',
      style,
    },
    label: {
      x: x3 + halfWidth,
      y: y3,
      text: 'Rotation Right Label',
      style: [{ textAlign: 'right', textBaseline: 'middle', font }],
    },
  });

  return el;
};

export const clockHandBrush = () => {
  const { ctx, el } = setup();
  clockHand(ctx, {
    color: '#ff0000',
    x: 100,
    y: 100,
    x2: 50,
    y2: 50,
    degree: 315,
    baseLine: 4,
    pin: {
      color: '#ff0000',
      style: [{ strokeStyle: 'rgba(255, 0, 0, 0.1)', lineWidth: 5 }],
      radius: 5,
    },
  } as ClockHandModel);

  return el;
};
