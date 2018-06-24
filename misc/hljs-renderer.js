var hljs = require('highlight.js'),
    escape = require('escape-html');

// Custom HLJS langs
hljs.registerLanguage('rodacode', require('./hljs/rodacode'));

function highlight(string, language, langId) {
    if (language) {
        var head = '<pre class="hljs exec-target" data-lang="' + (langId || language) + '"><code>';
    } else {
        var head = '<pre class="hljs"><code>';
    }

    var tail = '</code></pre>';

    if (language && hljs.getLanguage(language)) {
        try {
            return head + hljs.highlight(language, string, true).value + tail;
        } catch (__) {
            return '<div style="font-size: 3rem; color: red; font-weight: 300">Error Rendering</div>';
        }
    }

    return head + escape(string) + tail;
}

module.exports = highlight;
