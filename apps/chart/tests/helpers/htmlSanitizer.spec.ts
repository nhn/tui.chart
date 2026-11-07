import { sanitizeHTML, escapeHTML } from '@src/helpers/htmlSanitizer';

// 정화 결과를 다시 파싱해 브라우저가 해석한 URL을 얻는다
function getResolvedHrefs(html: string) {
  const container = document.createElement('div');
  container.innerHTML = sanitizeHTML(html);

  return Array.from(container.querySelectorAll('[href], [xlink\\:href]')).map((el) => {
    const anchor = document.createElement('a');
    anchor.setAttribute('href', el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? '');

    return anchor.href;
  });
}

describe('sanitizeHTML', () => {
  describe('URL 스킴 정규화 우회 (KVE-2026-2260)', () => {
    it.each([
      ['탭 엔티티', '<a href="java&#9;script:alert(1)">x</a>'],
      ['LF 엔티티', '<a href="java&#10;script:alert(1)">x</a>'],
      ['CR 엔티티', '<a href="java&#13;script:alert(1)">x</a>'],
      ['리터럴 탭', '<a href="java\tscript:alert(1)">x</a>'],
      ['콜론 앞 탭', '<a href="javascript&#9;:alert(1)">x</a>'],
      ['SVG xlink:href', '<svg><a xlink:href="java&#9;script:alert(1)"><text>x</text></a></svg>'],
      ['vbscript', '<a href="vb&#9;script:msgbox(1)">x</a>'],
    ])('%s 형태의 위험 URL을 제거한다', (_, payload) => {
      expect(getResolvedHrefs(payload).filter((href) => /^(java|vb)script:/i.test(href))).toEqual(
        []
      );
    });
  });

  describe('URL 허용 목록', () => {
    it.each([
      ['https://example.com/a'],
      ['http://example.com'],
      ['/relative/path'],
      ['relative/path?a=b:c'],
      ['#anchor'],
      ['mailto:help@example.com'],
    ])('%s 는 유지한다', (url) => {
      const container = document.createElement('div');
      container.innerHTML = sanitizeHTML(`<a href="${url}">x</a>`);

      expect(container.querySelector('a')!.getAttribute('href')).toBe(url);
    });

    it('data: 스킴 href는 제거한다', () => {
      const container = document.createElement('div');
      container.innerHTML = sanitizeHTML('<a href="data:text/html,x">x</a>');

      expect(container.querySelector('a')!.hasAttribute('href')).toBe(false);
    });

    it('img src의 data:image 는 유지한다', () => {
      const src = 'data:image/png;base64,iVBORw0KGgo=';
      const container = document.createElement('div');
      container.innerHTML = sanitizeHTML(`<img src="${src}">`);

      expect(container.querySelector('img')!.getAttribute('src')).toBe(src);
    });
  });

  it('base 태그를 제거한다', () => {
    const container = document.createElement('div');
    container.innerHTML = sanitizeHTML('<base href="https://attacker.example/"><b>x</b>');

    expect(container.querySelector('base')).toBeNull();
    expect(container.querySelector('b')).not.toBeNull();
  });

  it('on* 이벤트 속성을 제거한다', () => {
    const container = document.createElement('div');
    container.innerHTML = sanitizeHTML('<img src="x" onerror="alert(1)">');

    expect(container.querySelector('img')!.hasAttribute('onerror')).toBe(false);
  });
});

describe('escapeHTML', () => {
  it('HTML 특수 문자를 엔티티로 바꾼다', () => {
    expect(escapeHTML(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
    );
  });

  it('문자열이 아닌 값은 문자열로 바꾼다', () => {
    expect(escapeHTML(1000)).toBe('1000');
  });
});
