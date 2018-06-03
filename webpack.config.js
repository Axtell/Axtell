const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const isDevelopment = process.env.NODE_ENV === 'debug' || process.env.NODE_ENV === 'devleopment';
let plugins = [
    new webpack.HashedModuleIdsPlugin()
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
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname, 'static/lib'),
        filename: 'axtell.[name].js',
        chunkFilename: 'axtell~[chunkhash].js',
        publicPath: '/static/lib/'
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
