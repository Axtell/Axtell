const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './js/main.js',
    sideEffects: false,
    output: {
        path: path.resolve(__dirname, 'static/lib'),
        filename: 'axtell.[name].js',
        chunkFilename: 'axtell.[chunkhash].js',
        publicPath: '/static/lib/'
    },
    mode: process.env.NODE_ENV === 'debug' ? 'development' : 'production',
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
    plugins: [
        new webpack.HashedModuleIdsPlugin()
    ]
};
