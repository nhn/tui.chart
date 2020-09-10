import { LegendIconType } from '@t/store/store';
import { Align, Point } from '@t/options';
import { isVerticalAlign } from '@src/store/layout';

interface RenderOptions {
  iconType: LegendIconType;
  showCheckbox: boolean;
  checked: boolean;
  active: boolean;
  color: string;
  align: Align;
}

type SpectrumLegendModel = {
  align: Align;
} & Point;

export function spectrumLegend(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const { x, y, align } = model;

  const startColor = '#FFE98A';
  const endColor = '#D74177';

  let width = 400;
  let height = 6;
  let grd;

  // label 은 scale에서 뽑아내고
  // treeScale yAxis 로 지정해놓은거는 스펙트럼 너비, 높이 지정으로 되게 해야ㅎ마

  if (isVerticalAlign(align)) {
    grd = ctx.createLinearGradient(x, y, x + width, y);
  } else {
    height = 400;
    width = 6;
    grd = ctx.createLinearGradient(x, y, x, y + height);
  }
  grd.addColorStop(0, startColor);
  grd.addColorStop(1, endColor);

  ctx.fillStyle = grd;
  ctx.fillRect(x, y, width, height);
}
