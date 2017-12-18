// Highlight system
// This takes input through STDIN and spits HTML to STDOUT. Please cache all
//  things in redis
// This takes format:
//  [ uint32 langsize, uint8[] langid, uint8[] code ]
// all integers are LE
//

var hljs = require('highlight.js'),
    escape = require('escape-html');

function highlight(string, language, langId) {
    var head = '<pre class="hljs exec-target" data-lang="' + langId + '"><code>',
        tail = '</code></pre>';

    if (language && hljs.getLanguage(language)) {
        try {
            return head + hljs.highlight(language, string, true).value + tail;
        } catch (__) {
            return '<div style="font-size: 3rem; color: red; font-weight: 300">Error Rendering</div>';
        }
    }

    return head + escape(string) + tail;
}

process.stdin.resume();

process.stdin.on('data', function (chunk) {
    let offset = 0;

    // Determine language length
    let langLength = chunk.readUInt32LE(offset);
    offset += 4;

    // Read language name
    let lang = chunk.slice(offset, offset += langLength).toString('utf-8');

    // Determine language id length
    let langIdLength = chunk.readUInt32LE(offset);
    offset += 4;

    // Read language id name
    let langId = chunk.slice(offset, offset += langIdLength).toString('utf-8');

    // Read Code
    let code = chunk.slice(offset).toString('utf-8');

    let buffer = Buffer.from(highlight(code, lang, langId), 'utf8');
    let length = Buffer.allocUnsafe(4);
    length.writeInt32LE(buffer.length, 0);
    process.stdout.write(length);
    process.stdout.write(buffer);
});
