# Radar 차트

> 차트별로 사용할 수 있는 API는 이 가이드에서 다루지 않는다. 사용 가능한 API가 궁금하다면 [API 가이드](./common-api.md)를 참고하자.

## 차트 생성하기

Radar 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { RadarChart } from '@toast-ui/chart';

const chart = new RadarChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.radarChart({el, data, options});
```

## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 시리즈는 `name`과 `data` 쌍으로 입력받는다. `name`은 각각의 시리즈를 구분할 목적으로 사용하는 유일한 id로 작성한다.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000],
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000],
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000],
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000],
    },
  ],
};
```

![image](https://user-images.githubusercontent.com/43128697/102769215-ae7d5600-43c5-11eb-9f72-aa1c80e9ceaa.png)

## visible 옵션

각각의 `series`는 `visible` 옵션을 가질 수 있다. `visible` 옵션은 처음 차트가 그려졌을 때 시리즈를 나타낼지에 대한 여부를 결정한다. 기본값은 `true`이다.

```js
const data = {
  categories: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
  series: [
    {
      name: 'Budget',
      data: [5000, 3000, 5000, 7000, 6000, 4000],
      visible: false,
    },
    {
      name: 'Income',
      data: [8000, 4000, 7000, 2000, 6000, 3000],
    },
    {
      name: 'Expenses',
      data: [4000, 4000, 6000, 3000, 4000, 5000],
    },
    {
      name: 'Debt',
      data: [3000, 4000, 3000, 1000, 2000, 4000],
    },
  ],
}
```

위 옵션을 적용해 차트를 생성해보면 체크박스가 해제되어 생성되는 것을 확인할 수 있습니다.

![image](https://user-images.githubusercontent.com/35371660/108011957-86b81080-704b-11eb-8b3c-1c8ed2f01326.png)

## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
    //...
  },
  yAxis?: {
    //...
  },
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
    showDot?: boolean;
    showArea?: boolean;
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [축](./common-axes.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [플롯](./common-plot.md),
> [`responsive` 옵션](./common-responsive-options.md),
> )

### selectable

해당 시리즈를 선택할 수 있다.

* 기본값: `false`

```js
const options = {
  series: {
    selectable: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102769686-585ce280-43c6-11eb-8c24-684a6235ad37.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### showDot

시리즈의 꼭지점에 점을 표시한다.

* 기본값: `false`

```js
const options = {
  series: {
    showDot: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102770526-a45c5700-43c7-11eb-86da-81281b20f5eb.png)

### showArea

시리즈의 영역을 채운다.

* 기본값: `false`

```js
const options = {
  series: {
    showArea: true
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102770930-49772f80-43c8-11eb-871c-0c3d0e7b6cf0.png)

## 시리즈 theme

Radar 차트에서 수정할 수 있는 시리즈 테마이다.

```ts
interface RadarChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  lineWidth?: number;
  dashSegments?: number[];
  dot?: {
    color?: string;
    radius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
  hover?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
  };
  select?: {
    dot?: {
      color?: string;
      radius?: number;
      borderColor?: string;
      borderWidth?: number;
    };
    areaOpacity?: number;
    restSeries?: {
      areaOpacity: number;
    };
  };
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `colors` | string[] | 시리즈의 색상 |
| `areaOpacity` | number | `showArea: true`일 때 면 투명도 |
| `lineWidth` | number | 시리즈의 선 두께 |
| `dashSegments` | number[] | 시리즈 라인의 dashSegment 값 |
| `dot` | object | `showDot: true`일 때 노출되는 점 스타일 지정 |
| `hover.dot` | object | 데이터에 마우스를 올렸을 때 점 스타일 |
| `select` | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |
| `select.dot` | object | 시리즈가 선택되었을 때 점 스타일 |
| `select.areaOpacity` | number | `showArea: true`일 때 시리즈가 선택되었을 때 면 투명도 |
| `select.restSeries.areaOpacity` | number | `showArea: true`일 때 선택되지 않은 나머지 시리즈의 면 투명도 |

테마는 옵션에서 `theme` 옵션을 지정하고 시리즈 테마는 `theme.series`로 설정한다. 간단한 예시로 시리즈의 스타일을 바꿔보자.

```js
const options = {
  theme: {
    series: {
      colors: ['#264653', '#2A9D8F', '#E9C46A', '#F4A261'],
      lineWidth: 5,
      dashSegments: [10],
      areaOpacity: 0.5,
      dot: {
        radius: 5,
      },
      hover: {
        dot: {
          radius: 6,
          borderWidth: 2,
          borderColor: '#000000',
        },
      },
      select: {
        dot: {
          radius: 6,
          borderWidth: 2,
          borderColor: '#000000',
        },
        restSeries: {
          areaOpacity: 0.01,
        },
        areaOpacity: 1,
      },
    }
  }
}
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102772168-67de2a80-43ca-11eb-9760-480b1978f334.png)
