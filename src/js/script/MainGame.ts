import GameBase from '@kernel/utility/GameBase';

// 事件及訊號
import { MainSceneEventType } from '@script/events/MainSceneEventType';
import { SignalType } from '@script/process/EffectStates';

// UI分類容器
import UIBackGround from '@script/views/UIBackGround';
import UIBtnView from '@script/views/UIBtnView';
import UITextView from '@script/views/UITextView';
import UICharacterView from '@script/views/UICharacterView';
import UIEnemyView from '@script/views/UIEnemyView';
import UIResultView from '@script/views/UIResultView';

export default class MainGame extends GameBase {
    UIBackGround;
    UIBtn;
    UICharacterView;
    UIText;
    UIEnemyView;
    UIResultView;

    constructor() {
        super();
        // 註冊介面創造順序
        this.UIBackGround = this.addUI(UIBackGround);
        this.UIBtn = this.addUI(UIBtnView);
        this.UICharacterView = this.addUI(UICharacterView);
        this.UIText = this.addUI(UITextView);
        this.UIEnemyView = this.addUI(UIEnemyView);
        this.UIResultView = this.addUI(UIResultView);
    }

    init(scene) {
        this.game = scene;
        // 遊戲介面開始初始化
        this.initUI(scene);
        this.addEvent();
    }

    /** ui 註冊 Scene.update */
    update(time, delta) {
        this.UIList.forEach((ui) => { if (ui.update) ui.update(time, delta); }, this);
    }

    addEvent() {
        this.addSignal(SignalType.ClearLoading, this.#onClearLoading.bind(this));
        this.addEventListener(MainSceneEventType.ChangeBackground, this.#onChangeBackground.bind(this));
    }

    #onClearLoading(event) {
        // UI激活
        this.UIList.forEach((ui) => { if (ui.start) ui.start(); });
        event.CallBack();
    }

    #onChangeBackground() {
        this.UIBackGround.switchBackground();
    }

    destroy() {
        this.UIList.forEach((ui) => {
            ui.destroy?.();
        });
        this.UIList = [];
        super.destroy();
    }
}
