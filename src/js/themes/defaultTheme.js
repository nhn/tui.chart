const DEFAULT_COLOR = '#000000';
const DEFAULT_BACKGROUND = '#ffffff';
const DEFAULT_FONTWEIGHT = 'lighter';
const DEFAULT_FONTFAMILY = 'Arial';
const EMPTY = '';
const DEFAULT_AXIS = {
  tickColor: DEFAULT_COLOR,
  title: {
    fontSize: 11,
    fontFamily: DEFAULT_FONTFAMILY,
    color: '#bbbbbb',
    fontWeight: 'bold'
  },
  label: {
    fontSize: 11,
    fontFamily: DEFAULT_FONTFAMILY,
    color: '#333',
    fontWeight: 'normal'
  }
};

export default {
  chart: {
    background: {
      color: DEFAULT_BACKGROUND,
      opacity: 1
    },
    fontFamily: DEFAULT_FONTFAMILY
  },
  title: {
    fontSize: 18,
    fontFamily: DEFAULT_FONTFAMILY,
    color: DEFAULT_COLOR,
    fontWeight: DEFAULT_FONTWEIGHT
  },
  yAxis: DEFAULT_AXIS,
  xAxis: DEFAULT_AXIS,
  plot: {
    lineColor: '#000000',
    background: '#ffffff',
    label: {
      fontSize: 11,
      fontFamily: DEFAULT_FONTFAMILY,
      color: '#888'
    }
  },
  series: {
    label: {
      fontSize: 11,
      fontFamily: DEFAULT_FONTFAMILY,
      color: DEFAULT_COLOR,
      fontWeight: DEFAULT_FONTWEIGHT
    },
    colors: [
      '#00a9ff',
      '#ffb840',
      '#ff5a46',
      '#00bd9f',
      '#785fff',
      '#f28b8c',
      '#989486',
      '#516f7d',
      '#29dbe3',
      '#dddddd'
    ],
    borderColor: EMPTY,
    borderWidth: EMPTY,
    selectionColor: EMPTY,
    startColor: '#FFE98A',
    endColor: '#D74177',
    overColor: EMPTY,
    dot: {
      fillColor: EMPTY,
      fillOpacity: 1,
      strokeColor: EMPTY,
      strokeOpacity: EMPTY,
      strokeWidth: 0,
      radius: 6,
      hover: {
        fillColor: EMPTY,
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeOpacity: 1,
        strokeWidth: 4,
        radius: 6
      }
    },
    ranges: []
  },
  legend: {
    label: {
      fontSize: 11,
      fontFamily: DEFAULT_FONTFAMILY,
      color: '#333',
      fontWeight: DEFAULT_FONTWEIGHT
    }
  },
  tooltip: {},
  chartExportMenu: {
    backgroundColor: '#fff',
    borderRadius: 0,
    borderWidth: 1,
    color: '#000'
  }
};
