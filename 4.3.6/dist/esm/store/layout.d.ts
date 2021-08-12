import { StoreModule, Options } from "../../types/store/store";
import { Align } from "../../types/options";
export declare const padding: {
    X: number;
    Y: number;
};
export declare const X_AXIS_HEIGHT = 20;
export declare function isVerticalAlign(align?: Align): boolean;
export declare function isUsingResetButton(options: Options): boolean;
export declare function isExportMenuVisible(options: Options): boolean;
declare const layout: StoreModule;
export default layout;
