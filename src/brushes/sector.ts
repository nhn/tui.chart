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
    x,
    y,
    radius: { inner, outer },
    degree: { start, end },
    color,
    style,
    clockwise,
    drawingStartAngle,
  } = sectorModel;
  const startRadian = calculateDegreeToRadian(start, drawingStartAngle);
  const endRadian = calculateDegreeToRadian(end, drawingStartAngle);
  const { x: innerStartPosX, y: innerStartPosY } = getRadialPosition(x, y, outer, startRadian);
  const startX = inner ? innerStartPosX : x;
  const startY = inner ? innerStartPosY : y;

  ctx.fillStyle = color;
  ctx.beginPath();

  if (style) {
    const styleObj = makeStyleObj<SectorStyle, SectorStyleName>(style, sectorStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  ctx.moveTo(startX, startY);
  ctx.arc(x, y, outer, startRadian, endRadian, !clockwise);

  if (inner) {
    ctx.arc(x, y, inner, endRadian, startRadian, clockwise);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
