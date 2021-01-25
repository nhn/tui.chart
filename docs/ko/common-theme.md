# 공통 컴포넌트 테마

이 가이드는 TOAST UI Chart에서 공통 컴포넌트로 분류되고 있는 차트 제목, 축, 범례, 내보내기 메뉴, 툴팁, 플롯에 테마를 적용하는 방법을 다룬다.

```ts
type Theme = {
  chart?: ChartTheme;
  title?: FontTheme;
  yAxis?: AxisTheme | AxisTheme[];
  xAxis?: AxisTheme;
  legend?: LegendTheme;
  tooltip?: TooltipTheme;
  plot?: PlotTheme;
  exportMenu?: ExportMenuTheme;
  series?: {
    // 각 차트에서 설명
  };
}
```

## 차트 전역 테마

`theme.chart`옵션은 차트 전역에서 사용할 스타일을 설정할 수 있다. `theme.chart.fontFamily`를 지정하면 제목, 축에 사용되는 라벨 폰트, 제목 폰트, 범례 폰트 등이 이 폰트로 기본 설정되며, `theme.chart.backgroundColor` 옵션을 사용하면 차트의 배경색을 설정할 수 있다.

### fontFamily
* 기본값: `'Arial'`

### backgroundColor
* 기본값: `#ffffff`

```ts
type ChartTheme = {
  fontFamily?: string;
  backgroundColor?: string;
}
```

```js
const options = {
  theme: {
    chart: {
      fontFamily: 'Verdana',
      backgroundColor: 'rgba(9, 206, 115, 0.1)',
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/105469247-47f89a00-5cdb-11eb-9760-8141226604ff.png)

## 차트 제목 테마

`theme.title`은 차트 제목의 스타일을 설정한다.

```ts
type FontTheme = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `fontSize` | number | 글자 크기 |
| `fontFamily` | string | 폰트명 |
| `fontWeight` | number \| string | 글자 굵기 |
| `color` | string | 글자 색상 |

```js
const options = {
  theme: {
    title: {
      fontFamily: 'Comic Sans MS',
      fontSize: 45,
      fontWeight: 100,
      color: '#ff416d'
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102843994-c8627b80-444d-11eb-9a24-4144f1b028b8.png)

## 축 테마

`theme.xAxis` 또는 `theme.yAxis`는 축의 스타일을 설정한다. 축의 제목, 라벨, 선의 스타일을 변경할 수 있다.

```ts
type AxisTheme = {
  title?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  width?: number;
  color?: string;
};

type XAxisTheme = AxisTheme;
type YAxisTheme = AxisTheme | AxisTheme[];
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `title` | object | 축 제목에 대한 스타일 설정 |
| `label` | object | 축 라벨에 대한 스타일 설정 |
| `width` | number | 축의 선 두께 |
| `color` | string | 축의 선 색상 |

```js
const options = {
  theme: {
    xAxis: {
      title: {
        fontFamily: 'Impact',
        fontSize: 15,
        fontWeight: 400,
        color: '#ff416d'
      },
      label: {
        fontFamily: 'fantasy',
        fontSize: 11,
        fontWeight: 700,
        color: '#6EB5FF'
      },
      width: 2,
      color: '#6655EE'
    },
    yAxis: [
      {
        title: {
          fontFamily: 'Impact',
          fontSize: 17,
          fontWeight: 400,
          color: '#03C03C'
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#6655EE'
        },
        width: 3,
        color: '#88ddEE'
      },
      {
        title: {
          fontFamily: 'Comic Sans MS',
          fontSize: 13,
          fontWeight: 600,
          color: '#00a9ff'
        },
        label: {
          fontFamily: 'cursive',
          fontSize: 11,
          fontWeight: 700,
          color: '#FFABAB'
        },
        width: 3,
        color: '#AFFCCA'
      }
    ]
  }
};

```

