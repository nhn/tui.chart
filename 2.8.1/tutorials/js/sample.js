'use strict';

(function(root) {
    var openWindow = function(url) {
        window.open(url, '_blank');
    };

    var evaluationCode = function(codeMirror, codeString) {
        var currentCode = codeMirror.doc.getValue();
        var isError = false;

        document.getElementById('chart-area').innerHTML = '';

        try {
            eval(currentCode);
        } catch (e) {
            isError = true;
            console.warn('An error occur :' + e.message);
            eval(codeString);
        }

        return isError;
    };

    root.openWindow = openWindow;
    root.evaluationCode = evaluationCode;
})(window);
