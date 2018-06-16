#!/usr/bin/env node
let fs = require('fs'),
    path = require('path'),
    readline = require('readline'),
    http = require('http'),
    https = require('https'),
    ProgressBar = require('progress');

let helpMessage = `Usage: ./misc/lang-tool.js [args...] <command>

Arguments:
  -h, --help  Opens this help dialog
  -json path  Specifies the path for the language JSON file. Defaults to default
              language JSON.

Commands:
  add        Creates a new language entry.
  logo       Adds a logo for a language.
  view [id]  Obtains information about a language.
  list       List of all languages

No arguments needed.`;

function help() {
    console.log(helpMessage);
    process.exit(0);
}

if (process.argv.length < 3) help();

let jsonPath = path.join(__dirname, 'languages.json');

let i = 2;
// Check if flags provided
argLookup:
for (; i < process.argv.length; i++) {
    switch (process.argv[i]) {
        case "-json":
            let [arg, path] = process.argv.splice(i, 2);
            if (!path) help();

            jsonPath = path;

        case "-h":
        case "--help":
        case "help":
            help();

        default: break argLookup;
    }
}

let command = ({
    "add": addLanguage,
    "logo": addLogo,
    "view": viewLanguage,
    "list": listLanguages
})[process.argv[i]];

if (!command) {
    console.log(`No command: \`${process.argv[i]}\``);
    help();
}

async function dispatch() {
    let rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let result = await command({
        args: process.argv.slice(i + 1),
        json: JSON.parse(fs.readFileSync(jsonPath, 'utf-8')),
        prompt: (prompt) => new Promise((resolve) => {
            rl.question(`\u001B[1m${prompt}?\u001B[0m `, (response) => {
                if (!isNaN(response)) resolve(response|0);
                else resolve(response);
            });
        }),
        assumePrompt: (prompt) => new Promise((resolve) => {
            rl.question(`\u001B[1m${prompt}?\u001B[0m `, (response) => {
                if (!response) {
                    console.log(`\u001B[31mAssuming no ${prompt}.\u001B[0m`);
                }
                if (!isNaN(response)) resolve(response|0);
                else resolve(response);
            });
        }),
        requiredPrompt: (prompt) => new Promise((resolve) => {
            function question() {
                rl.question(`\u001B[1m${prompt}?\u001B[0m ` , (response) => {
                    if (!response) {
                        console.log(`\u001B[31mPlease provide ${
                            prompt[0].toLowerCase() + prompt.substring(1)
                        }\u001B[0m`);
                        question();
                    } else {
                        if (!isNaN(response)) resolve(response|0);
                        else resolve(response);
                    }
                });
            }

            question();
        })
    });

    if (process.stdout.isTTY) {
        if (result) {
            fs.writeFileSync(jsonPath, JSON.stringify(result), 'utf-8');
            console.log('\u001B[1;32mSuccess\u001B[0m. Wrote output JSON.');
        } else {
            console.log('No changes to emit.');
        }
    }

    process.exit(1);
}

dispatch();

function header(text, noSpacing) {
    if (!noSpacing) console.log();
    console.log(`\u001B[1m--- ${text} ----\u001B[0m`);
}

function em(text) {
    process.stdout.write('\u001B[1m' + text + '\u001B[0m');
}

function value(text, forceError) {
    if (!text || forceError) console.log('\u001B[31m' + text + '\u001B[0m');
    else console.log('\u001B[32m' + text + '\u001B[0m');
}

async function addLogo(opts) {
    let langId = (await opts.requiredPrompt('Language ID')).toLowerCase();
    if (!(langId in opts.json.languages)) {
        console.log(`\u001B[31mLanguage ID \`${langId}\` doesn't exist.\u001B[0m`);
        process.exit(1);
    }

    let url = await opts.requiredPrompt('SVG URL');
    await downloadSVG(url, langId);
}

function listLanguages(opts) {
    let showIds = opts.args[0] === 'ids';
    Object.keys(opts.json.languages).forEach((key) => {
        let name;
        if (showIds) {
            name = key;
        } else if (opts.json.languages[key].display) {
            name = opts.json.languages[key].display
        } else {
            name = key[0].toUpperCase() + key.slice(1);
        }

        if (process.stdout.isTTY) {
            em(name);
            console.log();
        } else {
            console.log(name);
        }
    });
}