![image](https://user-images.githubusercontent.com/43128697/102844148-20997d80-444e-11eb-87de-22f5abcb75df.png)

## 범례 테마

`theme.legend`는 범례에 표시되는 글자의 스타일을 지정한다.

```ts
type LegendTheme = {
  label?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
};
```

```js
const options = {
  theme: {
    legend: {
      label: {
        fontFamily: 'cursive',
        fontSize: 15,
        fontWeight: 700,
        color: '#ff416d'
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102844255-60f8fb80-444e-11eb-89c1-7644468b2dfb.png)

## 툴팁 테마

`theme.tooltip`은 툴팁의 스타일을 설정한다.

```ts
type TooltipTheme = {
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  header?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
  body?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string | number;
    color?: string;
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `background` | string | 배경 색상 |
| `borderColor` | string | 테두리 선 색상 |
| `borderWidth` | number | 테두리 선 너비 |
| `borderStyle` | string | 테두리 선 스타일. 사용 가능한 옵션은 [MDN 링크](https://developer.mozilla.org/ko/docs/Web/CSS/border-style)에서 확인할 수 있다. |
| `borderRadius` | number | 둥근 모서리 값 |
| `header` | object | 툴팁 header 영역의 글자 스타일 |
| `body` | object | 툴팁 body 영역의 글자 스타일 |

```js
const options = {
  theme: {
    tooltip: {
      background: '#80CEE1',
      borderColor: '#3065AC',
      borderWidth: 10,
      borderRadius: 20,
      borderStyle: 'double',
      header: {
        fontSize: 15,
        fontWeight: 700,
        color: '#333333',
        fontFamily: 'monospace',
      },
      body: {
        fontSize: 11,
        fontWeight: 700,
        color: '#a66033',
        fontFamily: 'monospace',
      }
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102844342-969de480-444e-11eb-9ff5-7f3c81062481.png)

## 플롯 테마

`theme.plot`은 플롯의 배경과 선 스타일을 설정한다.

```ts
type PlotTheme = {
  lineColor?: string;
  lineWidth?: number;
  dashSegments?: number[];
  backgroundColor?: string;
  vertical?: {
    lineColor?: string;
    lineWidth?: number;
    dashSegments?: number[];
  };
  horizontal?: {
    lineColor?: string;
    lineWidth?: number;
    dashSegments?: number[];
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `lineColor` | string | 선 색상 |
| `lineWidth` | number | 선 두께 |
| `dashSegments` | number[] | 플롯 선의 dashSegment 값 (IE11 이상 지원) |
| `backgroundColor` | string | 플롯 영역 배경색 |
| `vertical` | object | 세로로 그려지는 플롯 선의 스타일 설정 |
| `horizontal` | object | 가로로 그려지는 플롯 선의 스타일 설정 |

```js
const options = {
  theme: {
    plot: {
      vertical: {
        lineColor: 'rgba(60, 80, 180, 0.3)',
        lineWidth: 5,
        dashSegments: [5, 20],
      },
      horizontal: {
        lineColor: 'rgba(0, 0, 0, 0)',
      },
      backgroundColor: 'rgba(60, 80, 180, 0.1)'
    }
  }
};
```

![image](https://user-images.githubusercontent.com/43128697/102844399-bb925780-444e-11eb-9bd5-4c10471d1d6b.png)

## 내보내기 메뉴 테마
`theme.exportMenu`는 내보내기 버튼과 메뉴 박스에 대한 스타일을 설정한다.

```ts
type ExportMenuTheme = {
  button?: {
    backgroundColor?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    xIcon?: {
      color?: string;
      lineWidth?: number;
    };
    dotIcon?: {
      color?: string;
      width?: number;
      height?: number;
      gap?: number;
    };
  };
  panel?: {
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    header?: {
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string | number;
      color?: string;
      backgroundColor?: string;
    };
    body?: {
      fontSize?: number;
      fontFamily?: string;
      fontWeight?: string | number;
      color?: string;
      backgroundColor?: string;
    };
  };
};
```

| 이름 | 타입 | 설명 |
| --- | --- | --- |
| `button` | object | 내보내기 버튼 스타일 설정 |
| `button.backgroundColor` | string | 버튼의 배경색 |
| `button.borderRadius` | number | 버튼 둥근 모서리 값 |
| `button.borderWidth` | number | 버튼 테두리 두께 |
| `button.borderColor` | string | 버튼 테두리 색상 |
| `button.xIcon` | object | X 아이콘 스타일 설정 |
| `button.dotIcon` | object | 점 아이콘 스타일 설정 |
| `panel` | object | 내보내기 버튼 클릭 시 나타나는 메뉴 패널 스타일 설정 |
| `panel.borderRadius` | number | 메뉴 패널의 둥근 모서리 값 |
| `panel.borderWidth` | number | 메뉴 패널의 테두리 두께 |
| `panel.borderColor` | string | 메뉴 패널의 테두리 색상 |
| `panel.header` | object | 메뉴 패널의 header 스타일 설정 |
| `panel.body` | object | 메뉴 패널의 body 스타일 설정 |

```js
const options = {
  theme: {
    exportMenu: {
      button: {
        backgroundColor: '#ff0000',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#000000',
        xIcon: {
          color: '#ffffff',
          lineWidth: 3,
        },
        dotIcon: {
          color: '#ffffff',
          width: 10,
          height: 3,
          gap: 1,
        },
      },
      panel: {
        borderColor: '#ff0000',
        borderWidth: 2,
        borderRadius: 10,
        header: {
          fontSize: 15,
          fontFamily: 'fantasy',
          color: '#ffeb3b',
          fontWeight: 700,
          backgroundColor: '#673ab7',
        },
        body: {
          fontSize: 12,
          fontFamily: 'fantasy',
          color: '#ff0000',
          fontWeight: '500',
          backgroundColor: '#000000',
        },
      },
    },
  },
};
```

| 클릭 전 | 클릭 후 |
| --- | --- |
| ![image](https://user-images.githubusercontent.com/43128697/102844540-04e2a700-444f-11eb-83c5-8bc6cd756396.png) | ![image](https://user-images.githubusercontent.com/43128697/102844549-07dd9780-444f-11eb-88e7-5fa2f2d54ca4.png) |
