import { SectorModel } from "../../types/components/series";
export declare type SectorStyle = {
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
};
export declare type SectorStyleName = 'default' | 'hover' | 'nested';
export declare function sector(ctx: CanvasRenderingContext2D, sectorModel: SectorModel): void;
