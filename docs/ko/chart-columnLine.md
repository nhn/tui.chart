# Column Line 차트

> 차트별로 사용할 수 있는 [API](./common-api.md)에 대한 정보는 이 가이드에서 다루지 않는다. API 가이드를 참고하도록 하자.

## 차트 생성하기

Column Line 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { ColumnLineChart } from '@toast-ui/chart';

const chart = new ColumnLineChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.columnLineChart({el, data, options});
```
## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 차트의 시리즈는 `column`, `line`에 각각 입력되며 `name`과 `data` 쌍으로 입력 받는다. data는 값을 나타내는 배열로 입력한다.


```js
const data = {
  categories: ['Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct'],
  series: {
    column: [
      {
        name: 'Seoul',
        data: [11.3, 17.0, 21.0, 24.4, 25.2, 20.4, 13.9],
      },
      {
        name: 'NewYork',
        data: [9.9, 16.0, 21.2, 24.2, 23.2, 19.4, 13.3],
      },
      {
        name: 'Sydney',
        data: [18.3, 15.2, 12.8, 11.8, 13.0, 15.2, 17.6],
      },
      {
        name: 'Moskva',
        data: [4.4, 12.2, 16.3, 18.5, 16.7, 10.9, 4.2],
      },
    ],
    line: [
      {
        name: 'Average',
        data: [11, 15.1, 17.8, 19.7, 19.5, 16.5, 12.3],
      },
    ],
  },
};
```

![image](https://user-images.githubusercontent.com/43128697/102773432-8f35f700-43cc-11eb-82fe-2eef25c5dada.png)

## 옵션

`options`는 객체로 작성한다. 각각 차트에 적용하고 싶은 옵션은 `column`, `line`에 작성한다. 사용가능한 옵션은 다음과 같다.

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
      formatter?: Formatter;
    }
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자. 또한, column, line 차트 옵션에 대해 궁금하다면 해당 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [실시간 업데이트](./common-liveUpdate-options.md),
> [데이터 라벨](./common-dataLabels-options.md),
> [Column 차트](./chart-column.md),
> [Line 차트](./chart-line.md)
> )

### selectable

해당 시리즈를 선택할 수 있다.

* default: `false`

```js
const options = {
  series: {
    selectable: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102773737-14211080-43cd-11eb-83cc-7e5be58a7d85.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### eventDetectType

툴팁을 나타낼 때 발생하는 마우스 오버와 시리즈를 선택할 때 발생하는 마우스 클릭 시 데이터를 탐지하는 방법을 정의할 수 있다.

| 타입 | 설명 |
| --- | --- |
| `grouped` | Y축을 기준으로 값이 같은 모든 데이터가 탐지됨 |
| `point` | 개별 시리즈 영역에 마우스가 다가가야 탐지. 현재 마우스가 가리키고 있는 포인트를 기준으로 단 한 개만 탐지됨 |

* 기본값: `'grouped'`

![image](https://user-images.githubusercontent.com/43128697/102774021-82fe6980-43cd-11eb-8d01-bf1e5dac7a87.png)

`eventDetectType: 'point'`로 설정할 경우 line 시리즈의 점과 column 시리즈의 박스를 각각 마우스 포인터 기준으로 탐지한다.

![image](https://user-images.githubusercontent.com/43128697/102773737-14211080-43cd-11eb-83cc-7e5be58a7d85.png)

### column chart options

컬럼 차트의 `stack` 옵션을 적용하고 싶은 경우 column에 해당 옵션을 정의 해준다.

```js
const options = {
  column: {
    stack: {
      type: 'normal'
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102780550-797afe80-43d9-11eb-9d32-8707dec4a096.png)

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

![image](https://user-images.githubusercontent.com/43128697/102774810-0a98a800-43cf-11eb-8389-c4087f450379.png)

## 시리즈 theme

각각의 스타일을 지정할 경우 `series.column` 혹은 `series.line`을 정의한다. 시리즈의 색상을 지정하고 싶은 경우 `colors`를 입력하거나 각각 시리즈를 구분해 색상을 부여하고 싶다면 구분해서 넣어주면 된다.

```ts
interface ColumnLineChartSeriesTheme {
  colors: string[];
  column: {
    // column chart 시리즈 테마
  };
  line: {
    // line chart 시리즈 테마
  };
};
```

간단한 예시로 여러가지 스타일을 각각의 차트에 맞게 작성해보자.

```js
const theme = {
  theme: {
    series: {
      colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#bfe000'],
      column: {
        barWidth: 18
      },
      line: {
        dot: {
          radius: 6,
          borderColor: '#ffff00',
          borderWidth: 2,
        }
      }
    }
  }
};
```

결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102777876-d6c08100-43d4-11eb-94e5-7b426839aba6.png)


> [column 차트](./chart-column.md)와 [line 차트](./chart-line.md)의 테마는 각각의 가이드를 참고하도록 하자.
