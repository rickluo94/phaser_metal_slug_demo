import GameBase from '@kernel/utility/GameBase';
import { MainSceneEventType } from '@script/events/MainSceneEventType';
import { SignalType } from '@script/process/EffectStates';

type ResultViewData = {
    title?: string;
    bombCount?: number;
};

type SignalEvent = {
    CallBack: () => void;
};

export default class UIResultView extends GameBase {
    context?: Phaser.GameObjects.Container;
    resultPanel?: Phaser.GameObjects.Container;
    restartButton?: Phaser.GameObjects.Container;
    titleText?: Phaser.GameObjects.Text;
    bombCountText?: Phaser.GameObjects.Text;
    stageClearKey = 'ms_stage_clear';
    stageClearSound?: Phaser.Sound.BaseSound;

    initUI() {
        this.context = this.game.add.container().setName('UIResultView');
        this.#prepareStageClearSound();
        this.#createResultPanel();
        this.#createRestartButton();
        this.addEvent();
    }

    addEvent() {
        this.addSignal(SignalType.ResultViewInit, this.#onResultViewInit.bind(this));
        this.addEventListener(MainSceneEventType.ShowResultView, this.#onShowResultView.bind(this));
        this.addEventListener(MainSceneEventType.HideResultView, this.#onHideResultView.bind(this));
    }

    start() {
        this.addSignal(SignalType.ResultViewStart, this.#onResultViewStart.bind(this));
    }

    #prepareStageClearSound() {
        this.stageClearSound = this.game.sound.get(this.stageClearKey) || this.game.sound.add(this.stageClearKey, { loop: false });
    }

    #createResultPanel() {
        if (!this.context) return;

        const { width, height } = this.game.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        const background = this.game.add.rectangle(centerX, centerY, 520, 240, 0x000000, 0.75)
            .setStrokeStyle(4, 0xffffff, 1);

        this.titleText = this.game.add.text(centerX, centerY - 45, 'STAGE CLEAR', {
            fontSize: '42px',
            color: '#ffe066',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.bombCountText = this.game.add.text(centerX, centerY + 25, '炸彈掉落數量: 0', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.resultPanel = this.game.add.container(0, 0, [
            background,
            this.titleText,
            this.bombCountText
        ]).setVisible(false);

        this.context.add(this.resultPanel);
    }

    #createRestartButton() {
        if (!this.context) return;

        const { width, height } = this.game.scale;
        const centerX = width / 2;
        const centerY = height / 2;

        const background = this.game.add.rectangle(0, 0, 240, 56, 0x1f1f1f)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });
        const text = this.game.add.text(0, 0, '重新開始', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        background.on('pointerover', () => {
            background.setFillStyle(0x333333);
        });
        background.on('pointerout', () => {
            background.setFillStyle(0x1f1f1f);
        });
        background.on('pointerdown', () => {
            background.setFillStyle(0x4a4a4a);
        });
        background.on('pointerup', () => {
            background.setFillStyle(0x333333);
            this.game.cleanup();
            this.game.scene.start('title');
        });

        this.restartButton = this.game.add.container(centerX, centerY + 180, [background, text])
            .setVisible(false);

        this.context.add(this.restartButton);
    }

    #playStageClearSound() {
        if (!this.stageClearSound) return;

        this.stageClearSound.stop();
        this.stageClearSound.once(Phaser.Sound.Events.COMPLETE, () => {
            this.dispatchEvent(MainSceneEventType.HideResultView);
        });
        this.stageClearSound.play();
    }

    #onShowResultView(_eventName, data?: ResultViewData) {
        if (!this.resultPanel || !this.titleText || !this.bombCountText) return;

        this.titleText.setText(data?.title || 'STAGE CLEAR');
        this.bombCountText.setText(`炸彈掉落數量: ${data?.bombCount ?? 0}`);
        this.resultPanel.setVisible(true);
        this.restartButton?.setVisible(false);
        this.#playStageClearSound();
    }

    #onHideResultView() {
        this.resultPanel?.setVisible(false);
        this.restartButton?.setVisible(true);
    }

    #onResultViewInit(event: SignalEvent) {
        event.CallBack();
    }

    #onResultViewStart(event: SignalEvent) {
        console.log('ResultView Start');
        event.CallBack();
    }

    destroy() {
        super.destroy();
        this.stageClearSound?.stop();
        this.resultPanel?.destroy();
        this.restartButton?.destroy();
        this.resultPanel = undefined;
        this.restartButton = undefined;
        this.titleText = undefined;
        this.bombCountText = undefined;
        this.context?.destroy(true);
        this.context = undefined;
    }
}
