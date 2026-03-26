const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const paths = require('./paths');

const config = merge(common, {
    stats: 'errors-warnings',
    // Set the mode to development or production
    mode: 'development',
    // 記憶體緩存
    cache: { type: 'memory' },
    devtool: 'eval-cheap-module-source-map',
    devServer: {
        host: '0.0.0.0',
        historyApiFallback: true,
        static: [
            { directory: paths.src },
            { directory: paths.public },
            { directory: paths.assets },
            { directory: paths.nodeModules }
        ],
        open: true,
        compress: true,
        port: 4000
    },
    module: {
        rules: [{
            test: /\.(s[ac]ss|css)$/,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: { sourceMap: true, importLoaders: 1, modules: false }
                },
                { loader: 'sass-loader', options: { sourceMap: true } },
                { loader: 'postcss-loader', options: { sourceMap: true } }
            ]
        }]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
            }
        })
    ]
});

module.exports = config;
