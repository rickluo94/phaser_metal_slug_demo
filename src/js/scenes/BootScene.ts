import Model from '@kernel/utility/Model';
import LoadSources from '@share/tools/LoadSources';
import CommonBase from '@share/game/CommonBase';
// import Wallet from '@share/user/Wallet'; // todo 暫時沒有這個專案內容
import GameUISetting from '@script/component/setting/GameUISetting';
import { Config } from '@/js/files/Config';
import { Game, Setting } from '@script/component/setting/Game';

type ConfigShape = {
    GAME_ID: string;
    MULTI_PATH: string;
};

type ExternalSetting = Record<string, unknown>;

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'boot', active: false, visible: false });
        // 載入遊戲變數設定
        Model.Game = Game;
        Model.Setting = Setting;
        // Model.Wallet = new Wallet(); // todo 暫時沒有這個專案內容
        Model.IsDev = (['localhost', '0.0.0.0'].indexOf(window.location.hostname) !== -1);
    }

    preload() {
        const config = Config as ConfigShape;
        if (!this.cache.json.has(`external${config.GAME_ID}`)) LoadSources.loadJson(this, `external${config.GAME_ID}`, `${config.MULTI_PATH}assets/json/setting.json`);
    }

    create() {
        const config = Config as ConfigShape;
        const externalSetting = this.cache.json.get(`external${config.GAME_ID}`) as ExternalSetting | null;
        if (externalSetting) Object.assign(Model.External, externalSetting);

        // 基礎擴建載入
        CommonBase.Init(this, Config, Model);
        // 讀取loading預設檔案路徑...等
        CommonBase.GameLoadStart();
        // 讀取專案客製化內容(此會在preload之前設定完畢)
        GameUISetting.CoverSettingData();
        // 動態加載loading圖檔
        this.load.on('complete', () => { this.scene.start('preloader'); });
        this.load.start();
    }
}
