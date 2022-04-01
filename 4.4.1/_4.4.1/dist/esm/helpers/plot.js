import { isUndefined } from "./utils";
export function isExistPlotId(plots, data) {
    return plots.some(({ id: bandId }) => !isUndefined(bandId) && !isUndefined(data.id) && bandId === data.id);
}
