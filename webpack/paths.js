const path = require('path');

module.exports = {
    // Source files
    src: path.resolve(__dirname, '../src'),
    kernel: path.resolve(__dirname, '../src/sdk/kernel'),
    share: path.resolve(__dirname, '../src/sdk/share'),
    script: path.resolve(__dirname, '../src/js/script'),
    protocol: path.resolve(__dirname, '../src/sdk/protocol'),
    // Production build files
    build: path.resolve(__dirname, '../build'),
    // Static files that get copied to build folder
    static: path.resolve(__dirname, '../static'),
    assets: path.resolve(__dirname, '../src/assets'),
    nodeModules: path.resolve(__dirname, '../node_modules/'),
    external: path.resolve(__dirname, '../src/js/external/')
};
