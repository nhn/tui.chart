declare type DetectorType = 'circle' | 'rect' | 'sector' | 'boxPlot' | 'line' | 'clockHand';
declare type ResponderDetectors = {
    [key in DetectorType]: Function;
};
export declare const responderDetectors: ResponderDetectors;
export {};
