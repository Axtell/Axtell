// Markdown for help center
// This does things a little differently and has more complex marshaling. This
// is not secure and may under buggy conditions display data from previous
// executions.

var md = require('./markdown-renderer'),
    frontMatter = require('markdown-it-front-matter'),
    slug = require('slug'),
    anchor = require('markdown-it-anchor'),
    os = require('os')

md.set({ html: true });

let lastFrontMatter;
md.use(frontMatter, (frontMatter) => {
    lastFrontMatter = frontMatter
});

let headers;
md.use(anchor, {
    slugify: text => slug(text, {
        lower: true
    }),
    callback: (_, { slug, title }) => {
        headers.push([ title, slug ])
    }
})


process.stdin.resume();
process.stdin.on('data', function (chunk) {
    // Read markdown
    const renderString = chunk.toString('utf8');

    lastFrontMatter = '';
    headers = [];

    let renderOutput = md.render(renderString);
    let buffer = Buffer.from(renderOutput);

    let frontMatter = lastFrontMatter;
    let headings = headers;

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

    // Pass params
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


    // Pass headers
    let headersLength = Buffer.allocUnsafe(4);
    headersLength.writeInt32LE(headings.length, 0);
    process.stdout.write(headersLength);

    for (let i = 0; i < headings.length; i++) {
        let key = headings[i][0];
        let value = headings[i][1];

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
