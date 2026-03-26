const fs = require('fs');
const path = require('path');
const Module = require('module');
const ts = require('typescript');

const filename = path.resolve(__dirname, '../GameConfig.ts');
const source = fs.readFileSync(filename, 'utf8');
const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020
    },
    fileName: filename
});

const gameConfigModule = new Module(filename, module);
gameConfigModule.filename = filename;
gameConfigModule.paths = Module._nodeModulePaths(path.dirname(filename));
gameConfigModule._compile(outputText, filename);

module.exports = gameConfigModule.exports.default || gameConfigModule.exports;
