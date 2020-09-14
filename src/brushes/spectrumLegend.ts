import { isVerticalAlign, padding } from '@src/store/layout';
import { getTextWidth } from '@src/helpers/calculator';
import { label } from '@src/brushes/label';
import { rect } from '@src/brushes/basic';
import { polygon } from '@src/brushes/polygon';
import {
  SpectrumLegendModel,
  SpectrumLegendTooltipModel,
  SpectrumLegendTooltipPointModel,
} from '@t/components/spectrumLegend';

export const SPECTRUM_LEGEND_LABEL_HEIGHT = 12;
export const spectrumLegendBar = {
  HEIGHT: 6,
  PADDING: 5,
};
export const spectrumLegendTooltip = {
  HEIGHT: 28,
  POINT_WIDTH: 4,
  POINT_HEIGHT: 4,
  PADDING: 6,
};

// @TODO: 여러번 계산하는 로직은 최 상단에서 계싼해서 넘겨줘도 될듯
function getMaxLengthLabelWidth(labels: string[]) {
  const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');

  return getTextWidth(maxLengthLabel);
}

function getBarLayout(model: SpectrumLegendModel) {
  const { align, x, y, labels, width } = model;

  if (align === 'top') {
    return { x, y: y + SPECTRUM_LEGEND_LABEL_HEIGHT + spectrumLegendBar.PADDING };
  }

  if (align === 'bottom') {
    return { x, y: y + spectrumLegendTooltip.HEIGHT };
  }

  if (align === 'left') {
    return {
      x: x + getMaxLengthLabelWidth(labels) + spectrumLegendBar.PADDING,
      y: y + SPECTRUM_LEGEND_LABEL_HEIGHT / 2,
    };
  }

  if (align === 'right') {
    return {
      x:
        x +
        width -
        (getMaxLengthLabelWidth(labels) +
          padding.X +
          spectrumLegendBar.PADDING * 2 +
          spectrumLegendBar.HEIGHT),
      y: y + SPECTRUM_LEGEND_LABEL_HEIGHT / 2,
    };
  }
}

function getLabelsLayout(model: SpectrumLegendModel) {
  const { align, x, y, labels, width } = model;

  if (align === 'top') {
    return { x, y };
  }

  if (align === 'bottom') {
    return {
      x,
      y: y + spectrumLegendTooltip.HEIGHT + spectrumLegendBar.HEIGHT + spectrumLegendBar.PADDING,
    };
  }

  if (align === 'left') {
    return { x: x + getMaxLengthLabelWidth(labels), y };
  }

  if (align === 'right') {
    return { x: x + width - getMaxLengthLabelWidth(labels) - padding.X, y };
  }
}

function getBarSize(width: number, height: number, verticalAlign: boolean) {
  const barWidth = verticalAlign ? width : spectrumLegendBar.HEIGHT;
  const barHeight = verticalAlign
    ? spectrumLegendBar.HEIGHT
    : height - SPECTRUM_LEGEND_LABEL_HEIGHT;

  return { barWidth, barHeight };
}

function drawLabels(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const { labels, align, x, y, width, height } = model;
  const verticalAlign = isVerticalAlign(align);
  const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);

  const labelSize = labels.length - 1;

  const styleMap = {
    left: {
      textAlign: 'right',
      textBaseline: 'top',
    },
    right: {
      textAlign: 'left',
      textBaseline: 'top',
    },
    top: {
      textAlign: 'center',
      textBaseline: 'top',
    },
    bottom: {
      textAlign: 'center',
      textBaseline: 'top',
    },
  };

  labels.forEach((text, idx) => {
    const startX = verticalAlign ? x + (barWidth / labelSize) * idx : x;
    const startY = verticalAlign ? y : y + (barHeight / labelSize) * idx;

    label(ctx, {
      type: 'label',
      x: startX,
      y: startY,
      text: String(text),
      style: ['default', { ...styleMap[align] }],
    });
  });
}

function drawBar(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const { align, width, height, startColor, endColor, x, y } = model;
  const verticalAlign = isVerticalAlign(align);
  const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);
  let grd;

  if (verticalAlign) {
    grd = ctx.createLinearGradient(x, y, x + barWidth, y);
  } else {
    grd = ctx.createLinearGradient(x, y, x, y + barHeight);
  }
  grd.addColorStop(0, startColor);
  grd.addColorStop(1, endColor);

  ctx.fillStyle = grd;
  ctx.fillRect(x, y, barWidth, barHeight);
}

export function spectrumLegend(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const barLayout = getBarLayout(model);
  const labelsLayout = getLabelsLayout(model);

  drawLabels(ctx, { ...model, ...labelsLayout });
  drawBar(ctx, { ...model, ...barLayout });
}

