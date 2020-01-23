/**
 * @fileoverview Test for seriesCalculator.
 * @author NHN.
 *         FE Development Lab <dl_javascript@nhn.com>
 */
import seriesCalculator from '../../../src/js/models/bounds/seriesCalculator';
import chartConst from '../../../src/js/const';

describe('Test for seriesCalculator', () => {
  describe('calculateWidth()', () => {
    it('calculate width', () => {
      const dimensionMap = {
        chart: {
          width: 500
        },
        legend: {
          width: 50
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        }
      };
      const legendOption = {
        visible: true
      };
      const actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

      expect(actual).toBe(380);
    });

    it('calculate width, when align option is left', () => {
      const dimensionMap = {
        chart: {
          width: 500
        },
        legend: {
          width: 50
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_LEFT,
        visible: true
      };
      const actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

      expect(actual).toBe(380);
    });

    it('calculate width, when align option is top', () => {
      const dimensionMap = {
        chart: {
          width: 500
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_TOP,
        visible: true
      };
      const actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

      expect(actual).toBe(430);
    });

    it('calculate width, when align option is bottom', () => {
      const dimensionMap = {
        chart: {
          width: 500
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_TOP,
        visible: true
      };
      const actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

      expect(actual).toBe(430);
    });

    it('calculate width, when visible option is false', () => {
      const dimensionMap = {
        chart: {
          width: 500
        },
        yAxis: {
          width: 50
        },
        rightYAxis: {
          width: 0
        }
      };
      const legendOption = {
        visible: false
      };
      const actual = seriesCalculator.calculateWidth(dimensionMap, legendOption);

      expect(actual).toBe(430);
    });
  });

  describe('calculateHeight()', () => {
    it('calculate height', () => {
      const dimensionMap = {
        chart: {
          height: 400
        },
        title: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        chartExportMenu: {
          height: 30
        },
        legend: {
          height: 10
        }
      };
      const legendOption = {
        visible: true
      };
      const yAxisTitleAreaHeight = 20;
      const actual = seriesCalculator.calculateHeight(
        dimensionMap,
        legendOption,
        yAxisTitleAreaHeight
      );

      expect(actual).toBe(280);
    });

    it('calculate height, when align option is left', () => {
      const dimensionMap = {
        chart: {
          height: 400
        },
        title: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        chartExportMenu: {
          height: 30
        },
        legend: {
          height: 50
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_LEFT,
        visible: true
      };
      const yAxisTitleAreaHeight = 20;
      const actual = seriesCalculator.calculateHeight(
        dimensionMap,
        legendOption,
        yAxisTitleAreaHeight
      );

      expect(actual).toBe(280);
    });

    it('calculate height, when align option is top', () => {
      const dimensionMap = {
        chart: {
          height: 400
        },
        title: {
          height: 50
        },
        legend: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        chartExportMenu: {
          height: 30
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_TOP,
        visible: true
      };
      const yAxisTitleAreaHeight = 20;
      const actual = seriesCalculator.calculateHeight(
        dimensionMap,
        legendOption,
        yAxisTitleAreaHeight
      );

      expect(actual).toBe(250);
    });

    it('calculate height, when align option is top and text is empty', () => {
      const dimensionMap = {
        chart: {
          height: 400
        },
        title: {
          height: 0
        },
        legend: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        chartExportMenu: {
          height: 30
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_TOP,
        visible: true
      };
      const yAxisTitleAreaHeight = 20;
      const actual = seriesCalculator.calculateHeight(
        dimensionMap,
        legendOption,
        yAxisTitleAreaHeight
      );

      expect(actual).toBe(270);
    });

    it('calculate height, when align option is bottom', () => {
      const dimensionMap = {
        chart: {
          height: 400
        },
        title: {
          height: 50
        },
        legend: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        chartExportMenu: {
          height: 30
        }
      };
      const legendOption = {
        align: chartConst.LEGEND_ALIGN_BOTTOM,
        visible: true
      };
      const yAxisTitleAreaHeight = 20;
      const actual = seriesCalculator.calculateHeight(
        dimensionMap,
        legendOption,
        yAxisTitleAreaHeight
      );

      expect(actual).toBe(230);
    });

    it('calculate height, when visible option is false', () => {
      const dimensionMap = {
        chart: {
          height: 400
        },
        title: {
          height: 50
        },
        xAxis: {
          height: 50
        },
        chartExportMenu: {
          height: 30
        }
      };
      const legendOption = {
        visible: false
      };
      const yAxisTitleAreaHeight = 20;
      const actual = seriesCalculator.calculateHeight(
        dimensionMap,
        legendOption,
        yAxisTitleAreaHeight
      );

      expect(actual).toBe(280);
    });
  });
});
