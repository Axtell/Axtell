// Markdown system
// This takes input through STDIN and spits HTML to STDOUT. Please cache all
//  things in redis

var md = require('./markdown-renderer'),
    os = require('os')

process.stdin.resume();

process.stdin.on('data', function (chunk) {
    let offset = 0;

    const renderMath = chunk.readUInt8(offset) === 1;
    offset += 1;

    if (!renderMath) {
        md.disable(['math_inline', 'math_block']);
    }
    let buffer = Buffer.from(md.render(chunk.slice(offset).toString('utf8')), 'utf8');
    if (!renderMath) {
        md.enable(['math_inline', 'math_block']);
    }

    let length = Buffer.allocUnsafe(4);
    length.writeInt32LE(buffer.length, 0);
    process.stdout.write(length);
    process.stdout.write(buffer);
});
