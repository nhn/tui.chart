# Pie 차트

> 차트별로 사용할 수 있는 [API](./common-api.md)에 대한 정보는 이 가이드에서 다루지 않는다. API 가이드를 참고하도록 하자.

## 차트 생성하기

Pie 차트의 생성 방법은 두 가지가 있다. 생성자 함수와 정적 함수를 통해 생성할 수 있다. 결과는 모두 차트의 인스턴스가 반환된다. 매개 변수는 차트가 그려지는 영역인 HTML 요소 `el`, 데이터값인 `data`, 옵션값 `options`가 객체로 들어간다. `el` 값은 차트의 컨테이너 영역이므로 차트 외에 다른 요소들이 포함되어 있으면 차트에 영향을 줄 수 있음으로 비어있는 HTML 요소를 사용하는 것을 권장한다.

```js
import { PieChart } from '@toast-ui/chart';

const chart = new PieChart({el, data, options});

// 혹은

import Chart from '@toast-ui/chart';

const chart = Chart.pieChart({el, data, options});
```

## 기본 차트

### 데이터 타입

데이터는 `series` 를 통해 입력받는다. 각 시리즈는 `name`과 `data` 쌍으로 입력받는다.

```js
const data = {
  categories: ['Browser'],
  series: [
    {
      name: 'Chrome',
      data: 46.02,
    },
    {
      name: 'IE',
      data: 20.47,
    },
    {
      name: 'Firefox',
      data: 17.71,
    },
    {
      name: 'Safari',
      data: 5.45,
    },
    {
      name: 'Opera',
      data: 3.1,
    },
    {
      name: 'Etc',
      data: 7.25,
    }
  ]
}
```

![image](https://user-images.githubusercontent.com/43128697/102743434-cd1a2780-439a-11eb-8bda-0a2a8d142ad4.png)

## 옵션

`options`는 객체로 작성한다.

```ts
type options = {
  chart?: {
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
    clockwise?: boolean;
    radiusRange?: {
      inner?: number | string;
      outer?: number | string;
    };
    angleRange?: {
      start?: number;
      end?: number;
    };
    dataLabels?: {
      visible?: boolean;
      anchor?: DataLabelAnchor;
      offsetX?: number;
      offsetY?: number;
      formatter?: Formatter;
      pieSeriesName?: {
        visible: boolean;
        anchor?: 'center' | 'outer';
      };
    };
  }
}
```

> 이 차트에서 사용할 수 있는 공통 옵션에 대해서는 이 가이드에서 다루지 않는다. 필요하다면 해당 옵션의 가이드를 참고하자.
> (링크:
> [`chart` 옵션](./common-chart-options.md),
> [범례](./common-legend.md),
> [내보내기](./common-exportMenu.md),
> [툴팁](./common-tooltip.md),
> [`responsive` 옵션](./common-responsive-options.md),
> [데이터 라벨](./common-dataLabels-options.md)
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

![image](https://user-images.githubusercontent.com/43128697/102746471-b4614000-43a1-11eb-925c-7622c72c611a.png)

`selectable` 옵션과 `on` API의 `selectSeries`, `unselectSeries`를 함께 사용할 경우 해당 시리즈에 대한 제어를 추가로 할 수 있다.

### clockwise

시리즈가 그려지는 방향을 설정한다. 기본적으로 시계 방향으로 그려지고, `false`로 설정하면 시계 반대 방향으로 그려진다.

* 기본값: `true`

```js
const options = {
  series: {
    clockwise: false
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102745900-71eb3380-43a0-11eb-85a0-73f03d5f6f5a.png)

### radiusRange

`radiusRange`는 `inner`와 `outer` 옵션을 지정하여 안쪽 원의 반지름과 바깥쪽 원의 반지름을 설정할 수 있다. `inner`의 기본값은 `0`이다. 0보다 큰 값을 입력하면 도넛 모양의 차트를 표시할 수 있다.

| 속성 | 설명 |
| --- | --- |
| `radiusRange.inner` | 안쪽의 반지름 설정 |
| `radiusRange.outer` | 바깥쪽의 반지름 설정 |

값을 `%`를 포함한 문자열 타입으로 입력하면 비율로 계산한다.

```js
const options = {
  series: {
    radiusRange: {
      inner: '40%',
      outer: '100%',
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102746399-8976ec00-43a1-11eb-88f4-c86a5240e493.png)

값을 숫자 타입으로 입력하면 절대값으로 설정된다.

```js
const options = {
  series: {
    radiusRange: {
      inner: 80,
      outer: 200,
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102746372-7e23c080-43a1-11eb-94a3-c483f1d03117.png)

### angleRange

`angleRange`는 `start`와 `end` 옵션을 사용하여 호의 범위를 설정할 수 있다.

| 속성 | 설명 |
| --- | --- |
| `angleRange.start` | 호의 시작 각도 (기본값 : `0`) |
| `angleRange.end` | 호의 끝 각도 (기본값 : `360`) |

```js
const options = {
  series: {
    angleRange: {
      start: -90,
      end: 90,
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102748114-ec1db700-43a4-11eb-8f27-e0c881d55e00.png)

`clockwise`, `radiusRange`, `angleRange`를 활용하여 다양한 모양의 파이 차트를 표현할 수 있다.

```js
const options = {
  series: {
    clockwise: false,
    radiusRange: {
      inner: '70%',
      outer: '90%',
    },
    angleRange: {
      start: 135,
      end: 225,
    },
  },
};
```

![image](https://user-images.githubusercontent.com/43128697/102748528-af9e8b00-43a5-11eb-865d-1ba8ce15256a.png)

## 시리즈 theme

Pie 차트에서 수정할 수 있는 시리즈 테마이다.

```ts
interface PieChartSeriesTheme {
  colors?: string[];
  areaOpacity?: number;
  lineWidth?: number;
  strokeStyle?: string;
  hover?: {
    color?: string;
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  select?: {
    color?: string;
    lineWidth?: number;
    strokeStyle?: string;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    restSeries?: {
      areaOpacity?: number;
    };
    areaOpacity?: number;
  };
  dataLabels?: DefaultDataLabelsTheme & {
    pieSeriesName?: DefaultDataLabelsTheme;
    callout?: {
      lineWidth?: number;
      lineColor?: string;
      useSeriesColor?: boolean
    };
  };
}

type DefaultDataLabelsTheme = {
  textBubble?: {
    visible?: boolean;
    paddingX?: number;
    paddingY?: number;
    backgroundColor?: string;
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
    shadowColor?: string;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowBlur?: number;
  };
  useSeriesColor?: boolean;
  lineWidth?: number;
  textStrokeColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
}
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| colors | string[] | 시리즈의 색상 |
| areaOpacity | number | 모든 시리즈가 활성 되어 있을 때의 전체 영역 투명도 |
| lineWidth | number | 시리즈의 테두리 선 너비 |
| strokeStyle | string | 시리즈의 테두리 선 색 |
| hover | object | 데이터에 마우스를 올렸을 때 스타일 |
| select | object | 옵션 `series.selectable: true`로 설정 되어 있을 때 시리즈가 선택 되면 적용되는 스타일 |

테마는 options의 `theme`값으로 추가 해준다. 간단한 예시로 시리즈의 스타일을 바꿔보자.

```js
const options = {
  theme: {
    series: {
      colors: ['#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D', '#43AA8B', '#577590'],
      lineWidth: 2,
      strokeStyle: '#000000',
    }
  }
}
```

옵션에 대한 결과는 다음과 같다.

![image](https://user-images.githubusercontent.com/43128697/102745724-fab59f80-439f-11eb-892c-1ece9aa9845f.png)
