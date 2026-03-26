
import GetUrlParams from '@share/net/GetUrlParams';
// import ArrowKeys from '@share/tools/ArrowKeys';
// import UIPos from '@share/tools/UIPos';
// import Sound from '@share/tools/Sound';

type CommonBaseModel = {
    UrlParams: Record<string, unknown>;
    Game: Record<string, unknown>;
};

type CommonBaseConfig = {
    LANGUAGE_UI: string[];
    DEFAULT_LANGUAGE?: string;
    [key: string]: unknown;
};

type CommonBaseData = {
    scene: Phaser.Scene;
    config: CommonBaseConfig;
    model: CommonBaseModel;
    useStyle: string;
};

type LibBaseInstance = {
    GameLoadStart?: (scene?: Phaser.Scene) => void;
    GameLoadComplete?: () => void;
    GameCreateComplete?: (scene?: Phaser.Scene) => void;
    GameConnectComplete?: (data?: unknown) => void;
    GameLoginFeature?: () => void;
    GameInitFeature?: (scene?: Phaser.Scene) => void;
    GameErrorBeforeFeature?: (target: unknown, msg: unknown) => void;
};

type LibBaseConstructor = new (root: Phaser.Game, data: CommonBaseData) => LibBaseInstance;

/** # 遊戲共通接口
 * 處理特殊業務使用 ex: FullScreen 滿版... 等
 */
export default class CommonBase {
    static instance: CommonBase;
    static LibBase?: LibBaseInstance;
    data?: CommonBaseData;
    root: Phaser.Game;

    constructor(gameConfig: Phaser.Types.Core.GameConfig) {
        CommonBase.instance = this;
        /** 建立引擎 */
        this.root = new Phaser.Game(gameConfig);
    }

    static Init(scene: Phaser.Scene, config: CommonBaseConfig, model: CommonBaseModel, LibBase?: LibBaseConstructor, useStyle = '') {
        this.instance.data = { scene, config, model, useStyle };
        /** 撈取網址 - 完整內容 */
        Object.assign(model.UrlParams, GetUrlParams.urlParams);
        /** 撈取網址 - 介面語系 (需在LibBase之前完成寫入) */
        model.Game.languageID = GetUrlParams.getLanguage(config.LANGUAGE_UI, config.DEFAULT_LANGUAGE);
        /** 導向base處理 */
        if (LibBase) this.LibBase = new LibBase(this.instance.root, this.instance.data);
    }

    /** 資源載入前 */
    static GameLoadStart(scene?: Phaser.Scene) {
        this.LibBase?.GameLoadStart?.(scene);
    }

    /** 資源載入完畢 */
    static GameLoadComplete() {
        this.LibBase?.GameLoadComplete?.();
    }

    /** UI 創建完成的後續處理 */
    static GameCreateComplete(scene: Phaser.Scene) {
        this.LibBase?.GameCreateComplete?.(scene);
    }

    /** 連線成功 */
    static GameConnectComplete(data?: unknown) {
        this.LibBase?.GameConnectComplete?.(data);
    }

    /** 登入成功 */
    static GameLoginFeature() {
        this.LibBase?.GameLoginFeature?.();
    }

    /** 收到init封包時的公版處理 */
    static GameInitFeature(scene: Phaser.Scene) {
        this.LibBase?.GameInitFeature?.(scene);
    }

    /** 進入 Error 畫面時的公版擴充特色 (Before) */
    static GameErrorBeforeFeature(target: unknown, msg: unknown) {
        this.LibBase?.GameErrorBeforeFeature?.(target, msg);
    }
}
