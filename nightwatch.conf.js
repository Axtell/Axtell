require('@babel/register')({
    babelrc: false,
    presets: [
        ['@babel/preset-env', {
            targets: { node: true }
        }]
    ]
});

const BUILD_NUMBER = process.env.TRAVIS_JOB_NUMBER;
const COMMIT_MESSAGE = process.env.TRAVIS_COMMIT_MESSAGE;

module.exports = {
    src_folders: ['client-tests'],
    output_folder: 'reports',
    test_settings: {
        default: {
            launch_url: process.env.AXTELL_URL
        },
        saucelabs: {
            username: process.env.SAUCE_USERNAME,
            access_key: process.env.SAUCE_ACCESS_KEY,
            selenium_port: 80,
            selenium_host: 'ondemand.saucelabs.com',
            desiredCapabilities: {
                name: COMMIT_MESSAGE ? COMMIT_MESSAGE.split('\n')[0] : void 0,
                tunnelIdentifier: process.env.SAUCE_TUNNEL_IDENTIFIER || BUILD_NUMBER,
                build: BUILD_NUMBER ? `build-${BUILD_NUMBER}` : void 0,
                'custom-data': {
                    source: process.env.HAS_JOSH_K_SEAL_OF_APPROVAL ? 'travis' : void 0
                }
            }
        }
    }
};
