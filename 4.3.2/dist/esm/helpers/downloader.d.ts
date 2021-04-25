import { DataToExport } from "../component/exportMenu";
export declare type SpreadSheetExtension = 'csv' | 'xls';
declare type ImageExtension = 'png' | 'jpeg';
declare type Extension = SpreadSheetExtension | ImageExtension;
export declare function execDownload(fileName: string, extension: Extension, content: string, contentType?: string): void;
export declare function downloadSpreadSheet(fileName: string, extension: SpreadSheetExtension, data: DataToExport): void;
export {};
