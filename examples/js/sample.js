'use strict';

(function(root) {
    var openWindow = function(url) {
        window.open(url, '_blank');
    };

    var evaluationCode = function(codeMirror) {
        var currentCode = codeMirror.doc.getValue();
        var errorDimContainer = document.getElementById('error-dim');

        var chartArea = document.getElementById('chart-area');

        try {
            errorDimContainer.className = '';
            chartArea.innerHTML = '';
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
