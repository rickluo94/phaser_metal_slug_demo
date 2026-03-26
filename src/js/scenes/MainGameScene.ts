import Model from '@kernel/utility/Model';
// import Network from '@share/net/Network';
import CommonBase from '@share/game/CommonBase';

// import { ProtocolPack } from '@/js/files/ProtocolFile';
import MainGame from '@script/MainGame';
import { EffectState } from '@script/process/EffectStates';
import { GameState } from '@script/process/GameEvent';
import { GameStateConfig } from '@script/process/GameStateConfig';

export default class MainGameScene extends Phaser.Scene {
    escKey?: Phaser.Input.Keyboard.Key;

    constructor() {
        super({ key: 'main_game', active: false, visible: false });
    }

    create() {
        // 主遊戲創建
        Model.MainPage = new MainGame();
        Model.MainPage.init(this);
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        CommonBase.GameCreateComplete(this);
        // 註冊流程
        new GameStateConfig().addGameProcess();
        // 建立連線
        // new Network(ProtocolPack, Model.IsDev, this).connect();

        this.escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.escKey?.once('down', () => {
            this.cleanup();
            this.scene.start('title');
        });

        // 進入 InitStage
        Model.Fsm!.to(GameState.INIT, EffectState.beforeAry.Init);
        Model.Fsm!.to(GameState.START, EffectState.beforeAry.Start);
    }

    /** 註冊 MainGame update 給 view 層使用 */
    update(time, delta) {
        Model.MainPage!.update(time, delta);
    }

    cleanup() {
        Model.MainPage?.destroy?.();
        Model.MainPage = null;
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.sound.stopAll();
        this.escKey?.removeAllListeners();
        this.escKey?.destroy();
        this.escKey = undefined;
    }
}
