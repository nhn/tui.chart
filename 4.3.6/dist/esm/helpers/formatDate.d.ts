import { DateOption } from "../../types/options";
export declare const DEFAULT_DATE_FORMAT = "YY-MM-DD hh:mm:ss";
export declare function getDateFormat(date?: DateOption): string | undefined;
export declare function formatDate(form: string, date: Date | {
    year: number;
    month: number;
    date: number;
    hour: number;
    minute: number;
    second: number;
}, option?: {
    meridiemSet: {
        AM?: string;
        PM?: string;
    };
}): string;
