var MarkdownIt = require('markdown-it'),
    mk = require('markdown-it-math-katex'),
    hljs = require('highlight.js'),
    footnote = require('markdown-it-footnote'),
    highlight = require('./hljs-renderer'),
    mila = require('markdown-it-link-attributes'),
    implicitFigures = require('markdown-it-implicit-figures');

var md = new MarkdownIt({
    html: false, // No html = no xss
    linkify: true,
    highlight: highlight
}).use(implicitFigures, {
    dataType: true,
    figcaption: true,
    link: true
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
