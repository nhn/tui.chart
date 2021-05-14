interface MSWindowScreen extends Screen {
  deviceXDPI: number;
  logicalXDPI: number;
}

export function getRatio() {
  if ('deviceXDPI' in window.screen) {
    // IE mobile or IE
    return (
      (window.screen as MSWindowScreen).deviceXDPI / (window.screen as MSWindowScreen).logicalXDPI
    );
  }

  if (window.hasOwnProperty('devicePixelRatio')) {
    return window.devicePixelRatio;
  }

  return 1;
}

export function setSize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio = getRatio()
) {
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = width * ratio || 0;
  canvas.height = height * ratio || 0;

  ctx.scale(ratio, ratio);
}
