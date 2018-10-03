// Markdown for help center
// This does things a little differently and has more complex marshaling. This
// is not secure and may under buggy conditions display data from previous
// executions.

var md = require('./markdown-renderer'),
    frontMatter = require('markdown-it-front-matter'),
    os = require('os')

md.set({ html: true });

let lastFrontMatter;
md.use(frontMatter, (frontMatter) => {
    lastFrontMatter = frontMatter
});


process.stdin.resume();
process.stdin.on('data', function (chunk) {
    // Read markdown
    const renderString = chunk.toString('utf8');

    lastFrontMatter = '';
    let buffer = Buffer.from(md.render(renderString));
    let frontMatter = lastFrontMatter;


    // Parse front matter
    let frontMatterParams = [];
    let frontMatterLines = frontMatter.split('\n');
    for (let i = 0; i < frontMatterLines.length; i++) {
        let parts = frontMatterLines[i].split(':');
        if (parts.length !== 2) continue;

        frontMatterParams.push([ parts[0].trim(), parts[1].trim() ])
    }


    // We output this in form:
    // <ui32le len> <bytes>
    // <ui32le frontmatterParams> <param ...>
    //
    // param:
    //     <ui32le keyLen> <key bytes> <ui32le keyValue> <value bytes>
    //

    // Length
    let length = Buffer.allocUnsafe(4);
    length.writeInt32LE(buffer.length, 0);
    process.stdout.write(length);

    // Raw bytes
    process.stdout.write(buffer);

    let paramsLength = Buffer.allocUnsafe(4);
    paramsLength.writeInt32LE(frontMatterParams.length, 0);
    process.stdout.write(paramsLength);

    for (let i = 0; i < frontMatterParams.length; i++) {
        let key = frontMatterParams[i][0];
        let value = frontMatterParams[i][1];

        let keyLength = Buffer.allocUnsafe(4);
        keyLength.writeInt32LE(key.length, 0);
        process.stdout.write(keyLength);

        process.stdout.write(Buffer.from(key, 'utf8'));

        let valueLength = Buffer.allocUnsafe(4);
        valueLength.writeInt32LE(value.length, 0);
        process.stdout.write(valueLength);

        process.stdout.write(Buffer.from(value, 'utf8'))
    }
});
