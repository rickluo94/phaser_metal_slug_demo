const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const git = require('git-rev-sync');
const webpack = require('webpack');
const paths = require('./paths');
// 遊戲資訊
const gameConfig = require('./loadGameConfig');
const injectJS = require('./injectJS');

const config = {
    entry: {
        app: [`${paths.src}/js/index`]
    },
    target: 'web',
    output: {
        path: paths.build,
        filename: '[name].bundle.js',
        publicPath: '',
        assetModuleFilename: 'images/[name].[hash][ext]'
    },
    plugins: [
        // 清除 build 資料夾以及無用檔案
        new CleanWebpackPlugin(),
        // 複製檔案
        new CopyWebpackPlugin({
            patterns: [
                { from: paths.assets, to: 'assets', globOptions: { ignore: ['*.DS_Store'] } }
            ]
        }),
        new HtmlWebpackPlugin({
            title: gameConfig.settings.gameName,
            template: `${paths.src}/template.html`,
            filename: 'index.html',
            inject: 'body',
            // tag: git.tag(),
            rev: (new Date()).toDateString()
        }),
        // ESLint configuration
        new ESLintPlugin({
            files: ['.', 'src'],
            // emitError: false,
            // emitWarning: false,
            failOnError: false,
            exclude: ['node_modules']
        }),
        new webpack.DefinePlugin({
            'process.env.GameID': JSON.stringify(gameConfig.settings.GameID),
            'process.env.IP': JSON.stringify(process.env.IP)
        })
    ],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            include: paths.src,
                            exclude: [/node_modules/, paths.external]
                        }
                    }]
            },
            { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },
            { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' }
        ]
    },
    resolve: {
        modules: [paths.src, 'node_modules'],
        extensions: ['.ts', '.js', '.json'],
        alias: {
            '@': paths.src,
            '@script': paths.script,
            '@kernel': paths.kernel,
            '@share': paths.share,
            '@protocol': paths.protocol
        },
        // prevent polyfill
        fallback: {
            crypto: false
        }
    }
};

// external js
config.plugins = [...config.plugins, ...injectJS];
if (process.env.Mode === 'devtest') {
    // 插入 Demo Editor
    // config.entry.app.push(`${paths.src}/js/DemoTest/DemoEditor.js`);
}

module.exports = config;
