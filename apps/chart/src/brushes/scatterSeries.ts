import { circle, pathRect } from '@src/brushes/basic';
import { ScatterSeriesModel } from '@t/components/series';
import { polygon } from '@src/brushes/polygon';
import { Point } from '@t/options';
import { fillStyle } from '@src/helpers/style';

type RegularPolygonModel = {
  type: 'regularPolygon';
  numberOfSides: number;
  size: number;
  borderColor: string;
  borderWidth: number;
  fillColor: string;
} & Point;

type IconModel = {
  borderColor: string;
  borderWidth: number;
  fillColor: string;
  size: number;
} & Point;

type StarIconModel = { type: 'star' } & IconModel;
type CrossIconModel = { type: 'cross' } & IconModel;

function regularPolygon(ctx: CanvasRenderingContext2D, model: RegularPolygonModel) {
  const { numberOfSides, size, x, y, borderColor, borderWidth, fillColor } = model;
  const s = size / 2;
  const shift =
    numberOfSides % 2 ? (Math.PI / 180.0) * (10 + (numberOfSides - 3) / 2) * numberOfSides : 0;
  const step = (2 * Math.PI) / numberOfSides;

  ctx.beginPath();

  for (let i = 0; i <= numberOfSides; i += 1) {
    const curStep = i * step + shift;

    ctx.lineTo(x + s * Math.cos(curStep), y + s * Math.sin(curStep));
  }

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  fillStyle(ctx, fillColor);
  ctx.stroke();
  ctx.closePath();
}

// https://programmingthomas.wordpress.com/2012/05/16/drawing-stars-with-html5-canvas/
function star(ctx: CanvasRenderingContext2D, model: StarIconModel) {
  const { x, y, borderColor, borderWidth, size, fillColor } = model;

  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = borderColor;
  ctx.fillStyle = fillColor;
  ctx.save();
  ctx.beginPath();
  ctx.translate(x, y);
  ctx.moveTo(0, -size);

  for (let i = 0; i < 5; i += 1) {
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -size / 2);
    ctx.rotate(Math.PI / 5);
    ctx.lineTo(0, -size);
  }

  ctx.fill();
  ctx.stroke();
  ctx.restore();
  ctx.closePath();
}

function cross(ctx: CanvasRenderingContext2D, model: CrossIconModel) {
  const { x, y, borderColor, borderWidth, size, fillColor } = model;

  const quarter = size / 4;
  const half = size / 2;

  const xPointsOffset = [
    -half,
    -half,
    -quarter,
    -quarter,
    quarter,
    quarter,
    half,
    half,
    quarter,
    quarter,
    -quarter,
    -quarter,
  ];
  const yPointsOffset: number[] = [];

  for (let idx = 0, len = xPointsOffset.length; idx < len; idx += 1) {
    const startIdx = 9;
    yPointsOffset.push(xPointsOffset[(startIdx + idx) % len]);
  }

  polygon(ctx, {
    type: 'polygon',
    lineWidth: borderWidth,
    color: borderColor,
    points: xPointsOffset.map((val, idx) => ({ x: x + val, y: y + yPointsOffset[idx] })),
    fillColor,
  });
}

function getNumberOfSidesByIconType(iconType: 'triangle' | 'diamond' | 'pentagon' | 'hexagon') {
  switch (iconType) {
    case 'triangle':
      return 3;
    case 'diamond':
      return 4;
    case 'pentagon':
      return 5;
    case 'hexagon':
      return 6;
  }
}

export function scatterSeries(ctx: CanvasRenderingContext2D, model: ScatterSeriesModel) {
  const { x, y, borderColor, borderWidth, fillColor, iconType, size } = model;
  const commonModel = { x, y, fillColor, borderColor, borderWidth, size };

  ctx.beginPath();

  switch (iconType) {
    case 'rect':
      pathRect(ctx, {
        type: 'pathRect',
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        stroke: borderColor!,
        lineWidth: borderWidth,
        fill: fillColor,
      });
      break;
    case 'triangle':
    case 'pentagon':
    case 'diamond':
    case 'hexagon':
      regularPolygon(ctx, {
        type: 'regularPolygon',
        numberOfSides: getNumberOfSidesByIconType(iconType),
        ...commonModel,
      });
      break;
    case 'star':
      star(ctx, {
        type: 'star',
        ...commonModel,
        size: size / 2,
      });
      break;
    case 'cross':
      cross(ctx, {
        type: 'cross',
        ...commonModel,
      });
      break;
    default:
      circle(ctx, {
        type: 'circle',
        x,
        y,
        radius: size / 2,
        style: [{ strokeStyle: borderColor, lineWidth: borderWidth }],
        color: fillColor,
      });
  }

  ctx.stroke();
  ctx.closePath();
}
