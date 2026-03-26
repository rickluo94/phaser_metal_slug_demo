const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { merge } = require('webpack-merge');
const webpack = require('webpack');

const git = require('git-rev-sync');
const paths = require('./paths');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: 'production',
    devtool: false,
    output: {
        path: paths.build,
        publicPath: '',
        filename: 'js/[name].[contenthash:5].js'
    },
    module: {
        rules: [{
            test: /\.(s[ac]ss|css)$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: { importLoaders: 2, sourceMap: false }
                },
                'postcss-loader',
                'sass-loader'
            ]
        }]
    },
    plugins: [
        // Extracts CSS into separate files
        new MiniCssExtractPlugin({
            filename: 'styles/[name].[contenthash:5].css',
            chunkFilename: '[id].css'
        }),
        new webpack.DefinePlugin({
            'process.env': {
                // git: JSON.stringify(git.short())
            }
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    // 刪除無用代碼
                    toplevel: true,
                    format: { comments: false }
                },
                extractComments: false
            }),
            new CssMinimizerPlugin(),
            '...'
        ],
        runtimeChunk: { name: 'runtime' },
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'initial',
                    name: 'vendors',
                    enforce: true,
                    // 預設為 0，必須大於預設 cacheGroups
                    priority: 10
                }
            }
        }
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
});
