var MarkdownIt = require('markdown-it'),
    mk = require('markdown-it-math-katex'),
    hljs = require('highlight.js'),
    footnote = require('markdown-it-footnote'),
    highlight = require('./hljs-renderer'),
    mila = require('markdown-it-link-attributes');

var md = new MarkdownIt({
    html: false, // No html = no xss
    linkify: true,
    highlight: highlight
}).use(mk, {
    throwOnError: false,
    errorColor: "#F00"
}).use(mila, {
    attrs: {
        target: '_blank',
        rel: 'nofollow noopener'
    }
}).use(footnote);

module.exports = md;
