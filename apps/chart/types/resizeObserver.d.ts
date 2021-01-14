type ResizeObserverBoxOptions = 'border-box' | 'content-box' | 'device-pixel-content-box';

interface ResizeObserverOptions {
  box?: ResizeObserverBoxOptions;
}

interface ResizeObservation {
  readonly lastReportedSizes: ReadonlyArray<ResizeObserverSize>;
  readonly observedBox: ResizeObserverBoxOptions;
  readonly target: Element;
}

declare let ResizeObservation: {
  prototype: ResizeObservation;
  new (target: Element): ResizeObservation;
};

interface ResizeObserver {
  disconnect(): void;
  observe(target: Element, options?: ResizeObserverOptions): void;
  unobserve(target: Element): void;
}

interface ResizeObserverEntry {
  readonly borderBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly contentBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly contentRect: DOMRectReadOnly;
  readonly devicePixelContentBoxSize: ReadonlyArray<ResizeObserverSize>;
  readonly target: Element;
}

declare let ResizeObserverEntry: {
  prototype: ResizeObserverEntry;
  new (): ResizeObserverEntry;
};

interface ResizeObserverSize {
  readonly blockSize: number;
  readonly inlineSize: number;
}

declare let ResizeObserverSize: {
  prototype: ResizeObserverSize;
  new (): ResizeObserverSize;
};

interface ResizeObserverCallback {
  (entries: ResizeObserverEntry[], observer: ResizeObserver): void;
}

declare const ResizeObserver: {
  prototype: ResizeObserver;
  new(callback: ResizeObserverCallback): ResizeObserver;
};
