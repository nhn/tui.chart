import { tooltipTemplates, getBodyTemplate } from '@src/helpers/tooltipTemplate';
import { sanitizeHTML } from '@src/helpers/htmlSanitizer';
import { TooltipModel } from '@t/components/tooltip';

const theme = {
  borderColor: '#000',
  borderWidth: 0,
  borderStyle: 'solid',
  borderRadius: 3,
  background: '#fff',
  header: { fontSize: 13, fontWeight: 'bold', color: '#fff', fontFamily: 'Arial' },
  body: { fontSize: 12, fontWeight: 'normal', color: '#fff', fontFamily: 'Arial' },
} as any;

function createModel(model: Partial<TooltipModel>): TooltipModel {
  return {
    type: 'tooltip',
    x: 0,
    y: 0,
    target: { radius: 0, width: 0, height: 0 },
    data: [],
    ...model,
  } as TooltipModel;
}

// tooltip.ts renderTooltip()과 같은 순서로 기본 툴팁을 만든다
function renderDefaultTooltip(model: TooltipModel) {
  const container = document.createElement('div');
  container.innerHTML = sanitizeHTML(
    tooltipTemplates['default'](
      model,
      {
        header: tooltipTemplates.defaultHeader(model, theme),
        body: getBodyTemplate(model.templateType)(model, theme),
      },
      theme
    )
  );

  return container;
}

describe('기본 툴팁 템플릿 (KVE-2026-2260)', () => {
  it('category를 HTML이 아닌 텍스트로 표시한다', () => {
    const container = renderDefaultTooltip(
      createModel({
        category: '<a id="injected" href="java&#9;script:alert(1)">link</a>',
        data: [{ label: 'A', color: '#00a9ff', formattedValue: '1', value: 1 } as any],
      })
    );

    expect(container.querySelector('#injected')).toBeNull();
    expect(container.querySelector('.toastui-chart-tooltip-category')!.textContent).toContain(
      '<a id="injected"'
    );
  });

  it('series label과 formattedValue를 텍스트로 표시한다', () => {
    const container = renderDefaultTooltip(
      createModel({
        category: 'Q1',
        data: [
          { label: '<b>A</b>', color: '#00a9ff', formattedValue: '<i>1</i>', value: 1 } as any,
        ],
      })
    );

    expect(container.querySelector('b, i:not(.toastui-chart-icon)')).toBeNull();
    expect(container.querySelector('.toastui-chart-name')!.textContent).toBe('<b>A</b>');
  });

  it('series color가 style 속성을 벗어나지 못한다', () => {
    const container = renderDefaultTooltip(
      createModel({
        category: 'Q1',
        data: [
          {
            label: 'A',
            color: 'red"><a id="injected" href="#">c</a><i x="',
            formattedValue: '1',
            value: 1,
          } as any,
        ],
      })
    );

    expect(container.querySelector('#injected')).toBeNull();
  });

  it('heatmap label을 텍스트로 표시한다', () => {
    const container = renderDefaultTooltip(
      createModel({
        templateType: 'heatmap',
        data: [{ label: '<b>cell</b>', color: '#fff', formattedValue: '1', value: 1 } as any],
      })
    );

    expect(container.querySelector('b')).toBeNull();
  });
});

describe('사용자 정의 툴팁 템플릿', () => {
  it('model.category를 그대로 넣어도 sanitizer가 위험 URL을 제거한다', () => {
    const model = createModel({
      category: '<a id="injected" href="java&#9;script:alert(1)">link</a>',
    });
    const container = document.createElement('div');
    // 문서 예제처럼 category를 escape 없이 넣는 사용자 템플릿
    container.innerHTML = sanitizeHTML(`<p>${model.category}</p>`);

    expect(container.querySelector('#injected')!.hasAttribute('href')).toBe(false);
  });
});
