/* eslint-disable */
'use strict';

(function (root) {
  const openWindow = function (url) {
    window.open(url, '_blank');
  };

  const evaluationCode = function (codeMirror) {
    const currentCode = codeMirror.doc.getValue();
    const errorDimContainer = document.getElementById('error-dim');
    const codeHtml = document.getElementById('code-html');
    const chartAreas = codeHtml.childNodes;
    const len = chartAreas.length;

    try {
      errorDimContainer.className = '';

      for (let i = 0; i < len; i += 1) {
        if (chartAreas[i].nodeType === 1) {
          chartAreas[i].innerHTML = '';
        }
      }
      eval(currentCode);
    } catch (e) {
      errorDimContainer.className = 'show';
      document.getElementById('error-text').innerText = 'Exception: ' + e.message;
      document.getElementById('error-stack').innerText = e.stack;

      console.error(e);
    }
  };

  root.openWindow = openWindow;
  root.evaluationCode = evaluationCode;

  root.textArea = document.getElementById('code');
  root.chartCM = CodeMirror(
    function (elt) {
      root.textArea.parentElement.replaceChild(elt, textArea);
    },
    {
      mode: 'javascript',
      lineNumbers: true,
      styleActiveLine: true,
      matchBrackets: true,
      indentUnit: 4,
      value: document.getElementById('code-js').innerHTML,
      theme: 'neo',
    }
  );

  root.chartCM.setSize(800, 500);

  root.codeString = root.chartCM.doc.getValue();
})(window);
