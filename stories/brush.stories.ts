import { circle, line, label, CircleStyleName } from '@src/brushes/basic';
import { linePoints, areaPoints } from '@src/brushes/lineSeries';
import { tick } from '@src/brushes/axis';
import { rect } from '@src/brushes/boxSeries';
import { tooltip } from '@src/brushes/tooltip';

import {
  AreaPointsModel,
  CircleModel,
  CircleStyle,
  LinePointsModel,
  StyleProp
} from '@t/components/series';
import {
  withKnobs,
  number,
  radios,
  optionsKnob as options,
  boolean,
  text
} from '@storybook/addon-knobs';
import { setSplineControlPoint } from '@src/helpers/calculator';
import { LabelModel, LineModel, TickModel } from '@t/components/axis';
import { Point } from '@t/options';

export default {
  title: 'brushes',
  decorators: [withKnobs]
};

type BezierOptions = 'basic' | 'bezier';

function getLinePointsModel(bezier: BezierOptions) {
  const model = [
    { x: 50, y: 100 },
    { x: 200, y: 50 },
    { x: 350, y: 200 },
    { x: 500, y: 150 }
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
    type: 'linePoints'
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
    ...point
  } as CircleModel);

const areaPointsModel = (fillColor: string, bottomYPoint: number, bezier: BezierOptions) =>
  ({
    fillColor,
    bottomYPoint,
    points: getLinePointsModel(bezier),
    seriesIndex: 0,
    type: 'areaPoints'
  } as AreaPointsModel);

function setup() {
  const el = document.createElement('div');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const ratio = window.devicePixelRatio;
  const width = 500;
  const height = 500;

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
  const lineWidth = number('lineWidth', 1, { range: true, min: 1, max: 10, step: 1 });
  const isDashed = boolean('dashed', false);

  const lineModel: LineModel = {
    type: 'line',
    x: 100,
    y: 100,
    x2: 200,
    y2: 200,
    lineWidth,
    dashedPattern: isDashed ? [5, 5] : []
  };
  line(ctx, lineModel);

  return el;
};

export const tickBrush = () => {
  const { ctx, el } = setup();

  const tickModel: TickModel = { type: 'tick', x: 100, y: 100, isYAxis: boolean('isYAxis', false) };
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
      hanging: 'hanging'
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
    style: ['default', { textAlign, textBaseline, font }]
  };

  label(ctx, labelModel);

  return el;
};

export const linePointsBrush = () => {
  const { ctx, el } = setup();
  const color = radios('color', { green: 'green', blue: 'blue', red: 'red' }, 'green');
  const lineWidth = number('line width', 3, { range: true, min: 1, max: 10, step: 1 });
  const bezier = radios('bezier', { basic: 'basic', bezier: 'bezier' }, 'basic');

  linePoints(ctx, linePointsModel(lineWidth, color, bezier));

  return el;
};

export const circleBrush = () => {
  const { ctx, el } = setup();
  const color = radios('color', { green: 'green', blue: 'blue', red: 'red' }, 'green');
  const radius = number('radius', 15, { range: true, min: 15, max: 40, step: 5 });
  const styleName = options('style name', { default: 'default', hover: 'hover' }, 'default', {
    display: 'multi-select'
  });

  const strokeStyle = radios('strokeStyle', { black: 'black', red: 'red' }, 'black');
  const lineWidth = number('lineWidth', 1, { range: true, min: 1, max: 10, step: 1 });
  const shadowOffsetY = number('shadowOffsetY', 1, { range: true, min: 1, max: 10, step: 1 });
  const shadowBlur = number('shadowBlur', 1, { range: true, min: 1, max: 10, step: 1 });
  const shadowColor = radios('shadowColor', { black: 'black', red: 'red' }, 'black');

  const styleObj = [
    ...styleName,
    {
      strokeStyle,
      lineWidth,
      shadowColor,
      shadowBlur,
      shadowOffsetY
    }
  ] as StyleProp<CircleStyle, CircleStyleName>;

  circle(ctx, circleModel({ x: 100, y: 100 }, 50, '#a79aff', ['default']));
  circle(ctx, circleModel({ x: 300, y: 100 }, 50, '#a79aff', ['default', 'hover']));
  circle(ctx, circleModel({ x: 100, y: 300 }, radius, color, styleObj));

  return el;
};

export const areaPointsBrush = () => {
  const { ctx, el } = setup();

  const fillColor = radios('fillColor', { green: 'green', blue: 'blue', red: 'red' }, 'green');
  const bezier = radios('bezier', { basic: 'basic', bezier: 'bezier' }, 'basic');
  const bottomYPoint = number('bottomYPoint', 300, { range: true, min: 300, max: 800, step: 50 });

  areaPoints(ctx, areaPointsModel(fillColor, bottomYPoint, bezier));

  return el;
};

export const rectBrush = () => {
  const { ctx, el } = setup();

  const color = radios('color', { green: 'green', blue: 'blue', red: 'red' }, 'green');

  rect(ctx, { type: 'rect', x: 300, y: 100, height: 200, width: 100, color });
  rect(ctx, {
    type: 'rect',
    x: 100,
    y: 100,
    height: 200,
    width: 100,
    color,
    thickness: 10,
    style: [
      {
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowOffsetX: 1,
        shadowOffsetY: -1,
        shadowBlur: 10
      }
    ]
  });

  return el;
};

export const tooltipBrush = () => {
  const { ctx, el } = setup();

  tooltip(ctx, {
    type: 'tooltip',
    x: 100,
    y: 100,
    data: [{ label: 'A', color: '#ddd', value: 100 }]
  });

  tooltip(ctx, {
    type: 'tooltip',
    x: 300,
    y: 100,
    data: [
      { label: 'A', color: 'blue', value: 100 },
      { label: 'B', color: 'red', value: 5030 },
      { label: 'C', color: 'green', value: 200 }
    ],
    category: 'category name'
  });

  return el;
};
