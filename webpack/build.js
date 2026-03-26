/* eslint-disable no-console */
const chalk = require('chalk');
const webpack = require('webpack');
const fs = require('fs');
const config = require('./webpack.prod');

console.log(`
    －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
    正在打包 ${process.env.Mode} 版本
    －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
  `);

webpack(config).run((err, stats) => {
    if (err) {
        console.log(`
    －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
    Failed to create a production build. Reason:
    ${err.message || err}
    －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
        `);
        process.exit(1);
    }

    const data = stats.toJson();
    console.log(`
    －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
    ${chalk.green('Compiled successfully.')}

    OutputPath: ${chalk.bold(data.outputPath)}
    Total Time: ${chalk.bold(data.time)}ms
    －－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－－
`);

    const assets = data.assets.filter((asset) => /\.(js|css|json)(\?.*){0,}$/.test(asset.name));
    assets.sort((a, b) => a.name.localeCompare(b.name));
    assets.forEach((asset) => {
        // 壓縮 Json
        if (asset.name.match(/\.json$/)) {
            const file = `./build/${asset.name}`;
            fs.writeFileSync(file, JSON.stringify(JSON.parse(fs.readFileSync(file).toString())));
        }
    });
});
