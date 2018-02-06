// Markdown system
// This takes input through STDIN and spits HTML to STDOUT. Please cache all
//  things in redis

var md = require('./markdown-renderer'),
    os = require('os')

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (chunk) {
    let buffer = Buffer.from(md.render(chunk), 'utf8');
    let length = Buffer.allocUnsafe(4);
    length.writeInt32LE(buffer.length, 0);
    process.stdout.write(length);
    process.stdout.write(buffer);
});