async function viewLanguage(opts) {
    let langId, noSpacing = false;
    if (opts.args.length > 0) {
        langId = opts.args[0];
        noSpacing = true;
    } else {
        langId = (await opts.requiredPrompt('Language ID')).toLowerCase();
    }
    if (!(langId in opts.json.languages)) {
        console.log(`\u001B[31mLanguage ID \`${langId}\` doesn't exist.\u001B[0m`);
        process.exit(1);
    }

    header('Info', noSpacing);
    em('Display Name: ');
    console.log(opts.json.languages[langId].display || (langId[0].toUpperCase() + langId.substring(1)));

    em('Short Name: ');
    value(opts.json.languages[langId].sn || `\u001B[31mEmpty\u001B[0m`);

    function idFor(name) {
        let id = opts.json[name][langId];
        if (id == 1) return langId;
        else if (id) return id;
        else return `\u001B[31mEmpty\u001B[0m`;
    }

    header('IDs');
    em('TIO ID: ');
    if (opts.json.tio[langId] == 0) value(`Empty`, true);
    else value(opts.json.tio[langId] || langId);

    em('CodeMirror ID: ');
    value(idFor('cm'));

    em('Highlight ID: ');
    value(idFor('highlight'));

    header('Logo');
    em('Exists: ');
    value(fs.existsSync(path.join(__dirname, 'lang-logos', langId + '.svg')))

    console.log();
}

async function addLanguage(opts) {
    let langId = (await opts.requiredPrompt('Language ID')).toLowerCase();

    if (langId in opts.json.languages) {
        console.log(`\u001B[31mLanguage ID \`${langId}\` already exists. Modifying...\u001B[0m`);
    }

    header('Language Info');
    console.log(`If \u001B[1;4m1\u001B[0m is entered, value will be language ID w/ each word capitalized.`);

    let displayName = await opts.requiredPrompt('Display Name');

    header('Library IDs');
    console.log(`Enter \u001B[1;4m1\u001B[0m if response is same as Language ID.`);
    console.log(`Enter \u001B[1;4m0\u001B[0m if a response does not exist.`);
    let tioId = await opts.assumePrompt('TIO ID');
    let cmId = await opts.assumePrompt('CodeMirror Editor ID');
    let hljsId = await opts.assumePrompt('Highlight.js ID');

    header('Logo Info');
    console.log(`Enter \u001B[1;4m0\u001B[0m if a response does not exist.`);
    let svgUrl = null,
        shortName = null;
    do {
        if (svgUrl !== null) {
            console.log(`\u001B[31mURL is not SVG URL.\u001B[0m`);
        }
        svgUrl = await opts.prompt('Language Icon SVG URL');
    } while(!(/https?:\/\/.+\.svg/.test(svgUrl) || svgUrl == 0));

    if (svgUrl == 0) {
        console.log('\u001B[31mNo SVG provided\u001B[0m');
        do {
            if (shortName !== null) {
                console.log(`\u001B[31mShort name must be two letters.\u001B[0m`);
            }

            shortName = await opts.prompt('Short Name');
        } while(shortName.length !== 2 && shortName != 0);

        if (shortName == 0) {
            console.log('\u001B[31mNo shortname provided.\u001B[0m');
        }
    }

    header('Writing Language...');

    opts.json.languages[langId] = {};
    if (displayName != 1) {
        opts.json.languages[langId].display = displayName;
    }

    if (shortName) {
        opts.json.languages[langId].sn = shortName;
    }

    if (hljsId) {
        opts.json.highlight[langId] = hljsId;
    }

    if (cmId) {
        opts.json.cm[langId] = cmId;
    }

    if (tioId != 1) {
        opts.json.tio[langId] = tioId;
    }

    if (svgUrl) {
        await downloadSVG(svgUrl, langId);
    }

    return opts.json;
}

function downloadSVG(url, langId) {
    return new Promise((resolve, reject) => {
        let req;
        if (url.startsWith('https')) {
            req = https.get(url);
        } else {
            req = http.get(url);
        }

        let stream = fs.createWriteStream(path.join(__dirname, 'lang-logos', langId + '.svg'));

        req.on('response', (response) => {
            let length = response.headers['content-length'] | 0;
            let bar = new ProgressBar('\u001B[1;32mDownloading SVG\u001B[0m \u001B[1m[\u001B[0m:bar\u001B[1m]\u001B[0m \u001B[1m:percent | :current/:total\u001B[0m', {
                complete: '\u001B[32m█\u001B[0m',
                incomplete: '\u001B[░',
                width: 20,
                total: length
            });

            response.on('data', (chunk) => {
                bar.tick(chunk.length);
            }).pipe(stream).on('finish', () => {
                stream.end();
                console.log(`\u001B[1;32mSuccesfully\u001B[0m downloaded SVG for \u001B[1m${langId}\u001B[0m\n`);
                resolve();
            });

            response.on('error', () => {
                stream.end();
            });
        });
    });
}
