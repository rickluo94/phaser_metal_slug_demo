import { SpinePlugin } from '@esotericsoftware/spine-phaser';

const SPINE_ATLAS_FILE_TYPE = 'spineAtlasData';

const SpineSkeletonDataFileType = {
    json: 'json',
    binary: 'binary'
};

class SpineSkeletonDataFile extends Phaser.Loader.MultiFile {
    constructor(loader, key, url, fileType, xhrSettings) {
        if (typeof key !== 'string') {
            const config = key;
            key = config.key;
            url = config.url;
            fileType = config.type === 'spineJson' ? SpineSkeletonDataFileType.json : SpineSkeletonDataFileType.binary;
            xhrSettings = config.xhrSettings;
        }
        let file = null;
        let isJson = fileType === SpineSkeletonDataFileType.json;
        if (isJson) {
            file = new Phaser.Loader.FileTypes.JSONFile(loader, {
                key: key,
                url: `${url}?${process.env.GameTag}`,
                extension: 'json',
                xhrSettings: xhrSettings
            });
        } else {
            file = new Phaser.Loader.FileTypes.BinaryFile(loader, {
                key: key,
                url: `${url}?${process.env.GameTag}`,
                extension: 'skel',
                xhrSettings: xhrSettings
            });
        }
        super(loader, SPINE_ATLAS_FILE_TYPE, key, [file]);
        this.fileType = fileType;
    }

    onFileComplete(file) {
        this.pending--;
    }

    addToCache() {
        if (this.isReadyToProcess()) {
            this.files[0].addToCache();
        }
    }
}

/** 處理Atlas檔案和圖片檔案夾上時間搓 */
class SpineAtlasFile extends Phaser.Loader.MultiFile {
    constructor(loader, key, url, premultipliedAlpha = true, xhrSettings = {}) {
        let newKey = key;
        let newUrl = url;
        let newPremultipliedAlpha = premultipliedAlpha;
        let newXhrSettings = xhrSettings;
        if (typeof key !== 'string') {
            const config = key;
            newKey = config.key;
            newUrl = config.url;
            newPremultipliedAlpha = config.premultipliedAlpha !== undefined ? config.premultipliedAlpha : true;
            newXhrSettings = config.xhrSettings;
        }

        super(loader, SPINE_ATLAS_FILE_TYPE, newKey, [
            new Phaser.Loader.FileTypes.TextFile(loader, {
                key: newKey,
                url: `${newUrl}?${process.env.GameTag}`,
                xhrSettings: newXhrSettings,
                extension: 'atlas'
            })
        ]);
        
        this.premultipliedAlpha = newPremultipliedAlpha;
    }

    onFileComplete(file) {
        if (this.files.includes(file)) {
            this.pending--;
            if (file.type === 'text') {
                const lines = file.data.split(/\r\n|\r|\n/);
                const textures = [lines[0]];

                lines.forEach((line, index) => {
                    if (line.trim() === '' && index < lines.length - 1) {
                        textures.push(lines[index + 1]);
                    }
                });

                const basePath = file.src.match(/^.*\//);

                textures.forEach((texture) => {
                    const url = basePath + texture;
                    const key = `${file.key}!${texture}`;
                    const image = new Phaser.Loader.FileTypes.ImageFile(this.loader, key, `${url}?${process.env.GameTag}`);
                    if (!this.loader.keyExists(image)) {
                        this.addToMultiFile(image);
                        this.loader.addFile(image);
                    }
                });
            }
        }
    }

    addToCache() {
        if (this.isReadyToProcess()) {
            const { textureManager } = this.loader;
            this.files.forEach((file) => {
                if (file.type === 'image') {
                    if (!textureManager.exists(file.key)) {
                        textureManager.addImage(file.key, file.data);
                    }
                } else {
                    file.data = {
                        data: file.data,
                        premultipliedAlpha: this.premultipliedAlpha || (file.data.includes('pma: true') || file.data.includes('pma:true'))
                    };
                    file.addToCache();
                }
            });
        }
    }
}

export default class CustomSpine extends SpinePlugin {
    constructor(scene, pluginManager, pluginKey) {
        super(scene, pluginManager, pluginKey);

        let skeletonBinaryFileCallback = function(key, url, xhrSettings) {
            let file = new SpineSkeletonDataFile(this, key, url, SpineSkeletonDataFileType.binary, xhrSettings);
            this.addFile(file.files);
            return this;
        };
        pluginManager.registerFileType('spineBinary', skeletonBinaryFileCallback, scene);

        const atlasFileCallback = function (key, url, premultipliedAlpha, xhrSettings) {
            const file = new SpineAtlasFile(this, key, url, premultipliedAlpha, xhrSettings);
            this.addFile(file.files);
            return this;
        };
        pluginManager.registerFileType('spineAtlas', atlasFileCallback, scene);
    }
}
