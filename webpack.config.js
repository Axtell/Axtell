const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const PUBLIC_PATH = '/static/lib/';

const isDevelopment = process.env.NODE_ENV === 'debug' || process.env.NODE_ENV === 'devleopment';
let plugins = [
    new webpack.HashedModuleIdsPlugin(),
    new webpack.DefinePlugin({
        'PUBLIC_PATH': JSON.stringify(PUBLIC_PATH)
    })
];

if (!isDevelopment) {
    plugins.push(
        new UglifyJsPlugin({
            sourceMap: true,
            uglifyOptions: {
                compress: {
                    unused: true,
                    dead_code: true,
                    keep_fargs: false,
                    unsafe_math: true
                }
            }
        })
    );
}

module.exports = {
    entry: {
        main: './js/main.js',
        'sw.PushNotifications': './js/ServiceWorkers/PushNotifications/index.js'
    },
    output: {
        path: path.resolve(__dirname, 'static/lib'),
        filename: 'axtell.[name].js',
        chunkFilename: 'axtell~[chunkhash].js',
        publicPath: PUBLIC_PATH
    },
    mode: isDevelopment ? 'development' : 'production',
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader?cacheDirectory=true'
            }
        ]
    },
    plugins: plugins
};
