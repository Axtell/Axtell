// Markdown system
// This takes input through STDIN and spits HTML to STDOUT. Please cache all
//  things in redis

var MarkdownIt = require('markdown-it'),
    hljs = require('highlight.js'),
    os = require('os');

let md = new MarkdownIt({
    html: false, // No html = no xss
    linkify: true,
    highlight: function(string, language) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return '<pre class="hljs"><code>' +
                   hljs.highlight(lang, str, true).value +
                   '</code></pre>';
          } catch (__) {}
        }

        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
});

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(chunk) {
    let buffer = Buffer.from(md.render(chunk), 'utf8');
    let length = Buffer.allocUnsafe(4);
    length.writeInt32LE(buffer.length, 0);
    process.stdout.write(length);
    process.stdout.write(buffer);
});
