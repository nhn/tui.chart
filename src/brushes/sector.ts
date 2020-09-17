import { SectorModel } from '@t/components/series';
import { makeStyleObj } from '@src/helpers/style';
import { calculateDegreeToRadian, getRadialPosition } from '@src/helpers/sector';

export type SectorStyle = {
  lineWidth?: number;
  strokeStyle?: string;
  shadowColor?: string;
  shadowBlur?: number;
};

export type SectorStyleName = 'default' | 'hover';

const sectorStyle = {
  default: {
    lineWidth: 0,
    strokeStyle: 'rgba(255, 255, 255, 0)',
  },
  hover: {
    lineWidth: 5,
    strokeStyle: '#ffffff',
    shadowColor: '#cccccc',
    shadowBlur: 5,
  },
};

export function sector(ctx: CanvasRenderingContext2D, sectorModel: SectorModel) {
  const {
    degree: { start, end },
    color,
    style,
  } = sectorModel;

  if (start === end) {
    return;
  }

  const isCircle = Math.abs(start - end) === 360;

  ctx.fillStyle = color;
  ctx.beginPath();

  if (style) {
    const styleObj = makeStyleObj<SectorStyle, SectorStyleName>(style, sectorStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  if (isCircle) {
    drawCircle(ctx, sectorModel);
  } else {
    drawSector(ctx, sectorModel);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSector(ctx: CanvasRenderingContext2D, sectorModel: SectorModel) {
  const {
    x,
    y,
    radius: { inner, outer },
    degree: { start, end },
    clockwise,
    drawingStartAngle,
  } = sectorModel;
  const startRadian = calculateDegreeToRadian(start, drawingStartAngle);
  const endRadian = calculateDegreeToRadian(end, drawingStartAngle);

  if (!inner) {
    ctx.moveTo(x, y);
  }

  ctx.arc(x, y, outer, startRadian, endRadian, !clockwise);

  if (inner) {
    ctx.arc(x, y, inner, endRadian, startRadian, clockwise);
  }
}

function drawCircle(ctx: CanvasRenderingContext2D, sectorModel: SectorModel) {
  const {
    x,
    y,
    radius: { inner, outer },
    clockwise,
  } = sectorModel;

  ctx.arc(x, y, outer, 0, 2 * Math.PI, !clockwise);

  if (inner) {
    const { x: innerStartPosX, y: innerStartPosY } = getRadialPosition(x, y, inner, 0);
    const startX = inner ? innerStartPosX : x;
    const startY = inner ? innerStartPosY : y;

    ctx.moveTo(startX, startY);
    ctx.arc(x, y, inner, 0, 2 * Math.PI, clockwise);
  }
}
