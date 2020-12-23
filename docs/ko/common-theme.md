# 공통 컴포넌트 테마

차트 제목, 축, 범례, 내보내기 메뉴, 툴팁, 플롯에 테마를 적용하는 방법에 대해 다룬다.

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

## 차트 전역 폰트 설정

차트 전역에서 사용할 폰트를 설정합니다. 제목, 축에 사용되는 라벨 폰트, 제목 폰트, 범례 폰트 등이 이 폰트로 설정된다.

```ts
type ChartTheme = {
  fontFamily?: string
}
```

```js
const options = {
  theme: {
    chart: {
      fontFamily: 'Impact'
    }
  }
};
```

* ⚠️ 개발 후 가이드 작성 필요 ⚠️

![image]()

## 차트 제목 테마

차트 제목의 스타일을 변경할 수 있다.

```ts
type FontTheme = {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
};
```

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

축에 테마를 적용하여 제목, 라벨, 틱, 선의 스타일을 변경할 수 있다.

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

범례의 표시되는 폰트의 스타일을 변경할 수 있다.

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

툴팁의 스타일을 변경할 수 있다.

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

플롯의 테마를 수정할 수 있다.

```ts
type PlotTheme = {
  lineColor?: string;
  lineWidth?: number;
  dashSegments?: number[];
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
  backgroundColor?: string;
};
```

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
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
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
