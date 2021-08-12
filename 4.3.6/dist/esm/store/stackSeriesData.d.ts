import { StoreModule, StackDataType, StackGroupData, Options, Stack, StackSeries } from "../../types/store/store";
import { StackOptionType } from "../../types/options";
export declare function isPercentStack(stack?: Stack): boolean;
export declare function isGroupStack(rawData: StackDataType): rawData is StackGroupData;
export declare function hasPercentStackSeries(stackSeries: StackSeries): boolean;
export declare function pickStackOption(options: Options): StackOptionType;
declare const stackSeriesData: StoreModule;
export default stackSeriesData;
