import Store from "../store/store";
import EventEmitter from "../eventEmitter";
import ComponentManager from "../component/componentManager";
import Animator from "../animator";
import { ChartProps, Point, SeriesDataInput, Size, DataInput } from "../../types/options";
import { RespondersModel } from "../component/component";
import { ChartState, Options, StoreModule } from "../../types/store/store";
import Component from "../component/component";
import { CheckedLegendType } from "../../types/components/legend";
import { SelectSeriesInfo, AddSeriesDataInfo } from "../../types/charts";
import { CustomEventType, EventListener } from "../../types/eventEmitter";
export declare const DEFAULT_ANIM_DURATION = 500;
export interface SelectSeriesHandlerParams<T extends Options> extends SelectSeriesInfo {
    state: ChartState<T>;
}
/**
 * @class
 * @abstract
 * Abstract class used to implement each chart.
 */
export default abstract class Chart<T extends Options> {
    store: Store<T>;
    ___animId___: null;
    animator: Animator;
    readonly containerEl: HTMLElement;
    el: HTMLDivElement;
    ctx: CanvasRenderingContext2D;
    painter: any;
    readonly eventBus: EventEmitter;
    readonly componentManager: ComponentManager<T>;
    modules: StoreModule[];
    enteredComponents: Component[];
    animationControlFlag: {
        resizing: boolean;
        updating: boolean;
    };
    resizeObserver: ResizeObserver | null;
    private getAnimationDuration;
    createChartWrapper(): HTMLDivElement;
    constructor(props: ChartProps<T>);
    resizeChartSize(containerWidth?: number, containerHeight?: number): void;
    private debounceResizeEvent;
    setResizeEvent(): void;
    clearResizeEvent(): void;
    handleCanvasMouseEvent(eventType: string, mousePosition: Point): void;
    handleResponderEvent(event: MouseEvent, mousePosition: Point): void;
    handleEvent(event: MouseEvent): void;
    protected initStore(): void;
    protected initialize(): void;
    draw(): void;
    update(delta: number): void;
    initUpdate(delta: number): void;
    protected handleEventForAllResponders?(event: MouseEvent, responderModels: RespondersModel, delegationMethod: string, mousePosition: Point): void;
    /**
     * Get checked legend chart type and label, checked state.
     * @returns {Array<{checked: boolean, chartType: string, label: string}>} Array data that whether series has checked
     * @api
     * @example
     * const checkedLegend = chart.getCheckedLegend()
     */
    getCheckedLegend: () => CheckedLegendType;
    abstract updateOptions(options: Options): void;
    abstract setOptions(options: Options): void;
    abstract showTooltip(info: SelectSeriesInfo): void;
    abstract hideTooltip(): void;
    /**
     * Returns the currently applied chart options.
     * @returns {Object} options
     * @api
     * @example
     * const options = chart.getOptions();
     */
    getOptions: () => any;
    abstract addSeries(data: SeriesDataInput, dataInfo?: AddSeriesDataInfo): void;
    /**
     * Register of user custom event.
     * @param {string} eventName - Event name. 'clickLegendLabel', 'clickLegendCheckbox', 'selectSeries', 'unselectSeries', 'hoverSeries', 'unhoverSeries', 'zoom', 'resetZoom' is available.
     * @param {Function} handler - Event handler
     * @api
     */
    on: (eventName: CustomEventType, handler: EventListener) => void;
    abstract setData(data: DataInput): void;
    /**
     * Destroys the instance.
     * @api
     * @example
     * chart.destroy();
     */
    destroy: () => void;
    private isSelectableSeries;
    /**
     * Select series. It works only when the selectable option is true.
     * @param {Object} seriesInfo - Information of the series to be selected
     *      @param {number} [seriesInfo.seriesIndex] - Index of series
     *      @param {number} [seriesInfo.index] - Index of data within series
     *      @param {string} [seriesInfo.name] - Specify name for NestedPie Chart
     *      @param {string} [seriesInfo.chartType] - Specify which chart to select when using LineArea, LineScatter, and ColumnLine charts.specifies which chart to select when using LineArea, LineScatter, and ColumnLine charts.
     * @api
     * @example
     * chart.selectSeries({index: 1, seriesIndex: 2});
     */
    selectSeries: (seriesInfo: SelectSeriesInfo) => void;
    /**
     * Unselect selected series. It works only when the selectable option is true.
     * @api
     * @example
     * chart.unselectSeries();
     */
    unselectSeries: () => void;
    /**
     * Resize chart size.
     * @param {Object} size Chart size
     *   @param {number} [size.width] Width
     *   @param {number} [size.height] Height
     * @api
     * @example
     * chart.resize({height: 100, width: 200});
     */
    resize: (size: Partial<Size>) => void;
    /**
     * Set tooltip offset.
     * @param {Object} offset - Offset size
     *   @param {number} [offset.x] Offset value to move title horizontally
     *   @param {number} [offset.y] Offset value to move title vertically
     * @api
     * @example
     * chart.setTooltipOffset({x: 10, y: -20});
     */
    setTooltipOffset(offset: Partial<Point>): void;
    resetSeries: () => void;
    private setResizeEventListeners;
    protected dispatchOptionsEvent(eventName: 'initOptions' | 'updateOptions', options: Options): void;
}
