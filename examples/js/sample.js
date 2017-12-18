'use strict';

(function(root) {
    var openWindow = function(url) {
        window.open(url, '_blank');
    };

    var evaluationCode = function(codeMirror) {
        var currentCode = codeMirror.doc.getValue();
        var errorDimContainer = document.getElementById('error-dim');
        var codeHtml = document.getElementById('code-html');
        var chartAreas = codeHtml.childNodes;
        var i = 0;
        var len = chartAreas.length;

        try {
            errorDimContainer.className = '';

            for (; i < len; i += 1) {
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
})(window);
