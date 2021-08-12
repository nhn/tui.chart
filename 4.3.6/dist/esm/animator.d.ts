import Chart from "./charts/chart";
import { Options } from "../types/store/store";
declare type Anim = {
    chart: Chart<Options>;
    duration: number;
    requester: Chart<Options>;
    onCompleted: Function;
    onFrame: (delta: any) => void;
    start: number | null;
    completed: boolean;
    current: number | null;
};
export default class Animator {
    anims: Anim[];
    state: string;
    requestId: number | null;
    firstRendering: boolean;
    add({ chart, duration, requester, onCompleted, onFrame, }: {
        chart: Chart<Options>;
        duration: number;
        requester: Chart<Options>;
        onCompleted: Function;
        onFrame?: (delta: number) => void;
    }): void;
    reset(): void;
    start(): void;
    runFrame(): void;
    runAnims(timestamp: number): void;
    next(timestamp: number): void;
    cancelAnimFrame(): void;
}
export {};
