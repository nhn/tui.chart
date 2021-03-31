import { Point, PieSeriesOptions, Rect, DataLabelAnchor, RadialBarSeriesOptions } from '@t/options';
import { SectorModel, RadiusRange } from '@t/components/series';
import { pick } from '@src/helpers/utils';
import { RadialDataLabel, RadialAnchor } from '@t/components/dataLabels';

export const DEGREE_180 = 180;
export const DEGREE_NEGATIVE_180 = -180;
export const DEGREE_360 = 360;
export const DEGREE_0 = 0;
export const DEGREE_NEGATIVE_90 = -90;
export const DEGREE_90 = 90;

type RadialPositionParam = {
  anchor: DataLabelAnchor;
  x: number;
  y: number;
  radius: {
    inner: number;
    outer: number;
  };
  degree: {
    start: number;
    end: number;
  };
  drawingStartAngle?: number;
};

const MINIMUM_RADIUS = 10;

export function makeAnchorPositionParam(
  anchor: DataLabelAnchor,
  model: SectorModel | RadialDataLabel
) {
  return {
    anchor,
    ...pick(model, 'x', 'y', 'radius', 'degree', 'drawingStartAngle'),
  };
}

export function calculateDegreeToRadian(degree: number, drawingStartAngle = DEGREE_NEGATIVE_90) {
  let result = 0;

  if (degree % DEGREE_360 === 0) {
    result = (Math.PI / DEGREE_180) * drawingStartAngle;
  } else if (degree >= 0) {
    result = (Math.PI / DEGREE_180) * (degree + drawingStartAngle);
  }

  return result;
}

export function calculateRadianToDegree(radian: number, drawingStartAngle = DEGREE_NEGATIVE_90) {
  return ((radian * DEGREE_180) / Math.PI - drawingStartAngle + DEGREE_360) % DEGREE_360;
}

export function getRadialAnchorPosition(param: RadialPositionParam): Point {
  const {
    anchor,
    x,
    y,
    radius: { inner, outer },
    degree: { start, end },
    drawingStartAngle = DEGREE_NEGATIVE_90,
  } = param;
  const halfDegree = start + (end - start) / 2;
  const radian = calculateDegreeToRadian(halfDegree, drawingStartAngle);
  const r = anchor === 'outer' ? outer : (outer + inner) / 2;

  return getRadialPosition(x, y, r, radian);
}

export function getRadialPosition(x: number, y: number, r: number, radian: number) {
  return { x: Math.round(x + r * Math.cos(radian)), y: Math.round(y + r * Math.sin(radian)) };
}

export function withinRadian(
  clockwise: boolean,
  startDegree: number,
  endDegree: number,
  currentDegree: number
) {
  return clockwise
    ? startDegree <= currentDegree && endDegree >= currentDegree
    : startDegree >= currentDegree && endDegree <= currentDegree;
}

export function initSectorOptions(options?: PieSeriesOptions | RadialBarSeriesOptions) {
  const clockwise = options?.clockwise ?? true;

  return {
    clockwise,
    startAngle: options?.angleRange?.start ?? (clockwise ? DEGREE_0 : DEGREE_360),
    endAngle: options?.angleRange?.end ?? (clockwise ? DEGREE_360 : DEGREE_0),
  };
}

export function getDefaultRadius(
  { width, height }: Rect,
  isSemiCircular = false,
  maxLabelWidth = 0,
  maxLabelHeight = 0
) {
  let result;

  if (isSemiCircular) {
    result = Math.min(width / 2, height) - maxLabelHeight;
  } else if (width > height) {
    result = height / 2 - maxLabelHeight;
  } else {
    result = width / 2 - maxLabelWidth;
  }

  return Math.max(result, MINIMUM_RADIUS);
}

function getRadian(
  startAngle: number,
  endAngle: number,
  drawingStartAngle: number,
  needCalculateByHalf: boolean
) {
  const degree = needCalculateByHalf ? (endAngle + startAngle) / 2 : startAngle;

  return calculateDegreeToRadian(degree, drawingStartAngle);
}

export function getRadialLabelAlign(
  model: Pick<RadialDataLabel, 'totalAngle' | 'degree' | 'drawingStartAngle'>,
  anchor: RadialAnchor,
  needCalculateByHalf = true
) {
  const {
    totalAngle = DEGREE_360,
    degree: { start, end },
    drawingStartAngle = DEGREE_NEGATIVE_90,
  } = model;

  let textAlign: CanvasTextAlign = 'center';

  if (anchor !== 'outer') {
    return textAlign;
  }

  const radian0 = calculateDegreeToRadian(0, drawingStartAngle);
  const halfRadian = calculateDegreeToRadian(totalAngle / 2, drawingStartAngle);
  const radian = getRadian(start, end, drawingStartAngle, needCalculateByHalf);

  if (drawingStartAngle >= DEGREE_NEGATIVE_90 && drawingStartAngle < DEGREE_90) {
    if (radian0 < radian && halfRadian > radian) {
      textAlign = 'left';
    } else if (halfRadian < radian) {
      textAlign = 'right';
    }
  } else if (radian0 < radian && halfRadian > radian) {
    textAlign = 'right';
  } else if (halfRadian < radian) {
    textAlign = 'left';
  }

  return textAlign;
}

export function getRadiusRanges(radiusRanges: number[], padding: number) {
  return radiusRanges.reduce<RadiusRange[]>((acc, cur, index) => {
    if (index) {
      acc.push({
        inner: cur + padding,
        outer: radiusRanges[index - 1] - padding,
      });
    }

    if (index === radiusRanges.length - 1) {
      acc.push({
        inner: padding,
        outer: cur - padding,
      });
    }

    return acc;
  }, [] as RadiusRange[]);
}

// Recalculate to an angle between 0 and 360 degrees.
export function calculateValidAngle(angle: number) {
  if (angle < DEGREE_0) {
    return DEGREE_360 + (angle % DEGREE_360);
  }

  if (angle > DEGREE_360) {
    return angle % DEGREE_360;
  }

  return angle;
}
