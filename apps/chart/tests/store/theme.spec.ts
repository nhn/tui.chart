import theme from '@src/store/theme';
import { StateFunc } from '@t/store/store';

describe('theme store', () => {
  describe('state', () => {
    describe('line', () => {
      const series = {
        line: [
          { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#00a9ff' },
          { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#ffb840' },
        ],
      };

      it('default theme', () => {
        const state = (theme.state as StateFunc)({ options: {}, series });

        expect(state.theme).toEqual({
          chart: {
            fontFamily: 'Arial',
            backgroundColor: '#ffffff',
          },
          noData: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#333333',
          },
          title: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 100,
            color: '#333333',
          },
          circularAxis: {
            dotColor: 'rgba(0, 0, 0, 0.5)',
            label: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 'normal',
            },
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
            tick: {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.5)',
            },
            title: {
              color: '#bbbbbb',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 700,
            },
          },
          verticalAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
              textBubble: {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 0, 0, 0)',
                borderRadius: 7,
                borderWidth: 1,
                paddingX: 7,
                paddingY: 2,
                visible: false,
              },
            },
          },
          yAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          xAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          legend: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
          },
          series: {
            line: {
              colors: ['#00a9ff', '#ffb840'],
              dashSegments: [],
              dot: {
                radius: 3,
              },
              hover: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              lineWidth: 2,
              select: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              dataLabels: {
                color: '#333333',
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 400,
                textBubble: {
                  arrow: {
                    visible: false,
                    height: 6,
                    width: 8,
                    direction: 'bottom',
                  },
                  backgroundColor: '#ffffff',
                  borderRadius: 7,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  visible: false,
                },
                useSeriesColor: false,
              },
            },
          },
          tooltip: {
            background: 'rgba(85, 85, 85, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0)',
            borderWidth: 0,
            borderRadius: 3,
            borderStyle: 'solid',
            body: {
              fontSize: 12,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              color: '#ffffff',
            },
            header: {
              fontSize: 13,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              color: '#ffffff',
            },
          },
          plot: {
            lineColor: 'rgba(0, 0, 0, 0.05)',
            vertical: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            horizontal: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
          exportMenu: {
            button: {
              backgroundColor: '#f4f4f4',
              borderColor: '#f4f4f4',
              borderRadius: 5,
              borderWidth: 1,
              xIcon: {
                color: '#555555',
                lineWidth: 2,
              },
              dotIcon: {
                color: '#555555',
                gap: 2,
                height: 2,
                width: 2,
              },
            },
            panel: {
              borderWidth: 1,
              borderRadius: 0,
              borderColor: '#bab9ba',
              header: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#f4f4f4',
              },
              body: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#ffffff',
              },
            },
          },
        });
      });

      it('should set global theme options, If the chart theme option is entered', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              chart: {
                fontFamily: 'Verdana',
                backgroundColor: '#aaaaaa',
              },
            },
          },
          series,
        });

        expect(state.theme).toEqual({
          chart: {
            fontFamily: 'Verdana',
            backgroundColor: '#aaaaaa',
          },
          title: {
            fontSize: 18,
            fontFamily: 'Verdana',
            fontWeight: 100,
            color: '#333333',
          },
          noData: {
            fontSize: 18,
            fontFamily: 'Verdana',
            fontWeight: 'normal',
            color: '#333333',
          },
          circularAxis: {
            dotColor: 'rgba(0, 0, 0, 0.5)',
            label: {
              color: '#333333',
              fontFamily: 'Verdana',
              fontSize: 11,
              fontWeight: 'normal',
            },
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
            tick: {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.5)',
            },
            title: {
              color: '#bbbbbb',
              fontFamily: 'Verdana',
              fontSize: 11,
              fontWeight: 700,
            },
          },
          verticalAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Verdana',
              fontWeight: 'normal',
              color: '#333333',
              textBubble: {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 0, 0, 0)',
                borderRadius: 7,
                borderWidth: 1,
                paddingX: 7,
                paddingY: 2,
                visible: false,
              },
            },
          },
          yAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Verdana',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Verdana',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          xAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Verdana',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Verdana',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          legend: {
            label: {
              fontSize: 11,
              fontFamily: 'Verdana',
              fontWeight: 'normal',
              color: '#333333',
            },
          },
          series: {
            line: {
              colors: ['#00a9ff', '#ffb840'],
              dashSegments: [],
              dot: {
                radius: 3,
              },
              hover: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              lineWidth: 2,
              select: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              dataLabels: {
                color: '#333333',
                fontFamily: 'Verdana',
                fontSize: 11,
                fontWeight: 400,
                textBubble: {
                  arrow: {
                    visible: false,
                    height: 6,
                    width: 8,
                    direction: 'bottom',
                  },
                  backgroundColor: '#ffffff',
                  borderRadius: 7,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  visible: false,
                },
                useSeriesColor: false,
              },
            },
          },
          tooltip: {
            background: 'rgba(85, 85, 85, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0)',
            borderWidth: 0,
            borderRadius: 3,
            borderStyle: 'solid',
            body: {
              fontSize: 12,
              fontFamily: 'Verdana, sans-serif',
              fontWeight: 'normal',
              color: '#ffffff',
            },
            header: {
              fontSize: 13,
              fontFamily: 'Verdana, sans-serif',
              fontWeight: 'bold',
              color: '#ffffff',
            },
          },
          plot: {
            lineColor: 'rgba(0, 0, 0, 0.05)',
            vertical: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            horizontal: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
          exportMenu: {
            button: {
              backgroundColor: '#f4f4f4',
              borderColor: '#f4f4f4',
              borderRadius: 5,
              borderWidth: 1,
              xIcon: {
                color: '#555555',
                lineWidth: 2,
              },
              dotIcon: {
                color: '#555555',
                gap: 2,
                height: 2,
                width: 2,
              },
            },
            panel: {
              borderWidth: 1,
              borderRadius: 0,
              borderColor: '#bab9ba',
              header: {
                fontFamily: 'Verdana',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#f4f4f4',
              },
              body: {
                fontFamily: 'Verdana',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#ffffff',
              },
            },
          },
        });
      });

      it('theme options is reflected in the default theme option', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                colors: ['#aaaaaa', '#bbbbbb'],
                dashSegments: [5, 10],
                dot: {
                  radius: 10,
                },
                hover: {
                  dot: {
                    borderColor: '#ffffff',
                    borderWidth: 5,
                    radius: 10,
                  },
                },
                lineWidth: 10,
                select: {
                  dot: {
                    borderColor: '#ddddd',
                    borderWidth: 5,
                    radius: 3,
                  },
                },
              },
            },
          },
          series,
        });

        expect(state.theme).toEqual({
          chart: {
            fontFamily: 'Arial',
            backgroundColor: '#ffffff',
          },
          title: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 100,
            color: '#333333',
          },
          noData: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#333333',
          },
          legend: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
          },
          circularAxis: {
            dotColor: 'rgba(0, 0, 0, 0.5)',
            label: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 'normal',
            },
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
            tick: {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.5)',
            },
            title: {
              color: '#bbbbbb',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 700,
            },
          },
          verticalAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
              textBubble: {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 0, 0, 0)',
                borderRadius: 7,
                borderWidth: 1,
                paddingX: 7,
                paddingY: 2,
                visible: false,
              },
            },
          },
          yAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          xAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          tooltip: {
            background: 'rgba(85, 85, 85, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0)',
            borderWidth: 0,
            borderRadius: 3,
            borderStyle: 'solid',
            body: {
              fontSize: 12,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              color: '#ffffff',
            },
            header: {
              fontSize: 13,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              color: '#ffffff',
            },
          },
          plot: {
            lineColor: 'rgba(0, 0, 0, 0.05)',
            vertical: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            horizontal: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
          exportMenu: {
            button: {
              backgroundColor: '#f4f4f4',
              borderColor: '#f4f4f4',
              borderRadius: 5,
              borderWidth: 1,
              xIcon: {
                color: '#555555',
                lineWidth: 2,
              },
              dotIcon: {
                color: '#555555',
                gap: 2,
                height: 2,
                width: 2,
              },
            },
            panel: {
              borderWidth: 1,
              borderRadius: 0,
              borderColor: '#bab9ba',
              header: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#f4f4f4',
              },
              body: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#ffffff',
              },
            },
          },
          series: {
            line: {
              colors: ['#aaaaaa', '#bbbbbb'],
              dashSegments: [5, 10],
              dot: {
                radius: 10,
              },
              hover: {
                dot: {
                  borderColor: '#ffffff',
                  borderWidth: 5,
                  radius: 10,
                },
              },
              lineWidth: 10,
              select: {
                dot: {
                  borderColor: '#ddddd',
                  borderWidth: 5,
                  radius: 3,
                },
              },
              dataLabels: {
                color: '#333333',
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 400,
                textBubble: {
                  arrow: {
                    visible: false,
                    height: 6,
                    width: 8,
                    direction: 'bottom',
                  },
                  backgroundColor: '#ffffff',
                  borderRadius: 7,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  visible: false,
                },
                useSeriesColor: false,
              },
            },
          },
        });
      });
    });

    describe('line area combo chart', () => {
      const series = {
        line: [
          { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#00a9ff' },
          { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#ffb840' },
        ],
        area: [
          { name: 'han', data: [1, 3, 4], rawData: [1, 3, 5], color: '#00a9ff' },
          { name: 'cho', data: [5, 2, 4], rawData: [5, 2, 4], color: '#ffb840' },
        ],
      };

      it('default theme', () => {
        const state = (theme.state as StateFunc)({ options: {}, series });

        expect(state.theme).toEqual({
          chart: {
            fontFamily: 'Arial',
            backgroundColor: '#ffffff',
          },
          title: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 100,
            color: '#333333',
          },
          noData: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#333333',
          },
          legend: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
          },
          tooltip: {
            background: 'rgba(85, 85, 85, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0)',
            borderWidth: 0,
            borderRadius: 3,
            borderStyle: 'solid',
            body: {
              fontSize: 12,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              color: '#ffffff',
            },
            header: {
              fontSize: 13,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              color: '#ffffff',
            },
          },
          plot: {
            lineColor: 'rgba(0, 0, 0, 0.05)',
            vertical: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            horizontal: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
          exportMenu: {
            button: {
              backgroundColor: '#f4f4f4',
              borderColor: '#f4f4f4',
              borderRadius: 5,
              borderWidth: 1,
              xIcon: {
                color: '#555555',
                lineWidth: 2,
              },
              dotIcon: {
                color: '#555555',
                gap: 2,
                height: 2,
                width: 2,
              },
            },
            panel: {
              borderWidth: 1,
              borderRadius: 0,
              borderColor: '#bab9ba',
              header: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#f4f4f4',
              },
              body: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#ffffff',
              },
            },
          },
          circularAxis: {
            dotColor: 'rgba(0, 0, 0, 0.5)',
            label: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 'normal',
            },
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
            tick: {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.5)',
            },
            title: {
              color: '#bbbbbb',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 700,
            },
          },
          verticalAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
              textBubble: {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 0, 0, 0)',
                borderRadius: 7,
                borderWidth: 1,
                paddingX: 7,
                paddingY: 2,
                visible: false,
              },
            },
          },
          yAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          xAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          series: {
            line: {
              colors: ['#00a9ff', '#ffb840'],
              dashSegments: [],
              dot: {
                radius: 3,
              },
              hover: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              lineWidth: 2,
              select: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              dataLabels: {
                color: '#333333',
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 400,
                textBubble: {
                  arrow: {
                    visible: false,
                    height: 6,
                    width: 8,
                    direction: 'bottom',
                  },
                  backgroundColor: '#ffffff',
                  borderRadius: 7,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  visible: false,
                },
                useSeriesColor: false,
              },
            },
            area: {
              colors: ['#ff5a46', '#00bd9f'],
              areaOpacity: 0.3,
              dashSegments: [],
              dot: {
                radius: 3,
              },
              hover: {
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
              },
              lineWidth: 2,
              select: {
                areaOpacity: 0.3,
                dot: {
                  borderWidth: 5,
                  radius: 3,
                },
                restSeries: {
                  areaOpacity: 0.06,
                },
              },
              dataLabels: {
                color: '#333333',
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 400,
                textBubble: {
                  arrow: {
                    visible: false,
                    height: 6,
                    width: 8,
                    direction: 'bottom',
                  },
                  backgroundColor: '#ffffff',
                  borderRadius: 7,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  visible: false,
                },
                useSeriesColor: false,
              },
            },
          },
        });
      });

      it('Common options affect all charts.', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd'],
              },
            },
          },
          series,
        });
        expect(state.theme?.series).toEqual({
          area: {
            colors: ['#cccccc', '#dddddd'],
            areaOpacity: 0.3,
            dashSegments: [],
            dot: {
              radius: 3,
            },
            hover: {
              dot: {
                borderWidth: 5,
                radius: 3,
              },
            },
            lineWidth: 2,
            select: {
              areaOpacity: 0.3,
              dot: {
                borderWidth: 5,
                radius: 3,
              },
              restSeries: {
                areaOpacity: 0.06,
              },
            },
            dataLabels: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 400,
              textBubble: {
                arrow: {
                  visible: false,
                  height: 6,
                  width: 8,
                  direction: 'bottom',
                },
                backgroundColor: '#ffffff',
                borderRadius: 7,
                paddingX: 5,
                paddingY: 1,
                shadowBlur: 4,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffsetY: 2,
                visible: false,
              },
              useSeriesColor: false,
            },
          },
          line: {
            colors: ['#aaaaaa', '#bbbbbb'],
            dashSegments: [],
            dot: {
              radius: 3,
            },
            hover: {
              dot: {
                borderWidth: 5,
                radius: 3,
              },
            },
            lineWidth: 2,
            select: {
              dot: {
                borderWidth: 5,
                radius: 3,
              },
            },
            dataLabels: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 400,
              textBubble: {
                arrow: {
                  visible: false,
                  height: 6,
                  width: 8,
                  direction: 'bottom',
                },
                backgroundColor: '#ffffff',
                borderRadius: 7,
                paddingX: 5,
                paddingY: 1,
                shadowBlur: 4,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffsetY: 2,
                visible: false,
              },
              useSeriesColor: false,
            },
          },
        });
      });

      it('theme options is reflected in the default theme option', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              legend: {
                label: {
                  fontSize: 11,
                  fontFamily: 'Arial',
                  fontWeight: 'normal',
                  color: '#333333',
                },
              },
              series: {
                area: {
                  colors: ['#aaaaaa', '#bbbbbb'],
                  areaOpacity: 0.8,
                  dot: {
                    radius: 10,
                  },
                  select: {
                    areaOpacity: 0.1,
                    restSeries: {
                      areaOpacity: 0.2,
                    },
                  },
                },
                line: {
                  colors: ['#cccccc', '#dddddd'],
                },
              },
            },
          },
          series,
        });
        expect(state.theme?.series).toEqual({
          area: {
            colors: ['#aaaaaa', '#bbbbbb'],
            areaOpacity: 0.8,
            dashSegments: [],
            dot: {
              radius: 10,
            },
            hover: {
              dot: {
                borderWidth: 5,
                radius: 3,
              },
            },
            lineWidth: 2,
            select: {
              areaOpacity: 0.1,
              dot: {
                borderWidth: 5,
                radius: 3,
              },
              restSeries: {
                areaOpacity: 0.2,
              },
            },
            dataLabels: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 400,
              textBubble: {
                arrow: {
                  visible: false,
                  height: 6,
                  width: 8,
                  direction: 'bottom',
                },
                backgroundColor: '#ffffff',
                borderRadius: 7,
                paddingX: 5,
                paddingY: 1,
                shadowBlur: 4,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffsetY: 2,
                visible: false,
              },
              useSeriesColor: false,
            },
          },
          line: {
            colors: ['#cccccc', '#dddddd'],
            dashSegments: [],
            dot: {
              radius: 3,
            },
            hover: {
              dot: {
                borderWidth: 5,
                radius: 3,
              },
            },
            lineWidth: 2,
            select: {
              dot: {
                borderWidth: 5,
                radius: 3,
              },
            },
            dataLabels: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 400,
              textBubble: {
                arrow: {
                  visible: false,
                  height: 6,
                  width: 8,
                  direction: 'bottom',
                },
                backgroundColor: '#ffffff',
                borderRadius: 7,
                paddingX: 5,
                paddingY: 1,
                shadowBlur: 4,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowOffsetY: 2,
                visible: false,
              },
              useSeriesColor: false,
            },
          },
        });
      });
    });

    describe('nested pie chart', () => {
      const series = {
        pie: [
          {
            name: 'A',
            data: [
              {
                name: 'C',
                data: 1,
              },
              {
                name: 'S',
                data: 2,
              },
            ],
          },
          {
            name: 'B',
            data: [
              {
                name: 'CA',
                parentName: 'C',
                data: 3,
              },
              {
                name: 'CB',
                parentName: 'C',
                data: 4,
              },
              {
                name: 'SA',
                parentName: 'S',
                data: 5,
              },
            ],
          },
        ],
      };

      it('default theme', () => {
        const state = (theme.state as StateFunc)({ options: {}, series });

        expect(state.theme).toEqual({
          chart: {
            fontFamily: 'Arial',
            backgroundColor: '#ffffff',
          },
          title: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 100,
            color: '#333333',
          },
          noData: {
            fontSize: 18,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#333333',
          },
          circularAxis: {
            dotColor: 'rgba(0, 0, 0, 0.5)',
            label: {
              color: '#333333',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 'normal',
            },
            lineWidth: 1,
            strokeStyle: 'rgba(0, 0, 0, 0.05)',
            tick: {
              lineWidth: 1,
              strokeStyle: 'rgba(0, 0, 0, 0.5)',
            },
            title: {
              color: '#bbbbbb',
              fontFamily: 'Arial',
              fontSize: 11,
              fontWeight: 700,
            },
          },
          verticalAxis: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
              textBubble: {
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'rgba(0, 0, 0, 0)',
                borderRadius: 7,
                borderWidth: 1,
                paddingX: 7,
                paddingY: 2,
                visible: false,
              },
            },
          },
          yAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },
          xAxis: {
            title: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 700,
              color: '#bbbbbb',
            },
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
            width: 1,
            color: '#333333',
          },

          legend: {
            label: {
              fontSize: 11,
              fontFamily: 'Arial',
              fontWeight: 'normal',
              color: '#333333',
            },
          },
          tooltip: {
            background: 'rgba(85, 85, 85, 0.95)',
            borderColor: 'rgba(255, 255, 255, 0)',
            borderWidth: 0,
            borderRadius: 3,
            borderStyle: 'solid',
            body: {
              fontSize: 12,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'normal',
              color: '#ffffff',
            },
            header: {
              fontSize: 13,
              fontFamily: 'Arial, sans-serif',
              fontWeight: 'bold',
              color: '#ffffff',
            },
          },
          plot: {
            lineColor: 'rgba(0, 0, 0, 0.05)',
            vertical: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            horizontal: {
              lineColor: 'rgba(0, 0, 0, 0.05)',
            },
            backgroundColor: 'rgba(255, 255, 255, 0)',
          },
          exportMenu: {
            button: {
              backgroundColor: '#f4f4f4',
              borderColor: '#f4f4f4',
              borderRadius: 5,
              borderWidth: 1,
              xIcon: {
                color: '#555555',
                lineWidth: 2,
              },
              dotIcon: {
                color: '#555555',
                gap: 2,
                height: 2,
                width: 2,
              },
            },
            panel: {
              borderWidth: 1,
              borderRadius: 0,
              borderColor: '#bab9ba',
              header: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#f4f4f4',
              },
              body: {
                fontFamily: 'Arial',
                fontSize: 11,
                fontWeight: 'normal',
                color: '#333333',
                backgroundColor: '#ffffff',
              },
            },
          },
          series: {
            pie: {
              A: {
                areaOpacity: 1,
                colors: ['#00a9ff', '#ffb840'],
                hover: {
                  lineWidth: 3,
                  shadowBlur: 5,
                  shadowColor: '#cccccc',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  strokeStyle: '#ffffff',
                },
                lineWidth: 1,
                select: {
                  areaOpacity: 1,
                  lineWidth: 3,
                  restSeries: {
                    areaOpacity: 0.3,
                  },
                  shadowBlur: 5,
                  shadowColor: '#cccccc',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  strokeStyle: '#ffffff',
                },
                strokeStyle: '#ffffff',
                dataLabels: {
                  color: '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 16,
                  fontWeight: 600,
                  useSeriesColor: false,
                  textBubble: {
                    visible: false,
                    paddingX: 5,
                    paddingY: 1,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOffsetY: 2,
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                  },
                  callout: {
                    lineColor: '#e9e9e9',
                    lineWidth: 1,
                    useSeriesColor: true,
                  },
                  pieSeriesName: {
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    fontSize: 11,
                    fontWeight: 400,
                    useSeriesColor: false,
                    textBubble: {
                      visible: false,
                      paddingX: 5,
                      paddingY: 1,
                      shadowBlur: 4,
                      shadowColor: 'rgba(0, 0, 0, 0.3)',
                      shadowOffsetY: 2,
                      backgroundColor: '#ffffff',
                      borderRadius: 0,
                    },
                  },
                },
              },
              B: {
                areaOpacity: 1,
                colors: ['#ff5a46', '#00bd9f', '#785fff'],
                hover: {
                  lineWidth: 3,
                  shadowBlur: 5,
                  shadowColor: '#cccccc',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  strokeStyle: '#ffffff',
                },
                lineWidth: 1,
                select: {
                  areaOpacity: 1,
                  lineWidth: 3,
                  restSeries: {
                    areaOpacity: 0.3,
                  },
                  shadowBlur: 5,
                  shadowColor: '#cccccc',
                  shadowOffsetX: 0,
                  shadowOffsetY: 0,
                  strokeStyle: '#ffffff',
                },
                strokeStyle: '#ffffff',
                dataLabels: {
                  color: '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 16,
                  fontWeight: 600,
                  useSeriesColor: false,
                  textBubble: {
                    visible: false,
                    paddingX: 5,
                    paddingY: 1,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOffsetY: 2,
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                  },
                  callout: {
                    lineColor: '#e9e9e9',
                    lineWidth: 1,
                    useSeriesColor: true,
                  },
                  pieSeriesName: {
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    fontSize: 11,
                    fontWeight: 400,
                    useSeriesColor: false,
                    textBubble: {
                      visible: false,
                      paddingX: 5,
                      paddingY: 1,
                      shadowBlur: 4,
                      shadowColor: 'rgba(0, 0, 0, 0.3)',
                      shadowOffsetY: 2,
                      backgroundColor: '#ffffff',
                      borderRadius: 0,
                    },
                  },
                },
              },
            },
          },
        });
      });

      it('Common options affect all charts.', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd', '#eeeeee'],
              },
            },
          },
          series,
        });

        expect(state.theme?.series).toEqual({
          pie: {
            A: {
              areaOpacity: 1,
              colors: ['#aaaaaa', '#bbbbbb'],
              hover: {
                lineWidth: 3,
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              lineWidth: 1,
              select: {
                areaOpacity: 1,
                lineWidth: 3,
                restSeries: {
                  areaOpacity: 0.3,
                },
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              strokeStyle: '#ffffff',
              dataLabels: {
                color: '#ffffff',
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 600,
                useSeriesColor: false,
                textBubble: {
                  visible: false,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 0,
                },
                callout: {
                  lineColor: '#e9e9e9',
                  lineWidth: 1,
                  useSeriesColor: true,
                },
                pieSeriesName: {
                  color: '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 11,
                  fontWeight: 400,
                  useSeriesColor: false,
                  textBubble: {
                    visible: false,
                    paddingX: 5,
                    paddingY: 1,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOffsetY: 2,
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                  },
                },
              },
            },
            B: {
              areaOpacity: 1,
              colors: ['#cccccc', '#dddddd', '#eeeeee'],
              hover: {
                lineWidth: 3,
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              lineWidth: 1,
              select: {
                areaOpacity: 1,
                lineWidth: 3,
                restSeries: {
                  areaOpacity: 0.3,
                },
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              strokeStyle: '#ffffff',
              dataLabels: {
                color: '#ffffff',
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 600,
                useSeriesColor: false,
                textBubble: {
                  visible: false,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 0,
                },
                callout: {
                  lineColor: '#e9e9e9',
                  lineWidth: 1,
                  useSeriesColor: true,
                },
                pieSeriesName: {
                  color: '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 11,
                  fontWeight: 400,
                  useSeriesColor: false,
                  textBubble: {
                    visible: false,
                    paddingX: 5,
                    paddingY: 1,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOffsetY: 2,
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                  },
                },
              },
            },
          },
        });
      });

      it('theme options is reflected in the default theme option', () => {
        const state = (theme.state as StateFunc)({
          options: {
            theme: {
              series: {
                A: {
                  colors: ['#aaaaaa', '#bbbbbb'],
                },
                B: {
                  colors: ['#cccccc', '#dddddd', '#eeeeee'],
                },
              },
            },
          },
          series,
        });

        expect(state.theme?.series).toEqual({
          pie: {
            A: {
              areaOpacity: 1,
              colors: ['#aaaaaa', '#bbbbbb'],
              hover: {
                lineWidth: 3,
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              lineWidth: 1,
              select: {
                areaOpacity: 1,
                lineWidth: 3,
                restSeries: {
                  areaOpacity: 0.3,
                },
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              strokeStyle: '#ffffff',
              dataLabels: {
                color: '#ffffff',
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 600,
                useSeriesColor: false,
                textBubble: {
                  visible: false,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 0,
                },
                callout: {
                  lineColor: '#e9e9e9',
                  lineWidth: 1,
                  useSeriesColor: true,
                },
                pieSeriesName: {
                  color: '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 11,
                  fontWeight: 400,
                  useSeriesColor: false,
                  textBubble: {
                    visible: false,
                    paddingX: 5,
                    paddingY: 1,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOffsetY: 2,
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                  },
                },
              },
            },
            B: {
              areaOpacity: 1,
              colors: ['#cccccc', '#dddddd', '#eeeeee'],
              hover: {
                lineWidth: 3,
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              lineWidth: 1,
              select: {
                areaOpacity: 1,
                lineWidth: 3,
                restSeries: {
                  areaOpacity: 0.3,
                },
                shadowBlur: 5,
                shadowColor: '#cccccc',
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                strokeStyle: '#ffffff',
              },
              strokeStyle: '#ffffff',
              dataLabels: {
                color: '#ffffff',
                fontFamily: 'Arial',
                fontSize: 16,
                fontWeight: 600,
                useSeriesColor: false,
                textBubble: {
                  visible: false,
                  paddingX: 5,
                  paddingY: 1,
                  shadowBlur: 4,
                  shadowColor: 'rgba(0, 0, 0, 0.3)',
                  shadowOffsetY: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 0,
                },
                callout: {
                  lineColor: '#e9e9e9',
                  lineWidth: 1,
                  useSeriesColor: true,
                },
                pieSeriesName: {
                  color: '#ffffff',
                  fontFamily: 'Arial',
                  fontSize: 11,
                  fontWeight: 400,
                  useSeriesColor: false,
                  textBubble: {
                    visible: false,
                    paddingX: 5,
                    paddingY: 1,
                    shadowBlur: 4,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowOffsetY: 2,
                    backgroundColor: '#ffffff',
                    borderRadius: 0,
                  },
                },
              },
            },
          },
        });
      });
    });
  });
});
