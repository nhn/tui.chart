import { SectorModel } from '@t/components/series';
import { makeStyleObj } from '@src/helpers/style';
import { calculateDegreeToRadian } from '@src/helpers/sector';

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
  const { x, y, radius, startDegree, endDegree, color, style } = sectorModel;

  ctx.beginPath();
  ctx.fillStyle = color;

  if (style) {
    const styleObj = makeStyleObj<SectorStyle, SectorStyleName>(style, sectorStyle);

    Object.keys(styleObj).forEach((key) => {
      ctx[key] = styleObj[key];
    });
  }

  ctx.moveTo(x, y);
  ctx.arc(x, y, radius, calculateDegreeToRadian(startDegree), calculateDegreeToRadian(endDegree));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
