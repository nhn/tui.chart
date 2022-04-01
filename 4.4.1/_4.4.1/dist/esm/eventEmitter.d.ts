import { CustomEventType, EventListener } from "../types/eventEmitter";
declare type EventType = 'needSubLoop' | 'needDraw' | 'needLoop' | 'loopStart' | 'loopComplete' | 'animationCompleted' | 'renderSpectrumTooltip' | 'renderDataLabels' | 'resetHoveredSeries' | 'resetSelectedSeries' | 'renderSelectedSeries' | 'renderHoveredSeries' | 'seriesPointHovered' | 'showTooltip' | 'hideTooltip' | CustomEventType;
export default class EventEmitter {
    handlers: EventListener[];
    on(type: EventType, handler: EventListener): void;
    emit(type: EventType, ...args: any[]): void;
}
export {};
