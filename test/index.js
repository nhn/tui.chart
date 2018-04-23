require('es5-shim');

// const testsContext = require.context('.', true, /spec.js$/);
//const testsContext = require.context('.', true, /(axis|bubbleChart).spec.js$/);
//testsContext.keys().forEach(testsContext);
//
require('./apis/barChart.api.spec.js');
require('./apis/lineChart.api.spec.js');
require('./charts/bubbleChart.spec.js');
require('./charts/chartBase.spec.js');
require('./charts/colorSpectrum.spec.js');
require('./charts/componentManager.spec.js');
require('./charts/dynamicDataHelper.spec.js');
require('./charts/mapChartMapModel.spec.js');
require('./components/axes/axis.spec.js');
require('./components/chartExportMenu/chartExportMenu.spec.js');
require('./components/legends/circleLegend.spec.js');
require('./components/legends/legend.spec.js');
require('./components/legends/legendModel.spec.js');
require('./components/legends/spectrumLegend.spec.js');
require('./components/mouseEventDetectors/areaTypeDataModel.spec.js');
require('./components/mouseEventDetectors/boundsBaseCoordinateModel.spec.js');
require('./components/mouseEventDetectors/groupTypeEventDetector.spec.js');
require('./components/mouseEventDetectors/mapChartEventDetector.spec.js');
require('./components/mouseEventDetectors/mouseEventDetectorBase.spec.js');
require('./components/mouseEventDetectors/tickBaseCoordinateModel.spec.js');
require('./components/mouseEventDetectors/zoomMixer.spec.js');
require('./components/plots/plot.spec.js');
require('./components/plots/radialPlot.spec.js');
require('./components/series/areaChartSeries.spec.js');
require('./components/series/barChartSeries.spec.js');
require('./components/series/barTypeSeriesBase.spec.js');
require('./components/series/boxPlotChartSeries.spec.js');
require('./components/series/bubbleChartSeries.spec.js');
require('./components/series/bulletChartSeries.spec.js');
//require('./components/series/columnChartSeries.spec.js');
//require('./components/series/heatmapChartSeries.spec.js');
//require('./components/series/lineTypeSeriesBase.spec.js');
//require('./components/series/mapChartSeries.spec.js');
//require('./components/series/pieChartSeries.spec.js');
//require('./components/series/radialSeries.spec.js');
//require('./components/series/renderingLabelHelper.spec.js');
//require('./components/series/scatterChartSeries.spec.js');
//require('./components/series/series.spec.js');
//require('./components/series/squarifier.spec.js');
//require('./components/series/treemapChartSeries.spec.js');
//require('./components/series/zoom.spec.js');


        
