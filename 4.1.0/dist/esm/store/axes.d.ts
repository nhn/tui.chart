import { CenterYAxisData, Options, ScaleData, Series, StoreModule, ChartOptionsUsingYAxis, LabelAxisData, InitAxisData, Layout } from "../../types/store/store";
import { BaseAxisOptions, BaseXAxisOptions, LineTypeXAxisOptions, RangeDataType } from "../../types/options";
import { AxisTheme } from "../../types/theme";
interface StateProp {
    scale: ScaleData;
    axisSize: number;
    options: Options;
    series: Series;
    theme: Required<AxisTheme>;
    centerYAxis?: Pick<CenterYAxisData, 'xAxisHalfSize'> | null;
    zoomRange?: RangeDataType<number>;
    initialAxisData: InitAxisData;
    labelOnYAxis?: boolean;
    axisName: string;
}
declare type ValueStateProp = StateProp & {
    categories: string[];
    rawCategories: string[];
    isCoordinateTypeChart: boolean;
};
declare type LabelAxisState = Omit<LabelAxisData, 'tickInterval' | 'labelInterval'>;
export interface AxisDataParams {
    axis?: BaseAxisOptions | BaseXAxisOptions | LineTypeXAxisOptions;
    categories?: string[];
    layout?: Layout;
    shift?: boolean;
    isCoordinateTypeChart?: boolean;
}
export declare function isCenterYAxis(options: ChartOptionsUsingYAxis, isBar: boolean): boolean;
export declare function getLabelAxisData(stateProp: ValueStateProp): LabelAxisState;
declare const axes: StoreModule;
export default axes;
