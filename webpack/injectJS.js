
const webpack = require('webpack');
const paths = require('./paths');
const gameConfig = require('./loadGameConfig');

// spine loading
const js = gameConfig.injectJS;
const jsKeys = Object.keys(js);
const jsArray = [];
const isInjectJS = (jsKeys.length !== 0);

if (isInjectJS) {
    jsKeys.forEach((key) => {
        jsArray.push(
            new webpack.ProvidePlugin({
                [key]: `${paths.src}/${js[key]}`
            })
        );
    });
}
module.exports = jsArray;
