import TuiChart from 'tui-chart';

const creator = {
    'bar': TuiChart.barChart,
    'column': TuiChart.columnChart,
    'line': TuiChart.lineChart,
    'area': TuiChart.areaChart,
    'bubble': TuiChart.bubbleChart,
    'scatter': TuiChart.scatterChart,
    'pie': TuiChart.pieChart,
    'combo': TuiChart.comboChart,
    'map': TuiChart.mapChart,
    'heatmap': TuiChart.heatmapChart,
    'treemap': TuiChart.treemapChart,
    'radial': TuiChart.radialChart,
    'boxplot': TuiChart.boxplotChart,
    'bullet': TuiChart.bulletChart
};

const chartEvents = [
    'load',
    'selectLegend',
    'selectSeries',
    'unselectSeries',
    'beforeShowTooltip',
    'afterShowTooltip',
    'beforeHideTooltip',
    'zoom',
    'changeCheckedLegends'
];

export const createComponent = type => ({
    name: `${type}-chart`,
    template: '<div ref="tuiChart"></div>',
    props: {
        data: {
            type: Object,
            requried: true
        },
        options: {
            type: Object
        },
        theme: {
            type: Object
        },
        map: {
            type: [String, Object],
            validator(value) {
                let result = false;
                if (typeof value === 'object') {
                    result = value.hasOwnProperty('name') && value.hasOwnProperty('value');
                }

                return result;
            }
        }
    },
    data() {
        return {
            creator: creator[type],
            chartInstance: null,
            computedOptions: {}
        };
    },
    watch: {
        data: {
            handler(newVal) {
                this.chartInstance.setData(newVal);
            },
            deep: true
        }
    },
    mounted() {
        this.computedOptions = Object.assign({}, this.options);
        this.registerMapToOptions();
        this.registerThemeToOptions();
        this.chartInstance = this.creator(this.$refs.tuiChart, this.data, this.computedOptions);
        this.addEventListeners();
    },
    destoryed() {
        chartEvents.forEach(event => {
            this.chartInstance.off(event);
        });
    },
    methods: {
        registerMapToOptions() {
            if (this.theme) {
                TuiChart.registerTheme('chartTheme', this.theme);
                this.computedOptions = Object.assign({}, this.computedOptions, {
                    theme: 'chartTheme'
                });
            }
        },
        registerThemeToOptions() {
            if (this.map) {
                TuiChart.registerMap(this.map.name, this.map.value);
                this.computedOptions = Object.assign({}, this.computedOptions, {
                    map: this.map.name || this.map
                });
            }
        },
        addEventListeners() {
            chartEvents.forEach(event => {
                this.chartInstance.on(event, (...args) => {
                    this.$emit(event, ...args);
                });
            });
        },
        invoke(methodName, ...args) {
            let result;
            if (this.chartInstance[methodName]) {
                result = this.chartInstance[methodName](...args);
            }

            return result;
        }
    }
});