function drawTooltipPoint(
  ctx: CanvasRenderingContext2D,
  pointModel: SpectrumLegendTooltipPointModel
) {
  const { x, y, color, align } = pointModel;
  let points;

  if (align === 'top') {
    points = [
      { x, y },
      { x: x - spectrumLegendTooltip.POINT_WIDTH / 2, y: y + spectrumLegendTooltip.POINT_HEIGHT },
      { x: x + spectrumLegendTooltip.POINT_WIDTH / 2, y: y + spectrumLegendTooltip.POINT_HEIGHT },
    ];
  } else if (align === 'bottom') {
    points = [
      { x, y },
      { x: x - spectrumLegendTooltip.POINT_WIDTH / 2, y: y - spectrumLegendTooltip.POINT_HEIGHT },
      { x: x + spectrumLegendTooltip.POINT_WIDTH / 2, y: y - spectrumLegendTooltip.POINT_HEIGHT },
    ];
  } else if (align === 'right') {
    points = [
      { x, y },
      { x: x - spectrumLegendTooltip.POINT_HEIGHT, y: y - spectrumLegendTooltip.POINT_WIDTH / 2 },
      { x: x - spectrumLegendTooltip.POINT_HEIGHT, y: y + spectrumLegendTooltip.POINT_WIDTH / 2 },
    ];
  } else {
    points = [
      { x, y },
      { x: x + spectrumLegendTooltip.POINT_HEIGHT, y: y - spectrumLegendTooltip.POINT_WIDTH / 2 },
      { x: x + spectrumLegendTooltip.POINT_HEIGHT, y: y + spectrumLegendTooltip.POINT_WIDTH / 2 },
    ];
  }

  polygon(ctx, { type: 'polygon', color, lineWidth: 0, points, fillColor: color });
}

function getTopPoint(model: SpectrumLegendTooltipModel) {
  const { align, colorRatio, width, height, x, y, labels } = model;
  const verticalAlign = isVerticalAlign(align);

  const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);

  if (align === 'top') {
    return {
      x: x + barWidth * colorRatio,
      y:
        y + SPECTRUM_LEGEND_LABEL_HEIGHT + spectrumLegendBar.HEIGHT + spectrumLegendBar.PADDING * 2,
    };
  }

  if (align === 'bottom') {
    return {
      x: x + barWidth * colorRatio,
      y: y + SPECTRUM_LEGEND_LABEL_HEIGHT + spectrumLegendBar.PADDING * 2,
    };
  }

  if (align === 'left') {
    return {
      x:
        x +
        getMaxLengthLabelWidth(labels) +
        spectrumLegendBar.HEIGHT +
        spectrumLegendBar.PADDING * 2,
      y: y + barHeight * colorRatio + spectrumLegendBar.PADDING,
    };
  }

  if (align === 'right') {
    return {
      x:
        x +
        width -
        (getMaxLengthLabelWidth(labels) +
          padding.X +
          spectrumLegendBar.PADDING * 3 +
          spectrumLegendBar.HEIGHT),
      y: y + barHeight * colorRatio + spectrumLegendBar.PADDING,
    };
  }
}

function drawTooltipBox(ctx: CanvasRenderingContext2D, model: SpectrumLegendTooltipModel) {
  let { x: boxStartX, y: boxStartY } = model;
  const { align, text, color } = model;

  const labelWidth = getTextWidth(text);
  const width = labelWidth + spectrumLegendTooltip.PADDING * 2;
  const height = SPECTRUM_LEGEND_LABEL_HEIGHT + spectrumLegendTooltip.PADDING * 2;

  if (align === 'top') {
    boxStartY += spectrumLegendTooltip.POINT_HEIGHT;
  } else if (align === 'left') {
    boxStartX += spectrumLegendTooltip.POINT_HEIGHT;
  } else if (align === 'right') {
    boxStartX -= width + spectrumLegendTooltip.POINT_HEIGHT;
  } else {
    boxStartY -= height + spectrumLegendTooltip.POINT_HEIGHT;
  }

  if (isVerticalAlign(align)) {
    boxStartX -= width / 2;
  } else {
    boxStartY -= height / 2;
  }

  rect(ctx, { type: 'rect', x: boxStartX, y: boxStartY, width, height, color });

  label(ctx, {
    type: 'label',
    x: spectrumLegendTooltip.PADDING + boxStartX,
    y: spectrumLegendTooltip.PADDING + boxStartY,
    text,
    style: ['default', { textBaseline: 'top' }],
  });
}

export function spectrumTooltip(ctx: CanvasRenderingContext2D, model: SpectrumLegendTooltipModel) {
  const { x, y } = getTopPoint(model)!;

  drawTooltipPoint(ctx, { ...model, x, y });
  drawTooltipBox(ctx, { ...model, x, y });
}
