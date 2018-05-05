const path = require('path');

module.exports = {
    entry: './js/main.js',
    output: {
        path: path.resolve(__dirname, 'static/lib'),
        filename: 'main.js'
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
    }
};
