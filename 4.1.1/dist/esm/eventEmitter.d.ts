declare type EventType = 'needSubLoop' | 'needDraw' | 'needLoop' | 'loopStart' | 'loopComplete' | 'animationCompleted' | 'renderSpectrumTooltip' | 'renderDataLabels' | 'resetHoveredSeries' | 'resetSelectedSeries' | 'renderSelectedSeries' | 'renderHoveredSeries' | 'seriesPointHovered' | 'showTooltip' | 'hideTooltip' | CustomEventType;
export declare type CustomEventType = 'clickLegendLabel' | 'clickLegendCheckbox' | 'selectSeries' | 'unselectSeries' | 'hoverSeries' | 'unhoverSeries' | 'zoom' | 'resetZoom';
export declare type EventListener = (evt: any) => void;
export default class EventEmitter {
    handlers: EventListener[];
    on(type: EventType, handler: EventListener): void;
    emit(type: EventType, ...args: any[]): void;
}
export {};
