export const mainPath = {
    common: 'assets/images/common',
    feature: 'assets/images/feature',

    sound: 'assets/sound',
    soundFeature: 'assets/sound/feature',

    featureFile: '../common-files/images/feature',
    commonFile: '../common-files/images',
    soundFile: '../common-files/sound'
} as const;

/** loader屬性 */
export const loadType = {
    Atlas: 'atlas',
    MultiAtlas: 'mAtlas',
    Bitmap: 'bitmap',
    Json: 'json',
    Spine: 'spine',
    Sound: 'sound',
    Image: 'image'
} as const;

type LoadTypeValue = typeof loadType[keyof typeof loadType];

type LoadScene = Phaser.Scene & {
    load: Phaser.Loader.LoaderPlugin & {
        spineBinary: (key: string, url: string) => Phaser.Loader.LoaderPlugin;
        spineAtlas: (key: string, url: string) => Phaser.Loader.LoaderPlugin;
    };
};

type ResourceData = {
    type: LoadTypeValue | string;
    path: string;
    ext?: string;
    root?: keyof typeof mainPath | string;
    file: string;
};

type LoadCallback = (() => void) | ((file: unknown) => void);

/**
 * Load 資源
 * Singleton
 */
export default class LoadSources {
    static instance: LoadSources;
    suffix: string;

    constructor(suffix = '') {
        LoadSources.instance = this;
        this.suffix = suffix;
    }

    // 單例模式
    static get instances() {
        if (this.instance === undefined) {
            this.instance = new LoadSources();
        }
        return this.instance;
    }

    static makePath(path: string | string[]) {
        if (Array.isArray(path)) {
            return path.map((item) => ((this.instances.suffix === '') ? item : `${item}?${this.instances.suffix}`));
        }
        return (this.instances.suffix === '') ? path : `${path}?${this.instances.suffix}`;
    }

    static loadImage(scene: LoadScene, key: string, path: string) {
        scene.load.image(key, this.makePath(path) as string);
    }

    static loadAtlas(scene: LoadScene, key: string, imgPath: string, path: string) {
        scene.load.atlas(key, this.makePath(imgPath) as string, this.makePath(path) as string);
    }

    static loadMultiAtlas(scene: LoadScene, key: string, path: string) {
        const imgPath = path.replace(/\/[^\/]*$/, '/');
        scene.load.multiatlas(key, `${path}.json`, `${imgPath}`);
    }

    static loadBitmap(scene: LoadScene, key: string, imgPath: string, path: string) {
        scene.load.bitmapFont(key, this.makePath(imgPath) as string, this.makePath(path) as string);
    }

    static loadAudio(scene: LoadScene, key: string, path: string[]) {
        scene.load.audio(key, this.makePath(path) as string[], true);
    }

    static loadJson(scene: LoadScene, key: string, path: string) {
        scene.load.json(key, this.makePath(path) as string);
    }

    static loadBinary(scene: LoadScene, key: string, path: string) {
        scene.load.binary(key, this.makePath(path) as string);
    }

    static loadSpine(scene: LoadScene, key: string, path: string) {
        scene.load.spineBinary(`${key}-data`, `${path}.skel`);
        scene.load.spineAtlas(`${key}-atlas`, `${path}.atlas`);
    }

    /**
     * 檔案對應加載方式
     * @param {String} type 資源型態
     * @param {String} key Key Name
     * @param {String} pathFile 路徑
     * @param {String} ext 副檔名
     */
    static loadTypeFile(scene: LoadScene, type: string, key: string, pathFile: string, ext?: string) {
        switch (type) {
            case loadType.Atlas:
                this.loadAtlas(scene, key, `${pathFile}.${ext}`, `${pathFile}.json`);
                break;
            case loadType.MultiAtlas:
                this.loadMultiAtlas(scene, key, pathFile);
                break;
            case loadType.Bitmap:
                this.loadBitmap(scene, key, `${pathFile}.${ext}`, `${pathFile}.fnt`);
                break;
            case loadType.Json:
                this.loadJson(scene, key, `${pathFile}.json`);
                break;
            case loadType.Spine:
                this.loadSpine(scene, key, pathFile);
                break;
            case loadType.Sound:
                this.loadAudio(scene, key, ext ? [`${pathFile}.${ext}`] : [`${pathFile}.mp3`]);
                break;
            default:
                this.loadImage(scene, key, `${pathFile}.${ext}`);
                break;
        }
    }

    static baseLoadTypeFile(scene: LoadScene, key: string, data: ResourceData, languageID: string) {
        const { type, path, ext, root = '', file } = data;
        const lang = `${path.replace(/{lang}/g, `lang/${languageID}`)}`;
        const pathBase = (mainPath[root as keyof typeof mainPath]) ? mainPath[root as keyof typeof mainPath] : root;
        const pathFile = `${pathBase}/${lang}/${file}`;
        this.loadTypeFile(scene, type, key, pathFile, ext);

        return { key, pathFile };
    }

    /** 動態加載檔案(單隻) */
    static LoadResourcesFile(scene: LoadScene, key: string, data: ResourceData, languageID: string, onComplete?: LoadCallback, onError?: LoadCallback) {
        this.baseLoadTypeFile(scene, key, data, languageID);
        if (onComplete) scene.load.on('complete', onComplete);
        if (onError) scene.load.on('loaderror', onError);
        return { load: scene.load, onComplete, onError };
    }
}
