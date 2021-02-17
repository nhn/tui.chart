# LineScatter 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

LineScatter 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { LineScatterChart } from '@toast-ui/chart';

const chart = new LineScatterChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.lineScatterChart({el, data, options});
```
## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 차트의 시리즈는 `scatter`, `line`에 각각 입력되며 `name`과 `data` 쌍으로 입력 받는다. data는 좌표값 `x`, `y` 혹은 배열로 좌표를 입력한다.


```js
const data = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          { x: 10, y: 20 },
          { x: 14, y: 30 },
          { x: 18, y: 10 },
          { x: 20, y: 30 },
          { x: 22, y: 50 },
          { x: 24, y: 55 },
          { x: 25, y: 75 },
        ],
      },
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          { x: 5, y: 5 },
          { x: 10, y: 50 },
          { x: 15, y: 25 },
          { x: 25, y: 90 },
        ],
      },
    ],
  },
}

// 혹은

const data = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          [10, 20],
          [14, 30],
          [18, 10],
          [20, 30],
          [22, 50],
          [24, 55],
          [25, 75],
        ],
      },
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          [5, 5],
          [10, 50],
          [15, 25],
          [25, 90],
        ],
      },
    ],
  },
}
```

![image](https://user-images.githubusercontent.com/35371660/102061607-0866a480-3e37-11eb-92bb-eaf79c7e99f6.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  series: {
    scatter: [
      {
        name: 'Efficiency',
        data: [
          { x: 10, y: 20 },
          { x: 14, y: 30 },
          { x: 18, y: 10 },
          { x: 20, y: 30 },
          { x: 22, y: 50 },
          { x: 24, y: 55 },
          { x: 25, y: 75 },
        ],
        visible: false
      },
    ],
    line: [
      {
        name: 'Expenses',
        data: [
          { x: 5, y: 5 },
          { x: 10, y: 50 },
          { x: 15, y: 25 },
          { x: 25, y: 90 },
        ],
      },
    ],
  },
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108011159-dac1f580-7049-11eb-84d1-1fc93138f6d6.png)

## 옵션

`options`는 객체로 작성한다. 각각 차트에 적용하고 싶은 옵션은 `line`, `scatter`에 작성한다. 사용가능한 옵션은 다음과 같다.

```ts
type options = {
  chart?: {
    //...
  }
  xAxis?: {
    //...
  }
  yAxis?: {
    //...
  }
  legend?: {
    //...
  }
  exportMenu?: {
    //...
  }
  tooltip?: {
    //...
  }
  responsive?: {
    //...
  }
  theme?: {
    // 아래 테마 챕터에서 설명
  }
  series?: {
    selectable?: boolean;
    line?: {
      spline?: boolena;
      showDot?: boolean;
    }
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: (value) => string;
    }
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자. 또한, scatter, line 차트 옵션에 대해 궁금하다면 해당 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [실시간 업데이트](./common-liveUpdate-options.md),
> [Line 차트](./chart-line.md),
> [Scatter 차트](./chart-scatter.md)
> )

### selectable

![image](https://user-images.githubusercontent.com/35371660/102150192-58834c80-3eb3-11eb-8eed-708807aca1cc.png)

* 기본값: `false`

해당 시리즈를 선택할 수 있다.

```js
const options = {
  series: {
    selectable: true
  }
};
```

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### line chart options

라인 차트의 `spline` 옵션과 `showDot`을 적용하고 싶은 경우 line에 해당 옵션을 정의 해준다.

```js
const options = {
  line: {
    showDot: true,
    spline: true
  }
};
```

![image](https://user-images.githubusercontent.com/35371660/102150429-e2cbb080-3eb3-11eb-9698-ecdf53baf5ae.png)

### dataLabels options

`series.dataLabels` 옵션을 지정하면 Line 차트에 데이터 라벨이 표시된다. Scatter 차트는 데이터 라벨 옵션을 지원하지 않는다.

```js
const options = {
  ...
  series: {
    dataLabels: {
      visible: true;
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477790-5dc61e00-4e05-11eb-94cd-6209948ad291.png)

또한 `series.line.dataLabels` 옵션을 사용하여 데이터 라벨을 표시할 수 있다.

```ts
type LineScatterChartSeriesOption = {
  line: { // Line 시리즈 옵션
    ...
    dataLabels: {
      // Line 시리즈  데이터 라벨 옵션
    }
  }
};
```

## 시리즈 theme

각각의 스타일을 지정할 경우 `series.line` 혹은 `series.scatter`를 정의한다. 시리즈의 색상을 지정하고 싶은 경우 `colors`를 입력하거나 각각 시리즈를 구분해 색상을 부여하고 싶다면 구분해서 넣어주면 된다.

```ts
interface LineScatterChartSeriesTheme {
  colors: string[];
  line: {
    // line chart 시리즈 테마
  };
  scatter: {
    // scatter chart 시리즈 테마
  };
};
```

간단한 예시로 여러가지 스타일을 각각의 차트에 맞게 작성해보자.

```js
const theme = {
  theme: {
    series: {
      colors: ['#ff3322', '#bbcc22'],
      line: {
        dot: {
          borderColor: '#009dff',
          borderWidth: 2,
          radius: 7,
        },
      },
      scatter: {
        borderWidth: 1,
        iconTypes: ['star'],
      },
    },
  },
};
```

결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/35371660/102152124-b7e35b80-3eb7-11eb-890a-8e487c02b02b.png)

데이터 라벨의 스타일을 지정하기 위해서는 `series.line.dataLabels`를 정의한다.

```ts
type LineScatterChartDataLabelTheme = {
  series: {
    line: {
      dataLabels: {
        // Line 시리즈 데이터 라벨 테마
      }
    }
  }
};
```

간단한 예시로 Line 시리즈 데이터 라벨 스타일을 말풍선으로 바꾸고 글자 색상과 크기를 변경해보았다.

```js
const options = {
  series: {
    line: {
      showDot: true,
      dataLabels: { visible: true, offsetY: -15 }
    }
  },
  theme: {
    series: {
      line: {
        dataLabels: {
          color: '#105018',
          fontSize: 10,
          textBubble: {
            visible: true,
            paddingY: 3,
            paddingX: 6,
            arrow: {
              visible: true,
              width: 5,
              height: 5,
              direction: 'bottom'
            }
          }
        }
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/103477907-7c78e480-4e06-11eb-9d40-00759bcf65c3.png)


> [line 차트](./chart-line.md)와 [scatter 차트](./chart-scatter.md)의 테마는 각각의 가이드를 참고하도록 하자.

