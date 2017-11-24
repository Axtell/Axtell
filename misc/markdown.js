// Markdown system
// This takes input through STDIN and spits HTML to STDOUT. Please cache all
//  things in redis

var MarkdownIt = require('markdown-it'),
    KaTeX = require('markdown-it-katex'),
    hljs = require('highlight.js'),
    os = require('os');

let md = new MarkdownIt({
    html: false, // No html = no xss
    linkify: true,
    highlight: function (string, language) {
        var langExec = "";
        if (language) {
            langExec = ' exec-target" data-lang="' + language;
        }
        if (language && hljs.getLanguage(language)) {
            try {
                return '<pre class="hljs' + langExec + '"><code>' +
                    hljs.highlight(language, string, true).value +
                    '</code></pre>';
            } catch (__) {
            }
        }

        return '<pre class="hljs' + langExec + '"><code>' + md.utils.escapeHtml(string) + '</code></pre>';
    }
}).use(KaTeX, {
    'throwOnError': false,
    'errorColor': '#cc0000'
});

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (chunk) {
    let buffer = Buffer.from(md.render(chunk), 'utf8');
    let length = Buffer.allocUnsafe(4);
    length.writeInt32LE(buffer.length, 0);
    process.stdout.write(length);
    process.stdout.write(buffer);
});
