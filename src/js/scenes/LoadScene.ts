import Model from '@kernel/utility/Model';
import CommonBase from '@share/game/CommonBase';
import LoadSources, { mainPath } from '@share/tools/LoadSources';
import { Config } from '@/js/files/Config';

type LoadAssetItem = {
    type: string;
    path: string;
    file: string;
    root?: string;
    ext?: string;
    [key: string]: unknown;
};

type LoadAssetMap = Record<string, LoadAssetItem>;
type ConfigShape = {
    MULTI_PATH: string;
};

export default class LoaderScene extends Phaser.Scene {
    constructor() {
        super({ key: 'preloader', active: false, visible: false });
    }

    init() {}

    preload() {
        const config = Config as ConfigShape;
        // feature 素材先不加載
        Object.keys(Model.External.images).forEach((imageKey) => {
            if (imageKey === 'feature') return;
            const root = (imageKey === 'commonFile') ? imageKey.toString() : `${config.MULTI_PATH}${mainPath[imageKey]}`;
            this.loadIdentifyFile(Model.External.images[imageKey] as LoadAssetMap, root);
        });

        // feature 素材先不加載(音效)
        Object.keys(Model.External.sound).forEach((soundKey) => {
            if (soundKey === 'feature') return;
            const root = (soundKey === 'commonFile') ? 'soundFile' : `${config.MULTI_PATH}${mainPath.sound}`;
            this.loadIdentifyFile(Model.External.sound[soundKey] as LoadAssetMap, root);
        });
    }

    loadIdentifyFile(data: LoadAssetMap, root = '') {
        const languageID = String(Model.Game.languageID || '');
        Object.keys(data).forEach((key) => {
            const item = data[key];
            if (root !== '') item.root = root;
            LoadSources.baseLoadTypeFile(this, key, item, languageID);
        }, this);
    }

    create() {
        // 加載的數量不同, 跳制斷線
        if (this.load.totalComplete !== this.load.totalToLoad && !Model.FrameTool.ignoreLoadError) {
            this.scene.start('msg-error', {});
            return;
        }
        // 通知載入完畢
        CommonBase.GameLoadComplete();
        // 跳轉遊戲
        this.scene.start('title');
    }
}
