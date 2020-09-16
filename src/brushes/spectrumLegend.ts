import { padding } from '@src/store/layout';
import { getTextWidth } from '@src/helpers/calculator';
import { label } from '@src/brushes/label';
import { rect } from '@src/brushes/basic';
import { polygon } from '@src/brushes/polygon';
import {
  SpectrumLegendModel,
  SpectrumLegendTooltipModel,
  SpectrumLegendTooltipPointModel,
} from '@t/components/spectrumLegend';
import { LabelStyle } from '@t/components/axis';

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

function getMaxLengthLabelWidth(labels: string[]) {
  const maxLengthLabel = labels.reduce((acc, cur) => (acc.length > cur.length ? acc : cur), '');

  return getTextWidth(maxLengthLabel);
}

function getBarStartPoint(model: SpectrumLegendModel) {
  const { align, x: modelX, y: modelY, labels, width } = model;
  const { PADDING } = spectrumLegendBar;
  let x, y;

  if (align === 'top') {
    x = modelX;
    y = modelY + SPECTRUM_LEGEND_LABEL_HEIGHT + PADDING;
  } else if (align === 'bottom') {
    x = modelX;
    y = modelY + spectrumLegendTooltip.HEIGHT;
  } else if (align === 'left') {
    x = modelX + getMaxLengthLabelWidth(labels) + PADDING;
    y = modelY + SPECTRUM_LEGEND_LABEL_HEIGHT / 2;
  } else {
    x =
      modelX +
      width -
      (getMaxLengthLabelWidth(labels) + padding.X + PADDING * 2 + spectrumLegendBar.HEIGHT);
    y = modelY + SPECTRUM_LEGEND_LABEL_HEIGHT / 2;
  }

  return { x, y };
}

function getLabelsStartPoint(model: SpectrumLegendModel) {
  const { align, x: modelX, y: modelY, labels, width } = model;
  let x, y;

  if (align === 'top') {
    x = modelX;
    y = modelY;
  } else if (align === 'bottom') {
    x = modelX;
    y =
      modelY + spectrumLegendTooltip.HEIGHT + spectrumLegendBar.HEIGHT + spectrumLegendBar.PADDING;
  } else if (align === 'left') {
    x = modelX + getMaxLengthLabelWidth(labels);
    y = modelY;
  } else {
    x = modelX + width - getMaxLengthLabelWidth(labels) - padding.X;
    y = modelY;
  }

  return { x, y };
}

function getBarSize(width: number, height: number, verticalAlign: boolean) {
  const { HEIGHT } = spectrumLegendBar;
  const barWidth = verticalAlign ? width : HEIGHT;
  const barHeight = verticalAlign ? HEIGHT : height - SPECTRUM_LEGEND_LABEL_HEIGHT;

  return { barWidth, barHeight };
}

function drawLabels(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const { labels, align, x, y, width, height, verticalAlign } = model;
  const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);

  const labelSize = labels.length - 1;

  const textBaseStyleMap = {
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
      text,
      style: ['default', textBaseStyleMap[align] as LabelStyle],
    });
  });
}

function drawBar(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const { width, height, startColor, endColor, x, y, verticalAlign } = model;
  const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);
  const gradient = verticalAlign
    ? ctx.createLinearGradient(x, y, x + barWidth, y)
    : ctx.createLinearGradient(x, y, x, y + barHeight);

  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, barWidth, barHeight);
}

function drawTooltipArrow(
  ctx: CanvasRenderingContext2D,
  pointModel: SpectrumLegendTooltipPointModel
) {
  const { POINT_HEIGHT, POINT_WIDTH } = spectrumLegendTooltip;
  const { x, y, color, align } = pointModel;
  let points;

  if (align === 'top') {
    points = [
      { x, y },
      { x: x - POINT_WIDTH / 2, y: y + POINT_HEIGHT },
      { x: x + POINT_WIDTH / 2, y: y + POINT_HEIGHT },
    ];
  } else if (align === 'bottom') {
    points = [
      { x, y },
      { x: x - POINT_WIDTH / 2, y: y - POINT_HEIGHT },
      { x: x + POINT_WIDTH / 2, y: y - POINT_HEIGHT },
    ];
  } else if (align === 'right') {
    points = [
      { x, y },
      { x: x - POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
      { x: x - POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
    ];
  } else {
    points = [
      { x, y },
      { x: x + POINT_HEIGHT, y: y - POINT_WIDTH / 2 },
      { x: x + POINT_HEIGHT, y: y + POINT_WIDTH / 2 },
    ];
  }

  polygon(ctx, { type: 'polygon', color, lineWidth: 0, points, fillColor: color });
}

function getTooltipArrowPoint(model: SpectrumLegendTooltipModel) {
  const { align, colorRatio, width, height, x, y, labels, verticalAlign } = model;
  const { barWidth, barHeight } = getBarSize(width, height, verticalAlign);
  const { PADDING, HEIGHT } = spectrumLegendBar;

  if (align === 'top') {
    return {
      x: x + barWidth * colorRatio,
      y: y + SPECTRUM_LEGEND_LABEL_HEIGHT + HEIGHT + PADDING * 2,
    };
  }

  if (align === 'bottom') {
    return {
      x: x + barWidth * colorRatio,
      y: y + SPECTRUM_LEGEND_LABEL_HEIGHT + PADDING * 2,
    };
  }

  if (align === 'left') {
    return {
      x: x + getMaxLengthLabelWidth(labels) + HEIGHT + PADDING * 2,
      y: y + barHeight * colorRatio + PADDING,
    };
  }

  if (align === 'right') {
    return {
      x: x + width - (getMaxLengthLabelWidth(labels) + padding.X + PADDING * 3 + HEIGHT),
      y: y + barHeight * colorRatio + PADDING,
    };
  }
}

function drawTooltipBox(ctx: CanvasRenderingContext2D, model: SpectrumLegendTooltipModel) {
  const { PADDING, POINT_HEIGHT } = spectrumLegendTooltip;
  let { x: boxStartX, y: boxStartY } = model;
  const { align, text, color, verticalAlign } = model;

  const labelWidth = getTextWidth(text);
  const width = labelWidth + PADDING * 2;
  const height = SPECTRUM_LEGEND_LABEL_HEIGHT + PADDING * 2;

  if (align === 'top') {
    boxStartY += POINT_HEIGHT;
  } else if (align === 'left') {
    boxStartX += POINT_HEIGHT;
  } else if (align === 'right') {
    boxStartX -= width + POINT_HEIGHT;
  } else {
    boxStartY -= height + POINT_HEIGHT;
  }

  if (verticalAlign) {
    boxStartX -= width / 2;
  } else {
    boxStartY -= height / 2;
  }

  rect(ctx, { type: 'rect', x: boxStartX, y: boxStartY, width, height, color });

  label(ctx, {
    type: 'label',
    x: PADDING + boxStartX,
    y: PADDING + boxStartY,
    text,
    style: ['default', { textBaseline: 'top' }],
  });
}

export function spectrumLegend(ctx: CanvasRenderingContext2D, model: SpectrumLegendModel) {
  const labelsStartPoint = getLabelsStartPoint(model);
  const barStartPoint = getBarStartPoint(model);

  drawLabels(ctx, { ...model, ...labelsStartPoint });
  drawBar(ctx, { ...model, ...barStartPoint });
}

export function spectrumTooltip(ctx: CanvasRenderingContext2D, model: SpectrumLegendTooltipModel) {
  const { x, y } = getTooltipArrowPoint(model)!;

  drawTooltipArrow(ctx, { ...model, x, y });
  drawTooltipBox(ctx, { ...model, x, y });
}
