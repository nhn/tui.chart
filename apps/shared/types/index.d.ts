import { EventListener } from '@src/helpers/eventEmitter';
import { RGB } from '@src/helpers/color';

export class EventEmitter {
  public on(type: EventType, handler: EventListener): void;

  public emit(type: EventType, ...args): void;
}

// utils
export function isExist(value: unknown): boolean;

export function isDate(value: unknown): value is Date;

export function isUndefined(value: unknown): value is undefined;

export function isNull(value: unknown): value is null;

export function isBoolean(value: unknown): value is boolean;

export function isNumber(value: unknown): value is number;

export function isString(value: unknown): value is string;

export function isInteger(value: unknown): value is number;

export function isObject(obj: unknown): obj is object;

export function isFunction(value: unknown): value is Function;

export function range(start: number, stop?: number, step?: number): number[];

export function pickProperty(target: Record<string, any>, keys: string[]): Record<string, any>;

export function deepMergedCopy<T1 extends Record<string, any>, T2 extends Record<string, any>>(
  targetObj: T1,
  obj: T2
): T1 & T2;

export function deepCopyArray<T extends Array<any>>(items: T): T;

export function deepCopy<T extends Record<string, any>>(obj: T): T;

export function pickPropertyWithMakeup(
  target: Record<string, any>,
  args: string[]
): Record<string, any>;

export function forEach<T extends object, K extends Extract<keyof T, string>, V extends T[K]>(
  obj: T,
  cb: (item: V, key: K) => void
): void;

export function debounce(fn: Function, delay = 0): (...args: any[]) => void;

export function isSameArray(arr1: unknown[], arr2: unknown[]): boolean;

export function getFirstValidValue(values: any): any;

// reactive
export function observe(fn: Function): Function;

export function isObservable<T extends Record<string, any>>(target: T): boolean;

export function observable(
  target: Record<string, any>,
  source: Record<string, any> = target
): Record<string, any>;

export function setValue(
  target: Record<string, any>,
  key: string,
  source: any
): Record<string, any>;

export function extend(
  target: Record<string, any>,
  source: Record<string, any>
): Record<string, any>;

export function notify<T extends Record<string, any>, K extends keyof T>(target: T, key: K);
export function invisibleWork(fn: Function);
export function notifyByPath<T extends Record<string, any>>(holder: T, namePath: string);
export function computed(target: Record<string, any>, key: string, fn: Function);
export function watch(holder: Record<string, any>, path: string, fn: Function): Function | null;
export function makeObservableObjectToNormal(obj: any): any;

// scale
export function getLimitSafely(baseValues: number[], isXAxis = false): ValueEdge;
export function getDigits(num: number): number;
export function getNormalizedLimit(limit: ValueEdge, stepSize: number): ValueEdge;
export function getNormalizedStep(stepSize: number): number;

export interface ValueEdge {
  max: number;
  min: number;
}

// color
export function getSpectrumColor(ratio: number, distances: RGB, startRGB: RGB): string;
export function getColorRatio(limit: ValueEdge, value?: number | null): number | undefined;
export function makeDistances(startRGB: RGB, endRGB: RGB): RGB;
export function rgba(color: string, opacity = 1): string;
export function getAlpha(str: string): number;
export function getRGBA(str: string, opacity: number): string;
export function rgbToHEX(r: number, g: number, b: number): string | boolean;
export function hexToRGB(str: string): number[] | boolean;
export type RGB = [number, number, number];

// tooltip
export type FontTheme = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
};
export function getTranslateString(x: number, y: number): string;
export function getFontStyleString(theme: FontTheme): string;

// html sanitizer
export function sanitizeHTML(html: string): string;
